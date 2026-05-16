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
  
  const userId = user?._id;

  const userNotifications = React.useMemo(() => {
    if (!userId) return [];
    return notifications.filter((notification) => notification.recipient === userId);
  }, [notifications, userId]);
  
  const unreadCount = React.useMemo(() => 
    userNotifications.filter(notif => !notif.read).length,
    [userNotifications]
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    const fetchNotificationsIfNeeded = async () => {
      if (!isOpen || !userId) return;
      try {
        await dispatch(fetchNotifications());
      } catch (err) {
        if (mounted) console.error("Error fetching notifications:", err);
      }
    };
    fetchNotificationsIfNeeded();
    return () => { mounted = false; };
  }, [isOpen, userId, dispatch]);

  React.useEffect(() => {
    if (error) console.error("Notification error:", error);
  }, [error]);

  type SidebarLabel = "Home" | "Search" | "Messages" | "Notifications" | "Create" | "Profile" | "Logout";

  const handleSidebar = async (label: SidebarLabel) => {
    if (label === "Logout") { handleLogout(); return; }
    if (label === "Create") { setIsDialogOpen(true); return; }
    if (label === "Notifications") { dispatch(toggleNotifications()); return; }
    if (label === "Search") { setShowSearch(true); return; }

    setIsNavigating(true);
    try {
      if (label === "Home") {
        await router.push("/");
      } else if (label === "Profile") {
        if (!user?._id) {
          toast.error("Please log in to view your profile.");
          router.replace("/auth/login");
          return;
        }
        await router.push(`/profile/${user._id}`);
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
        `${BASE_API_URL}/users/logout`, {}, 
        { withCredentials: true, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }
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
        await router.push("/");
      } else {
        await router.push(`/profile/${notification.user._id}`);
      }
      dispatch(toggleNotifications());
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow": return "👤";
      case "unfollow": return "👋";
      case "like": return "❤️";
      case "unlike": return "💔";
      case "save": return "🔖";
      case "unsave": return "📌";
      default: return "🔔";
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "follow": return "started following you";
      case "unfollow": return "unfollowed you";
      case "like": return "liked your post";
      case "unlike": return "unliked your post";
      case "save": return "saved your post";
      case "unsave": return "unsaved your post";
      default: return "";
    }
  };

  const SidebarLinks = [
    { icon: <HomeIcon className="w-5 h-5" />, label: "Home", action: "Home" },
    { icon: <Search className="w-5 h-5" />, label: "Search", action: "Search" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Messages", action: "Messages" },
    {
      icon: (
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: "Notifications",
      action: "Notifications",
    },
    { icon: <SquarePlus className="w-5 h-5" />, label: "Create", action: "Create" },
    {
      icon: (
        <div className={`w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/20 ${isNavigating ? 'animate-pulse' : ''}`}>
          <Avatar className="w-full h-full">
            <AvatarImage src={user?.profilePicture} className="w-full h-full object-cover" alt={user?.username || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
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
      <div className="h-screen fixed left-0 top-0 w-64 sidebar-gradient z-10">
        <div className="h-full flex flex-col">
          {!isOpen ? (
            <>
              {/* Logo */}
              <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-bold gradient-text tracking-tight">
                  ConnectSRMAP
                </h1>
                <div className="mt-1 h-0.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-3 mt-4 space-y-1">
                {SidebarLinks.map((link, index) => (
                  <div
                    key={link.action}
                    className={`sidebar-item ${
                      (link.label === "Home" && pathname === "/") || 
                      (link.label === "Profile" && pathname.startsWith("/profile"))
                        ? "active" 
                        : ""
                    } ${link.action === "Logout" ? "!text-rose-400 hover:!bg-rose-500/10" : ""}`}
                    onClick={() => handleSidebar(link.action)}
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="transition-transform duration-200 group-hover:scale-110">
                      {link.icon}
                    </div>
                    <p className="text-sm font-medium">{link.label}</p>
                  </div>
                ))}
              </div>

              {/* User card at bottom */}
              {user && (
                <div className="px-4 pb-6 mt-auto">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Avatar className="w-9 h-9 ring-2 ring-indigo-500/30">
                      <AvatarImage src={user.profilePicture} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{user.username}</p>
                      <p className="text-gray-400 text-xs truncate">{user.bio || "No bio"}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Notification Panel */
            <div className="flex flex-col h-full bg-white">
              <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch(toggleNotifications())}
                    className="p-2 hover:bg-white/60 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : userNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Bell className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {userNotifications.map((notification, index) => (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in ${
                          notification.read 
                            ? "hover:bg-gray-50" 
                            : "bg-gradient-to-r from-indigo-50/60 to-purple-50/60 hover:from-indigo-50 hover:to-purple-50"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={notification.user.profilePicture}
                                className="object-cover"
                                alt={notification.user.username}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 text-xs font-bold">
                                {notification.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-0.5 -right-0.5 text-xs">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug">
                              <span className="font-semibold text-gray-800">{notification.user.username}</span>
                              {" "}
                              <span className="text-gray-500">{getNotificationMessage(notification)}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatTimestamp(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                          )}
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

      {showSearch && <SearchComponent onClose={() => setShowSearch(false)} />}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <CreatePostModel isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
      </Dialog>
    </>
  );
};

export default LeftSidebar;
