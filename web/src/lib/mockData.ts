import {
  School,
  Student,
  UserProfile,
  SessionLog,
  StudentAssessmentPair,
  Organization,
} from '@saiyam/shared';

// ZERO hardcoded data: 100% live from your Supabase PostgreSQL database
export const INITIAL_ORGANIZATIONS: Organization[] = [];
export const INITIAL_USERS: UserProfile[] = [];
export const INITIAL_SCHOOLS: School[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_ASSESSMENT_PAIRS: StudentAssessmentPair[] = [];
export const INITIAL_SESSION_LOGS: SessionLog[] = [];
