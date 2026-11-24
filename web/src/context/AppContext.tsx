import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  CurriculumModule,
  CurriculumSession,
  CURRICULUM_MODULES,
  ALL_25_SESSIONS,
  formatRowsForExcelExport,
  calculateAssessmentScore,
} from '@saiyam/shared';
import { apiService } from '../lib/api';
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
  isLoggedIn: boolean;
  login: (user: UserProfile) => Promise<void>;
  logout: () => void;
  currentUser: UserProfile;
  switchUser: (userId: string) => void;
  users: UserProfile[];
  refreshProfiles: () => Promise<UserProfile[]>;
  refreshData: () => Promise<void>;
  addUser: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => UserProfile;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  assignTrainerToSchool: (schoolId: string, trainerId: string) => void;
  financialYear: string;
  setFinancialYear: (fy: string) => void;
  availableFinancialYears: string[];
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
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
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
  curriculumModules: CurriculumModule[];
  curriculumSessions: CurriculumSession[];
}

// Ensure singleton Context across Vite HMR updates to prevent "useApp must be used within an AppProvider"
const CONTEXT_KEY = '__SAIYAM_APP_CONTEXT__';
const AppContext =
  ((globalThis as any)[CONTEXT_KEY] as React.Context<AppContextType | undefined>) ||
  (((globalThis as any)[CONTEXT_KEY] = createContext<AppContextType | undefined>(undefined)));

