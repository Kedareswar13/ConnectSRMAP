import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,  
  reducers: {
    setAuthUser(state, action: PayloadAction<User | null>) {
      if (action.payload) {
        // Ensure required fields are present
        const { username, profilePicture, bio } = action.payload;
        state.user = {
          ...action.payload,
          username: username || "",
          profilePicture: profilePicture || "",
          bio: bio || "",
        };
      } else {
        state.user = null;
      }
    },
    signOut(state) {
      state.user = null;
    },
  },
});

export const { setAuthUser, signOut } = authSlice.actions;
export default authSlice.reducer;
