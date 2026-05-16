"use client";

import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import LeftSidebar from "@/components/Home/LeftSidebar";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, ArrowLeft, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingButton from "@/components/Helper/loadingButton";
import PasswordInput from "@/components/Auth/PasswordInput";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "@/components/utils/apiRequest";
import { setAuthUser, signOut } from "@/store/authSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AxiosError } from "axios";

const EditProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(user?.profilePicture || null);
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [username, setUsername] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    if (fileInputRef.current?.files?.[0]) formData.append("profilePicture", fileInputRef.current.files[0]);
    const updateProfileReq = async () => await axios.post(`${BASE_API_URL}/users/edit-profile`, formData, { withCredentials: true });
    const result = await handleAuthRequest(updateProfileReq, setIsLoading);
    if (result) { dispatch(setAuthUser(result.data.data.user)); toast.success(result.data.message); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { currentPassword, newPassword, newPasswordConfirm };
    const updatePassReq = async () => await axios.post(`${BASE_API_URL}/users/change-password`, data, { withCredentials: true });
    const result = await handleAuthRequest(updatePassReq, setIsLoading);
    if (result) { dispatch(setAuthUser(result.data.data.user)); toast.success(result.data.message); }
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

  return (
    <div className="flex min-h-screen">
      <div className="w-64 hidden md:block h-screen fixed z-10">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-64 overflow-y-auto pb-20">
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

        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="mt-10 flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </button>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          </div>

          {/* Avatar Section */}
          <div className="mt-10 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity" />
              <Avatar className="relative w-32 h-32 ring-4 ring-[hsl(230,25%,8%)]">
                <AvatarImage src={selectedImage || ""} className="w-full h-full object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-3xl font-bold">
                  {username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <LoadingButton isLoading={isLoading} className="btn-gradient !rounded-xl mt-4" onClick={handleUpdateProfile}>
              Change Photo
            </LoadingButton>
          </div>

          {/* Username */}
          <div className="mt-10 pb-8 border-b border-white/[0.06]">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-dark w-full px-4 py-3" />
            <LoadingButton isLoading={isLoading} className="btn-gradient !rounded-xl mt-4" onClick={handleUpdateProfile}>
              Update Username
            </LoadingButton>
          </div>

          {/* Bio */}
          <div className="mt-8 pb-8 border-b border-white/[0.06]">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-dark w-full px-4 py-3 h-28 resize-none" />
            <LoadingButton isLoading={isLoading} className="btn-gradient !rounded-xl mt-4" onClick={handleUpdateProfile}>
              Update Bio
            </LoadingButton>
          </div>

          {/* Password */}
          <div className="mt-8 pb-8 border-b border-white/[0.06]">
            <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
            <form className="space-y-4 max-w-md" onSubmit={handlePasswordChange}>
              <PasswordInput name="currentpassword" value={currentPassword} label="Current Password" onChange={(e) => setCurrentPassword(e.target.value)} />
              <PasswordInput name="newpassword" value={newPassword} label="New Password" onChange={(e) => setNewPassword(e.target.value)} />
              <PasswordInput name="confirmnewpassword" value={newPasswordConfirm} label="Confirm New Password" onChange={(e) => setNewPasswordConfirm(e.target.value)} />
              <LoadingButton isLoading={isLoading} type="submit" className="bg-rose-600 hover:bg-rose-700 !rounded-xl mt-2">
                Change Password
              </LoadingButton>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pb-10">
            <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-white/30 text-sm mb-4">Once you delete your account, there is no going back.</p>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="rounded-xl">
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="border-white/10" style={{ background: 'hsl(230,25%,12%)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Delete Account</DialogTitle>
            <DialogDescription className="text-white/50">This action cannot be undone. All your data will be permanently deleted.</DialogDescription>
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

export default EditProfile;
