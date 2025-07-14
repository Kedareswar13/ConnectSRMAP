"use client";

import React, { FormEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import LeftSidebar from "@/components/Home/LeftSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, ArrowLeft } from "lucide-react";
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

const EditProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.profilePicture || null
  );
  const [bio, setBio] = useState(user?.bio || "Your Bio Here");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [username, setUsername] = useState(user?.username || "YourUsername");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

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
    
    // Append username, bio, and profile picture (if any)
    formData.append("username", username);
    formData.append("bio", bio);
    
    if (fileInputRef.current?.files?.[0]) {
      formData.append("profilePicture", fileInputRef.current.files[0]);
    }
    
    const updateProfileReq = async () =>
      await axios.post(`${BASE_API_URL}/users/edit-profile`, formData, {
        withCredentials: true,
      });
    
    const result = await handleAuthRequest(updateProfileReq, setIsLoading);
    
    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
    }
  };
    
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    };

    const updatePassReq = async () =>
      await axios.post(`${BASE_API_URL}/users/change-password`, data, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(updatePassReq, setIsLoading);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
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
      } else {
        toast.error("Failed to delete account");
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex">
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
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
              <LeftSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="w-[80%] mx-auto">
          <div className="mt-16 flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
          <div className="mt-16 pb-16 border-b-2">
            <div
              onClick={handleAvatarClick}
              className="flex items-center justify-center cursor-pointer"
            >
              <div className="w-[10rem] h-[10rem] rounded-full overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage 
                    src={selectedImage || ""} 
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center justify-center">
              <LoadingButton
                isLoading={isLoading}
                size={"lg"}
                className="bg-blue-800 mt-4"
                onClick={handleUpdateProfile}
              >
                Change Photo
              </LoadingButton>
            </div>
          </div>
          <div className="mt-10 border-b-2 pb-10">
            <label htmlFor="username" className="block text-lg font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-200 outline-none p-4 rounded-md mb-6"
            />
            <LoadingButton
              isLoading={isLoading}
              size={"lg"}
              className="mt-6"
              onClick={handleUpdateProfile}
            >
              Change Username
            </LoadingButton>
          </div>
          <div className="mt-10 border-b-2 pb-10">
            <label htmlFor="bio" className="block text-lg font-bold mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-[7rem] bg-gray-200 outline-none p-6 rounded-md"
            ></textarea>
            <LoadingButton
              isLoading={isLoading}
              size={"lg"}
              className="mt-6"
              onClick={handleUpdateProfile}
            >
              Change Bio
            </LoadingButton>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mt-6">
              Change Password
            </h1>
            <form className="mt-8 mb-8" onSubmit={handlePasswordChange}>
              <div className="w-[90%] md:w-[80%] lg:w-[60%] mt-4 mb-4">
                <PasswordInput
                  name="currentpassword"
                  value={currentPassword}
                  label="Current Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="w-[90%] md:w-[80%] lg:w-[60%] mt-4 mb-4">
                <PasswordInput
                  name="newpassword"
                  value={newPassword}
                  label="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="w-[90%] md:w-[80%] lg:w-[60%] mt-4 mb-4">
                <PasswordInput
                  name="confirmnewpassword"
                  value={newPasswordConfirm}
                  label="Cofirm New Password"
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <LoadingButton
                  isLoading={isLoading}
                  type="submit"
                  className="bg-red-700"
                >
                  Change Password
                </LoadingButton>
              </div>
            </form>
          </div>
          <div className="mt-10 pb-10 border-t-2">
            <h1 className="text-2xl font-bold text-red-600 mt-6">
              Danger Zone
            </h1>
            <p className="text-gray-600 mt-2 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full max-w-xs"
            >
              Delete Account
            </Button>
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
              <DialogHeader>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone.
                  All your posts, comments, and data will be permanently deleted.
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
      </div>
    </div>
  );
};

export default EditProfile;
