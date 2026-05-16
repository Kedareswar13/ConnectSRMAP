"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { User } from "../../types";
import axios from "axios";
import { BASE_API_URL } from "../../server";
import { handleAuthRequest } from "../utils/apiRequest";
import { Bookmark, Grid, MenuIcon, Settings, UserPlus, UserMinus } from "lucide-react";
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

type Props = { id: string; };

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
    if (!user) { router.push("/auth/login"); return; }
    const getUser = async () => {
      const getUserReq = async () => await axios.get(`${BASE_API_URL}/users/profile/${id}`, { withCredentials: true });
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
    if (!user?._id) { toast.error("Please log in."); return; }
    try {
      const result = await axios.post(`${BASE_API_URL}/users/follow-unfollow/${id}`, {}, { withCredentials: true });
      if (result.data.status === "success") {
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
        setIsFollowing(prev => !prev);
        setFollowerCount(prev => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to follow/unfollow");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;
    setIsDeleting(true);
    try {
      const result = await axios.delete(`${BASE_API_URL}/users/delete-account`, { withCredentials: true });
      if (result.data.status === "success") { dispatch(signOut()); toast.success("Account deleted"); router.replace("/auth/login"); }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to delete account");
    } finally { setIsDeleting(false); setShowDeleteDialog(false); }
  };

  if (isLoading || !userProfile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-white/30 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-64 hidden md:block h-screen fixed z-10">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-64 overflow-y-auto pb-20">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-20 border-b border-white/5 px-4 py-3" style={{ background: 'hsl(230,25%,10%)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold gradient-text">ConnectSRMAP</h1>
            <Sheet>
              <SheetTrigger><MenuIcon className="w-6 h-6 text-white/60" /></SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-none">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">App navigation</SheetDescription>
                <LeftSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="w-[90%] sm:w-[85%] max-w-[935px] mx-auto">
          {/* Profile Header */}
          <div className="mt-10 md:mt-12 animate-fade-in-up">
            <div className="flex md:flex-row flex-col md:items-start gap-8 md:gap-16 pb-10 border-b border-white/[0.06]">
              <div className="flex-shrink-0 flex md:justify-start justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
                  <Avatar className="relative w-36 h-36 ring-4 ring-[hsl(230,25%,8%)] shadow-xl">
                    <AvatarImage src={userProfile.profilePicture} className="h-full w-full object-cover object-center" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-4xl font-bold">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{userProfile.username}</h1>
                  {isOwnProfile ? (
                    <Link href="/edit-profile">
                      <Button variant="outline" className="rounded-xl border-white/10 text-white/70 bg-transparent hover:bg-white/5 hover:border-indigo-400/30 transition-all">
                        <Settings className="w-4 h-4 mr-2" />Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleFollowUnfollow}
                      className={cn("rounded-xl px-6 transition-all duration-300",
                        isFollowing
                          ? "bg-white/5 text-white/70 hover:bg-red-500/10 hover:text-red-400 border border-white/10"
                          : "btn-gradient"
                      )}>
                      {isFollowing ? <><UserMinus className="w-4 h-4 mr-2" />Unfollow</> : <><UserPlus className="w-4 h-4 mr-2" />Follow</>}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-10 mt-6 mb-4">
                  {[{ val: userProfile.posts.length, label: "Posts" }, { val: followerCount, label: "Followers" }, { val: followingCount, label: "Following" }].map(s => (
                    <div key={s.label} className="text-center">
                      <span className="text-xl font-bold text-white">{s.val}</span>
                      <p className="text-xs text-white/35 mt-0.5 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/50 leading-relaxed max-w-md">{userProfile.bio || "No bio yet"}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-white/[0.06]">
            <div className="flex items-center justify-center">
              <button className={cn("flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all",
                postOrSave === "POST" ? "border-indigo-500 text-indigo-400" : "border-transparent text-white/30 hover:text-white/50"
              )} onClick={() => setPostOrSave("POST")}><Grid className="w-4 h-4" />Posts</button>
              {isOwnProfile && (
                <button className={cn("flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all",
                  postOrSave === "SAVE" ? "border-indigo-500 text-indigo-400" : "border-transparent text-white/30 hover:text-white/50"
                )} onClick={() => setPostOrSave("SAVE")}><Bookmark className="w-4 h-4" />Saved</button>
              )}
            </div>
          </div>

          <div className="animate-fade-in mt-6">
            {postOrSave === "POST" && <Post userProfile={userProfile} />}
            {postOrSave === "SAVE" && <Saved userProfile={userProfile} />}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px] border-white/10" style={{ background: 'hsl(230,25%,12%)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Delete Account</DialogTitle>
            <DialogDescription className="text-white/50">This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting} className="border-white/10 text-white/70 bg-transparent">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete Account"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
