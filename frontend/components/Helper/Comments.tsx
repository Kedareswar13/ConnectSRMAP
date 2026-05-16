"use client";

import React, { useMemo } from "react";
import { Post, User } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useDispatch } from "react-redux";
import { deleteComment } from "@/store/postSlice";
import { toast } from "sonner";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { Trash2 } from "lucide-react";
import { formatTimestamp } from "@/utils/formatTime";
import type { AxiosError } from "axios";

type Props = {
  user: User | null;
  post: Post | null;
};

const Comments = ({ post, user }: Props) => {
  const dispatch = useDispatch();

  const sortedComments = useMemo(() => {
    if (!post?.comments) return [];
    return [...post.comments].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [post?.comments]);

  const handleDeleteComment = async (commentId: string) => {
    if (!post?._id) return;
    try {
      const result = await axios.delete(
        `${BASE_API_URL}/posts/comment/${post._id}/${commentId}`,
        { withCredentials: true }
      );
      if (result.data.status === "success") {
        dispatch(deleteComment({ postId: post._id, commentId }));
        toast.success("Comment deleted");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to delete comment");
    }
  };

  if (!post) return null;

  return (
    <div className="flex flex-col">
      {sortedComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-sm text-white/25">No comments yet</p>
          <p className="text-xs text-white/15 mt-1">Start the conversation</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {sortedComments.map((comment) => (
            <div
              key={comment._id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
            >
              <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-white/10">
                <AvatarImage
                  src={comment.user?.profilePicture}
                  alt={comment.user?.username || "User"}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold">
                  {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white/80">
                      {comment.user?.username}
                    </span>
                    <span className="text-[10px] text-white/25">
                      {comment.createdAt && !isNaN(new Date(comment.createdAt).getTime())
                        ? formatTimestamp(comment.createdAt)
                        : "just now"}
                    </span>
                  </div>
                  {user?._id === comment.user?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-white/20 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm mt-0.5 text-white/55 break-words leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
