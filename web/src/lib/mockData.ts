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

// System roles: Zero hardcoded users or credentials (100% dynamic via Supabase Auth)
export const INITIAL_USERS: UserProfile[] = [];

// ZERO hardcoded schools, students, pairs, or logs: 100% dynamic
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
