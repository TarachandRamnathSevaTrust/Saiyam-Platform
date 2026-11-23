import React, { useState } from 'react';
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
} from 'lucide-react';

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
  } = useApp();

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

  // Table-specific interactive filter states
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [tablePaperFilter, setTablePaperFilter] = useState<string>('ALL');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('ALL');
  const [tableClassFilter, setTableClassFilter] = useState<string>('ALL');

  // Filter schools by financial year and selected organization
  const orgSchools = schools.filter((s) => {
    const matchesFY = !s.financialYear || s.financialYear === financialYear;
    if (!matchesFY) return false;
    if (selectedOrgFilter === 'ALL') return true;
    return (s.organizationCode || 'TRST_DIRECT') === selectedOrgFilter;
  });

  const orgSchoolIds = new Set(orgSchools.map((s) => s.id));

  // Available unique class/division options for the table filter dropdown
  const availableClasses = Array.from(
    new Set(students.map((s) => `${s.standard}-${s.division}`))
  ).sort();

  // Filter student pairs by financial year, organization, school, search, paper, status, and class
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
    // Paper filter
    if (tablePaperFilter !== 'ALL' && p.paperType !== tablePaperFilter) {
      return false;
    }
    // Status filter
    if (tableStatusFilter !== 'ALL') {
      const isCompleted = Boolean(p.preTest && p.postTest);
      const isPreOnly = Boolean(p.preTest && !p.postTest);
      const isPending = Boolean(!p.preTest && !p.postTest);
      if (tableStatusFilter === 'ALL_COMPLETED' && !isCompleted) return false;
      if (tableStatusFilter === 'PRE_COMPLETED' && !isPreOnly) return false;
      if (tableStatusFilter === 'PENDING' && !isPending) return false;
    }
    // Class filter
    if (tableClassFilter !== 'ALL' && `${p.standard}-${p.division}` !== tableClassFilter) {
      return false;
    }
    return true;
  });

  const activeOrg = organizations.find((o) => o.code === selectedOrgFilter);

  const calcPaperMetrics = (pType: 'MKMH' | 'MMAT' | 'ERT') => {
    const pairs = assessmentPairs.filter((p) => p.paperType === pType && p.preTest && p.postTest);
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

              {/* School Filter Dropdown */}
              <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                <Filter className="w-4 h-4 text-[#233d76]" />
                <select
                  aria-label="Filter by School"
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                  className="bg-transparent font-bold text-[#233d76] focus:outline-hidden cursor-pointer text-xs"
                >
                  <option value="ALL">{language === 'mr' ? 'सर्व शाळा' : 'All Schools'}</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
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
                    {filteredPairs.length} {language === 'mr' ? 'नोंदी' : 'records'}
                  </span>
                </div>
              </div>

              {/* Interactive Filter Toolbar for Student Records Table */}
              <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 mb-3 space-y-2.5 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
                  {/* Search Input */}
                  <div className="relative lg:col-span-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={
                        language === 'mr'
                          ? 'विद्यार्थी नाव किंवा S-क्र. शोधा...'
                          : 'Search student name or S-bundle...'
                      }
                      value={tableSearchQuery}
                      onChange={(e) => setTableSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76]"
                    />
                    {tableSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTableSearchQuery('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* School Filter Dropdown */}
                  <div>
                    <select
                      value={selectedSchoolFilter}
                      onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76] font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">
                        {language === 'mr' ? '🏫 सर्व शाळा' : '🏫 All Schools'} ({orgSchools.length})
                      </option>
                      {orgSchools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.village})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class Filter Dropdown */}
                  <div>
                    <select
                      value={tableClassFilter}
                      onChange={(e) => setTableClassFilter(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76] font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">
                        {language === 'mr' ? '🎓 सर्व वर्ग' : '🎓 All Classes'}
                      </option>
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Test Paper Filter */}
                  <div>
                    <select
                      value={tablePaperFilter}
                      onChange={(e) => setTablePaperFilter(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76] font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">
                        {language === 'mr' ? '📝 सर्व चाचण्या' : '📝 All Papers'}
                      </option>
                      <option value="MKMH">चाचणी १ • MKMH</option>
                      <option value="MMAT">चाचणी २ • MMAT</option>
                      <option value="ERT">चाचणी ३ • ERT</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={tableStatusFilter}
                      onChange={(e) => setTableStatusFilter(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76] font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="ALL">
                        {language === 'mr' ? '⚡ सर्व स्थिती' : '⚡ All Statuses'}
                      </option>
                      <option value="ALL_COMPLETED">
                        ✓ {language === 'mr' ? 'दोन्ही पूर्ण' : 'Completed (Pre+Post)'}
                      </option>
                      <option value="PRE_COMPLETED">
                        ⏳ {language === 'mr' ? 'केवळ Pre पूर्ण' : 'Pre Done'}
                      </option>
                      <option value="PENDING">
                        ○ {language === 'mr' ? 'बाकी' : 'Pending'}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Filter Summary & Reset Pill */}
                {(tableSearchQuery || selectedSchoolFilter !== 'ALL' || tablePaperFilter !== 'ALL' || tableStatusFilter !== 'ALL' || tableClassFilter !== 'ALL') && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Filter className="w-3 h-3 text-[#233d76]" />
                      <span>
                        {language === 'mr'
                          ? `फिल्टर सक्रिय: ${filteredPairs.length} नोंदी आढळल्या`
                          : `Filter active: ${filteredPairs.length} records found`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTableSearchQuery('');
                        setSelectedSchoolFilter('ALL');
                        setTablePaperFilter('ALL');
                        setTableStatusFilter('ALL');
                        setTableClassFilter('ALL');
                      }}
                      className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{language === 'mr' ? 'फिल्टर साफ करा' : 'Reset Filters'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto border border-[#233d76] rounded-xl shadow-xs">
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
                      filteredPairs.map((p, idx) => {
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
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Curriculum Progression Roadmap & Trust Governance */}
        <div className="lg:col-span-4 space-y-6">
          {/* 25-Session Curriculum Framework */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold">
                <Layers className="w-4 h-4 text-[#233d76]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm trust-heading">
                  {language === 'mr' ? '२५ सत्रांचा आराखडा संच' : 'Curriculum Architecture'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'mr' ? '३ टप्प्यांमधील अभ्यासक्रम' : '3-Phase Intervention Plan'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#233d76]">
                    {language === 'mr' ? 'सत्र प्रगती' : 'Session Progress'}
                  </span>
                  <span className="font-mono font-bold text-[#233d76] bg-[#f0da9a]/60 px-2.5 py-0.5 rounded">
                    {sessionLogs.length} / 25
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#233d76] h-full transition-all"
                    style={{ width: `${Math.min(100, (sessionLogs.length / 25) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f0da9a]/30 border border-[#dfaf27]/40 text-slate-700 leading-relaxed text-[11px]">
                <strong className="text-[#233d76] block mb-1">
                  {language === 'mr' ? '२५ सत्रांची अधिकृत रचना:' : 'Official 25 Sessions Index:'}
                </strong>
                {language === 'mr'
                  ? 'TRST शैक्षणिक टीमकडून २५ सत्रांची अधिकृत अनुक्रमणिका व उद्दिष्टे प्राप्त होताच ती थेट डेटाबेसद्वारे येथे अपडेट होतील. कोणताही डमी मजकूर भरला जाणार नाही.'
                  : 'Awaiting verified 25-session syllabus and objectives from the TRST team. No synthetic descriptions are populated.'}
              </div>
            </div>
          </div>

          {/* Trust Field Governance & Audit Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center font-bold">
                <FileCheck2 className="w-4 h-4 text-[#233d76]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm trust-heading">
                  {language === 'mr' ? 'विश्वस्त पडताळणी मानके' : 'Trust Verification Standards'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'mr' ? 'ऑन-ग्राउंड पारदर्शकता' : 'Audit & Compliance Checklist'}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
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
                      <strong>३ मूल्यांकन चाचण्या (एकूण ९५ प्रश्न):</strong> चाचणी १ (३० प्रश्न), चाचणी २ (३० प्रश्न), चाचणी ३ (३५ प्रश्न) - रुब्रिक वेटेज व प्रोरिटेड स्कोअरिंग.
                    </>
                  ) : (
                    <>
                      <strong>3 Standardized Papers (95 Questions Total):</strong> Paper 1 (30 Qs), Paper 2 (30 Qs), Paper 3 (35 Qs) with rubric weightage & prorated scoring.
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
                      <strong>Session Media Evidence:</strong> Verified classroom photo proof and session attendance records.
                    </>
                  )}
                </span>
              </div>
            </div>
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
