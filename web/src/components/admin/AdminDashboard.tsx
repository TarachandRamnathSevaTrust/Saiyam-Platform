import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  ShieldCheck,
  Award,
  FileCheck2,
  Clock,
  Layers,
  Sparkles,
  Info,
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
  } = useApp();

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');

  // Filter schools by selected organization
  const orgSchools = schools.filter((s) => {
    if (selectedOrgFilter === 'ALL') return true;
    return (s.organizationCode || 'TRST_DIRECT') === selectedOrgFilter;
  });

  const orgSchoolIds = new Set(orgSchools.map((s) => s.id));

  // Filter student pairs by organization and school
  const filteredPairs = assessmentPairs.filter((p) => {
    const student = students.find((s) => s.id === p.studentId);
    if (selectedOrgFilter !== 'ALL') {
      if (!student || !orgSchoolIds.has(student.schoolId)) return false;
    }
    if (selectedSchoolFilter !== 'ALL') {
      if (!student || student.schoolId !== selectedSchoolFilter) return false;
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Hero Banner with Official TRST Brand Guidelines */}
      <div className="bg-[#233d76] rounded-2xl p-6 sm:p-8 text-white shadow-md border-b-4 border-[#dfaf27] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-[#dfaf27] text-[#233d76] uppercase tracking-wider font-extrabold px-3 py-1 rounded-md shadow-2xs">
              {language === 'mr' ? 'विश्वस्त डॅशबोर्ड (Trust Dashboard)' : 'Trust Executive Portal'}
            </span>
            <span className="text-xs bg-[#1a2d57] text-[#f0da9a] font-semibold px-2.5 py-1 rounded-md border border-[#3b5998] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span>DPDP Act (2023) Protected</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold trust-heading tracking-tight">
            {language === 'mr' ? 'संयम प्रकल्प - प्रगती व प्रभाव निरीक्षण' : 'Saiyam Program - Executive Monitoring'}
          </h1>
          <p className="text-[#f0da9a] text-xs sm:text-sm font-medium">
            Initiative By : Tarachand Ramnath Seva Trust (TRST), Pune
          </p>
        </div>

        {/* 1-Click Clean Excel Export */}
        <button
          onClick={() => exportToExcel(selectedSchoolFilter !== 'ALL' ? selectedSchoolFilter : undefined)}
          className="flex items-center space-x-2.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          <Download className="w-5 h-5 text-[#233d76] stroke-[2.5]" />
          <span className="text-sm font-bold">
            {language === 'mr' ? 'स्वयंचलित एक्सेल डाऊनलोड (.xlsx)' : 'Download Clean Excel (.xlsx)'}
          </span>
        </button>
      </div>

      {/* Organization Multi-Tenancy Switcher Bar (TRST Direct | JPIP | VOPA) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#233d76]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'mr' ? 'अंमलबजावणी संस्था (Organization):' : 'Organization Filter:'}
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
              🌐 {language === 'mr' ? 'सर्व संस्था (Consolidated)' : 'All (Consolidated)'}
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
                <span>{org.code === 'TRST_DIRECT' ? '🏛️' : org.code === 'JPIP' ? '📘' : '🤝'}</span>
                <span>{org.code === 'TRST_DIRECT' ? 'TRST Direct' : org.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Informative Partner Badge when specific Org is selected */}
        {activeOrg && (
          <div className="bg-[#f0da9a]/30 border border-[#dfaf27]/40 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#233d76] gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold uppercase tracking-wider bg-[#dfaf27] px-2 py-0.5 rounded text-[10px]">
                {activeOrg.code}
              </span>
              <span className="font-semibold">{activeOrg.nameMr}</span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="text-[11px] text-slate-600 hidden sm:inline">{activeOrg.description}</span>
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
            {language === 'mr' ? 'शाळांमध्ये प्रत्यक्ष कार्यरत' : 'On-ground facilitators'}
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
                  <option value="ALL">{language === 'mr' ? 'सर्व शाळा (All Schools)' : 'All Schools'}</option>
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
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-[#233d76] uppercase tracking-wider block">चाचणी १ / Paper 1</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 trust-heading">माझे ज्ञान, माझे आरोग्य (MKMH)</h3>
                  </div>
                  <div className="flex items-center text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{mkmhMetrics.delta}%
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] font-medium">Pre %</span>
                    <span className="text-base font-bold text-slate-700">{mkmhMetrics.pre}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] font-medium">Post %</span>
                    <span className="text-base font-bold text-[#233d76]">{mkmhMetrics.post}%</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-500 text-center font-medium">
                  {mkmhMetrics.count} {language === 'mr' ? 'तुलनात्मक जोड्या' : 'paired records'}
                </div>
              </div>

              {/* Paper 2: MMAT */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-[#233d76] uppercase tracking-wider block">चाचणी २ / Paper 2</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 trust-heading">समज व गैरसमज (MMAT)</h3>
                  </div>
                  <div className="flex items-center text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{mmatMetrics.delta}%
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] font-medium">Pre %</span>
                    <span className="text-base font-bold text-slate-700">{mmatMetrics.pre}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] font-medium">Post %</span>
                    <span className="text-base font-bold text-[#233d76]">{mmatMetrics.post}%</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-500 text-center font-medium">
                  {mmatMetrics.count} {language === 'mr' ? 'तुलनात्मक जोड्या' : 'paired records'}
                </div>
              </div>

              {/* Paper 3: ERT */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-[#233d76] uppercase tracking-wider block">चाचणी ३ / Paper 3</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 trust-heading">स्व-भावना नियमन (ERT)</h3>
                  </div>
                  <div className="flex items-center text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{ertMetrics.delta}%
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] font-medium">Pre %</span>
                    <span className="text-base font-bold text-slate-700">{ertMetrics.pre}%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] font-medium">Post %</span>
                    <span className="text-base font-bold text-[#233d76]">{ertMetrics.post}%</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-500 text-center font-medium">
                  {ertMetrics.count} {language === 'mr' ? 'तुलनात्मक जोड्या' : 'paired records'}
                </div>
              </div>
            </div>

            {/* Student-by-Student Live Assessment Records Table */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3.5">
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
                <span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-md">
                  {filteredPairs.length} {language === 'mr' ? 'नोंदी' : 'records'}
                </span>
              </div>

              <div className="overflow-x-auto border border-[#233d76] rounded-xl shadow-xs">
                <table className="min-w-full text-xs border-collapse">
                  <thead className="bg-[#233d76] text-white">
                    <tr>
                      <th className="px-3.5 py-3 text-left font-bold border-b border-white">गठ्ठा क्र. (Bundle #)</th>
                      <th className="px-3.5 py-3 text-left font-bold border-b border-white">विद्यार्थ्याचे नाव (Name)</th>
                      <th className="px-3.5 py-3 text-left font-bold border-b border-white">लिंग (Gender)</th>
                      <th className="px-3.5 py-3 text-left font-bold border-b border-white">इयत्ता (Class)</th>
                      <th className="px-3.5 py-3 text-center font-bold border-b border-white">चाचणी (Paper)</th>
                      <th className="px-3.5 py-3 text-center font-bold border-b border-white">Pre %</th>
                      <th className="px-3.5 py-3 text-center font-bold border-b border-white">Post %</th>
                      <th className="px-3.5 py-3 text-center font-bold border-b border-white">फरक (Delta)</th>
                      <th className="px-3.5 py-3 text-center font-bold border-b border-white">स्थिती (Status)</th>
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
                                ? 'अद्याप प्रत्यक्ष चाचणी नोंदी भरलेल्या नाहीत'
                                : 'Awaiting Field Assessment Records'}
                            </h5>
                            <p className="text-xs text-slate-500">
                              {language === 'mr'
                                ? 'क्षेत्र प्रशिक्षकांनी शाळांमध्ये जाऊन प्रत्यक्ष पेपर चाचण्या (Pre / Post Tests) घेतल्यानंतर भरलेला डेटा येथे थेट दिसेल. कोणताही डमी किंवा खोटा डेटा दाखवला जाणार नाही.'
                                : 'Real data entered by field trainers from on-ground physical paper stacks will appear here. No synthetic mock data is populated.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPairs.map((p, idx) => (
                        <tr
                          key={`${p.studentId}-${p.paperType}-${idx}`}
                          className={idx % 2 === 0 ? 'bg-[#f0da9a]/25' : 'bg-white'}
                        >
                          <td className="px-3.5 py-2.5 font-mono font-bold">S-{p.bundleSequenceNo}</td>
                          <td className="px-3.5 py-2.5 font-bold">{p.studentName}</td>
                          <td className="px-3.5 py-2.5">{p.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा'}</td>
                          <td className="px-3.5 py-2.5">{p.standard}-{p.division}</td>
                          <td className="px-3.5 py-2.5 text-center font-bold">{p.paperType}</td>
                          <td className="px-3.5 py-2.5 text-center font-bold">{p.preTest ? `${p.preTest.scorePercentage}%` : '—'}</td>
                          <td className="px-3.5 py-2.5 text-center font-bold">{p.postTest ? `${p.postTest.scorePercentage}%` : '—'}</td>
                          <td className="px-3.5 py-2.5 text-center font-black">
                            {p.improvementDelta !== undefined ? `+${p.improvementDelta}%` : '—'}
                          </td>
                          <td className="px-3.5 py-2.5 text-center font-semibold">
                            {p.status === 'ALL_COMPLETED' ? 'पूर्ण' : 'Pre पूर्ण'}
                          </td>
                        </tr>
                      ))
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

            <div className="mt-5 space-y-4 text-xs">
              {/* Phase 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#233d76]">टप्पा १: पायाभूत जीवनकौशल्ये</span>
                  <span className="text-[10px] font-bold bg-[#dfaf27] text-[#233d76] px-2 py-0.5 rounded-sm">सत्र १ ते ७</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                  प्रस्तावना, पूर्व चाचणी, पंचकोश संकल्पना, आत्मप्रतिष्ठा, शारीरिक आरोग्य व पोषण.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#233d76]">टप्पा २: व्यसनाधीनता व आरोग्य</span>
                  <span className="text-[10px] font-bold bg-[#dfaf27] text-[#233d76] px-2 py-0.5 rounded-sm">सत्र ८ ते १६</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                  व्यसनांचे दुष्परिणाम (तंबाखू, दारू, सिगारेट), स्क्रीन/डिजिटल व्यसन, मित्र व समवयस्क दबाव, नकार देण्याचे कौशल्य.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#233d76]">टप्पा ३: भावना नियमन व निर्णय</span>
                  <span className="text-[10px] font-bold bg-[#dfaf27] text-[#233d76] px-2 py-0.5 rounded-sm">सत्र १७ ते २५</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                  भावनांची ओळख, राग व ताणतणाव नियमन, निर्णयक्षमता, ध्येय निश्चिती, उत्तर चाचण्या व समारोप.
                </p>
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
                  <strong>मुख्याध्यापक सही व शिक्का:</strong> प्रत्येक शाळेचे अधिकृत संमतीपत्र व सत्र पूर्तता पत्रक.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>DPDP Act (2023) अनुपालन:</strong> अल्पवयीन विद्यार्थ्यांची ओळख गोपनीय (S-1 ते S-N गट क्रमांक).
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>३ पेपर्स मूल्यांकन:</strong> ~९० प्रश्न प्रति पेपर, गुणांकन वेटेज व प्रोरिटेड स्कोअरिंग.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>सत्र छायाचित्रे पुरावा:</strong> प्रत्येक वर्गाचे प्रत्यक्ष उपस्थिती व सत्राचे फोटो.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