// Aggressive sanitization of browser storage to purge all obsolete caches & past mocks
const purgeObsoleteStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('saiyam_')) {
        const val = localStorage.getItem(key) || '';
        // If not on current schema namespace v10, or contains any legacy mock names
        if (
          !key.endsWith('_v10') ||
          val.includes('Kadolkar') ||
          val.includes('Anagha') ||
          val.includes('u-trainer-trst') ||
          val.includes('u-field-trainer') ||
          val.includes('JPIP') ||
          val.includes('VOPA')
        ) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {
    // ignore
  }
};
purgeObsoleteStorage();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('saiyam_users_v10');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('saiyam_logged_in_v10') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const isLogged = localStorage.getItem('saiyam_logged_in_v10') === 'true';
    if (isLogged) {
      const saved = localStorage.getItem('saiyam_user_v10');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.id) return parsed;
        } catch (e) {}
      }
    }
    return {
      id: '',
      fullName: '',
      email: '',
      role: undefined,
      isActive: false,
      createdAt: '',
    };
  });

  const logout = () => {
    setIsLoggedIn(false);
    // Securely purge all session & student PII from browser localStorage
    const keysToPurge = [
      'saiyam_logged_in_v10',
      'saiyam_user_v10',
      'saiyam_schools_v10',
      'saiyam_students_v10',
      'saiyam_assessment_pairs_v10',
      'saiyam_session_logs_v10',
      'saiyam_organizations_v10',
      'saiyam_users_v10',
      'saiyam_selected_school_v10',
    ];
    for (const key of keysToPurge) {
      localStorage.removeItem(key);
    }
    setStudents([]);
    setAssessmentPairs([]);
    setSessionLogs([]);
    setSelectedSchool(null);
    setCurrentUser({
      id: '',
      fullName: '',
      email: '',
      role: undefined,
      isActive: false,
      createdAt: '',
    });
    if (apiService.isConnected()) {
      apiService.signOut().catch(() => {});
    }
  };

  const availableFinancialYears = ['2025-26'];
  const [financialYear, setFinancialYear] = useState<string>('2025-26');

  useEffect(() => {
    localStorage.setItem('saiyam_fy_v10', '2025-26');
  }, []);

  const [language, setLanguage] = useState<'mr' | 'en'>(() => {
    return (localStorage.getItem('saiyam_lang_v10') as 'mr' | 'en') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('saiyam_lang_v10', language);
  }, [language]);
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('saiyam_organizations_v10');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_ORGANIZATIONS;
  });
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('saiyam_schools_v10');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [selectedSchool, setSelectedSchool] = useState<School | null>(() => {
    const saved = localStorage.getItem('saiyam_selected_school_v10');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto-select first school if none is active but schools exist
  useEffect(() => {
    if (!selectedSchool && schools.length > 0) {
      setSelectedSchool(schools[0]);
    }
  }, [schools, selectedSchool]);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('saiyam_students_v10');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [assessmentPairs, setAssessmentPairs] = useState<StudentAssessmentPair[]>(() => {
    const saved = localStorage.getItem('saiyam_assessment_pairs_v10');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENT_PAIRS;
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('saiyam_session_logs_v10');
    return saved ? JSON.parse(saved) : INITIAL_SESSION_LOGS;
  });

  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [curriculumModules, setCurriculumModules] = useState<CurriculumModule[]>(CURRICULUM_MODULES);
  const [curriculumSessions, setCurriculumSessions] = useState<CurriculumSession[]>(ALL_25_SESSIONS);

  // Auto-hydrate from Supabase PostgreSQL backend
  const hydrateFromBackend = useCallback(async () => {
    if (!apiService.isConnected()) return;

    try {
      // 1. Authenticate & cryptographically verify active session with Supabase Auth
      const activeAuthUser = await apiService.getCurrentSessionUser();
      if (activeAuthUser) {
        setCurrentUser(activeAuthUser);
        setIsLoggedIn(true);
        localStorage.setItem('saiyam_logged_in_v10', 'true');
        localStorage.setItem('saiyam_user_v10', JSON.stringify(activeAuthUser));
      }

      const [
        backendOrgs,
        backendSchools,
        backendLogs,
        backendProfiles,
        backendStudents,
        backendModules,
        backendSessions,
        backendQuestions,
        backendAssessments,
      ] = await Promise.all([
        apiService.getOrganizations(),
        apiService.getSchools(),
        apiService.getSessionLogs(),
        apiService.getProfiles(),
        apiService.getAllStudents(),
        apiService.getCurriculumModules(),
        apiService.getCurriculumSessions(),
        apiService.getQuestions(),
        apiService.getAllAssessmentsWithResponses(),
      ]);

      if (backendProfiles && backendProfiles.length > 0) {
        setUsers(backendProfiles);
        setCurrentUser((prev) => {
          if (!prev || !prev.id) return prev;
          const matched = backendProfiles.find(
            (u) => u.id === prev.id || u.email.toLowerCase() === prev.email.toLowerCase()
          );
          return matched || prev;
        });
      }

      if (backendOrgs && backendOrgs.length > 0) {
        setOrganizations(backendOrgs);
      }

      if (backendSchools && backendSchools.length > 0) {
        const resolvedSchools = backendSchools.map((s) => {
          const schoolLogs = (backendLogs || []).filter((l) => l.schoolId === s.id);
          const dynamicSessionsCount = new Set(schoolLogs.map((l) => l.sessionNumber)).size;
          let updated = {
            ...s,
            completedSessionsCount: dynamicSessionsCount,
          };
          if (!s.assignedTrainerId) {
            const matchedByName = (backendProfiles || []).find(
              (p) => p.role === 'FIELD_TRAINER' && p.fullName?.trim().toLowerCase() === (s.assignedTrainerName || '').trim().toLowerCase()
            );
            if (matchedByName) {
              return {
                ...updated,
                assignedTrainerId: matchedByName.id,
                assignedTrainerName: matchedByName.fullName,
              };
            }
            const orgTrainers = (backendProfiles || []).filter(
              (p) => p.role === 'FIELD_TRAINER' && (!s.organizationCode || p.organizationCode === s.organizationCode)
            );
            if (orgTrainers.length === 1) {
              return {
                ...updated,
                assignedTrainerId: orgTrainers[0].id,
                assignedTrainerName: orgTrainers[0].fullName,
              };
            }
          } else if (!s.assignedTrainerName) {
            const tr = (backendProfiles || []).find((p) => p.id === s.assignedTrainerId);
            if (tr) {
              return { ...updated, assignedTrainerName: tr.fullName };
            }
          }
          return updated;
        });
        setSchools(resolvedSchools);
        setSelectedSchool((prev) => {
          if (!prev) return resolvedSchools[0];
          const matched = resolvedSchools.find(
            (s) =>
              s.id === prev.id ||
              s.name.trim().toLowerCase() === prev.name.trim().toLowerCase()
          );
          return matched || resolvedSchools[0];
        });
      }

      if (backendStudents && backendStudents.length > 0) {
        setStudents(backendStudents);

        // Reconstruct assessment pairs for all students and papers from Supabase
        const assessmentsList = backendAssessments || [];
        const allPairs: StudentAssessmentPair[] = [];

        backendStudents.forEach((student) => {
          (['MKMH', 'MMAT', 'ERT'] as PaperType[]).forEach((pType) => {
            const preRec = assessmentsList.find(
              (a) => a.studentId === student.id && a.paperType === pType && a.phase === 'PRE'
            );
            const postRec = assessmentsList.find(
              (a) => a.studentId === student.id && a.paperType === pType && a.phase === 'POST'
            );

            const preTest: AssessmentRecord | undefined = preRec
              ? {
                  id: preRec.id,
                  studentId: preRec.studentId,
                  studentName: student.fullName,
                  bundleSequenceNo: student.bundleSequenceNo,
                  paperType: preRec.paperType,
                  phase: 'PRE',
                  totalQuestions: preRec.totalQuestions,
                  answeredCount: preRec.answeredCount,
                  correctCount: preRec.correctCount,
                  scorePercentage: preRec.scorePercentage,
                  completedAt: preRec.completedAt,
                  responses: preRec.responses.map((r, idx) => {
                    const qNum =
                      backendQuestions?.find((bq) => bq.id === r.questionId)?.questionNumber ||
                      idx + 1;
                    return {
                      questionId: r.questionId,
                      questionNumber: qNum,
                      selectedOptionCode: r.selectedOptionCode,
                      isCorrect: r.isCorrect,
                      pointsAwarded: r.pointsAwarded,
                    };
                  }),
                }
              : undefined;

            const postTest: AssessmentRecord | undefined = postRec
              ? {
                  id: postRec.id,
                  studentId: postRec.studentId,
                  studentName: student.fullName,
                  bundleSequenceNo: student.bundleSequenceNo,
                  paperType: postRec.paperType,
                  phase: 'POST',
                  totalQuestions: postRec.totalQuestions,
                  answeredCount: postRec.answeredCount,
                  correctCount: postRec.correctCount,
                  scorePercentage: postRec.scorePercentage,
                  completedAt: postRec.completedAt,
                  responses: postRec.responses.map((r, idx) => {
                    const qNum =
                      backendQuestions?.find((bq) => bq.id === r.questionId)?.questionNumber ||
                      idx + 1;
                    return {
                      questionId: r.questionId,
                      questionNumber: qNum,
                      selectedOptionCode: r.selectedOptionCode,
                      isCorrect: r.isCorrect,
                      pointsAwarded: r.pointsAwarded,
                    };
                  }),
                }
              : undefined;

            let delta: number | undefined = undefined;
            let pct: number | undefined = undefined;
            let status: StudentAssessmentPair['status'] = 'PENDING_PRE';

            if (preTest && postTest) {
              status = 'ALL_COMPLETED';
              delta = Number((postTest.scorePercentage - preTest.scorePercentage).toFixed(2));
              pct =
                preTest.scorePercentage > 0
                  ? Number(
                      (((postTest.scorePercentage - preTest.scorePercentage) /
                        preTest.scorePercentage) *
                        100).toFixed(2)
                    )
                  : postTest.scorePercentage;
            } else if (preTest) {
              status = 'PRE_COMPLETED';
            }

            allPairs.push({
              studentId: student.id,
              schoolId: student.schoolId,
              schoolName: (backendSchools || schools).find((s) => s.id === student.schoolId)?.name,
              financialYear: student.financialYear,
              studentName: student.fullName,
              bundleSequenceNo: student.bundleSequenceNo,
              gender: student.gender,
              standard: student.standard,
              division: student.division,
              paperType: pType,
              preTest,
              postTest,
              improvementDelta: delta,
              improvementPercentage: pct,
              status,
            });
          });
        });

        setAssessmentPairs(allPairs);
      }

      if (backendLogs && backendLogs.length > 0) {
        setSessionLogs(backendLogs);
      }

      if (backendModules && backendModules.length > 0) {
        setCurriculumModules(backendModules);
      }

      if (backendSessions && backendSessions.length > 0) {
        setCurriculumSessions(backendSessions);
      }

      if (backendQuestions && backendQuestions.length > 0) {
        setQuestions(backendQuestions);
      }
    } catch (err) {
      console.warn('Hydration from Supabase error:', err);
    }
  }, []);

  // Responsive trigger: run on mount AND whenever user logs in
  useEffect(() => {
    hydrateFromBackend();
  }, [hydrateFromBackend, isLoggedIn]);

  // Login handler: sets user and immediately awaits full backend hydration
  const login = async (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('saiyam_logged_in_v10', 'true');
    localStorage.setItem('saiyam_user_v10', JSON.stringify(user));
    await hydrateFromBackend();
  };

  // Sync state to versioned local storage (v10)
  useEffect(() => {
    localStorage.setItem('saiyam_user_v10', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('saiyam_schools_v10', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('saiyam_selected_school_v10', JSON.stringify(selectedSchool));
  }, [selectedSchool]);

  useEffect(() => {
    localStorage.setItem('saiyam_students_v10', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('saiyam_assessment_pairs_v10', JSON.stringify(assessmentPairs));
  }, [assessmentPairs]);

  useEffect(() => {
    try {
      localStorage.setItem('saiyam_session_logs_v10', JSON.stringify(sessionLogs));
    } catch (e) {
      console.warn('LocalStorage quota limit reached for sessionLogs:', e);
    }
  }, [sessionLogs]);

  useEffect(() => {
    localStorage.setItem('saiyam_organizations_v10', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('saiyam_users_v10', JSON.stringify(users));
  }, [users]);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('saiyam_logged_in_v10', 'true');
      localStorage.setItem('saiyam_user_v10', JSON.stringify(user));
      setSelectedSchool(null);
    }
  };

  const refreshProfiles = async (): Promise<UserProfile[]> => {
    if (!apiService.isConnected()) return users;
    try {
      const backendProfiles = await apiService.getProfiles();
      if (backendProfiles && backendProfiles.length > 0) {
        setUsers(backendProfiles);
        setCurrentUser((prev) => {
          if (!prev || !prev.id) return prev;
          const matched = backendProfiles.find(
            (u) => u.id === prev.id || u.email.toLowerCase() === prev.email.toLowerCase()
          );
          return matched || prev;
        });
        return backendProfiles;
      }
    } catch (e) {
      console.warn('Error refreshing profiles:', e);
    }
    return users;
  };

  const addUser = (userData: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (apiService.isConnected()) {
      apiService.updateProfile(id, updates).catch((err) => {
        console.warn('Failed to sync updated profile to Supabase:', err);
      });
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser.id === id) {
      logout();
    }
  };

  const assignTrainerToSchool = (schoolId: string, trainerId: string) => {
    const trainer = users.find((u) => u.id === trainerId);
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          return {
            ...s,
            assignedTrainerId: trainerId || undefined,
            assignedTrainerName: trainer ? trainer.fullName : undefined,
            organizationCode: trainer?.organizationCode || s.organizationCode,
          };
        }
        return s;
      })
    );

    if (apiService.isConnected()) {
      apiService
        .updateSchool(schoolId, {
          assignedTrainerId: trainerId || undefined,
          organizationCode: trainer?.organizationCode,
        })
        .catch((err) => {
          console.warn('Failed to sync school trainer assignment to Supabase:', err);
        });
    }
  };

  const addOrganization = (orgData: Omit<Organization, 'id' | 'createdAt' | 'isActive'>): Organization => {
    const tempId = `org-${Date.now()}`;
    const newOrg: Organization = {
      ...orgData,
      id: tempId,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrganizations((prev) => [...prev, newOrg]);

    // Asynchronously push to Supabase backend
    if (apiService.isConnected()) {
      apiService
        .createOrganization(orgData)
        .then((persistedOrg) => {
          if (persistedOrg) {
            setOrganizations((prev) =>
              prev.map((o) => (o.id === tempId ? persistedOrg : o))
            );
          }
        })
        .catch((err) => {
          console.warn('Failed to sync new organization to Supabase:', err);
        });
    }

    return newOrg;
  };

  const updateOrganization = (id: string, orgData: Partial<Organization>) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...orgData } : o))
    );
    if (apiService.isConnected()) {
      apiService.updateOrganization(id, orgData).catch((err) => {
        console.warn('Failed to update organization in Supabase:', err);
      });
    }
  };

  const deleteOrganization = (id: string) => {
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    if (apiService.isConnected()) {
      apiService.deleteOrganization(id).catch((err) => {
        console.warn('Failed to delete organization in Supabase:', err);
      });
    }
  };

  const addSchool = (schoolData: Omit<School, 'id' | 'createdAt'>): School => {
    const assignedTrainerId =
      schoolData.assignedTrainerId || (currentUser.role === 'FIELD_TRAINER' ? currentUser.id : undefined);
    const assignedTrainerName =
      schoolData.assignedTrainerName || (currentUser.role === 'FIELD_TRAINER' ? currentUser.fullName : undefined);
    const resolvedSchoolData: Omit<School, 'id' | 'createdAt'> = {
      ...schoolData,
      assignedTrainerId,
      assignedTrainerName,
      organizationCode: schoolData.organizationCode || currentUser.organizationCode,
    };

    const tempId = `sch-${Date.now()}`;
    const newSchool: School = {
      ...resolvedSchoolData,
      financialYear: resolvedSchoolData.financialYear || financialYear,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      totalStudentsCount: 0,
      completedSessionsCount: 0,
    };
    setSchools((prev) => [newSchool, ...prev]);
    setSelectedSchool(newSchool);

    if (apiService.isConnected()) {
      apiService
        .createSchool(resolvedSchoolData)
        .then((persistedSchool) => {
          if (persistedSchool) {
            const finalSchool: School = {
              ...persistedSchool,
              assignedTrainerId: persistedSchool.assignedTrainerId || assignedTrainerId,
              assignedTrainerName: persistedSchool.assignedTrainerName || assignedTrainerName,
            };
            setSchools((prev) =>
              prev.map((s) => (s.id === tempId ? finalSchool : s))
            );
            setSelectedSchool((prev) => (prev?.id === tempId ? finalSchool : prev));
          }
        })
        .catch((err) => {
          console.warn('Failed to sync new school to Supabase:', err);
        });
    }

    return newSchool;
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>): Student => {
    // Resolve real Supabase school UUID if current schoolId is temporary
    let resolvedSchoolId = studentData.schoolId;
    const currentSchool = schools.find(
      (s) =>
        s.id === studentData.schoolId ||
        s.name.trim().toLowerCase() === selectedSchool?.name?.trim().toLowerCase()
    );
    if (currentSchool && currentSchool.id && !currentSchool.id.startsWith('sch-')) {
      resolvedSchoolId = currentSchool.id;
    }

    const tempId = `st-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      schoolId: resolvedSchoolId,
      financialYear: studentData.financialYear || financialYear,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudents((prev) => [...prev, newStudent]);

    // Create initial pairs for all 3 papers (MKMH, MMAT, ERT)
    const newPairs: StudentAssessmentPair[] = (['MKMH', 'MMAT', 'ERT'] as PaperType[]).map((pType) => ({
      studentId: newStudent.id,
      financialYear: newStudent.financialYear,
      studentName: newStudent.fullName,
      bundleSequenceNo: newStudent.bundleSequenceNo,
      gender: newStudent.gender,
      standard: newStudent.standard,
      division: newStudent.division,
      paperType: pType,
      status: 'PENDING_PRE',
    }));

    setAssessmentPairs((prev) => [...prev, ...newPairs]);

    if (apiService.isConnected()) {
      apiService
        .createStudent({ ...studentData, schoolId: resolvedSchoolId })
        .then((persistedStudent) => {
          if (persistedStudent) {
            setStudents((prev) =>
              prev.map((s) => (s.id === tempId ? persistedStudent : s))
            );
            setAssessmentPairs((prev) =>
              prev.map((p) =>
                p.studentId === tempId ? { ...p, studentId: persistedStudent.id } : p
              )
            );
          }
        })
        .catch((err) => {
          console.warn('Failed to sync student to Supabase:', err);
        });
    }

    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    // Sync student updates to assessment pairs
    setAssessmentPairs((prev) =>
      prev.map((pair) => {
        if (pair.studentId === id) {
          return {
            ...pair,
            studentName: updates.fullName || pair.studentName,
            bundleSequenceNo:
              updates.bundleSequenceNo !== undefined
                ? updates.bundleSequenceNo
                : pair.bundleSequenceNo,
            gender: updates.gender || pair.gender,
            standard: updates.standard || pair.standard,
            division: updates.division || pair.division,
          };
        }
        return pair;
      })
    );

    if (apiService.isConnected()) {
      apiService.updateStudent(id, updates).catch((err) => {
        console.warn('Failed to sync student update to Supabase:', err);
      });
    }
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setAssessmentPairs((prev) => prev.filter((p) => p.studentId !== id));

    if (apiService.isConnected()) {
      apiService.deleteStudent(id).catch((err) => {
        console.warn('Failed to delete student in Supabase:', err);
      });
    }
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

    setAssessmentPairs((prev) => {
      const student = students.find((s) => s.id === studentId);
      const existingIndex = prev.findIndex(
        (pair) => pair.studentId === studentId && pair.paperType === paperType
      );

      if (existingIndex >= 0) {
        return prev.map((pair, idx) => {
          if (idx === existingIndex) {
            const pre = phase === 'PRE' ? assessmentRecord : pair.preTest;
            const post = phase === 'POST' ? assessmentRecord : pair.postTest;

            let delta: number | undefined = undefined;
            let pct: number | undefined = undefined;
            let status: StudentAssessmentPair['status'] = pair.status;

            if (pre && post) {
              status = 'ALL_COMPLETED';
              delta = Number((post.scorePercentage - pre.scorePercentage).toFixed(2));
              pct =
                pre.scorePercentage > 0
                  ? Number(
                      (((post.scorePercentage - pre.scorePercentage) / pre.scorePercentage) *
                        100).toFixed(2)
                    )
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
        });
      } else {
        const pre = phase === 'PRE' ? assessmentRecord : undefined;
        const post = phase === 'POST' ? assessmentRecord : undefined;
        const newPair: StudentAssessmentPair = {
          studentId,
          financialYear: student?.financialYear || '2025-26',
          studentName: student?.fullName || 'Student',
          bundleSequenceNo: student?.bundleSequenceNo || 1,
          gender: student?.gender || 'MALE',
          standard: student?.standard || '8',
          division: student?.division || 'A',
          paperType,
          preTest: pre,
          postTest: post,
          status: pre && post ? 'ALL_COMPLETED' : pre ? 'PRE_COMPLETED' : 'PENDING_PRE',
        };
        return [...prev, newPair];
      }
    });

    // Save to Supabase backend
    if (apiService.isConnected()) {
      apiService
        .saveAssessment(
          studentId,
          paperType,
          phase,
          {
            totalQuestions: scoreResult.totalQuestions,
            answeredCount: scoreResult.answeredCount,
            correctCount: scoreResult.correctCount,
            scorePercentage: scoreResult.scorePercentage,
            recordedBy: currentUser.id,
          },
          responses.map((r) => {
            const q = paperQuestions.find((pq) => pq.id === r.questionId);
            const isCorrect = Boolean(q && q.correctOptionCode && q.correctOptionCode === r.selectedOptionCode);
            return {
              questionId: r.questionId,
              selectedOptionCode: r.selectedOptionCode,
              isCorrect,
              pointsAwarded: isCorrect ? q?.marks || 1 : 0,
            };
          })
        )
        .catch((err) => console.warn('Failed to save assessment to Supabase:', err));
    }
  };

  const saveSessionLog = (logData: Omit<SessionLog, 'id' | 'createdAt'>) => {
    const targetFY = logData.financialYear || financialYear;
    const existingIndex = sessionLogs.findIndex(
      (l) => l.schoolId === logData.schoolId && l.sessionNumber === logData.sessionNumber && (l.financialYear || financialYear) === targetFY
    );

    const newLog: SessionLog = {
      ...logData,
      financialYear: targetFY,
      id: existingIndex >= 0 ? sessionLogs[existingIndex].id : `log-${Date.now()}`,
      createdAt: existingIndex >= 0 ? sessionLogs[existingIndex].createdAt : new Date().toISOString().split('T')[0],
    };

    setSessionLogs((prev) => {
      const filtered = prev.filter(
        (l) => !(l.schoolId === logData.schoolId && l.sessionNumber === logData.sessionNumber && (l.financialYear || financialYear) === targetFY)
      );
      return [newLog, ...filtered];
    });

    // 2. Increment completedSessionsCount dynamically for this school
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === logData.schoolId) {
          const updatedLogs = [
            newLog,
            ...sessionLogs.filter(
              (l) =>
                !(
                  l.schoolId === logData.schoolId &&
                  l.sessionNumber === logData.sessionNumber &&
                  (l.financialYear || financialYear) === targetFY
                )
            ),
          ];
          const schoolLogs = updatedLogs.filter((l) => l.schoolId === s.id);
          const distinctCount = new Set(schoolLogs.map((l) => l.sessionNumber)).size;
          return {
            ...s,
            completedSessionsCount: distinctCount,
          };
        }
        return s;
      })
    );

    setSelectedSchool((prev) => {
      if (prev && prev.id === logData.schoolId) {
        const updatedLogs = [
          newLog,
          ...sessionLogs.filter(
            (l) =>
              !(
                l.schoolId === logData.schoolId &&
                l.sessionNumber === logData.sessionNumber &&
                (l.financialYear || financialYear) === targetFY
              )
          ),
        ];
        const schoolLogs = updatedLogs.filter((l) => l.schoolId === prev.id);
        const distinctCount = new Set(schoolLogs.map((l) => l.sessionNumber)).size;
        return {
          ...prev,
          completedSessionsCount: distinctCount,
        };
      }
      return prev;
    });

    if (apiService.isConnected()) {
      apiService.createSessionLog({ ...logData, financialYear: targetFY })
        .then((saved) => {
          if (saved) {
            setSessionLogs((prev) =>
              prev.map((l) =>
                l.schoolId === saved.schoolId &&
                l.sessionNumber === saved.sessionNumber &&
                (l.financialYear || financialYear) === (saved.financialYear || targetFY)
                  ? saved
                  : l
              )
            );
          }
        })
        .catch((err) => {
          console.warn('Failed to sync session log to Supabase:', err);
        });
    }
  };

  const exportToExcel = (schoolId?: string) => {
    const filteredPairs = schoolId
      ? assessmentPairs.filter((p) => {
          const student = students.find((s) => s.id === p.studentId);
          return student?.schoolId === schoolId;
        })
      : assessmentPairs;

    const rows = formatRowsForExcelExport(filteredPairs, schools, students);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Saiyam Impact Report');

    const fileName = `TRST_Saiyam_Impact_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Real-time calculated dashboard stats
  const dashboardStats: DashboardStats = {
    totalFieldTrainers: users.filter((u) => u.role === 'FIELD_TRAINER').length,
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
        isLoggedIn,
        login,
        logout,
        currentUser,
        switchUser,
        users,
        refreshProfiles,
        refreshData: hydrateFromBackend,
        addUser,
        updateUser,
        deleteUser,
        assignTrainerToSchool,
        financialYear,
        setFinancialYear,
        availableFinancialYears,
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
        updateStudent,
        deleteStudent,
        assessmentPairs,
        saveAssessmentSubmission,
        sessionLogs,
        saveSessionLog,
        dashboardStats,
        exportToExcel,
        questions,
        curriculumModules,
        curriculumSessions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    const fallback = (globalThis as any).__SAIYAM_LAST_APP_CONTEXT_VALUE__;
    if (fallback) return fallback as AppContextType;
    throw new Error('useApp must be used within an AppProvider');
  }
  (globalThis as any).__SAIYAM_LAST_APP_CONTEXT_VALUE__ = context;
  return context;
};
