"use client";

import { Post, User } from "@/types";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
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

type Props = {
  post: Post | null;
  user: User | null;
};

const DotButton = ({ post, user }: Props) => {
  const isOwnPost = post?.user?._id === user?._id;

  const isFollowing = post?.user?._id
    ? user?.following?.includes(post.user._id)
    : false;

  const dispatch = useDispatch();

  const handleFollowUnfollow = async () => {
    if (!user || !user._id) {
      toast.error("User not found. Please log in.");
      return;
    }

    try {
      const result = await axios.post(
        `${BASE_API_URL}/users/follow-unfollow/${post?.user._id}`,
        {},
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(setAuthUser(result.data.user));
        toast.success(result.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error: any) {
      console.error("Error following/unfollowing:", error);
      toast.error(error?.response?.data?.message || "Failed to follow/unfollow");
    }
  };

  const handleDeletePost = async () => {
    if (!post?._id) return;

    try {
      const result = await axios.delete(
        `${BASE_API_URL}/posts/delete/${post._id}`,
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(deletePost(post._id));
        toast.success("Post deleted successfully");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast.error(error?.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button>
            <Ellipsis className="w-8 h-8 text-black" />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white text-black dark:bg-neutral-900 dark:text-white shadow-xl">
          <DialogTitle>Post Options</DialogTitle>
          <div className="space-y-4 flex flex-col justify-center items-center mx-auto">
            {!isOwnPost && (
              <div>
                <Button 
                  variant={isFollowing ? "destructive" : "secondary"}
                  onClick={handleFollowUnfollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            )}
            <Link href={`/profile/${post?.user._id}`}>
              <Button variant={"secondary"}>About This Account</Button>
            </Link>
            {isOwnPost && (
              <Button variant={"destructive"} onClick={handleDeletePost}>
                Delete Post
              </Button>
            )}
            <DialogClose>Cancel</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DotButton;
