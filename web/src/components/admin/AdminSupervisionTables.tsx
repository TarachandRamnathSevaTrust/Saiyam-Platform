import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, PaperType } from '@saiyam/shared';
import { Search, X } from 'lucide-react';

interface Props {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminSupervisionTables: React.FC<Props> = () => {
  const {
    schools,
    students,
    assessmentPairs,
    sessionLogs,
    users,
    language,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SCHOOLS' | 'TRAINERS' | 'STUDENTS'>('SCHOOLS');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchoolId, setFilterSchoolId] = useState('ALL');
  const [filterOrg, setFilterOrg] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');

  const fieldTrainers = users.filter((u) => u.role === 'FIELD_TRAINER');

  // Helper: Trainer name for a school
  const getTrainerName = (school?: School) => {
    if (!school) return '-';
    if (school.assignedTrainerName) return school.assignedTrainerName;
    if (school.assignedTrainerId) {
      const tr = users.find((u) => u.id === school.assignedTrainerId);
      if (tr?.fullName) return tr.fullName;
    }
    return language === 'mr' ? 'नेमलेले नाही' : 'Unassigned';
  };

  // Helper: Assessment score for a student & paper
  const getPaperScore = (studentId: string, paper: PaperType) => {
    const pair = assessmentPairs.find(
      (p) => p.studentId === studentId && p.paperType === paper
    );
    if (!pair?.preTest) return '-';
    const score = pair.preTest.correctCount ?? pair.preTest.answeredCount ?? 0;
    const total = pair.preTest.totalQuestions || 30;
    return `${score}/${total}`;
  };

  // --- Filtered Data ---
  const q = searchTerm.toLowerCase().trim();

  // 1. Filtered Schools
  const filteredSchools = schools.filter((s) => {
    if (filterOrg !== 'ALL' && (s.organizationCode || 'TRST_DIRECT') !== filterOrg) return false;
    if (q) {
      const match =
        s.name.toLowerCase().includes(q) ||
        (s.village || '').toLowerCase().includes(q) ||
        getTrainerName(s).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // 2. Filtered Trainers
  const filteredTrainers = fieldTrainers.filter((tr) => {
    if (filterOrg !== 'ALL' && (tr.organizationCode || 'TRST_DIRECT') !== filterOrg) return false;
    if (q) {
      const match =
        tr.fullName.toLowerCase().includes(q) ||
        (tr.phone || '').toLowerCase().includes(q) ||
        (tr.email || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // 3. Filtered Students
  const filteredStudents = students.filter((st) => {
    if (filterSchoolId !== 'ALL' && st.schoolId !== filterSchoolId) return false;
    if (filterGender !== 'ALL' && st.gender !== filterGender) return false;
    if (q) {
      const sch = schools.find((s) => s.id === st.schoolId);
      const match =
        st.fullName.toLowerCase().includes(q) ||
        `s-${st.bundleSequenceNo}`.includes(q) ||
        (sch?.name || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleTabChange = (tab: 'SCHOOLS' | 'TRAINERS' | 'STUDENTS') => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Simple Sub-Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => handleTabChange('SCHOOLS')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'SCHOOLS'
                ? 'bg-[#233d76] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'mr' ? `शाळा (${schools.length})` : `Schools (${schools.length})`}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('TRAINERS')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'TRAINERS'
                ? 'bg-[#233d76] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'mr'
              ? `प्रशिक्षक (${fieldTrainers.length})`
              : `Trainers (${fieldTrainers.length})`}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('STUDENTS')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'STUDENTS'
                ? 'bg-[#233d76] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'mr' ? `विद्यार्थी (${students.length})` : `Students (${students.length})`}
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-2 flex-1 sm:flex-none justify-end">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'शोधा...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#233d76] bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeTab === 'STUDENTS' && (
            <select
              value={filterSchoolId}
              onChange={(e) => setFilterSchoolId(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">{language === 'mr' ? 'सर्व शाळा' : 'All Schools'}</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === 'STUDENTS' && (
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">{language === 'mr' ? 'सर्व लिंग' : 'All'}</option>
              <option value="FEMALE">{language === 'mr' ? 'मुली' : 'Girls'}</option>
              <option value="MALE">{language === 'mr' ? 'मुलगे' : 'Boys'}</option>
            </select>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. SIMPLE SCHOOLS TABLE                                 */}
      {/* ======================================================= */}
      {activeTab === 'SCHOOLS' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'शाळेचे नाव' : 'School Name'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'गाव / तालुका' : 'Location'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Trainer'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'विद्यार्थी' : 'Students'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'सत्रे (२५)' : 'Sessions (25)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {language === 'mr' ? 'शाळा आढळली नाही' : 'No schools found'}
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school, i) => {
                    const studentCount = students.filter((s) => s.schoolId === school.id).length;
                    const sessionCount = sessionLogs.filter((l) => l.schoolId === school.id).length;

                    return (
                      <tr key={school.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                          {i + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {school.name}
                          <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                            ({school.organizationCode || 'TRST_DIRECT'})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {school.village}, {school.district}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {getTrainerName(school)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {studentCount}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {sessionCount}/25
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. SIMPLE TRAINERS TABLE                                */}
      {/* ======================================================= */}
      {activeTab === 'TRAINERS' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'प्रशिक्षकाचे नाव' : 'Trainer Name'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'संस्था' : 'Organization'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'फोन / संपर्क' : 'Contact'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'नेमलेल्या शाळा' : 'Assigned Schools'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'विद्यार्थी' : 'Students'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'नोंदवलेली सत्रे' : 'Sessions Logged'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrainers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {language === 'mr' ? 'प्रशिक्षक आढळले नाहीत' : 'No trainers found'}
                    </td>
                  </tr>
                ) : (
                  filteredTrainers.map((tr, i) => {
                    const assigned = schools.filter(
                      (s) => s.assignedTrainerId === tr.id || s.assignedTrainerName === tr.fullName
                    );
                    const studentCount = assigned.reduce(
                      (acc, sch) => acc + students.filter((st) => st.schoolId === sch.id).length,
                      0
                    );
                    const sessionCount = sessionLogs.filter((l) => l.conductedBy === tr.id).length;

                    return (
                      <tr key={tr.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                          {i + 1}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{tr.fullName}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {tr.organizationCode || 'TRST_DIRECT'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {tr.phone || tr.email || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          {assigned.length > 0
                            ? assigned.map((s) => s.name).join(', ')
                            : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {studentCount}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {sessionCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. SIMPLE STUDENTS TABLE                                */}
      {/* ======================================================= */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-16">{language === 'mr' ? 'गठ्ठा क्र.' : 'Bundle #'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'विद्यार्थ्याचे नाव' : 'Student Name'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'लिंग' : 'Gender'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'शाळा' : 'School'}</th>
                  <th className="py-2.5 px-3">{language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Trainer'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'चाचणी १ (MKMH)' : 'Paper 1'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'चाचणी २ (MMAT)' : 'Paper 2'}</th>
                  <th className="py-2.5 px-3 text-center">{language === 'mr' ? 'चाचणी ३ (ERT)' : 'Paper 3'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {language === 'mr' ? 'विद्यार्थी आढळले नाहीत' : 'No students found'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const sch = schools.find((s) => s.id === st.schoolId);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#233d76]">
                          S-{st.bundleSequenceNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {st.fullName}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            (इ. {st.standard || '८'})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              st.gender === 'FEMALE'
                                ? 'bg-pink-50 text-pink-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {st.gender === 'FEMALE'
                              ? language === 'mr' ? 'मुलगी' : 'Girl'
                              : language === 'mr' ? 'मुलगा' : 'Boy'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{sch?.name || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{getTrainerName(sch)}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                          {getPaperScore(st.id, 'MKMH')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                          {getPaperScore(st.id, 'MMAT')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                          {getPaperScore(st.id, 'ERT')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
