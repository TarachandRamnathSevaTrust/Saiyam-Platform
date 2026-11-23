import {
  AssessmentRecord,
  AssessmentResponse,
  PaperType,
  Question,
  StudentAssessmentPair,
  Student,
  School,
} from './types';

/**
 * Prorated Scoring Engine with Statistical Safeguard:
 * - Scores students based on questions actually attempted: (Correct / Answered) * 100
 * - Does not penalize students for innocent blanks
 * - Requires at least 60% of the paper to be attempted; otherwise flagged as INCOMPLETE
 */
export function calculateAssessmentScore(
  responses: AssessmentResponse[],
  questions: Question[]
): {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  scorePercentage: number;
  totalPointsScored: number;
  maxPossiblePoints: number;
  attemptedPoints: number;
  isIncomplete: boolean;
} {
  const totalQuestions = questions.length;
  let answeredCount = 0;
  let correctCount = 0;
  let totalPointsScored = 0;
  let maxPossiblePoints = 0;
  let attemptedPoints = 0;

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  for (const q of questions) {
    maxPossiblePoints += (q.marks ?? 1);
  }

  for (const resp of responses) {
    const q = questionMap.get(resp.questionId);
    const qWeight = q?.marks ?? 1;

    if (resp.selectedOptionCode) {
      answeredCount++;
      attemptedPoints += qWeight;

      // Likert rubric weighted scoring (e.g. ERT paper)
      if (q?.scoringRubric && resp.selectedOptionCode in q.scoringRubric) {
        const rubricPoints = q.scoringRubric[resp.selectedOptionCode];
        resp.pointsAwarded = rubricPoints;
        totalPointsScored += rubricPoints;
        resp.isCorrect = rubricPoints > 0;
        if (resp.isCorrect) correctCount++;
      } else if (q && q.correctOptionCode && q.correctOptionCode === resp.selectedOptionCode) {
        correctCount++;
        resp.isCorrect = true;
        resp.pointsAwarded = qWeight;
        totalPointsScored += qWeight;
      } else {
        resp.isCorrect = false;
        resp.pointsAwarded = 0;
      }
    } else {
      resp.isCorrect = false;
      resp.pointsAwarded = 0;
    }
  }

  // Minimum threshold: at least 60% questions attempted
  const minRequiredAttempts = Math.ceil(totalQuestions * 0.6);
  const isIncomplete = answeredCount < minRequiredAttempts;

  // Prorated Score: (totalPointsScored / attemptedPoints) * 100
  const scorePercentage =
    attemptedPoints > 0
      ? Number(((totalPointsScored / attemptedPoints) * 100).toFixed(2))
      : 0;

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    scorePercentage,
    totalPointsScored: Number(totalPointsScored.toFixed(2)),
    maxPossiblePoints: Number(maxPossiblePoints.toFixed(2)),
    attemptedPoints: Number(attemptedPoints.toFixed(2)),
    isIncomplete,
  };
}

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

export function formatRowsForExcelExport(
  pairs: StudentAssessmentPair[],
  schools?: School[],
  students?: Student[]
) {
  const schoolMap = new Map<string, string>();
  if (schools) {
    schools.forEach((s) => schoolMap.set(s.id, `${s.name}${s.village ? ` (${s.village})` : ''}`));
  }
  const studentSchoolMap = new Map<string, string>();
  if (students) {
    students.forEach((st) => studentSchoolMap.set(st.id, st.schoolId));
  }

  return pairs.map((p) => {
    const schoolId = p.schoolId || studentSchoolMap.get(p.studentId);
    const schoolName = p.schoolName || (schoolId ? schoolMap.get(schoolId) : '') || '—';

    return {
      'आर्थिक वर्ष (Financial Year)': p.financialYear || '2025-26',
      'शाळेचे नाव (School Name)': schoolName,
      'गठ्ठा अनुक्रमांक (Bundle #)': `S-${p.bundleSequenceNo}`,
      'विद्यार्थ्याचे नाव (Name)': p.studentName,
      'लिंग (Gender)': p.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा',
      'इयत्ता (Class)': p.standard,
      'तुकडी (Division)': p.division,
      'चाचणी प्रकार (Paper)': p.paperType,
      'Pre उत्तरे / एकूण': p.preTest ? `${p.preTest.answeredCount} / ${p.preTest.totalQuestions}` : '—',
      'पूर्व चाचणी स्कोअर (Pre %)': p.preTest ? `${p.preTest.scorePercentage}%` : 'घेतली नाही',
      'Post उत्तरे / एकूण': p.postTest ? `${p.postTest.answeredCount} / ${p.postTest.totalQuestions}` : '—',
      'उत्तर चाचणी स्कोअर (Post %)': p.postTest ? `${p.postTest.scorePercentage}%` : 'घेतली नाही',
      'फरक (Improvement Delta %)':
        p.improvementDelta !== undefined
          ? `${p.improvementDelta > 0 ? '+' : ''}${p.improvementDelta}%`
          : '—',
      'स्थिती (Status)':
        p.status === 'ALL_COMPLETED'
          ? 'दोन्ही चाचण्या पूर्ण'
          : p.status === 'PRE_COMPLETED'
          ? 'पूर्व चाचणी पूर्ण'
          : 'बाकी',
    };
  });
}
