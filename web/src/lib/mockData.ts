import {
  School,
  Student,
  UserProfile,
  SessionLog,
  StudentAssessmentPair,
} from '@saiyam/shared';

// Pre-configured official system logins
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-admin',
    fullName: 'Trust Administrator',
    email: 'admin@trst.org.in',
    role: 'TRUST_ADMIN',
    phone: '+91 82620 38734',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'u-trainer-1',
    fullName: 'Anagha Kadolkar (क्षेत्र प्रशिक्षक)',
    email: 'trainer@trst.org.in',
    role: 'FIELD_TRAINER',
    phone: '+91 98220 00000',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// Zero dummy data: Clean initial state ready for real field data entry
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
