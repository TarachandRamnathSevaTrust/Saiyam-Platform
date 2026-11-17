import {
  AssessmentRecord,
  AssessmentResponse,
  PaperType,
  Question,
  StudentAssessmentPair,
  Student,
} from './types';

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
    if (resp.selectedOptionCode) {
      answeredCount++;
      const q = questionMap.get(resp.questionId);
      if (q && q.correctOptionCode && q.correctOptionCode === resp.selectedOptionCode) {
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

export function formatRowsForExcelExport(pairs: StudentAssessmentPair[]) {
  return pairs.map((p) => ({
    'गठ्ठा अनुक्रमांक (Bundle #)': `S-${p.bundleSequenceNo}`,
    'विद्यार्थ्याचे नाव (Name)': p.studentName,
    'लिंग (Gender)': p.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा',
    'इयत्ता (Class)': p.standard,
    'तुकडी (Division)': p.division,
    'चाचणी प्रकार (Paper)': p.paperType,
    'पूर्व चाचणी स्कोअर (Pre %)': p.preTest ? `${p.preTest.scorePercentage}%` : 'घेतली नाही',
    'उत्तर चाचणी स्कोअर (Post %)': p.postTest ? `${p.postTest.scorePercentage}%` : 'घेतली नाही',
    'फरक (Improvement Delta %)':
      p.improvementDelta !== undefined
        ? `${p.improvementDelta > 0 ? '+' : ''}${p.improvementDelta}%`
        : '—',
    'स्थिती (Status)': p.status === 'ALL_COMPLETED' ? 'दोन्ही चाचण्या पूर्ण' : 'पूर्व चाचणी पूर्ण',
  }));
}
