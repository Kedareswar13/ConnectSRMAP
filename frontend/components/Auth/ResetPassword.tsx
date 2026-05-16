"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import PasswordInput from "./PasswordInput";
import LoadingButton from "../Helper/loadingButton";
import { Button } from "../ui/button";
import Link from "next/link";
import { useDispatch } from "react-redux";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "sonner";

const PasswordReset = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!otp || !password || !passwordConfirm) { toast.error("All fields are required."); return; }
    if (password.trim() !== passwordConfirm.trim()) { toast.error("Passwords do not match!"); return; }
    const data = { email, otp, password: password.trim(), passwordConfirm: passwordConfirm.trim() };
    const resetPassReq = async () => await axios.post(`${BASE_API_URL}/users/reset-password`, data, { withCredentials: true });
    const result = await handleAuthRequest(resetPassReq, setIsLoading);
    if (result) { dispatch(setAuthUser(result.data.data.user)); toast.success(result.data.message); router.push("/auth/login"); }
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col px-4" style={{ background: 'hsl(230,25%,10%)' }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
        <p className="mb-8 text-sm text-white/40">Enter your OTP and new password</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 block">OTP Code</label>
            <input
              type="number"
              placeholder="Enter OTP"
              className="input-dark w-full px-4 py-3 no-spinner"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <PasswordInput name="password" label="New Password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordInput name="passwordconfirm" label="Confirm Password" placeholder="Confirm new password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
        </div>

        <div className="flex items-center gap-4 mt-6">
          <LoadingButton onClick={handleSubmit} isLoading={isLoading} className="btn-gradient !rounded-xl flex-1">
            Change Password
          </LoadingButton>
          <Button variant="ghost" className="text-white/40 hover:text-white/60">
            <Link href="/auth/forget-password">Go Back</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;