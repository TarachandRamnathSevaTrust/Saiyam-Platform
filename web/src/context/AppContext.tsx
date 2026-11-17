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
  Organization,
  OrganizationCode,
  formatRowsForExcelExport,
  calculateAssessmentScore,
} from '@saiyam/shared';
import {
  INITIAL_USERS,
  INITIAL_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_ASSESSMENT_PAIRS,
  INITIAL_SESSION_LOGS,
  INITIAL_ORGANIZATIONS,
} from '../lib/mockData';
import { INITIAL_QUESTIONS } from '@saiyam/shared';

interface AppContextType {
  currentUser: UserProfile;
  switchUser: (userId: string) => void;
  users: UserProfile[];
  language: 'mr' | 'en';
  setLanguage: (lang: 'mr' | 'en') => void;
  organizations: Organization[];
  addOrganization: (orgData: Omit<Organization, 'id' | 'createdAt' | 'isActive'>) => Organization;
  updateOrganization: (id: string, orgData: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  selectedOrgFilter: string;
  setSelectedOrgFilter: (orgCode: string) => void;
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
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('saiyam_users_v3');
    if (saved) return JSON.parse(saved);
    localStorage.removeItem('saiyam_users');
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('saiyam_user_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.id === 'u-admin' || parsed.id === 'u-trainer-trst') return parsed;
    }
    localStorage.removeItem('saiyam_user');
    return INITIAL_USERS[1];
  });

  const [language, setLanguage] = useState<'mr' | 'en'>('mr');
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('saiyam_organizations_v3');
    if (saved) return JSON.parse(saved);
    localStorage.removeItem('saiyam_organizations');
    return INITIAL_ORGANIZATIONS;
  });
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');

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
    localStorage.setItem('saiyam_user_v3', JSON.stringify(currentUser));
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

  useEffect(() => {
    localStorage.setItem('saiyam_organizations_v3', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('saiyam_users_v3', JSON.stringify(users));
  }, [users]);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setSelectedSchool(null);
    }
  };

  const addOrganization = (orgData: Omit<Organization, 'id' | 'createdAt' | 'isActive'>): Organization => {
    const newOrg: Organization = {
      ...orgData,
      id: `org-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrganizations((prev) => [...prev, newOrg]);
    return newOrg;
  };

  const updateOrganization = (id: string, orgData: Partial<Organization>) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...orgData } : o))
    );
  };

  const deleteOrganization = (id: string) => {
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
  };

  const addSchool = (schoolData: Omit<School, 'id' | 'createdAt'>): School => {
    const newSchool: School = {
      ...schoolData,
      id: `sch-${Date.now()}`,
      organizationCode: schoolData.organizationCode || currentUser.organizationCode,
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

    // Compute score using Prorated Scoring Engine
    const scoreResult = calculateAssessmentScore(responses, paperQuestions);

    const assessmentRecord: AssessmentRecord = {
      id: `${phase.toLowerCase()}-${Date.now()}`,
      studentId,
      paperType,
      phase,
      totalQuestions: scoreResult.totalQuestions,
      answeredCount: scoreResult.answeredCount,
      correctCount: scoreResult.correctCount,
      scorePercentage: scoreResult.scorePercentage,
      completedAt: new Date().toISOString(),
      responses: responses.map((r) => {
        const q = paperQuestions.find((pq) => pq.id === r.questionId);
        const isCorrect = Boolean(q && q.correctOptionCode && q.correctOptionCode === r.selectedOptionCode);
        return { ...r, isCorrect };
      }),
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
        users,
        language,
        setLanguage,
        organizations,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        selectedOrgFilter,
        setSelectedOrgFilter,
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
