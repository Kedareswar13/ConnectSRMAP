"use client";

import {
  HomeIcon,
  LogOut,
  MessageCircle,
  Search,
  SquarePlus,
  Bell,
  ArrowLeft,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { signOut } from "@/store/authSlice";
import { toast } from "sonner";
import CreatePostModel from "./CreatePostModel";
import { toggleNotifications, markNotificationAsRead, fetchNotifications } from "@/store/notificationSlice";
import { formatTimestamp } from "@/utils/formatTime";
import { AppDispatch } from "@/store/store";
import { Dialog } from "../ui/dialog";
import SearchComponent from "../Helper/Search";
import type { AxiosError } from "axios";

type Notification = {
  _id: string;
  type: "follow" | "unfollow" | "like" | "unlike" | "save" | "unsave";
  user: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  postId?: string;
  read: boolean;
  createdAt: string;
};

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isOpen, loading, error } = useSelector((state: RootState) => state.notifications);
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Get the user ID once and use it consistently
  const userId = user?._id;

  // Memoize the filtered notifications
  const userNotifications = React.useMemo(() => {
    if (!userId) return [];
    return notifications.filter((notification) => notification.recipient === userId);
  }, [notifications, userId]);
  
  // Memoize the unread count
  const unreadCount = React.useMemo(() => 
    userNotifications.filter(notif => !notif.read).length,
    [userNotifications]
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle notifications fetching
  React.useEffect(() => {
    let mounted = true;

    const fetchNotificationsIfNeeded = async () => {
      if (!isOpen || !userId) return;
      
      try {
        await dispatch(fetchNotifications());
      } catch (err) {
        if (mounted) {
          console.error("Error fetching notifications:", err);
        }
      }
    };

    fetchNotificationsIfNeeded();

    return () => {
      mounted = false;
    };
  }, [isOpen, userId, dispatch]);

  // Handle error logging separately
  React.useEffect(() => {
    if (error) {
      console.error("Notification error:", error);
    }
  }, [error]);

  type SidebarLabel = "Home" | "Search" | "Messages" | "Notifications" | "Create" | "Profile" | "Logout";

  const handleSidebar = async (label: SidebarLabel) => {
    if (label === "Logout") {
      handleLogout();
      return;
    }
    
    if (label === "Create") {
      setIsDialogOpen(true);
      return;
    }
    
    if (label === "Notifications") {
      dispatch(toggleNotifications());
      return;
    }
    
    if (label === "Search") {
      setShowSearch(true);
      return;
    }

    // Handle navigation with loading state
    setIsNavigating(true);
    try {
      if (label === "Home") {
        await router.push("/");
      } else if (label === "Profile") {
        await router.push(`/profile/${user?._id}`);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const response = await axios.post(
        `${BASE_API_URL}/users/logout`, 
        {}, 
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === "success") {
        dispatch(signOut());
        router.replace("/auth/login");
      } else {
        throw new Error(response.data.message || "Failed to logout");
      }
    } catch (error: unknown) {
      console.error("Logout error:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError?.response?.data?.message || "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await dispatch(markNotificationAsRead(notification._id));
    }
    
    setIsNavigating(true);
    try {
      if (notification.postId) {
        await router.push(`/post/${notification.postId}`);
      } else {
        await router.push(`/profile/${notification.user._id}`);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "follow":
        return "started following you";
      case "unfollow":
        return "unfollowed you";
      case "like":
        return "liked your post";
      case "unlike":
        return "unliked your post";
      case "save":
        return "saved your post";
      case "unsave":
        return "unsaved your post";
      default:
        return "";
    }
  };

  const SidebarLinks = [
    {
      icon: <HomeIcon className={`w-5 h-5 ${isNavigating ? 'animate-pulse' : ''}`} />,
      label: "Home",
      action: "Home",
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: "Search",
      action: "Search",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "Messages",
      action: "Messages",
    },
    {
      icon: (
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: "Notifications",
      action: "Notifications",
    },
    {
      icon: <SquarePlus className="w-5 h-5" />,
      label: "Create",
      action: "Create",
    },
    {
      icon: (
        <div className={`w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ${isNavigating ? 'animate-pulse' : ''}`}>
          <Avatar className="w-full h-full">
            <AvatarImage
              src={user?.profilePicture}
              className="w-full h-full object-cover"
              alt={user?.username || "User"}
            />
            <AvatarFallback>
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      ),
      label: "Profile",
      action: "Profile",
    },
    {
      icon: <LogOut className={`w-5 h-5 ${isLoggingOut ? 'animate-spin' : ''}`} />,
      label: isLoggingOut ? "Logging out..." : "Logout",
      action: "Logout",
    },
  ] satisfies Array<{ icon: React.ReactNode; label: string; action: SidebarLabel }>;

  return (
    <>
      <div className="h-screen fixed left-0 top-0 w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          {!isOpen ? (
            <>
              <div className="m-2 mt-3 lg:p-6 p-3">
                <div className="cursor-pointer" onClick={() => router.push('/')}>
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={150}
                    height={150}
                    className="mt-[-2rem]"
                    priority
                  />
                </div>

                <div className="mt-6">
                  {SidebarLinks.map((link) => (
                    <div
                      key={link.action}
                      className={`flex items-center mb-2 p-2 rounded-lg group cursor-pointer 
                      transition-all duration-200 hover:bg-gray-100 space-x-2 ${
                        link.label === "Home" && pathname === "/" ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSidebar(link.action)}
                    >
                      <div className="group-hover:scale-110 transition-all duration-200">
                        {link.icon}
                      </div>
                      <p className="text-sm lg:text-base">{link.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => dispatch(toggleNotifications())}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-semibold">Notifications</h2>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : userNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-center text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {userNotifications.map((notification) => (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          notification.read ? "bg-white" : "bg-blue-50"
                        } hover:bg-gray-50`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Avatar className="w-full h-full">
                              <AvatarImage
                                src={notification.user.profilePicture}
                                className="w-full h-full object-cover"
                                alt={notification.user.username}
                              />
                              <AvatarFallback>
                                {notification.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold">{notification.user.username}</span>
                              {" "}
                              {getNotificationMessage(notification)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Component */}
      {showSearch && (
        <SearchComponent onClose={() => setShowSearch(false)} />
      )}
      
      {/* Create Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <CreatePostModel isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      </Dialog>
    </>
  );
};

export default LeftSidebar;
