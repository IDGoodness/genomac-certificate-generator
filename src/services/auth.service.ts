import { jwtDecode } from 'jwt-decode';

const API_BASE = 'https://certificategeneratorbackend-production.up.railway.app/api/v1';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    subsidiary: string; // Required field
    adminKey: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
    };
}

export interface UserProfileResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        subsidiary?: string;
        role?: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface JWTPayload {
    _id: string;
    subsidiary?: string; // Make this optional since Holdings admin tokens might not have it
    iat: number;
    exp: number;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: unknown;
    access_token: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

export interface CreateCertificateRequest {
    header: string;
    description: string;
    courseTitle: string;
    date: string;
    templateType: string; // This will be "1", "2", "3", "4", "5", "6", etc. for template designs
    studentName?: string; // Add student name field
    programId?: string; // Add program ID
    certificateHtml?: string; // Add the complete certificate HTML
    subsidiary?: string; // Add subsidiary field for Holdings admin to specify target subsidiary
}

export interface CreateCertificateResponse {
    success: boolean;
    message: string;
    data: {
        certificateId?: string;
        certificateUrl?: string;
        downloadUrl?: string;
        [key: string]: unknown;
    };
}

export interface ApiError {
    success: boolean;
    status: number;
    message: string;
    data: unknown;
    detail?: string; // Fallback for other error formats
}

class AuthService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.message || error.detail || 'Login failed');
        }

        const data = await response.json();
        
        // Store token in localStorage
        localStorage.setItem('access_token', data.data.token);
        
        return data;
    }

    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        console.log('Making registration request to:', `${API_BASE}/auth/register`);
        console.log('Request payload:', {
            ...userData,
            password: '[REDACTED]',
            adminKey: '[REDACTED]'
        });

        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            let errorDetail = 'Registration failed';
            try {
                const error: ApiError = await response.json();
                // Use the message field for the new API error format, fallback to detail for older format
                errorDetail = error.message || error.detail || `HTTP ${response.status}: ${response.statusText}`;
                console.log('Error response body:', error);
            } catch (parseError) {
                console.log('Failed to parse error response:', parseError);
                errorDetail = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorDetail);
        }

        const data = await response.json();
        console.log('Registration successful:', {
            ...data,
            access_token: '[REDACTED]'
        });
        
        // Store token in localStorage
        localStorage.setItem('access_token', data.access_token);
        
        return data;
    }

    async changePassword(passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in first.');
        }

        console.log('Making change password request to:', `${API_BASE}/auth/change-password`);

        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
        });

        console.log('Change password response status:', response.status);

        if (!response.ok) {
            let errorDetail = 'Password change failed';
            try {
                const error: ApiError = await response.json();
                errorDetail = error.message || error.detail || `HTTP ${response.status}: ${response.statusText}`;
                console.log('Change password error response:', error);
            } catch (parseError) {
                console.log('Failed to parse error response:', parseError);
                errorDetail = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorDetail);
        }

        const data = await response.json();
        // console.log('Password changed successfully');
        
        return data;
    }

    async getPresets() {
        const response = await fetch(`${API_BASE}/auth/presets`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        });

        if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || 'Failed to fetch presets');
        }

        return response.json();
    }

    async getUserProfile(): Promise<UserProfileResponse> {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }

        try {
            // Decode the JWT token to extract user information
            const decoded = jwtDecode<JWTPayload>(token);
            // console.log('🔍 Decoded JWT Token Details:');
            // console.log('- User ID:', decoded._id);
            // console.log('- Email:', decoded.email);
            // console.log('- Subsidiary:', decoded.subsidiary);
            // console.log('- Full token payload:', decoded);

            // Create a response structure similar to what we'd expect from an API
            const userProfileResponse: UserProfileResponse = {
                success: true,
                message: 'User profile retrieved successfully',
                data: {
                    id: decoded._id,
                    email: decoded.email || '',
                    firstName: decoded.firstName || 'User',
                    lastName: decoded.lastName || '',
                    subsidiary: decoded.subsidiary,
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            };

            return userProfileResponse;
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            throw new Error('Invalid token format');
        }
    }

    async createCertificate(certificateData: CreateCertificateRequest): Promise<CreateCertificateResponse> {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found. Please log in first.');
        }

        // Debug: Check what subsidiary is in the current token
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            // console.log('🔍 JWT Token Analysis:');
            // console.log('  - Subsidiary in token:', decoded.subsidiary || 'UNDEFINED/NULL');
            // console.log('  - User ID:', decoded._id);
            // console.log('  - Email:', decoded.email || 'NOT_SET');
            // console.log('  - Full decoded token:', decoded);
            
            if (!decoded.subsidiary) {
                console.error('⚠️ WARNING: Token has NO subsidiary information!');
                console.error('⚠️ This explains why certificates go to wrong subsidiary!');
            }
        } catch (error) {
            console.error('❌ Failed to decode token for debugging:', error);
        }

        console.log('Making create certificate request to:', `${API_BASE}/certificate/create`);
        console.log('📤 Certificate request payload:', JSON.stringify(certificateData, null, 2));

        const response = await fetch(`${API_BASE}/certificate/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(certificateData),
        });

        console.log('Create certificate response status:', response.status);

        if (!response.ok) {
            let errorDetail = 'Certificate creation failed';
            try {
                const error: ApiError = await response.json();
                errorDetail = error.message || error.detail || `HTTP ${response.status}: ${response.statusText}`;
                console.log('Create certificate error response:', error);
            } catch (parseError) {
                console.log('Failed to parse error response:', parseError);
                errorDetail = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorDetail);
        }

        const data = await response.json();
        console.log('Certificate created successfully:', data);
        
        return data;
    }

    logout() {
        localStorage.removeItem('access_token');
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Debug helper to check current user's subsidiary from token
    getCurrentUserSubsidiary(): string | null {
        const token = this.getToken();
        if (!token) {
            console.log('❌ No token found');
            return null;
        }

        try {
            const decoded = jwtDecode<JWTPayload>(token);
            console.log('🏢 Token Analysis:');
            console.log('  - Subsidiary:', decoded.subsidiary || 'UNDEFINED');
            console.log('  - User ID:', decoded._id);
            console.log('  - Email:', decoded.email);
            console.log('  - Token issued at:', new Date(decoded.iat * 1000));
            console.log('  - Token expires at:', new Date(decoded.exp * 1000));
            
            if (!decoded.subsidiary) {
                console.error('🚨 CRITICAL: Your JWT token has NO subsidiary field!');
                console.error('🚨 This means your account was not properly associated with a subsidiary');
                console.error('🚨 You need to re-login or re-register with the correct subsidiary');
            }
            
            return decoded.subsidiary || null;
        } catch (error) {
            console.error('❌ Failed to decode token:', error);
            return null;
        }
    }

    // Check if current user is Holdings admin (no subsidiary assigned)
    isHoldingsAdmin(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<JWTPayload>(token);
            // Holdings admin has no subsidiary or undefined subsidiary
            return !decoded.subsidiary || decoded.subsidiary === '';
        } catch (error) {
            console.error('❌ Failed to decode token:', error);
            return false;
        }
    }

    // Get user role and subsidiary info
    getUserInfo(): { role: string; subsidiary: string | null; isHoldingsAdmin: boolean } {
        const token = this.getToken();
        if (!token) {
            return { role: 'none', subsidiary: null, isHoldingsAdmin: false };
        }

        try {
            const decoded = jwtDecode<JWTPayload>(token);
            const isHoldingsAdmin = !decoded.subsidiary || decoded.subsidiary === '';
            
            return {
                role: isHoldingsAdmin ? 'holdings_admin' : 'subsidiary_admin',
                subsidiary: decoded.subsidiary || null,
                isHoldingsAdmin
            };
        } catch (error) {
            console.error('❌ Failed to decode token:', error);
            return { role: 'none', subsidiary: null, isHoldingsAdmin: false };
        }
    }
}

export const authService = new AuthService();