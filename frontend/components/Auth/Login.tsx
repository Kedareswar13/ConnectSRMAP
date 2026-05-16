"use client";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import PasswordInput from "./PasswordInput";
import LoadingButton from "../Helper/loadingButton";
import Link from "next/link";
import { ChangeEvent } from "react";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { handleAuthRequest } from "../utils/apiRequest";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const loginReq = async () =>
      await axios.post(`${BASE_API_URL}/users/login`, formData, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(loginReq, setIsLoading);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push("/");
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Banner - fill completely */}
        <div className="h-screen hidden lg:block relative overflow-hidden">
          <Image
            src="/images/sinup-banner.jpg"
            alt="signup"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(230,25%,8%)] via-[hsl(230,25%,8%)]/40 to-transparent" />
          <div className="absolute bottom-16 left-10 right-10 z-10">
            <h2 className="text-3xl font-bold text-white/90 drop-shadow-lg">
              Welcome back to
            </h2>
            <h1 className="text-5xl font-extrabold mt-2 drop-shadow-lg">
              <span className="gradient-text">ConnectSRMAP</span>
            </h1>
            <p className="text-white/50 mt-4 text-base max-w-sm leading-relaxed">
              Connect with your campus community. Share moments, build connections.
            </p>
          </div>
        </div>

        {/* Login Form - dark background matching sidebar */}
        <div className="flex flex-col items-center justify-center h-screen px-8" 
             style={{ background: 'hsl(230, 25%, 10%)' }}>
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl font-extrabold gradient-text">ConnectSRMAP</h1>
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white">
                Sign in
              </h1>
              <p className="text-white/40 mt-2 text-sm">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@example.com"
                  className="input-auth px-4 py-3 w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Link
                  href="/auth/forget-password"
                  className="mt-2 text-xs text-indigo-400 block font-medium cursor-pointer text-right hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <LoadingButton
                size={"lg"}
                className="w-full btn-gradient !rounded-xl !py-3 text-base"
                type="submit"
                isLoading={isLoading}
              >
                Sign In
              </LoadingButton>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/40">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
