const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get users to swipe (excludes self)
router.get("/discover", auth, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id } 
    }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a user
router.post("/like/:id", auth, async (req, res) => {
  try {
    const likedUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!likedUser) return res.status(404).json({ message: "User not found" });

    // Check if it's a match
    if (likedUser.likes.includes(req.user.id)) {
      // It's a match!
      await User.findByIdAndUpdate(req.user.id, {
        $push: { matches: likedUser._id }
      });
      await User.findByIdAndUpdate(likedUser._id, {
        $push: { matches: req.user.id }
      });
      return res.json({ message: "It's a match! 🎉" });
    }

    // Just like
    await User.findByIdAndUpdate(req.user.id, {
      $push: { likes: likedUser._id }
    });
    res.json({ message: "Liked!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get matches
router.get("/matches", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("matches", "-password");
    res.json(user.matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user
router.get("/user/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;