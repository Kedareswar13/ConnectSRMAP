"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { likeOrDislike, setPost, addComment } from "@/store/postSlice";
import { HeartIcon, Loader, MessageCircle, Send, Bookmark } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";
import { Post as PostType, User } from "@/types";
import PostDialog from "../Profile/PostDialog";
import type { AxiosError } from "axios";

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.posts.posts);
  const [isLoading, setIsLoading] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [animateBookmark, setAnimateBookmark] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${BASE_API_URL}/posts/all`);

      const result = await handleAuthRequest(getAllPostReq, setIsLoading);

      if (result) {
        dispatch(setPost(result.data.data.posts));
      }
    };

    getAllPost();
  }, [dispatch]);

  const handleLikeDislike = async (id: string) => {
    if (!user || !user._id) {
      toast.error("User not found. Please log in.");
      return;
    }
    // Trigger the pop animation
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 500);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/like-dislike/${id}`,
        {
          notificationData: {
            id: Date.now().toString(),
            type: "like",
            user: {
              username: user.username,
              profilePicture: user.profilePicture,
              _id: user._id
            },
            message: `${user.username} liked your post`,
            createdAt: new Date().toISOString(),
            read: false,
            postId: id
          }
        },
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(likeOrDislike({ postId: id, userId: user._id }));
        toast(result.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error: unknown) {
      console.error("Error liking/disliking post:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to like/dislike");
    }
  };

  const handleSaveUnsave = async (id: string) => {
    if (!user || !user._id) {
      toast.error("User not found. Please log in.");
      return;
    }

    // Trigger the pop animation
    setAnimateBookmark(true);
    setTimeout(() => setAnimateBookmark(false), 500);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/save-unsave-post/${id}`,
        {},
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        // Update the Redux auth state with the returned user
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error: unknown) {
      console.error("Error saving/unsaving post:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to save/unsave post");
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!user || !user._id) {
      toast.error("User not found. Please log in.");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/comment/${postId}`,
        { text: commentText },
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(addComment({ postId, comment: result.data.data.comment }));
        toast.success("Comment added successfully");
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error: unknown) {
      console.error("Error adding comment:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to add comment");
    }
  };

  // Helper function to check if a post is saved.
  const isPostSaved = (postId: string): boolean => {
    if (!user || !user.savedPosts) return false;
    return user.savedPosts.some((saved) => {
      if (!saved) return false;
      if (typeof saved === "object" && saved._id) {
        return String(saved._id) === String(postId);
      }
      return String(saved) === String(postId);
    });
  };


  const isPostLiked = (post: PostType): boolean => {
    return post.likes.includes(user?._id || '');
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="text-3xl m-8 text-center capitalize font-bold">
        No posts to Show
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 w-[70%] mx-auto">
        {posts.map((post) => (
          <div 
            key={post._id} 
            id={`post-${post._id}`}
            className="mt-8 border-b pb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  <Avatar className="w-full h-full">
                  <AvatarImage
                    src={post.user?.profilePicture}
                      className="w-full h-full object-cover"
                      alt={post.user?.username || "User"}
                  />
                    <AvatarFallback>
                      {post.user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
                </div>
                <h1 className="font-semibold">{post.user?.username}</h1>
              </div>
              <DotButton post={post} user={user} />
            </div>

            {/* Media Rendering */}
            <div className="mt-2">
              {post.media?.type === "image" ? (
                <Image
                  src={post.media.url}
                  alt="Post"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover rounded-md"
                />
              ) : post.media?.type === "video" ? (
                <video
                  src={post.media.url}
                  controls
                  className="w-full max-h-[500px] object-contain rounded-md"
                />
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLikeDislike(post._id)}
                    className="focus:outline-none"
                  >
                <HeartIcon
                      className={`w-6 h-6 cursor-pointer transition-transform duration-300 ${
                    user && post.likes.includes(user._id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500"
                  } ${animateHeart ? "animate-like-pop" : ""}`}
                />
                  </button>
                  <span className="text-sm font-semibold">{post.likes.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="focus:outline-none"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowDialog(true);
                    }}
                  >
                    <MessageCircle className="w-6 h-6 cursor-pointer text-gray-500" />
                  </button>
                  <span className="text-sm font-semibold">{post.comments.length}</span>
                </div>
                <Send className="w-6 h-6 cursor-pointer text-gray-500" />
              </div>
              <button
                onClick={() => handleSaveUnsave(post._id)}
                className="focus:outline-none"
              >
                <Bookmark
                  className={`w-6 h-6 cursor-pointer transition-transform duration-300 ${
                  isPostSaved(post._id)
                      ? "text-blue-500 fill-blue-500"
                    : "text-gray-500"
                  } ${animateBookmark ? "animate-like-pop" : ""}`}
              />
              </button>
            </div>

            {/* Caption */}
            {post.caption && (
              <p className="mt-2 font-semibold">{post.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Post Dialog */}
      {selectedPost && (
        <PostDialog
          post={selectedPost}
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedPost(null);
          }}
          userProfile={selectedPost.user}
          currentUser={user}
          onLike={handleLikeDislike}
          onSave={handleSaveUnsave}
          onComment={handleComment}
          isLiked={isPostLiked(selectedPost)}
          isSaved={isPostSaved(selectedPost._id)}
          animateHeart={animateHeart}
          animateBookmark={animateBookmark}
        />
      )}

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes like-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        .animate-like-pop {
          animation: like-pop 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Feed;
