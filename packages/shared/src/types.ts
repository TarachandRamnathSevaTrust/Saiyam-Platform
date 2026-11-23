export type UserRole = 'TRUST_ADMIN' | 'FIELD_TRAINER' | 'HEAD_TRAINER' | 'ORG_COORDINATOR';

export type OrganizationCode = string;

export interface Organization {
  id: string;
  code: string; // Dynamic identifier (e.g. TRST_DIRECT, JPIP, VOPA, or newly created org)
  nameMr: string;
  nameEn: string;
  orgType: 'IN_HOUSE' | 'PARTNER_NGO' | 'ACADEMIC_INSTITUTE' | 'GOVERNMENT' | 'OTHER';
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  coordinatorUserId?: string; // Links to UserProfile(id) assigned to coordinate this NGO
  coordinatorUserName?: string;
  coordinatorEmail?: string;
  isActive: boolean;
  createdAt: string;
  trainerCount?: number;
  schoolCount?: number;
}

export interface UserProfile {
  id: string;
  authUserId?: string; // Links to Supabase auth.users(id)
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  organizationId?: string; // null for TRUST_ADMIN who oversees all orgs
  organizationCode?: OrganizationCode;
  isActive: boolean;
  createdAt: string;
}

export interface School {
  id: string;
  financialYear?: string; // e.g. '2025-26', '2026-27'
  organizationId?: string; // links school to TRST Direct or partner NGO
  organizationCode?: OrganizationCode;
  name: string;
  village: string;
  taluka: string;
  district: string;
  pinCode: string;
  programStartDate: string; // YYYY-MM-DD
  representativeName: string;
  representativeContact?: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  createdAt: string;
  totalStudentsCount?: number;
  completedSessionsCount?: number;
  isActive?: boolean;
}

export type DocumentType = 'REQUEST_LETTER' | 'STAMPED_COMPLETION_SHEET' | 'OTHER';

export interface SchoolDocument {
  id: string;
  schoolId: string;
  financialYear?: string;
  documentType: DocumentType;
  title: string;
  fileUrl: string;
  fileSizeBytes?: number;
  uploadedBy?: string;
  uploadedAt: string;
}

export type Gender = 'FEMALE' | 'MALE' | 'OTHER';

export interface Student {
  id: string;
  schoolId: string;
  financialYear?: string; // e.g. '2025-26'
  bundleSequenceNo: number; // S-1, S-2... 1:1 match with physical paper bundle
  fullName: string;
  gender: Gender;
  standard: string; // e.g. '8'
  division: string; // e.g. 'A'
  createdAt: string;
  isActive?: boolean;
}

export type PaperType = 'MKMH' | 'MMAT' | 'ERT';
export type AssessmentPhase = 'PRE' | 'POST';

export interface QuestionOption {
  code: string;
  labelMr: string;
  labelEn: string;
}

export interface Question {
  id: string;
  paperType: PaperType;
  questionNumber: number;
  textMr: string;
  textEn: string;
  options: QuestionOption[];
  correctOptionCode?: string;
  category?: string;
  marks?: number; // Custom weightage marks per question (supports decimals e.g. 1.0, 2.0, 0.5)
  scoringRubric?: Record<string, number>; // For Likert/frequency scales: e.g. { ALWAYS: 3, OFTEN: 2, SOMETIMES: 1, NEVER: 0 }
}

export interface AssessmentResponse {
  questionId: string;
  questionNumber: number;
  selectedOptionCode?: string; // e.g. 'CORRECT', 'WRONG', 'ALWAYS', 'SOMETIMES', or undefined for BLANK
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface AssessmentRecord {
  id: string;
  studentId: string;
  studentName?: string;
  bundleSequenceNo?: number;
  paperType: PaperType;
  phase: AssessmentPhase;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  completedAt?: string;
  responses: AssessmentResponse[];
}

export interface StudentAssessmentPair {
  studentId: string;
  schoolId?: string;
  schoolName?: string;
  financialYear?: string;
  studentName: string;
  bundleSequenceNo: number;
  gender: Gender;
  standard: string;
  division: string;
  paperType: PaperType;
  preTest?: AssessmentRecord;
  postTest?: AssessmentRecord;
  improvementDelta?: number; // Post score - Pre score
  improvementPercentage?: number;
  status: 'PENDING_PRE' | 'PRE_COMPLETED' | 'ALL_COMPLETED';
}

export interface CurriculumModule {
  id?: string;
  moduleNumber: number;
  nameMr: string;
  nameEn: string;
  descriptionMr?: string;
  descriptionEn?: string;
}

export interface CurriculumSession {
  id?: string;
  sessionNumber: number; // 1 to 25
  phaseNumber?: number; // 1, 2, or 3
  titleMr: string;
  titleEn: string;
  sessionNameMr?: string;
  sessionNameEn?: string;
  moduleNumber?: number;
  moduleNameMr?: string;
  moduleNameEn?: string;
  description?: string;
  descriptionMr?: string;
  descriptionEn?: string;
}

export interface SessionLog {
  id: string;
  schoolId: string;
  financialYear?: string;
  sessionNumber: number;
  conductedDate: string;
  durationMinutes: number;
  totalAttendance: number;
  girlsPresent: number;
  boysPresent: number;
  toolsUsed?: string;
  specialNotes?: string;
  conductedBy?: string;
  media: SessionMedia[];
  createdAt: string;
}

export type MediaType = 'PHOTO' | 'AUDIO' | 'VIDEO';

export interface SessionMedia {
  id: string;
  sessionLogId: string;
  mediaType: MediaType;
  fileUrl: string;
  fileName?: string;
  fileSizeBytes?: number;
  uploadedAt: string;
}

export interface DashboardStats {
  totalFieldTrainers: number;
  totalSchools: number;
  totalStudents: number;
  totalSessionsConducted: number;
  attendanceRate: number;
}
