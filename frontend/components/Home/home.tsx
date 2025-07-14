"use client";
import React, { useEffect, useState } from "react";
import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Loader, MenuIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { setAuthUser } from "../../store/authSlice";
import { redirect, useRouter } from "next/navigation";

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
  
    if (!user) {
      getAuthUser();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, router, user]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
  <div className="flex relative">
    <div className="w-[20%] hidden md:block h-screen fixed z-10">
      <LeftSidebar/>
    </div>
    <div className="flex-1 md:ml-[20%] overflow-y-auto relative z-0">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon/>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
            <LeftSidebar/>
          </SheetContent>
        </Sheet>
      </div>
      <Feed/>
    </div>
    <div className="w-[30%] pt-8 px-6 lg:block hidden relative z-0">
      <RightSidebar/>
    </div>
  </div>
  )
};

export default Home;