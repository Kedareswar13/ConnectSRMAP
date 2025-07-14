const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["follow", "unfollow", "like", "unlike", "save", "unsave", "comment"],
      required: true,
    },
    user: {
      username: {
        type: String,
        required: true
      },
      profilePicture: {
        type: String,
        default: ""
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification; 