"use client";
import React, { useEffect, useState } from "react";
import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "../ui/sheet";
import { MenuIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { setAuthUser } from "../../store/authSlice";
import { useRouter } from "next/navigation";

const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state:RootState)=>state.auth.user);
  const [isLoading,setIsLoading] = useState(true);

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const getAuthUserReq = async () => {
          return await axios.get(`${BASE_API_URL}/users/me`, { withCredentials: true });
        };
        const result = await handleAuthRequest(getAuthUserReq, setIsLoading);
        if (result?.data?.data?.user) {
          dispatch(setAuthUser(result.data.data.user));
        } else {
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Failed to get auth user:", error);
        router.replace("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };
    if (!user || !user._id) {
      getAuthUser();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, router, user]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <div className="w-14 h-14 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
        <p className="mt-4 text-sm text-white/30 animate-pulse font-medium">Loading ConnectSRMAP...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="w-64 hidden md:block h-screen fixed z-10">
        <LeftSidebar/>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 relative z-0">
        {/* Mobile Menu */}
        <div className="md:hidden sticky top-0 z-20 border-b border-white/5 px-4 py-3" style={{ background: 'hsl(230,25%,10%)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold gradient-text">ConnectSRMAP</h1>
            <Sheet>
              <SheetTrigger>
                <MenuIcon className="w-6 h-6 text-white/60"/>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-none">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">App navigation</SheetDescription>
                <LeftSidebar/>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Feed + Right Sidebar */}
        <div className="flex">
          <div className="flex-1 min-w-0">
            <Feed/>
          </div>
          <div className="w-80 pt-6 px-5 lg:block hidden flex-shrink-0 border-l border-white/5">
            <RightSidebar/>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Home;