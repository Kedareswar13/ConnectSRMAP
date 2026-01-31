"use client";

import { User, Post as PostType } from '../../types';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HeartIcon, MessageCircle, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from "sonner";
import axios from "axios";
import { BASE_API_URL } from "../../server";
import { setAuthUser } from "../../store/authSlice";
import { likeOrDislike, addComment } from "../../store/postSlice";
import PostDialog from './PostDialog';
import type { AxiosError } from "axios";

type Props = {
  userProfile: User | undefined;
}

const SavedPosts = ({ userProfile }: Props) => {
  const dispatch = useDispatch();
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.posts.posts);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [savedPosts, setSavedPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchSavedPosts();
    }
  }, [user?._id]);

  const fetchSavedPosts = async () => {
    try {
      const result = await axios.get(`${BASE_API_URL}/users/saved-posts`, {
        withCredentials: true,
      });

      if (result.data.status === "success") {
        setSavedPosts(result.data.data.posts);
      }
    } catch (error: unknown) {
      console.error("Error fetching saved posts:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to fetch saved posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeDislike = async (id: string) => {
    if (!user?._id) {
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
        if (selectedPost?._id === id) {
          const updatedPost = posts.find(p => p._id === id);
          if (updatedPost) setSelectedPost(updatedPost);
        }
        toast.success("Post liked successfully");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to like post");
    }
  };

  const handleSaveUnsave = async (id: string) => {
    if (!user?._id) {
      toast.error("Please login to save posts");
      return;
    }

    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/save-unsave-post/${id}`,
        {},
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(setAuthUser(result.data.data.user));
        await fetchSavedPosts();
        toast.success("Post saved successfully");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to save post");
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!user?._id) {
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
        if (selectedPost?._id === postId) {
          const updatedPost = posts.find(p => p._id === postId);
          if (updatedPost) setSelectedPost(updatedPost);
        }
        toast.success("Comment added successfully");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to add comment");
    }
  };

  const isPostLiked = (post: PostType): boolean => {
    return post.likes.includes(user?._id || '');
  };

  const isPostSaved = (postId: string): boolean => {
    return user?.savedPosts?.some(saved => 
      typeof saved === 'string' ? saved === postId : saved?._id === postId
    ) || false;
  };

  const handlePostClick = (post: PostType) => {
    const currentPost = posts.find(p => p._id === post._id) || post;
    setSelectedPost(currentPost);
    setShowDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!savedPosts?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
        <p className="text-lg font-medium">No saved posts yet</p>
        <p className="text-sm mt-1">Posts you save will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
      {savedPosts.map((post) => (
        <div 
          key={post._id} 
          className="relative aspect-square cursor-pointer group"
          onClick={() => handlePostClick(post)}
        >
          {post.media?.type === 'image' ? (
            <Image
              src={post.media.url}
              alt={`Post by ${post.user.username}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 300px"
            />
          ) : post.media?.type === 'video' ? (
            <video
              src={post.media.url}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : null}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <div className="flex items-center text-white">
              <HeartIcon className="w-6 h-6 mr-1 fill-white" />
              <span>{post.likes.length}</span>
            </div>
            <div className="flex items-center text-white">
              <MessageCircle className="w-6 h-6 mr-1" />
              <span>{post.comments.length}</span>
            </div>
          </div>
        </div>
      ))}
      {selectedPost && (
        <PostDialog
          post={selectedPost}
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedPost(null);
          }}
          onLike={() => handleLikeDislike(selectedPost._id)}
          onComment={handleComment}
          onSave={() => handleSaveUnsave(selectedPost._id)}
          isLiked={isPostLiked(selectedPost)}
          isSaved={isPostSaved(selectedPost._id)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default SavedPosts; 