const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const uri = process.env.MONGO_URI;
const dbName = "activityTracker";

let db;

// ✅ Connect MongoDB
async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log("MongoDB connected");
}
connectDB();

// ✅ Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ✅ REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await db.collection("users").findOne({ username });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      role: role || "user", // default user
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// ✅ LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = "admin";
    const adminPassword = "admin123";

    // --- Admin Login Check ---
    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, {
        expiresIn: "2h",
      });

      return res.json({
        success: true,
        message: "Admin login successful",
        username,
        role: "admin",
        token,
      });
    }

    // --- Normal User Login ---
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "User login successful",
      username: user.username,
      role: user.role || "user",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ ADD ACTIVITY
// --- GET today's count for the logged-in user
app.get("/api/activities/today-count", verifyToken, async (req, res) => {
  const userId = req.user.id.toString();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await db.collection("activities").countDocuments({
    userId,
    createdAt: { $gte: today, $lt: tomorrow },
  });

  res.json({ count });
});

// --- POST add activity (keeps the 2/day limit)
app.post("/api/activities", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id.toString();

    if (!title || !description)
      return res.status(400).json({ message: "All fields required" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activityCount = await db.collection("activities").countDocuments({
      userId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    if (activityCount >= 2) {
      return res.status(400).json({
        message: "Daily activity limit reached (2 per day)",
      });
    }

    await db.collection("activities").insertOne({
      userId,
      title,
      description,
      createdAt: new Date(),
    });

    res.json({ message: "Activity added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error adding activity" });
  }
});

// ✅ GET ALL ACTIVITIES (Logged-in user)
app.get("/api/activities", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const activities = await db
      .collection("activities")
      .find({ userId })
      .toArray();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// ✅ GET ACTIVITIES BY DATE
app.get("/api/activities/:date", verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id.toString();

    const activities = await db
      .collection("activities")
      .find({ userId, date })
      .toArray();

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// ✅ ADMIN — GET ALL USERS & THEIR ACTIVITIES
app.get("/api/admin/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const users = await db.collection("users").find().toArray();
    const activities = await db.collection("activities").find().toArray();

    // Combine users with their activities
    const data = users.map((u) => ({
      username: u.username,
      role: u.role,
      activities: activities.filter((a) => a.userId === u._id.toString()),
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching admin data" });
  }
});

// ✅ Edit activity
app.put("/api/activities/:id", verifyToken, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id.toString();
    const { title, description, date } = req.body;

    const activity = await db
      .collection("activities")
      .findOne({ _id: new ObjectId(activityId), userId });

    if (!activity) {
      return res
        .status(404)
        .json({ message: "Activity not found or unauthorized" });
    }

    // If activity is older than 1 hour, editing should not be allowed
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const createdTime = new Date(activity.createdAt).getTime();

    if (createdTime < oneHourAgo) {
      return res
        .status(403)
        .json({ message: "Edit time expired. Cannot edit after 1 hour." });
    }

    // Allow edit only 2 times within 1 hour
    const editCount = activity.editCount || 0;
    if (editCount >= 2) {
      return res
        .status(403)
        .json({ message: "You can only edit this activity 2 times." });
    }

    // Update the activity
    const result = await db.collection("activities").updateOne(
      { _id: new ObjectId(activityId), userId },
      {
        $set: { title, description, date, lastEditedAt: new Date() },
        $inc: { editCount: 1 }, // increment edit count by 1
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "No changes were made." });
    }

    res.json({
      message: "Activity updated successfully",
      editCount: editCount + 1,
    });
  } catch (err) {
    console.error("Error updating activity:", err);
    res.status(500).json({ message: "Error updating activity" });
  }
});

//getting user activity at admin panel
app.get('/api/admin/user/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find activities by userId (not username!)
    const activities = await db
      .collection("activities")
      .find({ userId: user._id.toString() })
      .toArray();

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete activity
app.delete("/api/activities/:id", verifyToken, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id.toString();
    const result = await db.collection("activities").deleteOne({
      _id: new ObjectId(activityId),
      userId,
    });

    if (result.deletedCount === 0)
      return res
        .status(404)
        .json({ message: "Activity not found or unauthorized" });
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting activity" });
  }
});

// ✅ Home route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
