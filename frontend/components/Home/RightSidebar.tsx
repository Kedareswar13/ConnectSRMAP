import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import { User } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";

const RightSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [suggestedUser, setSuggestedUser] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getSuggestedUser = async () => {
      const getSuggestedUserReq = async () =>
        await axios.get(`${BASE_API_URL}/users/suggested-user`, { withCredentials: true });
      const result = await handleAuthRequest(getSuggestedUserReq, setIsLoading);
      if (result) setSuggestedUser(result.data.data.users);
    };
    getSuggestedUser();
  }, []);

  const handleProfileClick = async (userId: string) => {
    try { await router.push(`/profile/${userId}`); }
    catch (error) { toast.error("Failed to navigate."); }
  };

  return (
    <div className="sticky top-6">
      {/* Current User */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer group"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={() => user?._id && handleProfileClick(user._id)}
      >
        <div className="relative">
          <Avatar className="w-12 h-12 ring-2 ring-white/10">
            <AvatarImage src={user?.profilePicture} className="object-cover" alt={user?.username || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[hsl(230,25%,8%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white/90 truncate text-sm group-hover:text-indigo-400 transition-colors">
            {user?.username}
          </h3>
          <p className="text-xs text-white/35 truncate">{user?.bio || "Your bio here"}</p>
        </div>
        <span className="text-xs font-semibold text-indigo-400/70 hover:text-indigo-400 transition-colors">Switch</span>
      </div>

      {/* Suggested Users */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-1 mb-4">
          <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">Suggested</h2>
          <button className="text-xs font-semibold text-indigo-400/70 hover:text-indigo-400 transition-colors">See All</button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded-full w-24 animate-pulse" />
                  <div className="h-2.5 bg-white/3 rounded-full w-32 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {suggestedUser?.slice(0, 5).map((s_user, index) => (
              <div
                onClick={() => handleProfileClick(s_user._id)}
                key={s_user._id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Avatar className="w-10 h-10 ring-1 ring-white/10">
                  <AvatarImage src={s_user?.profilePicture} className="object-cover" alt={s_user?.username || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold">
                    {s_user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white/70 truncate group-hover:text-indigo-400 transition-colors">
                    {s_user?.username}
                  </h3>
                  <p className="text-xs text-white/25 truncate">{s_user?.bio || "No bio yet"}</p>
                </div>
                <span className="text-xs font-bold text-indigo-400/60 opacity-0 group-hover:opacity-100 transition-opacity">View</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 px-1">
        <p className="text-[10px] text-white/15 leading-relaxed tracking-wide">
          © 2026 ConnectSRMAP · About · Help · Privacy · Terms
        </p>
      </div>
    </div>
  );
};

export default RightSidebar;