import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  School,
  Student,
  UserProfile,
  StudentAssessmentPair,
  SessionLog,
  DashboardStats,
  Question,
  PaperType,
  AssessmentRecord,
  formatRowsForExcelExport,
} from '@saiyam/shared';
import {
  INITIAL_USERS,
  INITIAL_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_ASSESSMENT_PAIRS,
  INITIAL_SESSION_LOGS,
} from '../lib/mockData';
import { INITIAL_QUESTIONS } from '@saiyam/shared';

interface AppContextType {
  currentUser: UserProfile;
  switchUser: (userId: string) => void;
  language: 'mr' | 'en';
  setLanguage: (lang: 'mr' | 'en') => void;
  schools: School[];
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null) => void;
  addSchool: (schoolData: Omit<School, 'id' | 'createdAt'>) => School;
  students: Student[];
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => Student;
  assessmentPairs: StudentAssessmentPair[];
  saveAssessmentSubmission: (
    studentId: string,
    paperType: PaperType,
    phase: 'PRE' | 'POST',
    responses: { questionId: string; questionNumber: number; selectedOptionCode?: string }[]
  ) => void;
  sessionLogs: SessionLog[];
  saveSessionLog: (logData: Omit<SessionLog, 'id' | 'createdAt'>) => void;
  dashboardStats: DashboardStats;
  exportToExcel: (schoolId?: string) => void;
  questions: Question[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('saiyam_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // Default to Field Trainer (matching old app)
  });

  const [language, setLanguage] = useState<'mr' | 'en'>('mr');

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('saiyam_schools');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [selectedSchool, setSelectedSchool] = useState<School | null>(() => {
    const saved = localStorage.getItem('saiyam_selected_school');
    return saved ? JSON.parse(saved) : null;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('saiyam_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [assessmentPairs, setAssessmentPairs] = useState<StudentAssessmentPair[]>(() => {
    const saved = localStorage.getItem('saiyam_assessment_pairs');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENT_PAIRS;
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('saiyam_session_logs');
    return saved ? JSON.parse(saved) : INITIAL_SESSION_LOGS;
  });

  const [questions] = useState<Question[]>(INITIAL_QUESTIONS);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('saiyam_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('saiyam_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('saiyam_selected_school', JSON.stringify(selectedSchool));
  }, [selectedSchool]);

  useEffect(() => {
    localStorage.setItem('saiyam_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('saiyam_assessment_pairs', JSON.stringify(assessmentPairs));
  }, [assessmentPairs]);

  useEffect(() => {
    localStorage.setItem('saiyam_session_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  const switchUser = (userId: string) => {
    const user = INITIAL_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const addSchool = (schoolData: Omit<School, 'id' | 'createdAt'>): School => {
    const newSchool: School = {
      ...schoolData,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalStudentsCount: 0,
      completedSessionsCount: 0,
    };
    setSchools((prev) => [newSchool, ...prev]);
    setSelectedSchool(newSchool);
    return newSchool;
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>): Student => {
    const newStudent: Student = {
      ...studentData,
      id: `st-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudents((prev) => [...prev, newStudent]);

    // Create initial pairs for all 3 papers (MKMH, MMAT, ERT)
    const newPairs: StudentAssessmentPair[] = (['MKMH', 'MMAT', 'ERT'] as PaperType[]).map((pType) => ({
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      bundleSequenceNo: newStudent.bundleSequenceNo,
      gender: newStudent.gender,
      standard: newStudent.standard,
      division: newStudent.division,
      paperType: pType,
      status: 'PENDING_PRE',
    }));

    setAssessmentPairs((prev) => [...prev, ...newPairs]);
    return newStudent;
  };

  const saveAssessmentSubmission = (
    studentId: string,
    paperType: PaperType,
    phase: 'PRE' | 'POST',
    responses: { questionId: string; questionNumber: number; selectedOptionCode?: string }[]
  ) => {
    const paperQuestions = questions.filter((q) => q.paperType === paperType);
    let correctCount = 0;
    let answeredCount = 0;

    const scoredResponses = responses.map((r) => {
      const q = paperQuestions.find((pq) => pq.id === r.questionId);
      const isAns = Boolean(r.selectedOptionCode);
      if (isAns) answeredCount++;
      const isCorrect = Boolean(q && q.correctOptionCode && q.correctOptionCode === r.selectedOptionCode);
      if (isCorrect) correctCount++;
      return { ...r, isCorrect };
    });

    const scorePercentage =
      paperQuestions.length > 0 ? Number(((correctCount / paperQuestions.length) * 100).toFixed(2)) : 0;

    const assessmentRecord: AssessmentRecord = {
      id: `${phase.toLowerCase()}-${Date.now()}`,
      studentId,
      paperType,
      phase,
      totalQuestions: paperQuestions.length,
      answeredCount,
      correctCount,
      scorePercentage,
      completedAt: new Date().toISOString(),
      responses: scoredResponses,
    };

    setAssessmentPairs((prev) =>
      prev.map((pair) => {
        if (pair.studentId === studentId && pair.paperType === paperType) {
          const pre = phase === 'PRE' ? assessmentRecord : pair.preTest;
          const post = phase === 'POST' ? assessmentRecord : pair.postTest;

          let delta: number | undefined = undefined;
          let pct: number | undefined = undefined;
          let status: StudentAssessmentPair['status'] = pair.status;

          if (pre && post) {
            status = 'ALL_COMPLETED';
            delta = Number((post.scorePercentage - pre.scorePercentage).toFixed(2));
            pct = pre.scorePercentage > 0
              ? Number((((post.scorePercentage - pre.scorePercentage) / pre.scorePercentage) * 100).toFixed(2))
              : post.scorePercentage;
          } else if (pre) {
            status = 'PRE_COMPLETED';
          }

          return {
            ...pair,
            preTest: pre,
            postTest: post,
            improvementDelta: delta,
            improvementPercentage: pct,
            status,
          };
        }
        return pair;
      })
    );
  };

  const saveSessionLog = (logData: Omit<SessionLog, 'id' | 'createdAt'>) => {
    const newLog: SessionLog = {
      ...logData,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSessionLogs((prev) => {
      const filtered = prev.filter(
        (l) => !(l.schoolId === logData.schoolId && l.sessionNumber === logData.sessionNumber)
      );
      return [newLog, ...filtered];
    });

    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === logData.schoolId) {
          return {
            ...s,
            completedSessionsCount: Math.min(25, (s.completedSessionsCount || 0) + 1),
          };
        }
        return s;
      })
    );
  };

  const exportToExcel = (schoolId?: string) => {
    const filteredPairs = schoolId
      ? assessmentPairs.filter((p) => {
          const student = students.find((s) => s.id === p.studentId);
          return student?.schoolId === schoolId;
        })
      : assessmentPairs;

    const rows = formatRowsForExcelExport(filteredPairs);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Saiyam Impact Report');

    const fileName = `TRST_Saiyam_Impact_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Real-time calculated dashboard stats
  const dashboardStats: DashboardStats = {
    totalFieldTrainers: 1,
    totalSchools: schools.length,
    totalStudents: students.length,
    totalSessionsConducted: sessionLogs.length,
    attendanceRate:
      sessionLogs.length > 0
        ? Number(
            (
              sessionLogs.reduce((acc, l) => acc + l.totalAttendance, 0) /
              Math.max(1, sessionLogs.length * 50) *
              100
            ).toFixed(1)
          )
        : 0,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        language,
        setLanguage,
        schools,
        selectedSchool,
        setSelectedSchool,
        addSchool,
        students,
        addStudent,
        assessmentPairs,
        saveAssessmentSubmission,
        sessionLogs,
        saveSessionLog,
        dashboardStats,
        exportToExcel,
        questions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
