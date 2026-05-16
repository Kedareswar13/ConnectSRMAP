"use client";

import { Post as PostType, User } from "@/types";
import React, { useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { HeartIcon, MessageCircle, Send, Bookmark, MoreHorizontal, X } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import Comments from "../Helper/Comments";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostDialogProps {
  post: PostType | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: User;
  currentUser?: User | null;
  onLike?: (postId: string, postUser: User) => void;
  onSave?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
  animateHeart?: boolean;
  animateBookmark?: boolean;
  onDelete?: () => void;
}

const PostDialog = ({
  post,
  isOpen,
  onClose,
  currentUser,
  onLike,
  onSave,
  onComment,
  isLiked,
  isSaved,
  animateHeart,
  animateBookmark,
  onDelete
}: PostDialogProps) => {
  const [comment, setComment] = React.useState("");
  const posts = useSelector((state: RootState) => state.posts.posts);

  const currentPost = React.useMemo(() => {
    if (!post) return null;
    return posts.find(p => p._id === post._id) || post;
  }, [post, posts]);

  useEffect(() => {
    if (!isOpen) setComment("");
  }, [isOpen]);

  const handleCommentSubmit = useCallback(() => {
    if (comment.trim() && onComment && currentPost) {
      onComment(currentPost._id, comment);
      setComment("");
    }
  }, [comment, onComment, currentPost]);

  if (!currentPost) return null;

  const isOwnPost = currentUser?._id === currentPost.user._id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[92vw] md:max-w-[900px] p-0 overflow-hidden border-none"
        style={{ background: 'hsl(230, 25%, 10%)', borderRadius: '20px' }}
        aria-describedby="post-dialog-desc"
      >
        <span className="sr-only">
          <DialogTitle>{currentPost.caption ? currentPost.caption : "Post details"}</DialogTitle>
          <p id="post-dialog-desc">View post details, comments, and interactions</p>
        </span>

        <div className="flex flex-col md:flex-row h-[85vh] md:h-[600px]">
          {/* Media - Left */}
          <div className="relative w-full md:w-[55%] bg-black/40 flex items-center justify-center">
            {currentPost.media?.type === "image" ? (
              <div className="relative w-full h-full">
                <Image
                  src={currentPost.media.url}
                  alt={currentPost.caption || "Post"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-contain"
                />
              </div>
            ) : currentPost.media?.type === "video" ? (
              <video src={currentPost.media.url} controls className="w-full h-full object-contain" />
            ) : null}
          </div>

          {/* Info - Right */}
          <div className="w-full md:w-[45%] flex flex-col" style={{ background: 'hsl(230, 25%, 12%)' }}>
            {/* User Header */}
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 ring-2 ring-white/10">
                  <AvatarImage src={currentPost.user?.profilePicture} alt={currentPost.user?.username} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold">
                    {currentPost.user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm text-white/90">{currentPost.user?.username}</span>
              </div>
              <div className="flex items-center gap-1">
                {isOwnPost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[hsl(230,25%,16%)] border-white/10 text-white">
                      <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10" onClick={onDelete}>
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Caption + Comments */}
            <div className="flex-1 overflow-y-auto">
              {currentPost.caption && (
                <div className="p-4 border-b border-white/[0.04]">
                  <p className="text-sm text-white/70 leading-relaxed">
                    <span className="font-semibold text-white/90 mr-2">{currentPost.user?.username}</span>
                    {currentPost.caption}
                  </p>
                </div>
              )}
              <Comments post={currentPost} user={currentUser || null} />
            </div>

            {/* Actions */}
            <div className="border-t border-white/[0.06]">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => onLike?.(currentPost._id, currentPost.user)} className="focus:outline-none group">
                      <HeartIcon className={`w-6 h-6 transition-all ${isLiked ? "text-rose-500 fill-rose-500" : "text-white/50 group-hover:text-rose-400"} ${animateHeart ? "animate-like-pop" : ""}`} />
                    </button>
                    <MessageCircle className="w-6 h-6 text-white/50" />
                    <Send className="w-5 h-5 text-white/50" />
                  </div>
                  <button onClick={() => onSave?.(currentPost._id)} className="focus:outline-none group">
                    <Bookmark className={`w-6 h-6 transition-all ${isSaved ? "text-indigo-400 fill-indigo-400" : "text-white/50 group-hover:text-indigo-400"} ${animateBookmark ? "animate-like-pop" : ""}`} />
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold text-white/80">{currentPost.likes.length} likes</p>
              </div>

              {/* Comment Input */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent outline-none text-sm text-white/80 placeholder:text-white/25 px-2"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && comment.trim()) handleCommentSubmit(); }}
                  />
                  <button
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      comment.trim() ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-white/15'
                    }`}
                    onClick={handleCommentSubmit}
                    disabled={!comment.trim()}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;