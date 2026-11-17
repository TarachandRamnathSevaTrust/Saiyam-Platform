import {
  School,
  Student,
  UserProfile,
  SessionLog,
  StudentAssessmentPair,
  Organization,
} from '@saiyam/shared';

// Official implementing organizations under Saiyam
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-trst',
    code: 'TRST_DIRECT',
    nameMr: 'ताराचंद रामनाथ सेवा ट्रस्ट (थेट)',
    nameEn: 'TRST Direct (In-House Team)',
    orgType: 'IN_HOUSE',
    description: 'TRST in-house field facilitators conducting direct classroom sessions and paper bundles.',
    contactPerson: 'Anagha Kadolkar',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'org-jpip',
    code: 'JPIP',
    nameMr: 'ज्ञान प्रबोधिनी संशोधन संस्था (JPIP)',
    nameEn: 'Jnana Prabodhini (JPIP)',
    orgType: 'PARTNER_NGO',
    description: 'Academic partner managing ~14-25 field trainers across designated school clusters.',
    contactPerson: 'Sandhya Tai (JPIP)',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'org-vopa',
    code: 'VOPA',
    nameMr: 'व्होपा (Vowels of People Association)',
    nameEn: 'VOPA (Vowels of People Association)',
    orgType: 'PARTNER_NGO',
    description: 'Digital education partner implementing Saiyam through dedicated school batches.',
    contactPerson: 'VOPA Program Lead',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// Pre-configured official system logins with organization scoping
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-admin',
    fullName: 'Trust Executive (Darshan / Trustee)',
    email: 'admin@trst.org.in',
    role: 'TRUST_ADMIN',
    phone: '+91 82620 38734',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'u-trainer-trst',
    fullName: 'Anagha Kadolkar (TRST Direct Trainer)',
    email: 'anagha@trst.org.in',
    role: 'FIELD_TRAINER',
    organizationId: 'org-trst',
    organizationCode: 'TRST_DIRECT',
    phone: '+91 98220 00000',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'u-trainer-jpip',
    fullName: 'JPIP Field Trainer (ज्ञान प्रबोधिनी)',
    email: 'jpip.trainer@prabodhini.org',
    role: 'FIELD_TRAINER',
    organizationId: 'org-jpip',
    organizationCode: 'JPIP',
    phone: '+91 98221 11111',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'u-trainer-vopa',
    fullName: 'VOPA Coordinator (व्होपा)',
    email: 'coord@vopa.org',
    role: 'FIELD_TRAINER',
    organizationId: 'org-vopa',
    organizationCode: 'VOPA',
    phone: '+91 98222 22222',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// Zero dummy data: Clean initial state ready for real field data entry
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
