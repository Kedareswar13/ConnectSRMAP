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
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const Signup = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const signupReq = async () =>
      await axios.post(`${BASE_API_URL}/users/signup`, formData, {
        withCredentials: true,
      });
    const result = await handleAuthRequest(signupReq, setIsLoading);

    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push("/auth/verify");
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
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(230,25%,8%)] via-[hsl(230,25%,8%)]/40 to-transparent" />
          <div className="absolute bottom-16 left-10 right-10 z-10">
            <h2 className="text-3xl font-bold text-white/90 drop-shadow-lg">
              Join the community at
            </h2>
            <h1 className="text-5xl font-extrabold mt-2 drop-shadow-lg">
              <span className="gradient-text">ConnectSRMAP</span>
            </h1>
            <p className="text-white/50 mt-4 text-base max-w-sm leading-relaxed">
              Create your profile, share your story, and connect with students across campus.
            </p>
          </div>
        </div>

        {/* Signup Form - dark background */}
        <div className="flex flex-col items-center justify-center h-screen px-8"
             style={{ background: 'hsl(230, 25%, 10%)' }}>
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl font-extrabold gradient-text">ConnectSRMAP</h1>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Create account</h1>
              <p className="text-white/40 mt-2 text-sm">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Choose a username"
                  className="input-auth px-4 py-3 w-full"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@srmap.edu.in"
                  className="input-auth px-4 py-3 w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <PasswordInput label="Password" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <PasswordInput label="Confirm Password" name="passwordConfirm" placeholder="Re-enter your password" value={formData.passwordConfirm} onChange={handleChange} />
              </div>
              <LoadingButton
                size={"lg"}
                className="w-full btn-gradient !rounded-xl !py-3 text-base mt-2"
                type="submit"
                isLoading={isLoading}
              >
                Create Account
              </LoadingButton>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/40">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
