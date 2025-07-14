const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const getDataUri = require("../utils/datauri");
const { uploadToCloudinary } = require("../utils/cloudinary");
const Notification = require("../models/notificationModel");

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select(
      "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
    )
    .populate({
      path: "posts",
      options: { sort: { createdAt: -1 } },
    })
    .populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 } },
    });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { bio, username } = req.body; // Accept username and bio from the request body
  const profilePicture = req.file; // Ensure file is provided via multer

  let cloudResponse;

  // If a profile picture file is provided, convert it and upload it to Cloudinary
  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileUri);
  }

  // Find the user by ID, excluding the password field
  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("User Not Found", 404));

  // Update fields if provided in the request
  if (bio) user.bio = bio;
  if (username) user.username = username;
  if (profilePicture) {
    user.profilePicture = cloudResponse.secure_url;
  }

  // Save the updated user (without re-validating all fields)
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Profile updated successfully",
    status: "success",
    data: { user },
  });
});

exports.suggestedUser = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;

  const users = await User.find({ _id: { $ne: loginUserId } }).select(
    "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
  );

  res.status(200).json({
    status: "success",
    data: {
      users,
    }, // Wrapped users inside an object
  });
});

exports.followUnfollow = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { notificationData } = req.body;

  // Check if user exists
  const userToFollow = await User.findById(id);
  if (!userToFollow) return next(new AppError("User not found", 404));

  // Check if user is trying to follow themselves
  if (id === userId.toString())
    return next(new AppError("You cannot follow yourself", 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const isFollowing = user.following.includes(id);

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(userId, { $pull: { following: id } });
    await User.findByIdAndUpdate(id, { $pull: { followers: userId } });

    // Create unfollow notification
    await Notification.create({
      type: "unfollow",
      user: {
        username: user.username,
        profilePicture: user.profilePicture,
        _id: userId
      },
      recipient: id,
      message: `${user.username} unfollowed you`,
      targetUserId: userId,
      read: false
    });

    // Get updated user data
    const updatedUser = await User.findById(userId)
      .select("-password -passwordConfirm -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires")
      .populate("following", "username profilePicture")
      .populate("followers", "username profilePicture")
      .populate("posts");

    return res.status(200).json({
      status: "success",
      message: "User unfollowed successfully",
      data: {
        user: updatedUser,
      },
    });
  } else {
    // Follow
    await User.findByIdAndUpdate(userId, { $addToSet: { following: id } });
    await User.findByIdAndUpdate(id, { $addToSet: { followers: userId } });

    // Create follow notification
    if (notificationData) {
      await Notification.create({
        ...notificationData,
        recipient: id,
      });
    }

    // Get updated user data
    const updatedUser = await User.findById(userId)
      .select("-password -passwordConfirm -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires")
      .populate("following", "username profilePicture")
      .populate("followers", "username profilePicture")
      .populate("posts");

    return res.status(200).json({
      status: "success",
      message: "User followed successfully",
      data: {
        user: updatedUser,
      },
    });
  }
});

exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .populate("user._id", "username profilePicture")
    .populate("postId", "media caption")
    .populate("targetUserId", "username profilePicture");

  return res.status(200).json({
    status: "success",
    data: {
      notifications,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError("User not authenticated", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Authenticated User",
    data: { user },
  });
});

// Add endpoint to mark notification as read
exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  if (notification.recipient.toString() !== userId.toString()) {
    return next(new AppError("Not authorized to update this notification", 403));
  }

  notification.read = true;
  await notification.save();

  return res.status(200).json({
    status: "success",
    message: "Notification marked as read",
  });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError('Please provide a search query', 400));
  }

  // Create a case-insensitive regex pattern for the search query
  const searchPattern = new RegExp(query, 'i');

  // Search for users where username matches the pattern
  const users = await User.find({
    username: searchPattern,
    // Exclude the current user from results
    _id: { $ne: req.user._id }
  })
  .select('username profilePicture bio')
  .limit(20); // Limit results to 20 users

  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  });
});
