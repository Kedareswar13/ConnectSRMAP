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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      setIsSuggestedLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/users/suggested-user`, { withCredentials: true });
        if (response.data.status === 'success') setSuggestedUsers(response.data.data.users);
      } catch (error) { console.error('Failed to fetch suggested users:', error); }
      finally { setIsSuggestedLoading(false); }
    };
    fetchSuggestedUsers();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      setIsLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/users/search?query=${encodeURIComponent(searchQuery)}`, { withCredentials: true });
        if (response.data.status === 'success') setSearchResults(response.data.data.users);
      } catch (error) { toast.error('Failed to search users'); }
      finally { setIsLoading(false); }
    };
    const debounceTimer = setTimeout(() => { if (searchQuery) searchUsers(); }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    onClose();
  };

  const renderUserList = (users: User[], title: string) => (
    <div className="p-4 space-y-1">
      <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 px-2">{title}</h3>
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserClick(user._id)}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all"
        >
          <Avatar className="w-10 h-10 ring-1 ring-white/10">
            <AvatarImage src={user.profilePicture || '/images/placeholder.jpg'} alt={user.username} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-bold">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-white/80 truncate">{user.username}</p>
            <p className="text-xs text-white/30 truncate">{user.bio || 'No bio'}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 isolate overflow-hidden z-[9999]">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 left-64 flex">
        <div className="relative w-full shadow-2xl" style={{ background: 'hsl(230,25%,10%)', isolation: 'isolate' }}>
          <div className="w-full max-w-3xl mx-auto flex flex-col h-full">
            <div className="flex-none p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-white/[0.06] rounded-full transition-colors">
                  <X className="w-6 h-6 text-white/60" />
                </button>
                <h2 className="text-xl font-semibold text-white">Search</h2>
              </div>
              <div className="mt-4 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark w-full pl-10 pr-4 py-2.5"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 border-3 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32">
                    <p className="text-white/30">No users found</p>
                  </div>
                ) : renderUserList(searchResults, 'Search Results')
              ) : isSuggestedLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 border-3 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : renderUserList(suggestedUsers, 'Suggested Users')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;