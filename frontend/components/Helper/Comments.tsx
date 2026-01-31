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
        toast.success("Comment deleted successfully");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error: unknown) {
      console.error("Error deleting comment:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to delete comment");
    }
  };

  if (!post) return null;

  return (
    <div className="flex flex-col">
      <h3 className="px-4 py-2 border-b font-semibold">
        Comments ({post.comments.length})
      </h3>
      
      <div className="flex-1 overflow-y-auto">
        {sortedComments.map((comment) => (
          <div 
            key={comment._id} 
            className="flex items-start space-x-3 px-4 py-2 hover:bg-gray-50"
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage
                src={comment.user?.profilePicture}
                alt={comment.user?.username || "User"}
                className="h-full w-full object-cover"
              />
              <AvatarFallback>
                {comment.user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">
                    {comment.user?.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {comment.createdAt && !isNaN(new Date(comment.createdAt).getTime())
                      ? formatTimestamp(comment.createdAt)
                      : "just now"}
                  </span>
                </div>
                {user?._id === comment.user?._id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm mt-0.5 break-words">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
