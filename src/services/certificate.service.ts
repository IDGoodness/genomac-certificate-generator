const API_BASE = 'https://certificategeneratorbackend-production.up.railway.app/api/v1';

// Import the auth store for token access
import { useAuthStore } from '../stores/authStore';

export interface Certificate {
    _id: string;  // Changed from 'id' to '_id'
    header: string;
    description: string;
    courseTitle: string;
    date: string;
    templateType: string;
    certificateUrl?: string;
    downloadUrl?: string;
    studentName?: string;
    organizationName?: string;
    subsidiary?: string;  // Added this since it appears in your logs
    createdAt: string;
    updatedAt: string;
}

export interface CertificateResponse {
    success: boolean;
    message: string;
    data: Certificate;
}

export interface CertificateListResponse {
    success: boolean;
    message: string;
    data: Certificate[];
}

class CertificateService {
    private getAuthHeaders(): HeadersInit {
        // Get token from Zustand store
        const token = useAuthStore.getState().token;
        
        // console.log('🔑 Getting auth headers, token exists:', !!token);
        
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async getCertificateById(certificateId: string): Promise<Certificate> {
        try {
            const response = await fetch(`${API_BASE}/certificate/${certificateId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CertificateResponse = await response.json();
            
            console.log('📥 Certificate retrieved from backend:', {
                certificateId: certificateId,
                backendData: data.data,
                templateType: data.data?.templateType,
                success: data.success
            });
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch certificate');
            }

            return data.data;
        } catch (error) {
            // console.error('Error fetching certificate:', error);
            throw error instanceof Error ? error : new Error('Failed to fetch certificate');
        }
    }

    async getCertificatesByUser(): Promise<Certificate[]> {
        try {
            const response = await fetch(`${API_BASE}/certificate/user`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CertificateListResponse = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch certificates');
            }

            return data.data;
        } catch (error) {
            // console.error('Error fetching certificates:', error);
            throw error instanceof Error ? error : new Error('Failed to fetch certificates');
        }
    }

    async getCertificatesBySubsidiary(subsidiaryId?: string): Promise<Certificate[]> {
        try {
            // For now, we fetch all certificates since the API doesn't support subsidiary filtering yet
            // TODO: Update when API supports filtering by subsidiary
            const endpoint = `${API_BASE}/certificate/`;
            
            console.log(`Fetching certificates from: ${endpoint}`, subsidiaryId ? `for subsidiary: ${subsidiaryId}` : '');
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CertificateListResponse = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch certificates');
            }

            return data.data;
        } catch (error) {
            console.error('Error fetching certificates by subsidiary:', error);
            throw error instanceof Error ? error : new Error('Failed to fetch certificates');
        }
    }

    async downloadCertificate(certificateId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE}/certificate/${certificateId}/download`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${certificateId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading certificate:', error);
            throw error instanceof Error ? error : new Error('Failed to download certificate');
        }
    }

    async getCertificatePreviewUrl(certificateId: string): Promise<string> {
        try {
            const response = await fetch(`${API_BASE}/certificate/${certificateId}/preview`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to get certificate preview');
            }

            return data.data.previewUrl;
        } catch (error) {
            console.error('Error getting certificate preview:', error);
            throw error instanceof Error ? error : new Error('Failed to get certificate preview');
        }
    }

    async deleteCertificate(certificateId: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE}/certificate/${certificateId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete certificate');
            }
        } catch (error) {
            console.error('Error deleting certificate:', error);
            throw error instanceof Error ? error : new Error('Failed to delete certificate');
        }
    }
}

export const certificateService = new CertificateService();
