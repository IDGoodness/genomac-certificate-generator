import { nanoid } from 'nanoid';
import { encryptCertificateData } from './encryption';

/**
 * Generate a unique certificate ID using nanoid
 * Format: cert_[10-character-nanoid]
 * Example: cert_V1StGXR8_Z
 */
export const generateCertificateId = (): string => {
  const id = `cert_${nanoid(10)}`;
  console.log('🆔 Generated certificate ID:', id);
  return id;
};

/**
 * Generate a shorter certificate ID for demo purposes
 * Format: demo_[6-character-nanoid]
 * Example: demo_V1StGX
 */
export const generateDemoCertificateId = (): string => {
  return `demo_${nanoid(6)}`;
};

/**
 * Generate certificate URL for student access (LEGACY - unencrypted)
 * @param subsidiaryId - The subsidiary ID (e.g., 'genomac_institute')
 * @param programId - The program ID
 * @param certificateId - The certificate ID (usually from backend)
 * @returns Complete certificate URL
 * @deprecated Use generateSecureCertificateUrl instead for encrypted links
 */
export const generateCertificateUrl = (
  subsidiaryId: string, 
  programId: string, 
  certificateId: string
): string => {
  return `${window.location.origin}/certificate/${subsidiaryId}/${programId}/${certificateId}`;
};

/**
 * Generate secure certificate URL with time-based encryption
 * @param subsidiaryId - The subsidiary ID (e.g., 'genomac_institute')
 * @param programId - The program ID
 * @param certificateId - The certificate ID (usually from backend)
 * @param expirationDays - Number of days until link expires (default: 7)
 * @returns Complete encrypted certificate URL
 */
export const generateSecureCertificateUrl = (
  subsidiaryId: string, 
  programId: string, 
  certificateId: string,
  expirationDays: number = 7
): string => {
  const encryptedData = encryptCertificateData(subsidiaryId, programId, certificateId, expirationDays);
  return `${window.location.origin}/certificate/${encryptedData}`;
};

/**
 * Validate if a string looks like a nanoid-based certificate ID
 * @param id - The ID to validate
 * @returns true if it looks like a valid certificate ID
 */
export const isValidCertificateId = (id: string): boolean => {
  // Check if it starts with cert_ or demo_ and has appropriate length
  return (
    (id.startsWith('cert_') && id.length === 15) || // cert_ + 10 chars
    (id.startsWith('demo_') && id.length === 11)    // demo_ + 6 chars
  );
};

/**
 * Generate a unique program ID using nanoid
 * Format: prog_[8-character-nanoid]
 * Example: prog_V1StGXR8
 */
export const generateProgramId = (): string => {
  return `prog_${nanoid(8)}`;
};
