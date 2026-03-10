import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type LoginRequest, type UserProfileResponse } from '../services/auth.service';

// Import the existing interfaces from App
import type { UserProfile } from '../App';

// Backend user profile interface (what we get from API)
interface BackendUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subsidiary?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform backend user profile to App UserProfile
const transformBackendUser = (backendUser: BackendUserProfile): UserProfile => {
  // Use email as primary choice (but only if it's not empty), fall back to firstName, then id as last resort
  const hasValidEmail = backendUser.email && backendUser.email.trim() !== '';
  const username = hasValidEmail 
    ? backendUser.email 
    : backendUser.firstName || `User_${backendUser.id.slice(-4)}`;
  
  return {
    id: backendUser.id,
    username: username,
    firstName: backendUser.firstName,
    role: 'admin', // Single admin role
    company: 'Genomac',
    permissions: ['view_all', 'manage_all', 'analytics_all']
  };
};

// Define the complete auth state and actions
interface AuthState {
  // State properties
  user: UserProfile | null;
  token: string | null;
  loginEmail: string | null; // Store the email used for login
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionStartTime: number | null; // Track when session started
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  extendSession: () => void; // Manually extend session
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      loginEmail: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionStartTime: null,

      // Login action - handles the complete login flow
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          // Step 1: Login and get token
          const loginResponse = await authService.login(credentials);
          
          // Step 2: Get user profile from JWT token
          const userProfileResponse: UserProfileResponse = await authService.getUserProfile();
          
          // Step 3: Transform backend user to App UserProfile format
          const backendUserWithEmail = {
            ...userProfileResponse.data,
            email: userProfileResponse.data.email || credentials.email
          };
          const transformedUser = transformBackendUser(backendUserWithEmail);
          
          // Step 4: Update store with complete auth state
          set({
            user: transformedUser,
            token: loginResponse.data.token,
            loginEmail: credentials.email,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionStartTime: Date.now()
          });
          
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed',
            user: null,
            token: null,
            isAuthenticated: false,
            sessionStartTime: null
          });
          throw error;
        }
      },

      // Logout action - clears everything
      logout: () => {
        // console.log('🚪 Logging out...');
        
        // Clear token from auth service (localStorage)
        authService.logout();
        
        // Clear store state
        set({
          user: null,
          token: null,
          loginEmail: null,
          isAuthenticated: false,
          error: null,
          sessionStartTime: null
        });
        
  // console.log removed
      },

      // Restore session - checks if we have a valid token and restores user
      restoreSession: async () => {
        const { token, loginEmail } = get();
        
        if (!token) {
          return;
        }
        
        set({ isLoading: true });
        
        try {
          // Verify token is still valid by fetching user profile
          const userProfileResponse: UserProfileResponse = await authService.getUserProfile();
          
          // Transform backend user to App UserProfile format
          const backendUserWithEmail = {
            ...userProfileResponse.data,
            email: userProfileResponse.data.email || loginEmail || ''
          };
          const transformedUser = transformBackendUser(backendUserWithEmail);
          
          set({
            user: transformedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionStartTime: get().sessionStartTime || Date.now()
          });
        } catch {
          // Token is invalid, clear everything
          authService.logout();
          set({
            user: null,
            token: null,
            loginEmail: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired, please login again',
            sessionStartTime: null
          });
        }
      },

      updateUser: (userData: Partial<UserProfile>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      // Set loading state manually if needed
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Extend session - updates session start time
      extendSession: () => {
        set({ sessionStartTime: Date.now() });
      }
    }),
    {
      name: 'genomac-auth-storage', // localStorage key
      partialize: (state) => ({ 
        token: state.token,
        loginEmail: state.loginEmail,
        user: state.user,
        sessionStartTime: state.sessionStartTime,
      }),
      // Only restore if we have both token and user
      onRehydrateStorage: () => (state) => {
        if (state?.token && state?.user) {
          // console.log removed
          // Set isAuthenticated if we have both user and token
          state.isAuthenticated = true;
        } else {
          // console.log('❌ Incomplete auth state, clearing...');
          // Clear incomplete state safely
          if (state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      }
    }
  )
);

// Selector hooks for common use cases (optional but helpful)
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

export const useAuthActions = () => {
  const { login, logout, restoreSession, updateUser, clearError } = useAuthStore();
  return { login, logout, restoreSession, updateUser, clearError };
};
