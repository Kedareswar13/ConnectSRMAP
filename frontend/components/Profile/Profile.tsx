"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { User } from "../../types";
import axios from "axios";
import { BASE_API_URL } from "../../server";
import { handleAuthRequest } from "../utils/apiRequest";
import { Bookmark, Grid, Loader2, MenuIcon } from "lucide-react";
import LeftSidebar from "../Home/LeftSidebar";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import Post from "./Post";
import Saved from "./Saved";
import { setAuthUser, signOut } from "../../store/authSlice";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import type { AxiosError } from "axios";

type Props = {
  id: string;
};

const Profile = ({ id }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [postOrSave, setPostOrSave] = useState<string>("POST");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = user?._id === id;

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const getUser = async () => {
      const getUserReq = async () =>
        await axios.get(`${BASE_API_URL}/users/profile/${id}`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(getUserReq, setIsLoading);
      if (result) {
        const u = result.data.data.user as User;
        setUserProfile(u);
        setIsFollowing(u.followers.includes(user._id));
        setFollowerCount(u.followers.length);
        setFollowingCount(u.following.length);
      }
    };

    getUser();
  }, [user, router, id]);

  const handleFollowUnfollow = async () => {
    if (!user?._id) {
      toast.error("User not found. Please log in.");
      return;
    }

    try {
      const result = await axios.post(
        `${BASE_API_URL}/users/follow-unfollow/${id}`,
        {},
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
        setIsFollowing(prev => !prev);
        setFollowerCount(prev => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error: unknown) {
      console.error("Error following/unfollowing:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to follow/unfollow");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;

    setIsDeleting(true);
    try {
      const result = await axios.delete(
        `${BASE_API_URL}/users/delete-account`,
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(signOut());
        toast.success("Account deleted successfully");
        router.replace("/auth/login");
      }
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // **Guard against rendering before data arrives**
  if (isLoading || !userProfile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex mb-20">
      <div className="w-[20%] hidden md:block border-r-2 h-screen fixed">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle />
              <SheetDescription />
              <LeftSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="w-[90%] sm:w-[80%] mx-auto">
          <div className="mt-16 flex md:flex-row flex-col md:items-center pb-16 border-b-2 md:space-x-20">
            <Avatar className="w-[10rem] h-[10rem] mb-8 md:mb-0 overflow-hidden">
              <AvatarImage
                src={userProfile.profilePicture}
                className="h-full w-full object-cover object-center rounded-full"
              />
              <AvatarFallback>
                {userProfile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold">{userProfile.username}</h1>

                {isOwnProfile ? (
                  <Link href="/edit-profile">
                    <Button variant="secondary">Edit Profile</Button>
                  </Link>
                ) : (
                  <Button
                    variant={isFollowing ? "destructive" : "secondary"}
                    onClick={handleFollowUnfollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-8 mt-6 mb-6">
                <div>
                  <span className="font-bold">{userProfile.posts.length}</span>
                  <span> Posts</span>
                </div>
                <div>
                  <span className="font-bold">{followerCount}</span>
                  <span> Followers</span>
                </div>
                <div>
                  <span className="font-bold">{followingCount}</span>
                  <span> Following</span>
                </div>
              </div>
              <p className="w-[80%] font-medium">{userProfile.bio || "No bio yet"}</p>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-center space-x-14">
              <div
                className={cn(
                  "flex items-center space-x-2 cursor-pointer",
                  postOrSave === "POST" && "text-blue-500"
                )}
                onClick={() => setPostOrSave("POST")}
              >
                <Grid />
                <span className="font-semibold">Posts</span>
              </div>
              {isOwnProfile && (
                <div
                  className={cn(
                    "flex items-center space-x-2 cursor-pointer",
                    postOrSave === "SAVE" && "text-blue-500"
                  )}
                  onClick={() => setPostOrSave("SAVE")}
                >
                  <Bookmark />
                  <span className="font-semibold">Saved</span>
                </div>
              )}
            </div>
            {postOrSave === "POST" && <Post userProfile={userProfile} />}
            {postOrSave === "SAVE" && <Saved userProfile={userProfile} />}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
