"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import Image from "next/image";
import LoadingButton from "../Helper/loadingButton";
import { Button } from "../ui/button";
import { ImageIcon, VideoIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { handleAuthRequest } from "../utils/apiRequest";
import { addPost } from "@/store/postSlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) { setSelectedFile(null); setPreviewUrl(null); setCaption(""); }
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Please select a valid image or video file!"); return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size should not exceed 20MB!"); return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("media", selectedFile);
    const createPostReq = async () =>
      await axios.post(`${BASE_API_URL}/posts/create-post`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    const result = await handleAuthRequest(createPostReq, setIsLoading);
    if (result) {
      toast.success("Post created successfully!");
      dispatch(addPost(result?.data?.data?.post));
      setSelectedFile(null); setPreviewUrl(null); setCaption("");
      onClose();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="border-none sm:max-w-[480px]"
        style={{ background: 'hsl(230, 25%, 12%)', borderRadius: '20px' }}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <DialogTitle className="sr-only">Create New Post</DialogTitle>
            <DialogDescription className="sr-only">Preview and publish your post</DialogDescription>
            <div className="mt-2 w-full rounded-xl overflow-hidden bg-black/30">
              {selectedFile?.type.startsWith("video/") ? (
                <video controls src={previewUrl} className="max-h-80 rounded-xl object-contain w-full" />
              ) : (
                <Image src={previewUrl} alt="Preview" width={400} height={400} className="max-h-80 rounded-xl object-contain w-full" />
              )}
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption ..."
              className="input-dark w-full px-4 py-2.5 text-sm"
            />
            <div className="flex gap-3 w-full">
              <LoadingButton
                className="flex-1 btn-gradient !rounded-xl"
                isLoading={isLoading}
                onClick={handleCreatePost}
              >
                Create Post
              </LoadingButton>
              <Button
                className="bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 rounded-xl"
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); setCaption(""); onClose(); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-white mt-2">Create New Post</DialogTitle>
              <DialogDescription className="sr-only">Select a photo or video</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-10 space-y-5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Upload className="w-8 h-8 text-white/30" />
              </div>
              <div className="flex gap-3 text-white/25">
                <ImageIcon size={28} />
                <VideoIcon size={28} />
              </div>
              <p className="text-white/35 text-sm">Drag and drop or select a file</p>
              <Button
                className="btn-gradient !rounded-xl px-8"
                onClick={() => fileInputRef.current?.click()}
              >
                Select from computer
              </Button>
              <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
