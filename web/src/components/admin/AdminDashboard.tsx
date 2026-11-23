import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OrganizationManagementModal } from './OrganizationManagementModal';
import { formatOrgName, formatGender, formatAssessmentStatus } from '../../lib/formatters';
import {
  Users,
  Building2,
  BookOpen,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ShieldCheck,
  Award,
  FileCheck2,
  Clock,
  Layers,
  Sparkles,
  Info,
  Settings,
  Search,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ALL_25_SESSIONS } from '@saiyam/shared';

export const AdminDashboard: React.FC = () => {
  const {
    dashboardStats,
    schools,
    students,
    assessmentPairs,
    exportToExcel,
    language,
    sessionLogs,
    organizations,
    selectedOrgFilter,
    setSelectedOrgFilter,
    financialYear,
    curriculumSessions,
  } = useApp();

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

  // Quick search query for student table (student name or S-bundle #)
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');

  // Show only 2 students initially, with 'Show More' / 'Show Less' toggle
  const [showAllStudents, setShowAllStudents] = useState<boolean>(false);
  // Curriculum Phase filter state ('ALL', 1, 2, 3)
  const [curriculumPhaseFilter, setCurriculumPhaseFilter] = useState<'ALL' | 1 | 2 | 3>('ALL');
  // Trust Verification Standards collapsible state
  const [isStandardsOpen, setIsStandardsOpen] = useState<boolean>(false);

  // Filter schools by financial year and selected organization
  const orgSchools = schools.filter((s) => {
    const matchesFY = !s.financialYear || s.financialYear === financialYear;
    if (!matchesFY) return false;
    if (selectedOrgFilter === 'ALL') return true;
    return (s.organizationCode || 'TRST_DIRECT') === selectedOrgFilter;
  });

  const orgSchoolIds = new Set(orgSchools.map((s) => s.id));

  // Filter student pairs by financial year, organization, school (from top scope bar), and search query
  const filteredPairs = assessmentPairs.filter((p) => {
    const matchesFY = !p.financialYear || p.financialYear === financialYear;
    if (!matchesFY) return false;
    const student = students.find((s) => s.id === p.studentId);
    if (selectedOrgFilter !== 'ALL') {
      if (!student || !orgSchoolIds.has(student.schoolId)) return false;
    }
    if (selectedSchoolFilter !== 'ALL') {
      if (!student || student.schoolId !== selectedSchoolFilter) return false;
    }
    // Search query filter (matches student name or bundle sequence like 'S-1' or '1')
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase().trim();
      const matchName = p.studentName.toLowerCase().includes(q);
      const matchBundle =
        `s-${p.bundleSequenceNo}`.toLowerCase().includes(q) ||
        `${p.bundleSequenceNo}` === q;
      if (!matchName && !matchBundle) return false;
    }
    return true;
  });

  // Group / paginate filteredPairs to display only first 2 distinct students when collapsed
  const { displayedPairs, totalUniqueStudents, isTruncated } = useMemo(() => {
    const distinctIds: string[] = [];
    for (const p of filteredPairs) {
      if (!distinctIds.includes(p.studentId)) {
        distinctIds.push(p.studentId);
      }
    }
    const totalCount = distinctIds.length;

    if (showAllStudents || totalCount <= 2) {
      return {
        displayedPairs: filteredPairs,
        totalUniqueStudents: totalCount,
        isTruncated: false,
      };
    }

    const allowedIds = new Set(distinctIds.slice(0, 2));
    const sliced = filteredPairs.filter((p) => allowedIds.has(p.studentId));

    return {
      displayedPairs: sliced,
      totalUniqueStudents: totalCount,
      isTruncated: true,
    };
  }, [filteredPairs, showAllStudents]);

  // Master Curriculum sessions (fallback to ALL_25_SESSIONS)
  const masterSessions = useMemo(() => {
    return curriculumSessions && curriculumSessions.length > 0
      ? curriculumSessions
      : ALL_25_SESSIONS;
  }, [curriculumSessions]);

  // Filter master sessions by selected Phase
  const phaseFilteredSessions = useMemo(() => {
    if (curriculumPhaseFilter === 'ALL') return masterSessions;
    return masterSessions.filter((s) => s.phaseNumber === curriculumPhaseFilter);
  }, [masterSessions, curriculumPhaseFilter]);

  // Set of session numbers that have been logged for the active filter scope
  const conductedSessionNumbers = useMemo(() => {
    return new Set(
      sessionLogs
        .filter((l) => {
          const matchesFY = !l.financialYear || l.financialYear === financialYear;
          if (!matchesFY) return false;
          if (selectedSchoolFilter !== 'ALL') {
            return l.schoolId === selectedSchoolFilter;
          }
          if (selectedOrgFilter !== 'ALL') {
            const school = schools.find((s) => s.id === l.schoolId);
            if (!school || (school.organizationCode || 'TRST_DIRECT') !== selectedOrgFilter) {
              return false;
            }
          }
          return true;
        })
        .map((l) => l.sessionNumber)
    );
  }, [sessionLogs, financialYear, selectedSchoolFilter, selectedOrgFilter, schools]);

  const conductedCount = conductedSessionNumbers.size;

  const activeOrg = organizations.find((o) => o.code === selectedOrgFilter);

  const calcPaperMetrics = (pType: 'MKMH' | 'MMAT' | 'ERT') => {
    const pairs = assessmentPairs.filter((p) => {
      const matchesFY = !p.financialYear || p.financialYear === financialYear;
      if (!matchesFY) return false;
      if (p.paperType !== pType || !p.preTest || !p.postTest) return false;
      const student = students.find((s) => s.id === p.studentId);
      if (selectedOrgFilter !== 'ALL') {
        if (!student || !orgSchoolIds.has(student.schoolId)) return false;
      }
      if (selectedSchoolFilter !== 'ALL') {
        if (!student || student.schoolId !== selectedSchoolFilter) return false;
      }
      return true;
    });

    if (pairs.length === 0) {
      return { pre: 0, post: 0, delta: 0, count: 0 };
    }
    const preSum = pairs.reduce((acc, p) => acc + (p.preTest?.scorePercentage || 0), 0);
    const postSum = pairs.reduce((acc, p) => acc + (p.postTest?.scorePercentage || 0), 0);
    const preAvg = Number((preSum / pairs.length).toFixed(1));
    const postAvg = Number((postSum / pairs.length).toFixed(1));
    return {
      pre: preAvg,
      post: postAvg,
      delta: Number((postAvg - preAvg).toFixed(1)),
      count: pairs.length,
    };
  };

  const mkmhMetrics = calcPaperMetrics('MKMH');
  const mmatMetrics = calcPaperMetrics('MMAT');
  const ertMetrics = calcPaperMetrics('ERT');

  const renderDeltaBadge = (delta: number) => {
    if (delta > 0) {
      return (
        <div className="flex items-center text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
          +{delta}%
        </div>
      );
    }
    if (delta < 0) {
      return (
        <div className="flex items-center text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
          {delta}%
        </div>
      );
    }
    return (
      <div className="flex items-center text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
        <Minus className="w-3.5 h-3.5 mr-0.5" />
        0%
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto space-y-6">
      {/* Top Hero Banner with Official TRST Brand Guidelines */}
      <div className="bg-[#233d76] rounded-2xl p-4 sm:p-7 text-white shadow-md border-b-4 border-[#dfaf27] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="space-y-2 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs bg-[#dfaf27] text-[#233d76] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-2xs">
              {language === 'mr' ? 'विश्वस्त डॅशबोर्ड' : 'Trust Executive Portal'}
            </span>
            <span className="text-[10px] sm:text-xs bg-[#1a2d57] text-[#dfaf27] font-bold px-2.5 py-1 rounded-md border border-[#dfaf27]/40">
              📅 {language === 'mr' ? `आर्थिक वर्ष: FY ${financialYear}` : `Financial Year: FY ${financialYear}`}
            </span>
            <span className="text-[10px] sm:text-xs bg-[#1a2d57] text-[#f0da9a] font-semibold px-2 py-1 rounded-md border border-[#3b5998] flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-[#dfaf27]" />
              <span>DPDP Act Protected</span>
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold trust-heading tracking-tight leading-snug">
            {language === 'mr' ? 'संयम प्रकल्प - प्रगती व प्रभाव निरीक्षण' : 'Saiyam Program - Executive Monitoring'}
          </h1>
          <p className="text-[#f0da9a] text-[11px] sm:text-sm font-medium">
            Initiative By : Tarachand Ramnath Seva Trust (TRST), Pune
          </p>
        </div>

        {/* 1-Click Clean Excel Export */}
        <button
          onClick={() => exportToExcel(selectedSchoolFilter !== 'ALL' ? selectedSchoolFilter : undefined)}
          className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4 text-[#233d76] stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-bold">
            {language === 'mr' ? 'स्वयंचलित एक्सेल डाऊनलोड (.xlsx)' : 'Download Clean Excel (.xlsx)'}
          </span>
        </button>
      </div>

      {/* Organization Multi-Tenancy Switcher Bar (Fully Dynamic & TRST Managed) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#233d76]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'mr' ? 'अंमलबजावणी संस्था:' : 'Implementing Organization:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedOrgFilter('ALL');
                setSelectedSchoolFilter('ALL');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedOrgFilter === 'ALL'
                  ? 'bg-[#233d76] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🌐 {language === 'mr' ? 'सर्व संस्था (एकत्रित)' : 'All Organizations (Consolidated)'}
            </button>

            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setSelectedOrgFilter(org.code);
                  setSelectedSchoolFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedOrgFilter === org.code
                    ? 'bg-[#233d76] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{formatOrgName(org, language)}</span>
              </button>
            ))}

            {/* TRST Organization Management Modal Trigger */}
            <button
              onClick={() => setIsOrgModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0da9a]/60 hover:bg-[#dfaf27] text-[#233d76] border border-[#dfaf27] transition-all cursor-pointer shadow-2xs ml-auto sm:ml-2"
              title={language === 'mr' ? 'संस्था जोडा किंवा व्यवस्थापन करा' : 'Manage Organizations'}
            >
              <Settings className="w-3.5 h-3.5 text-[#233d76]" />
              <span>{language === 'mr' ? 'संस्था व्यवस्थापन' : 'Manage Orgs'}</span>
            </button>
          </div>
        </div>

        {/* Informative Partner Badge when specific Org is selected */}
        {activeOrg && (
          <div className="bg-[#f0da9a]/30 border border-[#dfaf27]/40 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#233d76] gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold uppercase tracking-wider bg-[#dfaf27] px-2 py-0.5 rounded text-[10px]">
                {activeOrg.code}
              </span>
              <span className="font-semibold">{formatOrgName(activeOrg, language)}</span>
              {activeOrg.description && (
                <>
                  <span className="hidden sm:inline text-slate-400">•</span>
                  <span className="text-[11px] text-slate-600 hidden sm:inline">{activeOrg.description}</span>
                </>
              )}
            </div>
            {activeOrg.contactPerson && (
              <span className="text-[11px] text-[#233d76] font-bold">
                {language === 'mr' ? 'समन्वयक:' : 'POC:'} {activeOrg.contactPerson}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Field Trainers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#dfaf27] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Trainers'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold">
              <Users className="w-4 h-4 text-[#233d76]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#233d76]">{dashboardStats.totalFieldTrainers}</span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-sm">
              {language === 'mr' ? 'सक्रिय' : 'Active'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'शाळांमध्ये प्रत्यक्ष कार्यरत' : 'On-ground field trainers'}
          </p>
        </div>

        {/* Schools Registered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#dfaf27] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'नोंदणीकृत शाळा' : 'Schools Registered'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-[#233d76]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#233d76]">{schools.length}</span>
            <span className="text-xs text-slate-500 font-medium">{language === 'mr' ? 'शाळा' : 'schools'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'प्रशिक्षकांनी प्रत्यक्ष नोंदवलेल्या' : 'Registered by field trainers'}
          </p>
        </div>

        {/* Sessions Conducted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#dfaf27] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'पूर्ण झालेली सत्रे' : 'Sessions Logged'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4 text-[#233d76]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#233d76]">{sessionLogs.length}</span>
            <span className="text-xs text-slate-500 font-medium">/ 25 {language === 'mr' ? 'सत्रे' : 'sessions'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'संयम आराखडा संच' : 'Curriculum progression'}
          </p>
        </div>

        {/* Students Enrolled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#dfaf27] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'नोंदवलेले विद्यार्थी' : 'Students Enrolled'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4 text-[#233d76]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#233d76]">{dashboardStats.totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">{language === 'mr' ? 'विद्यार्थी' : 'students'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'गठ्ठा क्र. S-1 ते S-N' : 'Paper bundle mapped'}
          </p>
        </div>
      </div>

      {/* Unified School & Progress Scope Control Bar (Controls Both Analytics & Curriculum) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#233d76] text-[#dfaf27] flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {language === 'mr' ? 'शाळा व्याप्ती निवड (विश्लेषण व सत्रे)' : 'School Scope Filter (Analytics & Sessions)'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {language === 'mr' ? 'दोन्ही विभागांसाठी समान' : 'Syncs Both Sections'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedSchoolFilter === 'ALL'
                ? language === 'mr'
                  ? `सर्व ${orgSchools.length} शाळांमधील चाचणी निकाल व २५ सत्रांची प्रगती एकत्रित दाखवत आहे.`
                  : `Showing aggregated test deltas & 25-session progress across all ${orgSchools.length} schools.`
                : language === 'mr'
                ? `सध्या निवडलेली शाळा: ${schools.find((s) => s.id === selectedSchoolFilter)?.name || ''} • चाचण्या व सत्रे आपोआप अपडेट झाली आहेत.`
                : `Active School: ${schools.find((s) => s.id === selectedSchoolFilter)?.name || ''} • Test analytics & 25 sessions updated.`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-2 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 w-full sm:w-auto shadow-2xs">
            <Filter className="w-4 h-4 text-[#233d76] shrink-0" />
            <select
              aria-label="Select School Scope"
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="bg-transparent font-bold text-[#233d76] focus:outline-hidden cursor-pointer text-xs w-full sm:w-auto"
            >
              <option value="ALL">
                {language === 'mr' ? '🏫 सर्व शाळा (एकत्रित)' : '🏫 All Schools (Aggregated)'} ({orgSchools.length})
              </option>
              {orgSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.village})
                </option>
              ))}
            </select>
          </div>

          {selectedSchoolFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedSchoolFilter('ALL')}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              title={language === 'mr' ? 'सर्व शाळा रीसेट करा' : 'Reset to All Schools'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Executive Content: 2-Column Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Pre vs Post Impact Engine & Assessment Records */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#f0da9a]/60 text-[#233d76] border border-[#dfaf27]/50">
                    {language === 'mr' ? 'स्वयंचलित प्रभाव विश्लेषण' : 'Automated Improvement Engine'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1.5 trust-heading">
                  {language === 'mr' ? 'पूर्व व उत्तर चाचणी तुलना (Pre ⟷ Post Delta)' : 'Pre vs Post Assessment Analytics'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'mr'
                    ? 'हाताने एक्सेल न करता Baseline व Outcome स्कोअरची ३ पेपर्सनिहाय तुलना.'
                    : 'Real-time delta calculation across 3 standardized evaluation papers.'}
                </p>
              </div>

              {/* Active School Scope Indicator Badge */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-bold text-[#233d76] bg-[#f0da9a]/50 px-3 py-1.5 rounded-xl border border-[#dfaf27]/40 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#233d76]" />
                  <span>
                    {selectedSchoolFilter === 'ALL'
                      ? language === 'mr' ? 'सर्व शाळा (एकत्रित)' : 'All Schools'
                      : schools.find((s) => s.id === selectedSchoolFilter)?.name || ''}
                  </span>
                </span>
              </div>
            </div>

            {/* 3 Papers Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Paper 1: MKMH */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex justify-between items-start gap-2 min-h-[56px]">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-[#233d76] uppercase tracking-wider block">
                        {language === 'mr' ? 'चाचणी १' : 'Paper 1'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5 trust-heading leading-snug">
                        {language === 'mr' ? 'माझे ज्ञान, माझे आरोग्य (MKMH)' : 'My Knowledge, My Health (MKMH)'}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      {renderDeltaBadge(mkmhMetrics.delta)}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px] font-medium">Pre %</span>
                      <span className="text-base font-bold text-slate-700">{mkmhMetrics.pre}%</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px] font-medium">Post %</span>
                      <span className="text-base font-bold text-[#233d76]">{mkmhMetrics.post}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-500 text-center font-medium">
                  {mkmhMetrics.count} {language === 'mr' ? 'तुलनात्मक जोड्या' : 'paired records'}
                </div>
              </div>

              {/* Paper 2: MMAT */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex justify-between items-start gap-2 min-h-[56px]">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-[#233d76] uppercase tracking-wider block">
                        {language === 'mr' ? 'चाचणी २' : 'Paper 2'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5 trust-heading leading-snug">
                        {language === 'mr' ? 'समज व गैरसमज (MMAT)' : 'Myths & Misconceptions (MMAT)'}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      {renderDeltaBadge(mmatMetrics.delta)}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px] font-medium">Pre %</span>
                      <span className="text-base font-bold text-slate-700">{mmatMetrics.pre}%</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px] font-medium">Post %</span>
                      <span className="text-base font-bold text-[#233d76]">{mmatMetrics.post}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-500 text-center font-medium">
                  {mmatMetrics.count} {language === 'mr' ? 'तुलनात्मक जोड्या' : 'paired records'}
                </div>
              </div>

              {/* Paper 3: ERT */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <div className="flex justify-between items-start gap-2 min-h-[56px]">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-[#233d76] uppercase tracking-wider block">
                        {language === 'mr' ? 'चाचणी ३' : 'Paper 3'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5 trust-heading leading-snug">
                        {language === 'mr' ? 'स्व-भावना नियमन (ERT)' : 'Emotion Regulation Test (ERT)'}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      {renderDeltaBadge(ertMetrics.delta)}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px] font-medium">Pre %</span>
                      <span className="text-base font-bold text-slate-700">{ertMetrics.pre}%</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[11px] font-medium">Post %</span>
                      <span className="text-base font-bold text-[#233d76]">{ertMetrics.post}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-500 text-center font-medium">
                  {ertMetrics.count} {language === 'mr' ? 'तुलनात्मक जोड्या' : 'paired records'}
                </div>
              </div>
            </div>

            {/* Student-by-Student Live Assessment Records Table */}
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 trust-heading">
                    {language === 'mr' ? 'विद्यार्थी निहाय पूर्व व उत्तर चाचणी नोंदी' : 'Student-by-Student Records'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {language === 'mr'
                      ? 'गठ्ठा क्रमाने जुळवलेले (S-1, S-2...) अधिकृत निकाल'
                      : 'Physical paper bundle sequence (S-1, S-2...) verified'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-600 font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {isTruncated
                      ? `${displayedPairs.length} / ${filteredPairs.length} ${language === 'mr' ? 'नोंदी' : 'records'} (२ ${language === 'mr' ? 'विद्यार्थी' : 'students'})`
                      : `${filteredPairs.length} ${language === 'mr' ? 'नोंदी' : 'records'} (${totalUniqueStudents} ${language === 'mr' ? 'विद्यार्थी' : 'students'})`}
                  </span>
                </div>
              </div>

              {/* Quick Search for Student Records Table */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={
                      language === 'mr'
                        ? 'विद्यार्थी नाव किंवा गट क्र. शोधा (उदा. S-1, S-2...)'
                        : 'Search student name or bundle (e.g. S-1, S-2...)'
                    }
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8.5 pr-8 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76] transition-colors"
                  />
                  {tableSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTableSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Outer Card with Rounded Border: Stays fixed, does not scroll horizontally */}
              <div className="border border-[#233d76] rounded-xl shadow-xs overflow-hidden bg-white">
                {/* Scroll container for the table rows ONLY */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border-collapse">
                    <thead className="bg-[#233d76] text-white">
                      <tr>
                        <th className="px-3.5 py-3 text-left font-bold border-b border-white">
                          {language === 'mr' ? 'गठ्ठा क्र.' : 'Bundle #'}
                        </th>
                        <th className="px-3.5 py-3 text-left font-bold border-b border-white">
                          {language === 'mr' ? 'विद्यार्थ्याचे नाव' : 'Student Name'}
                        </th>
                        <th className="px-3.5 py-3 text-left font-bold border-b border-white">
                          {language === 'mr' ? 'लिंग' : 'Gender'}
                        </th>
                        <th className="px-3.5 py-3 text-left font-bold border-b border-white">
                          {language === 'mr' ? 'इयत्ता' : 'Class'}
                        </th>
                        <th className="px-3.5 py-3 text-center font-bold border-b border-white">
                          {language === 'mr' ? 'चाचणी' : 'Test Paper'}
                        </th>
                        <th className="px-3.5 py-3 text-center font-bold border-b border-white">Pre %</th>
                        <th className="px-3.5 py-3 text-center font-bold border-b border-white">Post %</th>
                        <th className="px-3.5 py-3 text-center font-bold border-b border-white">
                          {language === 'mr' ? 'फरक' : 'Delta'}
                        </th>
                        <th className="px-3.5 py-3 text-center font-bold border-b border-white">
                          {language === 'mr' ? 'स्थिती' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[#233d76]">
                      {filteredPairs.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center bg-white">
                            <div className="max-w-md mx-auto space-y-2">
                              <div className="w-10 h-10 rounded-full bg-[#f0da9a]/40 text-[#233d76] flex items-center justify-center mx-auto">
                                <Info className="w-5 h-5 text-[#233d76]" />
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm">
                                {language === 'mr'
                                  ? 'कोणत्याही नोंदी आढळल्या नाहीत'
                                  : 'No matching assessment records found'}
                              </h5>
                              <p className="text-xs text-slate-500">
                                {language === 'mr'
                                  ? 'निवडलेल्या फिल्टरनुसार कोणतीही चाचणी नोंद सापडली नाही. कृपया फिल्टर तपासा किंवा साफ करा.'
                                  : 'No assessment records match the selected filters. Please adjust or reset the filters.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayedPairs.map((p, idx) => {
                          const isCompleted = Boolean(p.preTest && p.postTest);
                          const isPreOnly = Boolean(p.preTest && !p.postTest);
                          const isPostOnly = Boolean(!p.preTest && p.postTest);
                          const computedStatus = isCompleted
                            ? 'ALL_COMPLETED'
                            : isPreOnly
                            ? 'PRE_COMPLETED'
                            : isPostOnly
                            ? 'POST_ONLY'
                            : 'PENDING_PRE';

                          return (
                            <tr
                              key={`${p.studentId}-${p.paperType}-${idx}`}
                              className={idx % 2 === 0 ? 'bg-[#f0da9a]/25' : 'bg-white'}
                            >
                              <td className="px-3.5 py-2.5 font-mono font-bold">S-{p.bundleSequenceNo}</td>
                              <td className="px-3.5 py-2.5 font-bold">{p.studentName}</td>
                              <td className="px-3.5 py-2.5">{formatGender(p.gender, language)}</td>
                              <td className="px-3.5 py-2.5">{p.standard}-{p.division}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold">{p.paperType}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold">{p.preTest ? `${p.preTest.scorePercentage}%` : '—'}</td>
                              <td className="px-3.5 py-2.5 text-center font-bold">{p.postTest ? `${p.postTest.scorePercentage}%` : '—'}</td>
                              <td className="px-3.5 py-2.5 text-center font-black">
                                {p.improvementDelta !== undefined ? (
                                  <span
                                    className={
                                      p.improvementDelta > 0
                                        ? 'text-emerald-700'
                                        : p.improvementDelta < 0
                                        ? 'text-rose-600'
                                        : 'text-slate-500'
                                    }
                                  >
                                    {p.improvementDelta > 0 ? `+${p.improvementDelta}%` : `${p.improvementDelta}%`}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="px-3.5 py-2.5 text-center font-semibold">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                                    isCompleted
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : isPreOnly
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : isPostOnly
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {formatAssessmentStatus(computedStatus, language)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Show More / Show Less Students Pagination Control: Stays fixed, never scrolls horizontally */}
                {totalUniqueStudents > 2 && (
                  <div className="p-3 bg-slate-50 border-t border-[#233d76]/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-semibold">
                      {language === 'mr'
                        ? isTruncated
                          ? `सध्या २ विद्यार्थ्यांच्या नोंदी दाखवत आहे (एकूण ${totalUniqueStudents} विद्यार्थ्यांपैकी)`
                          : `सर्व ${totalUniqueStudents} विद्यार्थ्यांच्या नोंदी दाखवत आहे (${filteredPairs.length} एकूण नोंदी)`
                        : isTruncated
                        ? `Showing records for 2 of ${totalUniqueStudents} students`
                        : `Showing all ${totalUniqueStudents} students (${filteredPairs.length} total records)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAllStudents(!showAllStudents)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#233d76] hover:bg-[#1b2f5c] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <span>
                        {showAllStudents
                          ? language === 'mr'
                            ? 'कमी दाखवा (केवळ २ विद्यार्थी)'
                            : 'Show Less (Only 2 Students)'
                          : language === 'mr'
                          ? `आणखी दाखवा (+${totalUniqueStudents - 2} विद्यार्थी)`
                          : `Show More (+${totalUniqueStudents - 2} More Students)`}
                      </span>
                      {showAllStudents ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[#dfaf27]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#dfaf27]" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Curriculum Progression Roadmap & Trust Governance */}
        <div className="lg:col-span-4 space-y-5">
          {/* 25-Session Curriculum Framework */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4 text-[#233d76]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm trust-heading">
                    {language === 'mr' ? '२५ सत्रांचा आराखडा संच' : 'Curriculum Architecture'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'mr' ? '३ टप्प्यांमधील मूल्यशिक्षण व आरोग्य' : '3-Phase Life Skills & Values Roadmap'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-bold text-[#233d76] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 hidden sm:inline-flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-[#233d76]" />
                  <span className="truncate max-w-[120px]">
                    {selectedSchoolFilter === 'ALL'
                      ? language === 'mr' ? 'सर्व शाळा' : 'All Schools'
                      : schools.find((s) => s.id === selectedSchoolFilter)?.name || ''}
                  </span>
                </span>
                <span className="font-mono text-xs font-bold bg-[#f0da9a]/60 text-[#233d76] px-2 py-0.5 rounded-md border border-[#dfaf27]/40">
                  {conductedCount} / 25
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[#233d76]">
                  {language === 'mr' ? 'अभ्यासक्रम पूर्तता' : 'Intervention Progress'}
                </span>
                <span className="font-mono font-bold text-slate-700">
                  {Math.round((conductedCount / 25) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#233d76] h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (conductedCount / 25) * 100)}%` }}
                />
              </div>
            </div>

            {/* Phase Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 mt-3 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-center">
              <button
                type="button"
                onClick={() => setCurriculumPhaseFilter('ALL')}
                className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                  curriculumPhaseFilter === 'ALL'
                    ? 'bg-white text-[#233d76] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'सर्व (२५)' : 'All (25)'}
              </button>
              <button
                type="button"
                onClick={() => setCurriculumPhaseFilter(1)}
                className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                  curriculumPhaseFilter === 1
                    ? 'bg-white text-[#233d76] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'टप्पा १ (१-६)' : 'Phase 1'}
              </button>
              <button
                type="button"
                onClick={() => setCurriculumPhaseFilter(2)}
                className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                  curriculumPhaseFilter === 2
                    ? 'bg-white text-[#233d76] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'टप्पा २ (७-१८)' : 'Phase 2'}
              </button>
              <button
                type="button"
                onClick={() => setCurriculumPhaseFilter(3)}
                className={`py-1.5 rounded-lg cursor-pointer transition-colors ${
                  curriculumPhaseFilter === 3
                    ? 'bg-white text-[#233d76] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'टप्पा ३ (१९-२५)' : 'Phase 3'}
              </button>
            </div>

            {/* Phase Description Banner */}
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-[#f0da9a]/25 border border-[#dfaf27]/40 text-[11px] text-[#233d76]">
              {curriculumPhaseFilter === 1 && (
                <p>
                  <strong>{language === 'mr' ? 'टप्पा १ (सत्रे १-६): ' : 'Phase 1 (Sessions 1-6): '}</strong>
                  {language === 'mr'
                    ? 'पायाभूत मूल्ये, पंचकोश संकल्पना, शारीरिक व मानसिक आरोग्य.'
                    : 'Foundation values, Panchakosh concepts, physical & mental health awareness.'}
                </p>
              )}
              {curriculumPhaseFilter === 2 && (
                <p>
                  <strong>{language === 'mr' ? 'टप्पा २ (सत्रे ७-१८): ' : 'Phase 2 (Sessions 7-18): '}</strong>
                  {language === 'mr'
                    ? 'गैरसमज निर्मूलन, लिंग संवेदनशीलता, भावनिक संतुलन व वर्तन विकास.'
                    : 'Myths eradication, gender sensitivity, emotion regulation & habit coaching.'}
                </p>
              )}
              {curriculumPhaseFilter === 3 && (
                <p>
                  <strong>{language === 'mr' ? 'टप्पा ३ (सत्रे १९-२५): ' : 'Phase 3 (Sessions 19-25): '}</strong>
                  {language === 'mr'
                    ? 'निर्णयक्षमता, स्व-नियंत्रण (संयम), सामूहिक चिंतन व अंतिम मूल्यमापन.'
                    : 'Decision making, self-control (Saiyam), group reflection & outcome evaluation.'}
                </p>
              )}
              {curriculumPhaseFilter === 'ALL' && (
                <p>
                  <strong>{language === 'mr' ? '२५ सत्रांची अधिकृत रचना: ' : '25-Session Standard Framework: '}</strong>
                  {language === 'mr'
                    ? 'प्रत्येक सत्राचे नाव, विभाग आणि मुख्य उद्दिष्टे खालील यादीत तपासा.'
                    : 'Click any phase above or scroll to explore modules, objectives, and live status.'}
                </p>
              )}
            </div>

            {/* Scrollable Session List */}
            <div className="mt-3.5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {phaseFilteredSessions.map((s) => {
                const isConducted = conductedSessionNumbers.has(s.sessionNumber);
                const title = language === 'mr' ? (s.titleMr || s.sessionNameMr) : (s.titleEn || s.sessionNameEn);
                const subTitle = language === 'mr' ? (s.titleEn || s.sessionNameEn) : (s.titleMr || s.sessionNameMr);
                const desc = language === 'mr' ? s.descriptionMr : s.descriptionEn;
                const modName = language === 'mr' ? s.moduleNameMr : s.moduleNameEn;

                return (
                  <div
                    key={s.sessionNumber}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      isConducted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-6 h-6 rounded-md font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                            isConducted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#233d76] text-white'
                          }`}
                        >
                          #{s.sessionNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">
                            {title}
                          </h4>
                          {subTitle && (
                            <span className="text-[10px] text-slate-400">
                              {subTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isConducted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isConducted
                          ? language === 'mr' ? '✓ पूर्ण' : '✓ Conducted'
                          : language === 'mr' ? 'नियोजित' : 'Scheduled'}
                      </span>
                    </div>

                    {modName && (
                      <span className="inline-block text-[10px] font-semibold text-[#233d76] bg-[#f0da9a]/40 px-2 py-0.5 rounded mb-1">
                        {modName}
                      </span>
                    )}

                    {desc && (
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                        {desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Verification Standards: Compact & Collapsible */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setIsStandardsOpen(!isStandardsOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs trust-heading">
                    {language === 'mr' ? 'विश्वस्त पडताळणी मानके (४ निकष)' : 'Trust Verification Standards (4 Checks)'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {language === 'mr' ? 'ऑन-ग्राउंड पारदर्शकता व DPDP अनुपालन' : 'Audit, compliance & evidence checklist'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#233d76]">
                <span>{isStandardsOpen ? (language === 'mr' ? 'लपवा' : 'Hide') : (language === 'mr' ? 'तपासा' : 'View')}</span>
                {isStandardsOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#dfaf27]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#dfaf27]" />
                )}
              </div>
            </button>

            {isStandardsOpen && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2.5 text-xs animate-fadeIn">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    {language === 'mr' ? (
                      <>
                        <strong>मुख्याध्यापक सही व शिक्का:</strong> प्रत्येक शाळेचे अधिकृत संमतीपत्र व सत्र पूर्तता पत्रक.
                      </>
                    ) : (
                      <>
                        <strong>HM Sign & Stamp:</strong> Official school consent letter and session completion certificate.
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    {language === 'mr' ? (
                      <>
                        <strong>DPDP Act (2023) अनुपालन:</strong> अल्पवयीन विद्यार्थ्यांची ओळख गोपनीय (S-1 ते S-N गट क्रमांक).
                      </>
                    ) : (
                      <>
                        <strong>DPDP Act (2023) Compliance:</strong> Minor student identities masked via S-1 to S-N bundle codes.
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    {language === 'mr' ? (
                      <>
                        <strong>३ मूल्यांकन चाचण्या (९५ प्रश्न):</strong> चाचणी १ (३०), चाचणी २ (३०), चाचणी ३ (३५) - रुब्रिक वेटेज व प्रोरिटेड स्कोअरिंग.
                      </>
                    ) : (
                      <>
                        <strong>3 Standardized Papers (95 Qs):</strong> Paper 1 (30), Paper 2 (30), Paper 3 (35) with rubric weightage.
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">
                    {language === 'mr' ? (
                      <>
                        <strong>सत्र छायाचित्रे पुरावा:</strong> प्रत्येक वर्गाचे प्रत्यक्ष उपस्थिती व सत्राचे फोटो.
                      </>
                    ) : (
                      <>
                        <strong>Session Media Evidence:</strong> Classroom photo proof and session attendance records.
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Organization Management Modal for TRST */}
      <OrganizationManagementModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />
    </div>
  );
};
