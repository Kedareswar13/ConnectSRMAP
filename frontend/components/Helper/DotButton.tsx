"use client";

import { Post, User } from "@/types";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import { Ellipsis } from "lucide-react";
import { useDispatch } from "react-redux";
import { Button } from "../ui/button";
import Link from "next/link";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "sonner";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { deletePost } from "@/store/postSlice";
import type { AxiosError } from "axios";

type Props = {
  post: Post | null;
  user: User | null;
};

const DotButton = ({ post, user }: Props) => {
  const postUserId = post?.user?._id;
  const isOwnPost = postUserId === user?._id;
  const isFollowing = postUserId ? user?.following?.includes(postUserId) : false;
  const dispatch = useDispatch();

  const handleFollowUnfollow = async () => {
    if (!user || !user._id) { toast.error("Please log in."); return; }
    if (!postUserId) { toast.error("Post user not found."); return; }
    try {
      const result = await axios.post(`${BASE_API_URL}/users/follow-unfollow/${postUserId}`, {}, { withCredentials: true });
      if (result.data.status === "success") { dispatch(setAuthUser(result.data.data.user)); toast.success(result.data.message); }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to follow/unfollow");
    }
  };

  const handleDeletePost = async () => {
    if (!post?._id) return;
    try {
      const result = await axios.delete(`${BASE_API_URL}/posts/delete-post/${post._id}`, { withCredentials: true });
      if (result.data.status === "success") { dispatch(deletePost(post._id)); toast.success("Post deleted"); }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-1 rounded-full hover:bg-white/[0.06] transition-colors">
          <Ellipsis className="w-5 h-5 text-white/40" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[320px] border-none p-6"
        style={{ background: 'hsl(230, 25%, 12%)', borderRadius: '20px' }}
      >
        <DialogTitle className="text-white text-center mb-4">Post Options</DialogTitle>
        <DialogDescription className="sr-only">Follow, unfollow, or delete post options</DialogDescription>
        <div className="space-y-2 flex flex-col">
          {!isOwnPost && postUserId && (
            <Button
              variant="ghost"
              className={`w-full justify-center rounded-xl py-3 ${isFollowing ? 'text-rose-400 hover:bg-rose-500/10' : 'text-indigo-400 hover:bg-indigo-500/10'}`}
              onClick={handleFollowUnfollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
          {postUserId && (
            <Link href={`/profile/${postUserId}`} className="w-full">
              <Button variant="ghost" className="w-full justify-center rounded-xl py-3 text-white/60 hover:bg-white/[0.06]">
                About This Account
              </Button>
            </Link>
          )}
          {isOwnPost && (
            <Button variant="ghost" className="w-full justify-center rounded-xl py-3 text-rose-400 hover:bg-rose-500/10" onClick={handleDeletePost}>
              Delete Post
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="ghost" className="w-full justify-center rounded-xl py-3 text-white/30 hover:text-white/50 hover:bg-white/[0.04]">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DotButton;
