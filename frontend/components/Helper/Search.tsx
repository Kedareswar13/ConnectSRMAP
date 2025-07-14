"use client";

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import axios from 'axios';
import { BASE_API_URL } from '@/server';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { toast } from 'sonner';

interface SearchProps {
  onClose: () => void;
}

const Search = ({ onClose }: SearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestedLoading, setIsSuggestedLoading] = useState(false);
  const router = useRouter();

  // Prevent background scrolling when search is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fetch suggested users when component mounts
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      setIsSuggestedLoading(true);
      try {
        const response = await axios.get(
          `${BASE_API_URL}/users/suggested-user`,
          { withCredentials: true }
        );

        if (response.data.status === 'success') {
          setSuggestedUsers(response.data.data.users);
        }
      } catch (error) {
        console.error('Failed to fetch suggested users:', error);
      } finally {
        setIsSuggestedLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${BASE_API_URL}/users/search?query=${encodeURIComponent(searchQuery)}`,
          { withCredentials: true }
        );

        if (response.data.status === 'success') {
          setSearchResults(response.data.data.users);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search users');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    onClose();
  };

  const renderUserList = (users: User[], title: string) => (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserClick(user._id)}
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage
              src={user.profilePicture || '/images/placeholder.jpg'}
              alt={user.username}
              className="object-cover"
            />
            <AvatarFallback>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{user.username}</p>
            <p className="text-sm text-gray-500 truncate">{user.bio || 'No bio'}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 isolate overflow-hidden z-[9999]">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search container */}
      <div className="fixed inset-y-0 right-0 left-64 flex">
        <div 
          className="relative w-full bg-white shadow-2xl"
          style={{ isolation: 'isolate' }}
        >
          <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
            {/* Header */}
            <div className="flex-none p-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold">Search</h2>
              </div>

              {/* Search input */}
              <div className="mt-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="h-full">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : searchQuery ? (
                  searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32">
                      <p className="text-center text-gray-500">No users found</p>
                    </div>
                  ) : (
                    renderUserList(searchResults, 'Search Results')
                  )
                ) : isSuggestedLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  renderUserList(suggestedUsers, 'Suggested Users')
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 