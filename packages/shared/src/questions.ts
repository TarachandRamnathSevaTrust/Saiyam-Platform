import { Question, CurriculumSession, QuestionOption } from './types';

// Standardized physical paper options formats
export const OPTIONS_MKMH: QuestionOption[] = [
  { code: 'CORRECT', labelMr: 'बरोबर', labelEn: 'Correct' },
  { code: 'WRONG', labelMr: 'चूक', labelEn: 'Wrong' },
  { code: 'DONT_KNOW', labelMr: 'माहीत नाही', labelEn: "Don't Know" },
];

export const OPTIONS_MMAT: QuestionOption[] = [
  { code: 'CORRECT', labelMr: 'बरोबर', labelEn: 'Correct' },
  { code: 'WRONG', labelMr: 'चूक', labelEn: 'Wrong' },
  { code: 'CANNOT_SAY', labelMr: 'सांगता येत नाही', labelEn: 'Cannot Say' },
];

export const OPTIONS_ERT: QuestionOption[] = [
  { code: 'ALWAYS', labelMr: 'नेहमी', labelEn: 'Always' },
  { code: 'OFTEN', labelMr: 'बऱ्याच वेळा', labelEn: 'Often' },
  { code: 'SOMETIMES', labelMr: 'कधी कधी', labelEn: 'Sometimes' },
  { code: 'NEVER', labelMr: 'कधीच नाही', labelEn: 'Never' },
];

// ZERO hardcoded questions: Populated 100% dynamically from backend/database
// awaiting the verified list of ~90 questions with marks from TRST team.
export const INITIAL_QUESTIONS: Question[] = [];

// ZERO hardcoded sessions: Populated 100% dynamically from backend/database
// awaiting the official 25 sessions index from the TRST team.
export const ALL_25_SESSIONS: CurriculumSession[] = [];
