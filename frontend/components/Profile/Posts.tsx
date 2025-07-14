"use client";

import { User, Post as PostType } from '../../types';
import React, { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, MessageCircle, Send, Bookmark } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from "sonner";
import axios from "axios";
import { BASE_API_URL } from "../../server";
import { setAuthUser } from "../../store/authSlice";
import { likeOrDislike, addComment, deletePost } from "../../store/postSlice";
import PostDialog from './PostDialog';
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import DotButton from "../Helper/DotButton";

type Props = {
  userProfile: User | undefined;
}

const Posts = ({ userProfile }: Props) => {
  const dispatch = useDispatch();
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [animateBookmark, setAnimateBookmark] = useState(false);

  const handleLikeDislike = async (id: string, postUser: User) => {
    if (!user || !user._id) {
      toast.error("Please login to like posts");
      return;
    }
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
        toast.success(result.data.message);
      }
    } catch (error: any) {
      console.error("Error liking/disliking post:", error);
      toast.error(error?.response?.data?.message || "Failed to like post");
    }
  };

  const handleSaveUnsave = async (id: string) => {
    if (!user || !user._id) {
      toast.error("Please login to save posts");
      return;
    }

    setAnimateBookmark(true);
    setTimeout(() => setAnimateBookmark(false), 500);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/save-unsave-post/${id}`,
        {},
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
      }
    } catch (error: any) {
      console.error("Error saving/unsaving post:", error);
      toast.error(error?.response?.data?.message || "Failed to save post");
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!user || !user._id) {
      toast.error("Please login to comment");
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
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(error?.response?.data?.message || "Failed to add comment");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const result = await axios.delete(
        `${BASE_API_URL}/posts/delete-post/${postId}`,
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(deletePost(postId));
        toast.success("Post deleted successfully");
        if (userProfile) {
          userProfile.posts = userProfile.posts.filter(post => post._id !== postId);
        }
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error?.response?.data?.message || "Failed to delete post");
    }
  };

  const isPostLiked = (post: PostType): boolean => {
    return post.likes.includes(user?._id || '');
  };

  const isPostSaved = (postId: string): boolean => {
    if (!user?.savedPosts) return false;
    return user.savedPosts.some(saved => 
      typeof saved === 'string' ? saved === postId : saved?._id === postId
    ) || false;
  };

  if (!userProfile?.posts || userProfile.posts.length === 0) {
    return (
      <div className="text-center mt-8 text-gray-500">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm">When you share photos, they will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 w-full max-w-[935px] mx-auto">
        <div className="grid grid-cols-3 gap-1">
          {userProfile.posts.map((post) => (
            <div 
              key={post._id} 
              className="relative aspect-square group"
              onClick={() => {
                setSelectedPost(post);
                setShowDialog(true);
              }}
            >
              {/* Media Container */}
              <div className="w-full h-full">
                {post.media?.type === "image" ? (
                  <Image
                    src={post.media.url}
                    alt={`Post by ${post.user.username}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 300px"
                  />
                ) : post.media?.type === "video" ? (
                  <video
                    src={post.media.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : null}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-6 text-white">
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-6 h-6" />
                    <span className="font-semibold">{post.likes.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-semibold">{post.comments.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Send className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          userProfile={userProfile}
          currentUser={user}
          onLike={handleLikeDislike}
          onSave={handleSaveUnsave}
          onComment={handleComment}
          onDelete={() => handleDeletePost(selectedPost._id)}
          isLiked={isPostLiked(selectedPost)}
          isSaved={isPostSaved(selectedPost._id)}
          animateHeart={animateHeart}
          animateBookmark={animateBookmark}
        />
      )}

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

export default Posts; 