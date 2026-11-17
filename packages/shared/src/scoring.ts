import {
  AssessmentRecord,
  AssessmentResponse,
  PaperType,
  Question,
  StudentAssessmentPair,
  Student,
} from './types';

/**
 * Calculates raw score and percentage for an assessment submission.
 * Properly accounts for blanks and unanswered questions.
 */
export function calculateAssessmentScore(
  responses: AssessmentResponse[],
  questions: Question[]
): {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
} {
  const totalQuestions = questions.length;
  let answeredCount = 0;
  let correctCount = 0;

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  for (const resp of responses) {
    if (resp.selectedOption && resp.selectedOption !== 'BLANK') {
      answeredCount++;
      const q = questionMap.get(resp.questionId);
      if (q && q.correctOption && q.correctOption === resp.selectedOption) {
        correctCount++;
        resp.isCorrect = true;
      } else {
        resp.isCorrect = false;
      }
    } else {
      resp.isCorrect = false;
    }
  }

  const scorePercentage =
    totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    scorePercentage,
  };
}

/**
 * Automatically binds a student's Pre-Test and Post-Test for a given paper type
 * and computes the exact improvement delta and percentage shift.
 */
export function computeStudentPair(
  student: Student,
  paperType: PaperType,
  preTest?: AssessmentRecord,
  postTest?: AssessmentRecord
): StudentAssessmentPair {
  let improvementDelta: number | undefined = undefined;
  let improvementPercentage: number | undefined = undefined;

  let status: StudentAssessmentPair['status'] = 'PENDING_PRE';

  if (preTest && postTest) {
    status = 'ALL_COMPLETED';
    improvementDelta = Number((postTest.scorePercentage - preTest.scorePercentage).toFixed(2));
    improvementPercentage = preTest.scorePercentage > 0
      ? Number((((postTest.scorePercentage - preTest.scorePercentage) / preTest.scorePercentage) * 100).toFixed(2))
      : postTest.scorePercentage;
  } else if (preTest) {
    status = 'PRE_COMPLETED';
  }

  return {
    studentId: student.id,
    studentName: student.fullName,
    bundleSequenceNo: student.bundleSequenceNo,
    gender: student.gender,
    standard: student.standard,
    division: student.division,
    paperType,
    preTest,
    postTest,
    improvementDelta,
    improvementPercentage,
    status,
  };
}

/**
 * Aggregates a cohort of students to calculate overall paper performance.
 * Gives TRST executive leadership real-time statistical insight.
 */
export function aggregateCohortStats(pairs: StudentAssessmentPair[]) {
  const completedPairs = pairs.filter((p) => p.preTest && p.postTest);
  const total = pairs.length;
  const completed = completedPairs.length;

  if (completed === 0) {
    return {
      totalStudents: total,
      completedCount: 0,
      averagePreScore: 0,
      averagePostScore: 0,
      averageImprovementDelta: 0,
    };
  }

  const sumPre = completedPairs.reduce((acc, p) => acc + (p.preTest?.scorePercentage || 0), 0);
  const sumPost = completedPairs.reduce((acc, p) => acc + (p.postTest?.scorePercentage || 0), 0);
  const sumDelta = completedPairs.reduce((acc, p) => acc + (p.improvementDelta || 0), 0);

  return {
    totalStudents: total,
    completedCount: completed,
    averagePreScore: Number((sumPre / completed).toFixed(2)),
    averagePostScore: Number((sumPost / completed).toFixed(2)),
    averageImprovementDelta: Number((sumDelta / completed).toFixed(2)),
  };
}

/**
 * Prepares clean rows for the Consolidated Excel Export.
 * Formats data exactly as TRST researchers and stakeholders expect.
 */
export function formatRowsForExcelExport(pairs: StudentAssessmentPair[]) {
  return pairs.map((p) => ({
    'Bundle Serial #': `S-${p.bundleSequenceNo}`,
    'Student Name': p.studentName,
    'Gender': p.gender === 'FEMALE' ? 'मुलगी (Female)' : 'मुलगा (Male)',
    'Standard': p.standard,
    'Division': p.division,
    'Paper Code': p.paperType,
    'Pre-Test Score (%)': p.preTest ? `${p.preTest.scorePercentage}%` : 'Not Taken',
    'Post-Test Score (%)': p.postTest ? `${p.postTest.scorePercentage}%` : 'Not Taken',
    'Improvement Delta (%)':
      p.improvementDelta !== undefined
        ? `${p.improvementDelta > 0 ? '+' : ''}${p.improvementDelta}%`
        : 'N/A',
    'Status': p.status.replace('_', ' '),
  }));
}
