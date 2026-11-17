import {
  School,
  Student,
  UserProfile,
  SessionLog,
  StudentAssessmentPair,
  Organization,
} from '@saiyam/shared';

// Base In-House Organization (TRST). All other partner organizations are dynamically added by TRST.
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-trst',
    code: 'TRST_DIRECT',
    nameMr: 'ताराचंद रामनाथ सेवा ट्रस्ट (TRST)',
    nameEn: 'Tarachand Ramnath Seva Trust (TRST Direct)',
    orgType: 'IN_HOUSE',
    description: 'TRST in-house field facilitators conducting direct classroom sessions and paper bundles.',
    contactPerson: 'Anagha Kadolkar',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// Official verified TRST logins only (No synthetic partner users)
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
    fullName: 'Anagha Kadolkar (TRST Field Trainer)',
    email: 'anagha@trst.org.in',
    role: 'FIELD_TRAINER',
    organizationId: 'org-trst',
    organizationCode: 'TRST_DIRECT',
    phone: '+91 98220 00000',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// Clean initial state: zero synthetic data
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
