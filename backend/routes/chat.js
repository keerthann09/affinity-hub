const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");

// Get messages
router.get("/:matchId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.matchId },
        { sender: req.params.matchId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
router.post("/:matchId", auth, async (req, res) => {
  try {
    const message = new Message({
      sender: req.user.id,
      receiver: req.params.matchId,
      message: req.body.message,
      status: "sent"
    });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mark messages as seen (called when receiver opens the chat)
router.patch("/seen/:senderId", auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        receiver: req.user.id,
        status: { $ne: "seen" }
      },
      { $set: { status: "seen" } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mark messages as delivered (called when receiver comes online)
router.patch("/delivered/:senderId", auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        receiver: req.user.id,
        status: "sent"
      },
      { $set: { status: "delivered" } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete message for ME only
router.patch("/:messageId/delete-for-me", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const userId = req.user.id.toString();
    const isSender = message.sender.toString() === userId;
    const isReceiver = message.receiver.toString() === userId;

    if (!isSender && !isReceiver) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }

    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete message for EVERYONE (only sender)
router.patch("/:messageId/delete-for-everyone", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Only the sender can delete for everyone" });
    }

    message.deletedForEveryone = true;
    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;