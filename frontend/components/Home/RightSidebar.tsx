import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import { User } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";

const RightSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [suggestedUser, setSuggestedUser] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getSuggestedUser = async () => {
      const getSuggestedUserReq = async () =>
        await axios.get(`${BASE_API_URL}/users/suggested-user`, {
          withCredentials: true,
        });

      const result = await handleAuthRequest(getSuggestedUserReq, setIsLoading);

      if (result) {
        setSuggestedUser(result.data.data.users);
      }
    };

    getSuggestedUser();
  }, []);

  const handleProfileClick = async (userId: string) => {
    setIsNavigating(true);
    try {
      await router.push(`/profile/${userId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate. Please try again.");
    } finally {
      setIsNavigating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ${isNavigating ? 'animate-pulse' : ''}`}>
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
            <div className="flex flex-col">
              <h1 className="font-semibold">{user?.username}</h1>
              <p className="text-sm text-gray-500">{user?.bio}</p>
            </div>
          </div>
        </div>
        <h1 className="font-medium text-blue-700 cursor-pointer">Switch</h1>
      </div>
      <div className="flex items-center justify-between mt-8">
        <h1 className="font-semibold text-gray-700">Suggested User</h1>
        <h1 className="font-medium cursor-pointer">See All</h1>
      </div>
      {suggestedUser?.slice(0, 5).map((s_user) => (
        <div 
          onClick={() => handleProfileClick(s_user._id)} 
          key={s_user._id} 
          className="mt-6 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${isNavigating ? 'animate-pulse' : ''}`}>
                <Avatar className="w-full h-full">
                <AvatarImage
                  src={s_user?.profilePicture}
                    className="w-full h-full object-cover"
                    alt={s_user?.username || "User"}
                />
                  <AvatarFallback>
                    {s_user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
              </Avatar>
              </div>
              <div className="flex flex-col">
                <h1 className="font-semibold">{s_user?.username}</h1>
                <p className="text-sm text-gray-500">{s_user?.bio || "My Profile Bio here"}</p>
              </div>
            </div>
            <h1 className="font-medium text-blue-700 cursor-pointer">Details</h1>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;