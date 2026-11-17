export type UserRole = 'TRUST_ADMIN' | 'FIELD_TRAINER' | 'HEAD_TRAINER';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface School {
  id: string;
  name: string; // e.g. Hujurpaga
  village: string; // e.g. Pune
  taluka: string;
  district: string;
  pinCode: string;
  programStartDate: string; // YYYY-MM-DD
  representativeName: string; // e.g. Patil Madam
  representativeContact?: string;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  createdAt: string;
  totalStudentsCount?: number;
  completedSessionsCount?: number;
}

export type DocumentType = 'REQUEST_LETTER' | 'STAMPED_COMPLETION_SHEET' | 'OTHER';

export interface SchoolDocument {
  id: string;
  schoolId: string;
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
  bundleSequenceNo: number; // S-1, S-2... 1:1 match with physical paper bundle
  fullName: string;
  gender: Gender;
  standard: string; // e.g. '8'
  division: string; // e.g. 'A'
  createdAt: string;
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
}

export interface AssessmentResponse {
  questionId: string;
  questionNumber: number;
  selectedOptionCode?: string; // e.g. 'CORRECT', 'WRONG', 'ALWAYS', 'SOMETIMES', or undefined for BLANK
  isCorrect?: boolean;
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

export interface CurriculumSession {
  sessionNumber: number; // 1 to 25
  titleMr: string;
  titleEn: string;
  description?: string;
}

export interface SessionLog {
  id: string;
  schoolId: string;
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
