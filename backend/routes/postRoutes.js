const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/multer");
const { createPost, getAllPost, getUserPosts, saveOrUnsavePost, deletePost, likeOrDislikePost, addComment } = require("../controllers/postController");

const router = express.Router();

// Define routes
router.post("/create-post", isAuthenticated, upload.single("media"), createPost);
router.get("/all", getAllPost);
router.get("/user-post/:id",getUserPosts);
router.post("/save-unsave-post/:id", isAuthenticated ,saveOrUnsavePost);
router.delete("/delete-post/:id", isAuthenticated , deletePost);
router.post("/like-dislike/:id", isAuthenticated ,likeOrDislikePost);
router.post("/comment/:id", isAuthenticated ,addComment);
module.exports = router;