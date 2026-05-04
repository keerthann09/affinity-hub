const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },

  // ✅ Read receipt status: sent → delivered → seen
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },

  // Delete for me
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

  // Delete for everyone
  deletedForEveryone: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);