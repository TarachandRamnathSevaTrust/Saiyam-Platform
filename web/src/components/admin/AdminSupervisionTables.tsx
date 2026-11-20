import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, Student, UserProfile, PaperType } from '@saiyam/shared';
import {
  Building2,
  Users,
  User,
  ClipboardCheck,
  BookOpen,
  FileText,
  Filter,
  Search,
  X,
  Download,
  FileSpreadsheet,
  Check,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminSupervisionTables: React.FC<Props> = ({ onNavigateToTab }) => {
  const {
    schools,
    selectedSchool,
    setSelectedSchool,
    students,
    assessmentPairs,
    sessionLogs,
    users,
    organizations,
    language,
    currentUser,
    exportToExcel,
  } = useApp();

  // Active top sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'SCHOOLS' | 'TRAINERS' | 'STUDENTS'>('SCHOOLS');

  // Schools View Mode: Table vs Cards
  const [schoolsViewMode, setSchoolsViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // --- SCHOOLS FILTERS ---
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolOrgFilter, setSchoolOrgFilter] = useState('ALL');
  const [schoolTrainerFilter, setSchoolTrainerFilter] = useState('ALL');

  // --- TRAINERS FILTERS ---
  const [trainerSearch, setTrainerSearch] = useState('');
  const [trainerOrgFilter, setTrainerOrgFilter] = useState('ALL');

  // --- STUDENTS FILTERS ---
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSchoolFilter, setStudentSchoolFilter] = useState('ALL');
  const [studentOrgFilter, setStudentOrgFilter] = useState('ALL');
  const [studentTrainerFilter, setStudentTrainerFilter] = useState('ALL');
  const [studentGenderFilter, setStudentGenderFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'DONE' | 'PENDING'>('ALL');

  // Field trainers list
  const fieldTrainers = users.filter((u) => u.role === 'FIELD_TRAINER');

  // Helper to find trainer name for a school
  const getSchoolTrainerName = (school: School): string => {
    if (school.assignedTrainerName) return school.assignedTrainerName;
    if (school.assignedTrainerId) {
      const tr = users.find((u) => u.id === school.assignedTrainerId);
      if (tr?.fullName) return tr.fullName;
    }
    return language === 'mr' ? 'नेमलेले नाही' : 'Not Assigned';
  };

  // Helper to find trainer name for a student
  const getStudentTrainerName = (student: Student): string => {
    const school = schools.find((s) => s.id === student.schoolId);
    if (school) return getSchoolTrainerName(school);
    return language === 'mr' ? 'नेमलेले नाही' : 'Not Assigned';
  };

  // Helper to find student assessment status
  const getStudentPaperStatus = (studentId: string, paper: PaperType) => {
    const pair = assessmentPairs.find(
      (p) => p.studentId === studentId && p.paperType === paper
    );
    const preScore = pair?.preTest?.correctCount ?? pair?.preTest?.answeredCount;
    const preTotal = pair?.preTest?.totalQuestions || (paper === 'MKMH' ? 30 : paper === 'MMAT' ? 30 : 35);
    const postScore = pair?.postTest?.correctCount ?? pair?.postTest?.answeredCount;
    const postTotal = pair?.postTest?.totalQuestions || (paper === 'MKMH' ? 30 : paper === 'MMAT' ? 30 : 35);

    return {
      hasPre: Boolean(pair?.preTest),
      preScore,
      preTotal,
      hasPost: Boolean(pair?.postTest),
      postScore,
      postTotal,
      delta: pair?.improvementDelta,
    };
  };

  // Generic CSV Exporter
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Filtered Schools CSV
  const handleExportSchoolsCsv = () => {
    const headers = [
      'School Name',
      'Organization',
      'Assigned Field Trainer',
      'Village',
      'Taluka',
      'District',
      'PIN Code',
      'Headmaster POC',
      'Contact Phone',
      'Students Enrolled',
      'Sessions Completed',
    ];
    const rows = filteredSchools.map((s) => [
      s.name,
      s.organizationCode || 'TRST_DIRECT',
      getSchoolTrainerName(s),
      s.village,
      s.taluka || '',
      s.district,
      s.pinCode,
      s.representativeName,
      s.representativeContact || '',
      students.filter((st) => st.schoolId === s.id).length,
      `${sessionLogs.filter((l) => l.schoolId === s.id).length}/25`,
    ]);
    downloadCsv(`Saiyam_Schools_Roster_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // Export Filtered Trainers CSV
  const handleExportTrainersCsv = () => {
    const headers = [
      'Trainer Full Name',
      'Organization',
      'Email',
      'Phone',
      'Assigned Schools Count',
      'Assigned Schools Names',
      'Total Students Registered',
      'Total Sessions Conducted',
    ];
    const rows = filteredTrainers.map((tr) => {
      const assigned = schools.filter(
        (s) => s.assignedTrainerId === tr.id || s.assignedTrainerName === tr.fullName
      );
      const studentCount = assigned.reduce(
        (acc, sch) => acc + students.filter((st) => st.schoolId === sch.id).length,
        0
      );
      const sessionCount = sessionLogs.filter((l) => l.conductedBy === tr.id).length;

      return [
        tr.fullName,
        tr.organizationCode || 'TRST_DIRECT',
        tr.email || '',
        tr.phone || '',
        assigned.length,
        assigned.map((s) => s.name).join('; '),
        studentCount,
        sessionCount,
      ];
    });
    downloadCsv(`Saiyam_Field_Trainers_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // Export Filtered Students Raw Data CSV
  const handleExportStudentsCsv = () => {
    const headers = [
      'Bundle Sequence No',
      'Student Full Name',
      'Gender',
      'Standard',
      'Division',
      'School Name',
      'Organization',
      'Field Trainer',
      'Paper 1 (MKMH) Pre Score',
      'Paper 1 (MKMH) Post Score',
      'Paper 2 (MMAT) Pre Score',
      'Paper 2 (MMAT) Post Score',
      'Paper 3 (ERT) Pre Score',
      'Paper 3 (ERT) Post Score',
    ];
    const rows = filteredStudents.map((st) => {
      const sch = schools.find((s) => s.id === st.schoolId);
      const mkmh = getStudentPaperStatus(st.id, 'MKMH');
      const mmat = getStudentPaperStatus(st.id, 'MMAT');
      const ert = getStudentPaperStatus(st.id, 'ERT');

      return [
        `S-${st.bundleSequenceNo}`,
        st.fullName,
        st.gender,
        st.standard || '8',
        st.division || 'A',
        sch?.name || '',
        sch?.organizationCode || 'TRST_DIRECT',
        getStudentTrainerName(st),
        mkmh.hasPre ? `${mkmh.preScore}/${mkmh.preTotal}` : 'Pending',
        mkmh.hasPost ? `${mkmh.postScore}/${mkmh.postTotal}` : 'Pending',
        mmat.hasPre ? `${mmat.preScore}/${mmat.preTotal}` : 'Pending',
        mmat.hasPost ? `${mmat.postScore}/${mmat.postTotal}` : 'Pending',
        ert.hasPre ? `${ert.preScore}/${ert.preTotal}` : 'Pending',
        ert.hasPost ? `${ert.postScore}/${ert.postTotal}` : 'Pending',
      ];
    });
    downloadCsv(`Saiyam_Students_Raw_Data_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  // --- FILTERED LISTS ---

  // Filtered Schools
  const filteredSchools = schools.filter((s) => {
    if (schoolOrgFilter !== 'ALL' && (s.organizationCode || 'TRST_DIRECT') !== schoolOrgFilter) {
      return false;
    }
    if (schoolTrainerFilter !== 'ALL') {
      const trainerName = getSchoolTrainerName(s);
      if (trainerName !== schoolTrainerFilter) return false;
    }
    if (schoolSearch.trim()) {
      const q = schoolSearch.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchVillage = (s.village || '').toLowerCase().includes(q);
      const matchDistrict = (s.district || '').toLowerCase().includes(q);
      const matchPoc = (s.representativeName || '').toLowerCase().includes(q);
      const matchTrainer = getSchoolTrainerName(s).toLowerCase().includes(q);
      if (!matchName && !matchVillage && !matchDistrict && !matchPoc && !matchTrainer) {
        return false;
      }
    }
    return true;
  });

  // Filtered Trainers
  const filteredTrainers = fieldTrainers.filter((tr) => {
    if (trainerOrgFilter !== 'ALL' && (tr.organizationCode || 'TRST_DIRECT') !== trainerOrgFilter) {
      return false;
    }
    if (trainerSearch.trim()) {
      const q = trainerSearch.toLowerCase().trim();
      const matchName = tr.fullName.toLowerCase().includes(q);
      const matchEmail = (tr.email || '').toLowerCase().includes(q);
      const matchPhone = (tr.phone || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Students
  const filteredStudents = students.filter((st) => {
    const sch = schools.find((s) => s.id === st.schoolId);

    if (studentSchoolFilter !== 'ALL' && st.schoolId !== studentSchoolFilter) return false;
    if (studentOrgFilter !== 'ALL' && (sch?.organizationCode || 'TRST_DIRECT') !== studentOrgFilter) return false;
    if (studentTrainerFilter !== 'ALL' && getStudentTrainerName(st) !== studentTrainerFilter) return false;
    if (studentGenderFilter !== 'ALL' && st.gender !== studentGenderFilter) return false;

    if (studentStatusFilter !== 'ALL') {
      const p1 = getStudentPaperStatus(st.id, 'MKMH');
      const p2 = getStudentPaperStatus(st.id, 'MMAT');
      const p3 = getStudentPaperStatus(st.id, 'ERT');
      const hasAnyPre = p1.hasPre || p2.hasPre || p3.hasPre;

      if (studentStatusFilter === 'DONE' && !hasAnyPre) return false;
      if (studentStatusFilter === 'PENDING' && hasAnyPre) return false;
    }

    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const matchName = st.fullName.toLowerCase().includes(q);
      const matchSeq = `s-${st.bundleSequenceNo}`.includes(q) || String(st.bundleSequenceNo) === q;
      const matchSchool = (sch?.name || '').toLowerCase().includes(q);
      const matchTrainer = getStudentTrainerName(st).toLowerCase().includes(q);
      if (!matchName && !matchSeq && !matchSchool && !matchTrainer) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Trust Supervision Header */}
      <div className="bg-[#233d76] text-white p-5 sm:p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#dfaf27] uppercase tracking-wider">
                {language === 'mr' ? 'विश्वस्त देखरेख व ऑडिट कक्ष' : 'Trust Supervision & Audit Control'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded text-slate-200">
                {language === 'mr' ? 'कच्चा डेटा तक्ते' : 'Raw Data Tables'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black trust-heading mt-1">
              {language === 'mr'
                ? 'शाळा, क्षेत्र प्रशिक्षक व विद्यार्थी सविस्तर डेटा'
                : 'Schools, Field Trainers & Students Raw Data Tables'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {language === 'mr'
                ? 'प्रत्यक्ष मैदानी कामाचा संपूर्ण डेटा, उपस्थिती व चाचणी प्रगतीचे फिल्टर-आधारित निरीक्षण'
                : 'Filter-wise inspection of on-ground field operations, schools, trainers and students data'}
            </p>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <span className="text-xs bg-[#f0da9a]/20 border border-[#dfaf27]/40 text-[#f0da9a] font-bold px-3 py-1.5 rounded-xl">
              {schools.length} {language === 'mr' ? 'शाळा' : 'Schools'}
            </span>
            <span className="text-xs bg-white/10 border border-white/20 text-white font-bold px-3 py-1.5 rounded-xl">
              {fieldTrainers.length} {language === 'mr' ? 'प्रशिक्षक' : 'Trainers'}
            </span>
            <span className="text-xs bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold px-3 py-1.5 rounded-xl">
              {students.length} {language === 'mr' ? 'विद्यार्थी' : 'Students'}
            </span>
          </div>
        </div>

        {/* 3 Sub-Tabs Switcher */}
        <div className="flex items-center space-x-2 mt-6 bg-[#1b2f5c] p-1.5 rounded-2xl w-full sm:w-auto sm:inline-flex">
          <button
            type="button"
            onClick={() => setActiveSubTab('SCHOOLS')}
            className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'SCHOOLS'
                ? 'bg-[#dfaf27] text-[#233d76] shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'mr' ? '१. शाळा तक्ता' : '1. Schools Table'}</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeSubTab === 'SCHOOLS'
                  ? 'bg-[#233d76] text-white'
                  : 'bg-white/15 text-slate-200'
              }`}
            >
              {schools.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('TRAINERS')}
            className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'TRAINERS'
                ? 'bg-[#dfaf27] text-[#233d76] shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'mr' ? '२. क्षेत्र प्रशिक्षक तक्ता' : '2. Field Trainers Table'}</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeSubTab === 'TRAINERS'
                  ? 'bg-[#233d76] text-white'
                  : 'bg-white/15 text-slate-200'
              }`}
            >
              {fieldTrainers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('STUDENTS')}
            className={`flex items-center space-x-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'STUDENTS'
                ? 'bg-[#dfaf27] text-[#233d76] shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'mr' ? '३. विद्यार्थी कच्चा डेटा' : '3. Students Raw Data'}</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeSubTab === 'STUDENTS'
                  ? 'bg-[#233d76] text-white'
                  : 'bg-white/15 text-slate-200'
              }`}
            >
              {students.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: SCHOOLS TABLE & CARDS                             */}
      {/* ============================================================ */}
      {activeSubTab === 'SCHOOLS' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    language === 'mr'
                      ? 'शाळेचे नाव, गाव, तालुका किंवा प्रशिक्षक शोधा...'
                      : 'Search by school name, village, or trainer...'
                  }
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
                />
                {schoolSearch && (
                  <button
                    onClick={() => setSchoolSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2">
                {/* Org Filter */}
                <select
                  value={schoolOrgFilter}
                  onChange={(e) => setSchoolOrgFilter(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व संस्था (Orgs)' : 'All Organizations'}</option>
                  <option value="TRST_DIRECT">TRST_DIRECT</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.code}>
                      {org.code}
                    </option>
                  ))}
                </select>

                {/* Trainer Filter */}
                <select
                  value={schoolTrainerFilter}
                  onChange={(e) => setSchoolTrainerFilter(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व प्रशिक्षक' : 'All Trainers'}</option>
                  {fieldTrainers.map((tr) => (
                    <option key={tr.id} value={tr.fullName}>
                      {tr.fullName}
                    </option>
                  ))}
                </select>

                {/* View Mode Switcher (Table vs Cards) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSchoolsViewMode('TABLE')}
                    className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      schoolsViewMode === 'TABLE'
                        ? 'bg-[#233d76] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'तक्ता' : 'Table'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchoolsViewMode('CARDS')}
                    className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      schoolsViewMode === 'CARDS'
                        ? 'bg-[#233d76] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{language === 'mr' ? 'कार्ड्स' : 'Cards'}</span>
                  </button>
                </div>

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportSchoolsCsv}
                  className="text-xs font-bold bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                  title={language === 'mr' ? 'शाळा डेटा CSV डाउनलोड करा' : 'Export Schools CSV'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                {language === 'mr'
                  ? `एकूण ${schools.length} पैकी ${filteredSchools.length} शाळा दिसत आहेत`
                  : `Showing ${filteredSchools.length} of ${schools.length} schools`}
              </span>
              {(schoolSearch || schoolOrgFilter !== 'ALL' || schoolTrainerFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSchoolSearch('');
                    setSchoolOrgFilter('ALL');
                    setSchoolTrainerFilter('ALL');
                  }}
                  className="text-[#233d76] font-bold hover:underline cursor-pointer"
                >
                  {language === 'mr' ? 'फिल्टर्स साफ करा' : 'Clear Filters'}
                </button>
              )}
            </div>
          </div>

          {/* TABLE VIEW */}
          {schoolsViewMode === 'TABLE' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#233d76] text-white text-[11px] font-black uppercase tracking-wider">
                      <th className="py-3 px-3.5 text-center w-12">#</th>
                      <th className="py-3 px-4 min-w-[200px]">
                        {language === 'mr' ? 'शाळेचे नाव व संस्था' : 'School & Organization'}
                      </th>
                      <th className="py-3 px-4 min-w-[170px]">
                        {language === 'mr' ? 'नेमलेले क्षेत्र प्रशिक्षक' : 'Assigned Field Trainer'}
                      </th>
                      <th className="py-3 px-3.5 min-w-[150px]">
                        {language === 'mr' ? 'गाव / तालुका / जिल्हा' : 'Location & PIN'}
                      </th>
                      <th className="py-3 px-3.5 text-center min-w-[100px]">
                        {language === 'mr' ? 'विद्यार्थी' : 'Students'}
                      </th>
                      <th className="py-3 px-3.5 text-center min-w-[110px]">
                        {language === 'mr' ? 'सत्रे पूर्ण' : 'Sessions Done'}
                      </th>
                      <th className="py-3 px-4 min-w-[240px] text-center">
                        {language === 'mr' ? 'ऑडिट तपासणी (Inspection)' : 'Audit Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                    {filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          {language === 'mr'
                            ? 'कोणतीही शाळा आढळली नाही.'
                            : 'No schools found matching filters.'}
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((school, index) => {
                        const schoolStudents = students.filter((s) => s.schoolId === school.id);
                        const schoolSessions = sessionLogs.filter((l) => l.schoolId === school.id);
                        const trainerName = getSchoolTrainerName(school);

                        return (
                          <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                              {index + 1}
                            </td>

                            {/* School & Org */}
                            <td className="py-3 px-4">
                              <div className="flex items-start space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center shrink-0 mt-0.5">
                                  <Building2 className="w-4 h-4 text-[#233d76]" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm trust-heading">
                                    {school.name}
                                  </p>
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#233d76]/10 text-[#233d76]">
                                      {school.organizationCode || 'TRST_DIRECT'}
                                    </span>
                                    <span className="text-[11px] text-slate-400">•</span>
                                    <span className="text-[11px] text-slate-500">
                                      {school.representativeName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Field Trainer */}
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-[#233d76] flex items-center justify-center shrink-0">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-slate-900 text-xs">
                                  {trainerName}
                                </span>
                              </div>
                            </td>

                            {/* Location */}
                            <td className="py-3 px-3.5 text-slate-600 text-xs">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>
                                  {school.village}, {school.district}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block ml-4">
                                PIN: {school.pinCode}
                              </span>
                            </td>

                            {/* Students Count */}
                            <td className="py-3 px-3.5 text-center">
                              <span className="inline-block font-black text-xs px-2.5 py-1 rounded-lg bg-[#233d76]/10 text-[#233d76]">
                                {schoolStudents.length}{' '}
                                <span className="font-normal text-[10px] text-slate-500">
                                  {language === 'mr' ? 'विद्यार्थी' : 'students'}
                                </span>
                              </span>
                            </td>

                            {/* Sessions Completed Progress */}
                            <td className="py-3 px-3.5 text-center">
                              <div>
                                <span className="inline-block font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                  {schoolSessions.length} / 25
                                </span>
                                <div className="w-16 bg-slate-100 rounded-full h-1 mt-1 mx-auto overflow-hidden">
                                  <div
                                    className="bg-emerald-600 h-1 rounded-full"
                                    style={{ width: `${(schoolSessions.length / 25) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* 4 Inspection Action Pills */}
                            <td className="py-3 px-4">
                              <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSchool(school);
                                    onNavigateToTab?.('STUDENTS');
                                  }}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#233d76] hover:text-white text-slate-700 transition-colors cursor-pointer flex items-center justify-center space-x-1"
                                  title={language === 'mr' ? 'विद्यार्थी यादी तपासा' : 'Inspect Student Roster'}
                                >
                                  <Users className="w-3 h-3" />
                                  <span>{language === 'mr' ? 'विद्यार्थी' : 'Students'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSchool(school);
                                    onNavigateToTab?.('ASSESSMENTS');
                                  }}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#233d76] hover:text-white text-slate-700 transition-colors cursor-pointer flex items-center justify-center space-x-1"
                                  title={language === 'mr' ? 'चाचण्या डेटा तपासा' : 'Inspect Tests'}
                                >
                                  <ClipboardCheck className="w-3 h-3" />
                                  <span>{language === 'mr' ? 'चाचण्या' : 'Tests'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSchool(school);
                                    onNavigateToTab?.('SESSIONS');
                                  }}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-[#233d76] hover:bg-[#1b2f5c] text-white transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                                  title={language === 'mr' ? 'सविस्तर सत्र तक्ता उघडा' : 'Inspect Session Logs'}
                                >
                                  <BookOpen className="w-3 h-3 text-[#dfaf27]" />
                                  <span>{language === 'mr' ? 'सत्रे' : 'Sessions'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSchool(school);
                                    onNavigateToTab?.('DOCUMENTS');
                                  }}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#233d76] hover:text-white text-slate-700 transition-colors cursor-pointer flex items-center justify-center space-x-1"
                                  title={language === 'mr' ? 'कागदपत्रे पुरावे' : 'Inspect Documents'}
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>{language === 'mr' ? 'कागदपत्रे' : 'Docs'}</span>
                                </button>
                              </div>
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

          {/* CARDS VIEW */}
          {schoolsViewMode === 'CARDS' && (
            <div className="space-y-4">
              {filteredSchools.map((school) => {
                const isSelected = selectedSchool?.id === school.id;
                const schoolSessions = sessionLogs.filter((l) => l.schoolId === school.id);
                const schoolStudents = students.filter((s) => s.schoolId === school.id);
                const trainerName = getSchoolTrainerName(school);

                return (
                  <div
                    key={school.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-[#233d76] ring-2 ring-[#233d76]/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedSchool(school)}
                      className="p-5 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer border-b border-slate-100"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#233d76] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                          <Building2 className="w-5 h-5 text-[#dfaf27]" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-base text-slate-900 trust-heading">
                              {school.name}
                            </h3>
                            {school.organizationCode && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#233d76]/10 text-[#233d76]">
                                {school.organizationCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {school.village}, {school.district} • PIN: {school.pinCode}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-xs text-[#233d76] font-bold mt-1">
                            <User className="w-3 h-3" />
                            <span>
                              {language === 'mr' ? 'क्षेत्र प्रशिक्षक: ' : 'Trainer: '}
                              {trainerName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-bold px-2.5 py-1 rounded-full border border-[#dfaf27]/40">
                          {schoolSessions.length} / 25 {language === 'mr' ? 'सत्रे पूर्ण' : 'Sessions Done'}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          {schoolStudents.length} {language === 'mr' ? 'नोंदणीकृत विद्यार्थी' : 'Students Enrolled'}
                        </span>
                      </div>
                    </div>

                    {/* 4 Action / Inspection Buttons */}
                    <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => {
                          setSelectedSchool(school);
                          onNavigateToTab?.('STUDENTS');
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <Users className="w-4 h-4 text-[#233d76]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {language === 'mr' ? 'विद्यार्थी यादी' : 'Student Roster'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {schoolStudents.length} {language === 'mr' ? 'विद्यार्थी' : 'Students'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSchool(school);
                          onNavigateToTab?.('ASSESSMENTS');
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <ClipboardCheck className="w-4 h-4 text-[#233d76]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {language === 'mr' ? 'पूर्व / उत्तर चाचण्या' : 'Pre / Post Tests'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {language === 'mr' ? '३ पेपर्स (MKMH, MMAT, ERT)' : '3 Papers'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSchool(school);
                          onNavigateToTab?.('SESSIONS');
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-4 h-4 text-[#233d76]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {language === 'mr' ? 'सत्र नोंदी तक्ता' : 'Session Table'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {schoolSessions.length} / 25 {language === 'mr' ? 'पूर्ण' : 'Done'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSchool(school);
                          onNavigateToTab?.('DOCUMENTS');
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4 text-[#233d76]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {language === 'mr' ? 'कागदपत्रे पुरावे' : 'Documents'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {language === 'mr' ? 'सही व शिक्का' : 'HM Stamp & Consent'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: FIELD TRAINERS RAW DATA TABLE                     */}
      {/* ============================================================ */}
      {activeSubTab === 'TRAINERS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    language === 'mr'
                      ? 'प्रशिक्षकाचे नाव, फोन किंवा ईमेल शोधा...'
                      : 'Search by trainer name, phone, or email...'
                  }
                  value={trainerSearch}
                  onChange={(e) => setTrainerSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
                />
                {trainerSearch && (
                  <button
                    onClick={() => setTrainerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={trainerOrgFilter}
                  onChange={(e) => setTrainerOrgFilter(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व संस्था' : 'All Organizations'}</option>
                  <option value="TRST_DIRECT">TRST_DIRECT</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.code}>
                      {org.code}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportTrainersCsv}
                  className="text-xs font-bold bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0"
                  title="Export Field Trainers CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                {language === 'mr'
                  ? `एकूण ${fieldTrainers.length} पैकी ${filteredTrainers.length} क्षेत्र प्रशिक्षक दिसत आहेत`
                  : `Showing ${filteredTrainers.length} of ${fieldTrainers.length} field trainers`}
              </span>
              {(trainerSearch || trainerOrgFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setTrainerSearch('');
                    setTrainerOrgFilter('ALL');
                  }}
                  className="text-[#233d76] font-bold hover:underline cursor-pointer"
                >
                  {language === 'mr' ? 'फिल्टर्स साफ करा' : 'Clear Filters'}
                </button>
              )}
            </div>
          </div>

          {/* TRAINERS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#233d76] text-white text-[11px] font-black uppercase tracking-wider">
                    <th className="py-3 px-3.5 text-center w-12">#</th>
                    <th className="py-3 px-4 min-w-[200px]">
                      {language === 'mr' ? 'क्षेत्र प्रशिक्षक व भूमिका' : 'Field Trainer & Role'}
                    </th>
                    <th className="py-3 px-3.5 min-w-[130px]">
                      {language === 'mr' ? 'संस्था' : 'Organization'}
                    </th>
                    <th className="py-3 px-4 min-w-[180px]">
                      {language === 'mr' ? 'संपर्क तपशील' : 'Contact Details'}
                    </th>
                    <th className="py-3 px-4 min-w-[200px]">
                      {language === 'mr' ? 'नेमून दिलेल्या शाळा' : 'Assigned Schools'}
                    </th>
                    <th className="py-3 px-3.5 text-center min-w-[110px]">
                      {language === 'mr' ? 'विद्यार्थी' : 'Students Taught'}
                    </th>
                    <th className="py-3 px-3.5 text-center min-w-[110px]">
                      {language === 'mr' ? 'घेतलेली सत्रे' : 'Sessions Logged'}
                    </th>
                    <th className="py-3 px-3.5 text-center w-24">
                      {language === 'mr' ? 'स्थिती' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {filteredTrainers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        {language === 'mr'
                          ? 'कोणताही क्षेत्र प्रशिक्षक आढळला नाही.'
                          : 'No field trainers found matching filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTrainers.map((tr, index) => {
                      const assignedSchools = schools.filter(
                        (s) => s.assignedTrainerId === tr.id || s.assignedTrainerName === tr.fullName
                      );
                      const studentCount = assignedSchools.reduce(
                        (acc, sch) => acc + students.filter((st) => st.schoolId === sch.id).length,
                        0
                      );
                      const sessionCount = sessionLogs.filter((l) => l.conductedBy === tr.id).length;

                      return (
                        <tr key={tr.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400">
                            {index + 1}
                          </td>

                          {/* Trainer Profile */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-[#233d76] text-white flex items-center justify-center font-bold shrink-0">
                                <User className="w-4 h-4 text-[#dfaf27]" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{tr.fullName}</p>
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {language === 'mr' ? 'क्षेत्र प्रशिक्षक (On-Ground)' : 'Field Trainer'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Organization */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded-md">
                              {tr.organizationCode || 'TRST_DIRECT'}
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4 text-slate-600">
                            {tr.email && (
                              <div className="flex items-center space-x-1.5 text-xs">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[160px]">{tr.email}</span>
                              </div>
                            )}
                            {tr.phone && (
                              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{tr.phone}</span>
                              </div>
                            )}
                          </td>

                          {/* Assigned Schools */}
                          <td className="py-3 px-4">
                            {assignedSchools.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedSchools.map((s) => (
                                  <span
                                    key={s.id}
                                    className="text-[11px] font-bold bg-[#233d76]/10 text-[#233d76] px-2 py-0.5 rounded"
                                  >
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                {language === 'mr' ? 'कोणतीही शाळा नाही' : 'No school assigned'}
                              </span>
                            )}
                          </td>

                          {/* Total Students */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="font-black text-slate-900 text-sm">
                              {studentCount}
                            </span>
                          </td>

                          {/* Total Sessions Conducted */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="inline-block font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {sessionCount} {language === 'mr' ? 'सत्रे' : 'sessions'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5 text-center">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>{language === 'mr' ? 'सक्रिय' : 'Active'}</span>
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
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: STUDENTS RAW DATA TABLE                           */}
      {/* ============================================================ */}
      {activeSubTab === 'STUDENTS' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    language === 'mr'
                      ? 'विद्यार्थ्याचे नाव किंवा गठ्ठा क्र. (उदा. S-1) शोधा...'
                      : 'Search by student name or bundle no (e.g. S-1)...'
                  }
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
                />
                {studentSearch && (
                  <button
                    onClick={() => setStudentSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2">
                {/* School Filter */}
                <select
                  value={studentSchoolFilter}
                  onChange={(e) => setStudentSchoolFilter(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व शाळा (All Schools)' : 'All Schools'}</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Trainer Filter */}
                <select
                  value={studentTrainerFilter}
                  onChange={(e) => setStudentTrainerFilter(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व प्रशिक्षक' : 'All Trainers'}</option>
                  {fieldTrainers.map((tr) => (
                    <option key={tr.id} value={tr.fullName}>
                      {tr.fullName}
                    </option>
                  ))}
                </select>

                {/* Gender Filter */}
                <select
                  value={studentGenderFilter}
                  onChange={(e) => setStudentGenderFilter(e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व लिंग' : 'All Genders'}</option>
                  <option value="FEMALE">{language === 'mr' ? 'मुली (Girls)' : 'Girls'}</option>
                  <option value="MALE">{language === 'mr' ? 'मुलगे (Boys)' : 'Boys'}</option>
                </select>

                {/* Status Filter */}
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व चाचणी स्थिती' : 'All Status'}</option>
                  <option value="DONE">{language === 'mr' ? 'चाचणी भरलेले' : 'Tested'}</option>
                  <option value="PENDING">{language === 'mr' ? 'प्रलंबित' : 'Pending'}</option>
                </select>

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportStudentsCsv}
                  className="text-xs font-bold bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0"
                  title="Export Students CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'CSV एक्सपोर्ट' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                {language === 'mr'
                  ? `एकूण ${students.length} पैकी ${filteredStudents.length} विद्यार्थ्यांचा कच्चा डेटा दिसत आहे`
                  : `Showing ${filteredStudents.length} of ${students.length} students raw records`}
              </span>
              {(studentSearch ||
                studentSchoolFilter !== 'ALL' ||
                studentTrainerFilter !== 'ALL' ||
                studentGenderFilter !== 'ALL' ||
                studentStatusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setStudentSearch('');
                    setStudentSchoolFilter('ALL');
                    setStudentOrgFilter('ALL');
                    setStudentTrainerFilter('ALL');
                    setStudentGenderFilter('ALL');
                    setStudentStatusFilter('ALL');
                  }}
                  className="text-[#233d76] font-bold hover:underline cursor-pointer"
                >
                  {language === 'mr' ? 'फिल्टर्स साफ करा' : 'Clear Filters'}
                </button>
              )}
            </div>
          </div>

          {/* STUDENTS RAW DATA TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="bg-[#233d76] text-white text-[11px] font-black uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-14">
                      {language === 'mr' ? 'गठ्ठा क्र.' : 'Bundle'}
                    </th>
                    <th className="py-3 px-4 min-w-[170px]">
                      {language === 'mr' ? 'विद्यार्थ्याचे नाव' : 'Student Full Name'}
                    </th>
                    <th className="py-3 px-3 text-center min-w-[90px]">
                      {language === 'mr' ? 'लिंग' : 'Gender'}
                    </th>
                    <th className="py-3 px-3.5 min-w-[150px]">
                      {language === 'mr' ? 'शाळा' : 'School'}
                    </th>
                    <th className="py-3 px-3.5 min-w-[150px]">
                      {language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Trainer'}
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px]">
                      {language === 'mr' ? 'चाचणी १ (MKMH)' : 'Paper 1 (MKMH)'}
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px]">
                      {language === 'mr' ? 'चाचणी २ (MMAT)' : 'Paper 2 (MMAT)'}
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px]">
                      {language === 'mr' ? 'चाचणी ३ (ERT)' : 'Paper 3 (ERT)'}
                    </th>
                    <th className="py-3 px-3 text-center w-24">
                      {language === 'mr' ? 'कृती' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        {language === 'mr'
                          ? 'कोणताही विद्यार्थी डेटा आढळला नाही.'
                          : 'No student records found matching filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const sch = schools.find((s) => s.id === st.schoolId);
                      const trainerName = getStudentTrainerName(st);
                      const mkmh = getStudentPaperStatus(st.id, 'MKMH');
                      const mmat = getStudentPaperStatus(st.id, 'MMAT');
                      const ert = getStudentPaperStatus(st.id, 'ERT');

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Bundle Serial S-1, S-2 */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-black font-mono text-xs text-[#233d76] bg-[#f0da9a]/60 px-2 py-1 rounded-md border border-[#dfaf27]/40">
                              S-{st.bundleSequenceNo}
                            </span>
                          </td>

                          {/* Full Name */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm trust-heading">
                              {st.fullName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              इ. {st.standard || '८'} - {st.division || 'अ'}
                            </span>
                          </td>

                          {/* Gender */}
                          <td className="py-3 px-3 text-center">
                            {st.gender === 'FEMALE' ? (
                              <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                {language === 'mr' ? 'मुलगी' : 'Girl'}
                              </span>
                            ) : (
                              <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                {language === 'mr' ? 'मुलगा' : 'Boy'}
                              </span>
                            )}
                          </td>

                          {/* School */}
                          <td className="py-3 px-3.5">
                            <p className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                              {sch?.name || '-'}
                            </p>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {sch?.village}
                            </span>
                          </td>

                          {/* Trainer */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-800 text-xs block truncate max-w-[140px]">
                              {trainerName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {sch?.organizationCode || 'TRST_DIRECT'}
                            </span>
                          </td>

                          {/* Paper 1: MKMH */}
                          <td className="py-3 px-3 text-center">
                            {mkmh.hasPre ? (
                              <div className="space-y-0.5">
                                <span className="inline-block font-extrabold text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  Pre: {mkmh.preScore}/{mkmh.preTotal}
                                </span>
                                {mkmh.hasPost && (
                                  <span className="block font-extrabold text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                                    Post: {mkmh.postScore}/{mkmh.postTotal}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                {language === 'mr' ? 'प्रलंबित' : 'Pending'}
                              </span>
                            )}
                          </td>

                          {/* Paper 2: MMAT */}
                          <td className="py-3 px-3 text-center">
                            {mmat.hasPre ? (
                              <div className="space-y-0.5">
                                <span className="inline-block font-extrabold text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  Pre: {mmat.preScore}/{mmat.preTotal}
                                </span>
                                {mmat.hasPost && (
                                  <span className="block font-extrabold text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                                    Post: {mmat.postScore}/{mmat.postTotal}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                {language === 'mr' ? 'प्रलंबित' : 'Pending'}
                              </span>
                            )}
                          </td>

                          {/* Paper 3: ERT */}
                          <td className="py-3 px-3 text-center">
                            {ert.hasPre ? (
                              <div className="space-y-0.5">
                                <span className="inline-block font-extrabold text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  Pre: {ert.preScore}/{ert.preTotal}
                                </span>
                                {ert.hasPost && (
                                  <span className="block font-extrabold text-[10px] text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                                    Post: {ert.postScore}/{ert.postTotal}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                {language === 'mr' ? 'प्रलंबित' : 'Pending'}
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (sch) setSelectedSchool(sch);
                                onNavigateToTab?.('ASSESSMENTS');
                              }}
                              className="text-xs font-bold text-[#233d76] bg-slate-100 hover:bg-[#233d76] hover:text-white p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center mx-auto shadow-2xs"
                              title={language === 'mr' ? 'चाचणी तपासा' : 'Inspect Assessment'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
