"use client";
import { KeySquareIcon } from "lucide-react";
import React, { useState } from "react";
import LoadingButton from "../Helper/loadingButton";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ForgetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const forgetPassReq = async () => await axios.post(`${BASE_API_URL}/users/forget-password`, { email }, { withCredentials: true });
    const result = await handleAuthRequest(forgetPassReq, setIsLoading);
    if (result) { router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`); toast.success(result.data.message); }
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-screen px-4" style={{ background: 'hsl(230,25%,10%)' }}>
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8">
        <KeySquareIcon className="w-10 h-10 text-indigo-400" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Forgot your password?</h1>
      <p className="mb-8 text-sm text-white/40 text-center max-w-sm">Enter your email and we&apos;ll send you a code to reset your password</p>
      <input
        type="email"
        placeholder="Enter your email"
        className="input-dark px-4 py-3 w-full max-w-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <LoadingButton onClick={handleSubmit} className="btn-gradient !rounded-xl mt-4 w-48" size={"lg"} isLoading={isLoading}>
        Continue
      </LoadingButton>
    </div>
  );
};

export default ForgetPassword;
