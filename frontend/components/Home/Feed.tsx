"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { likeOrDislike, setPost, addComment } from "@/store/postSlice";
import { HeartIcon, MessageCircle, Send, Bookmark } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";
import { toast } from "sonner";
import { setAuthUser } from "@/store/authSlice";
import { Post as PostType } from "@/types";
import PostDialog from "../Profile/PostDialog";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const Feed = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.posts.posts);
  const [isLoading, setIsLoading] = useState(false);
  const [animateHeart, setAnimateHeart] = useState<string | null>(null);
  const [animateBookmark, setAnimateBookmark] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () => await axios.get(`${BASE_API_URL}/posts/all`);
      const result = await handleAuthRequest(getAllPostReq, setIsLoading);
      if (result) {
        const validPosts = (result.data.data.posts || []).filter(
          (post: PostType) => post.user != null
        );
        dispatch(setPost(validPosts));
      }
    };
    getAllPost();
  }, [dispatch]);

  const handleLikeDislike = async (id: string) => {
    if (!user || !user._id) { toast.error("Please log in."); return; }
    setAnimateHeart(id);
    setTimeout(() => setAnimateHeart(null), 500);
    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/like-dislike/${id}`,
        { notificationData: { id: Date.now().toString(), type: "like", user: { username: user.username, profilePicture: user.profilePicture, _id: user._id }, message: `${user.username} liked your post`, createdAt: new Date().toISOString(), read: false, postId: id } },
        { withCredentials: true }
      );
      if (result.data.status === "success") {
        dispatch(likeOrDislike({ postId: id, userId: user._id }));
        toast(result.data.message);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to like/dislike");
    }
  };

  const handleSaveUnsave = async (id: string) => {
    if (!user || !user._id) { toast.error("Please log in."); return; }
    setAnimateBookmark(id);
    setTimeout(() => setAnimateBookmark(null), 500);
    try {
      const result = await axios.post(`${BASE_API_URL}/posts/save-unsave-post/${id}`, {}, { withCredentials: true });
      if (result.data.status === "success") {
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to save/unsave post");
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!user || !user._id) { toast.error("Please log in."); return; }
    if (!commentText.trim()) { toast.error("Comment cannot be empty"); return; }
    try {
      const result = await axios.post(`${BASE_API_URL}/posts/comment/${postId}`, { text: commentText }, { withCredentials: true });
      if (result.data.status === "success") {
        dispatch(addComment({ postId, comment: result.data.data.comment }));
        toast.success("Comment added");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to add comment");
    }
  };

  const isPostSaved = (postId: string): boolean => {
    if (!user || !user.savedPosts) return false;
    return user.savedPosts.some((saved) => {
      if (!saved) return false;
      if (typeof saved === "object" && saved._id) return String(saved._id) === String(postId);
      return String(saved) === String(postId);
    });
  };

  const isPostLiked = (post: PostType): boolean => post.likes.includes(user?._id || '');

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center flex-col gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-white/30 animate-pulse">Loading feed...</p>
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-white/70">No posts yet</h2>
        <p className="text-white/30">Follow people or create a post to see content here</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 w-full max-w-[520px] mx-auto px-4 space-y-5 pb-10">
        {posts.map((post, index) => (
          <div
            key={post._id}
            id={`post-${post._id}`}
            className="post-card dark-card overflow-hidden"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => post.user?._id && router.push(`/profile/${post.user._id}`)}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-400/40 transition-all">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={post.user?.profilePicture} className="w-full h-full object-cover" alt={post.user?.username || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold">
                      {post.user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-sm font-semibold text-white/90 group-hover:text-indigo-400 transition-colors">
                  {post.user?.username}
                </h3>
              </div>
              <DotButton post={post} user={user} />
            </div>

            {/* Media */}
            <div className="relative bg-black/20">
              {post.media?.type === "image" ? (
                <Image src={post.media.url} alt={post.caption || "Post"} width={800} height={500} className="w-full h-auto object-cover" priority={index === 0} />
              ) : post.media?.type === "video" ? (
                <video src={post.media.url} controls className="w-full max-h-[500px] object-contain bg-black" />
              ) : null}
            </div>

            {/* Actions */}
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button onClick={() => handleLikeDislike(post._id)} className="focus:outline-none group">
                    <HeartIcon className={`w-6 h-6 transition-all ${user && post.likes.includes(user._id) ? "text-rose-500 fill-rose-500" : "text-white/50 group-hover:text-rose-400"} ${animateHeart === post._id ? "animate-like-pop" : ""}`} />
                  </button>
                  <button className="focus:outline-none group" onClick={() => { setSelectedPost(post); setShowDialog(true); }}>
                    <MessageCircle className="w-6 h-6 text-white/50 group-hover:text-indigo-400 transition-colors" />
                  </button>
                  <button className="focus:outline-none group">
                    <Send className="w-5 h-5 text-white/50 group-hover:text-indigo-400 transition-colors" />
                  </button>
                </div>
                <button onClick={() => handleSaveUnsave(post._id)} className="focus:outline-none group">
                  <Bookmark className={`w-6 h-6 transition-all ${isPostSaved(post._id) ? "text-indigo-400 fill-indigo-400" : "text-white/50 group-hover:text-indigo-400"} ${animateBookmark === post._id ? "animate-like-pop" : ""}`} />
                </button>
              </div>

              <p className="mt-2 text-sm font-semibold text-white/80">
                {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
              </p>

              {post.caption && (
                <p className="mt-1 text-sm text-white/60 leading-relaxed">
                  <span className="font-semibold text-white/80 mr-1.5">{post.user?.username}</span>
                  {post.caption}
                </p>
              )}

              {post.comments.length > 0 && (
                <button className="mt-1.5 text-xs text-white/30 hover:text-indigo-400 transition-colors" onClick={() => { setSelectedPost(post); setShowDialog(true); }}>
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostDialog
          post={selectedPost} isOpen={showDialog}
          onClose={() => { setShowDialog(false); setSelectedPost(null); }}
          userProfile={selectedPost.user} currentUser={user}
          onLike={handleLikeDislike} onSave={handleSaveUnsave} onComment={handleComment}
          isLiked={isPostLiked(selectedPost)} isSaved={isPostSaved(selectedPost._id)}
          animateHeart={animateHeart !== null} animateBookmark={animateBookmark !== null}
        />
      )}
    </>
  );
};

export default Feed;
