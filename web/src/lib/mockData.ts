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

// System roles for switching between views (Zero hardcoded individuals or trainers)
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'de77cac3-3743-443f-8cf0-c4808c5bae8f',
    fullName: 'TRST Admin (विश्वस्त / Admin)',
    email: 'test-admin@trst.org.in',
    role: 'TRUST_ADMIN',
    isActive: true,
    createdAt: '2026-01-01',
  },
];

// ZERO hardcoded schools, students, pairs, or logs: 100% dynamic
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
