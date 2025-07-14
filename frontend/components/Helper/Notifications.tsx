"use client";

import React from "react";
import { Bell, X } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";

type Notification = {
  id: string;
  type: "follow" | "like" | "comment";
  user: {
    username: string;
    profilePicture: string;
  };
  message: string;
  createdAt: Date;
  read: boolean;
};

type Props = {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const Notifications = ({ notifications, onClose, onMarkAsRead }: Props) => {
  return (
    <div className="fixed left-[20%] top-0 h-screen w-80 bg-white shadow-lg z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-4rem)]">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={notification.user.profilePicture}
                    alt={notification.user.username}
                  />
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {notification.user.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(new Date(notification.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications; 