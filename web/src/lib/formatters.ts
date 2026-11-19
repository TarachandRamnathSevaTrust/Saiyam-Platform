/**
 * Saiyam Platform - Language & Entity Presentation Formatters
 * Ensures complete bilingual fidelity across English & Marathi UI modes.
 */

/**
 * Format Organization names based on active language.
 * Ensures TRST Direct and partner NGOs always render in the appropriate script.
 */
export const formatOrgName = (
  org: { code?: string; nameMr?: string; nameEn?: string } | null | undefined,
  language: 'mr' | 'en'
): string => {
  if (!org) return '';
  if (org.code === 'TRST_DIRECT' || org.code === 'TRST') {
    return language === 'mr'
      ? (org.nameMr || 'ताराचंद रामनाथ सेवा ट्रस्ट (थेट)')
      : 'Tarachand Ramnath Seva Trust (Direct)';
  }
  if (language === 'mr') {
    return org.nameMr || org.nameEn || org.code || '';
  }
  // English: prefer English name if available and does not contain Devanagari script
  if (org.nameEn && !/[\u0900-\u097F]/.test(org.nameEn)) {
    return org.nameEn;
  }
  return org.nameEn || org.nameMr || org.code || '';
};

/**
 * Format Gender based on active language.
 */
export const formatGender = (
  gender: string | undefined,
  language: 'mr' | 'en'
): string => {
  if (gender === 'FEMALE') return language === 'mr' ? 'मुलगी' : 'Female';
  if (gender === 'MALE') return language === 'mr' ? 'मुलगा' : 'Male';
  return gender || '—';
};

/**
 * Format Assessment Status based on active language.
 */
export const formatAssessmentStatus = (
  status: string | undefined,
  language: 'mr' | 'en'
): string => {
  if (status === 'ALL_COMPLETED') return language === 'mr' ? 'पूर्ण' : 'Completed';
  return language === 'mr' ? 'Pre पूर्ण' : 'Pre Done';
};
