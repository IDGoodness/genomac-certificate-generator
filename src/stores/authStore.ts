import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type LoginRequest, type UserProfileResponse } from '../services/auth.service';

// Import the existing interfaces from App
import type { UserProfile, Subsidiary } from '../App';

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
const transformBackendUser = (backendUser: BackendUserProfile, subsidiaries?: Subsidiary[]): UserProfile => {
  // Use email as primary choice (but only if it's not empty), fall back to firstName, then id as last resort
  const hasValidEmail = backendUser.email && backendUser.email.trim() !== '';
  const username = hasValidEmail 
    ? backendUser.email 
    : backendUser.firstName || `User_${backendUser.id.slice(-4)}`;
  
  // console.log removed: avoid logging PII in production
  
  // Find the matching subsidiary object if user has a subsidiary
  const userSubsidiary = subsidiaries && backendUser.subsidiary 
    ? subsidiaries.find(sub => sub.id === backendUser.subsidiary) || null
    : null;
  
  return {
    id: backendUser.id,
    username: username, // Use email if valid, otherwise firstName or generated username
    firstName: backendUser.firstName, // Keep individual first name
    role: backendUser.subsidiary ? 'subsidiary_admin' : 'holdings_admin', // Holdings admins don't have subsidiary
    company: 'Genomac Holdings',
    subsidiary: userSubsidiary, // Map subsidiary ID to actual subsidiary object
    canSwitchSubsidiaries: !backendUser.subsidiary, // Holdings admin can switch, subsidiary admin cannot
    permissions: !backendUser.subsidiary 
      ? ['view_all', 'manage_all', 'analytics_all'] // Holdings admin permissions
      : ['view_own', 'manage_own', 'analytics_own']  // Subsidiary admin permissions
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
  login: (credentials: LoginRequest, subsidiaries?: Subsidiary[]) => Promise<void>;
  logout: () => void;
  restoreSession: (subsidiaries?: Subsidiary[]) => Promise<void>;
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
      login: async (credentials: LoginRequest, subsidiaries?: Subsidiary[]) => {
        // console.log('🔐 Starting login process...');
        set({ isLoading: true, error: null });
        
        try {
          // Step 1: Login and get token
          const loginResponse = await authService.login(credentials);
          // console.log('✅ Login successful, token received');
          
          // Step 2: Get user profile from JWT token
          const userProfileResponse: UserProfileResponse = await authService.getUserProfile();
          // console.log('✅ User profile retrieved from JWT:', userProfileResponse.data);
          
          // Step 3: Transform backend user to App UserProfile format
          // Use the email from login credentials if JWT doesn't contain it
          const backendUserWithEmail = {
            ...userProfileResponse.data,
            email: userProfileResponse.data.email || credentials.email // Use JWT email or fallback to login email
          };
          const transformedUser = transformBackendUser(backendUserWithEmail, subsidiaries);
          
          // Step 4: Update store with complete auth state
          set({
            user: transformedUser,
            token: loginResponse.data.token,
            loginEmail: credentials.email, // Store the login email for session restoration
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionStartTime: Date.now() // Track when session started
          });
          
          // console.log removed
        } catch (error) {
          // console.error('❌ Login failed:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed',
            user: null,
            token: null,
            isAuthenticated: false,
            sessionStartTime: null
          });
          throw error; // Re-throw so components can handle it
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
      restoreSession: async (subsidiaries?: Subsidiary[]) => {
        const { token, loginEmail } = get();
        // console.log('🔄 Attempting to restore session...', token ? 'Token found' : 'No token');
        
        if (!token) {
          // console.log('❌ No token found, cannot restore session');
          return;
        }
        
        set({ isLoading: true });
        
        try {
          // Verify token is still valid by fetching user profile
          const userProfileResponse: UserProfileResponse = await authService.getUserProfile();
          // console.log('✅ Session restored successfully:', userProfileResponse.data);
          
          // Transform backend user to App UserProfile format
          // Use stored loginEmail as fallback if JWT doesn't contain email
          const backendUserWithEmail = {
            ...userProfileResponse.data,
            email: userProfileResponse.data.email || loginEmail || '' // Use JWT email, then stored loginEmail, then empty
          };
          const transformedUser = transformBackendUser(backendUserWithEmail, subsidiaries);
          
          set({
            user: transformedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            // Keep existing sessionStartTime if available, otherwise set to now
            sessionStartTime: get().sessionStartTime || Date.now()
          });
        } catch {
          // console.error('❌ Session restoration failed:', error);
          
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
