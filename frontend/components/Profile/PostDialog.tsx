"use client";

import { Post as PostType, User } from "@/types";
import React, { useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { HeartIcon, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
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

  // Get the latest version of the post from Redux state
  const currentPost = React.useMemo(() => {
    if (!post) return null;
    return posts.find(p => p._id === post._id) || post;
  }, [post, posts]);

  useEffect(() => {
    if (!isOpen) {
      setComment("");
    }
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
      <DialogContent className="sm:max-w-[90%] md:max-w-[800px] p-0 overflow-hidden">
        {/* Accessible Dialog Title (visually hidden) */}
        <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          <DialogTitle>
            {currentPost.caption ? currentPost.caption : "Post details"}
          </DialogTitle>
        </span>
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Media Section - Left Side */}
          <div className="relative w-full md:w-[55%] bg-black flex items-center justify-center">
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
              <video
                src={currentPost.media.url}
                controls
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>

          {/* Info Section - Right Side */}
          <div className="w-full md:w-[45%] flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={currentPost.user?.profilePicture}
                    alt={currentPost.user?.username}
                  />
                  <AvatarFallback>
                    {currentPost.user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{currentPost.user?.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                {isOwnPost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          if (onDelete) {
                            onDelete();
                          }
                        }}
                      >
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              {currentPost.caption && (
                <div className="p-4 border-b">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{currentPost.user?.username}</span>
                    {currentPost.caption}
                  </p>
                </div>
              )}
              <Comments post={currentPost} user={currentUser || null} />
            </div>

            {/* Actions and Comment Input */}
            <div className="border-t">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onLike?.(currentPost._id, currentPost.user)}
                      className="focus:outline-none"
                    >
                      <HeartIcon
                        className={`w-6 h-6 cursor-pointer transition-transform duration-300 ${
                          isLiked ? "text-red-500 fill-red-500" : "text-gray-500"
                        } ${animateHeart ? "animate-like-pop" : ""}`}
                      />
                    </button>
                    <MessageCircle className="w-6 h-6 cursor-pointer text-gray-500" />
                    <Send className="w-6 h-6 cursor-pointer text-gray-500" />
                  </div>
                  <button
                    onClick={() => onSave?.(currentPost._id)}
                    className="focus:outline-none"
                  >
                    <Bookmark
                      className={`w-6 h-6 cursor-pointer transition-transform duration-300 ${
                        isSaved ? "text-blue-500 fill-blue-500" : "text-gray-500"
                      } ${animateBookmark ? "animate-like-pop" : ""}`}
                    />
                  </button>
                </div>
                <div className="mt-2">
                  <span className="font-semibold">{currentPost.likes.length} likes</span>
                </div>
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 outline-none text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && comment.trim()) {
                        handleCommentSubmit();
                      }
                    }}
                  />
                  <button
                    className={`ml-2 font-semibold ${
                      comment.trim() ? 'text-blue-500 hover:text-blue-600' : 'text-blue-200'
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