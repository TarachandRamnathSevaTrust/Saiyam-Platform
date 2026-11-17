import {
  School,
  Student,
  UserProfile,
  SessionLog,
  StudentAssessmentPair,
  Organization,
} from '@saiyam/shared';

// ZERO hardcoded organizations: 100% dynamic and managed by TRST
export const INITIAL_ORGANIZATIONS: Organization[] = [];

// System roles for switching between views (No hardcoded individuals)
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-trust-admin',
    fullName: 'Trust Executive (Trustee / Admin)',
    email: 'admin@trst.org.in',
    role: 'TRUST_ADMIN',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'u-field-trainer',
    fullName: 'Field Trainer (क्षेत्र प्रशिक्षक)',
    email: 'trainer@trst.org.in',
    role: 'FIELD_TRAINER',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ZERO hardcoded schools, students, pairs, or logs: 100% dynamic
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
