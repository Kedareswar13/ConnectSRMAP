import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";

export interface Notification {
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
  recipient: string;
}

interface NotificationState {
  notifications: Notification[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isOpen: false,
  loading: false,
  error: null,
};

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const currentUserId = state.auth.user?._id;

      if (!currentUserId) {
        return rejectWithValue("User not authenticated");
      }

      const response = await axios.get(
        `${BASE_API_URL}/users/notifications`,
        { withCredentials: true }
      );
      
      if (response.data.status === "success") {
        // Ensure we're getting the notifications array from the correct path
        const notifications = response.data.data.notifications || [];
        console.log("Fetched notifications:", notifications); // Debug log
        return notifications;
      }
      return rejectWithValue("Failed to fetch notifications");
    } catch (error) {
      console.error("Error fetching notifications:", error); // Debug log
      return rejectWithValue("Error fetching notifications");
    }
  }
);

// Async thunk for marking a notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await axios.post(
        `${BASE_API_URL}/users/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue("Error marking notification as read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    toggleNotifications: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeNotifications: (state) => {
      state.isOpen = false;
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.error = null;
        console.log("Updated notifications in state:", state.notifications); // Debug log
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error("Error in notification slice:", action.payload); // Debug log
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        state.notifications = state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        );
      });
  },
});

export const {
  toggleNotifications,
  closeNotifications,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer; 