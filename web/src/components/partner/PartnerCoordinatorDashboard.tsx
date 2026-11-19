import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  School as SchoolIcon,
  BookOpen,
  ClipboardCheck,
  Download,
  Calendar,
  CheckCircle2,
  MapPin,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
} from 'lucide-react';

export const PartnerCoordinatorDashboard: React.FC = () => {
  const {
    currentUser,
    organizations,
    users,
    schools,
    students,
    assessmentPairs,
    sessionLogs,
    financialYear,
    language,
    exportToExcel,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRAINERS' | 'SCHOOLS' | 'ANALYTICS'>('OVERVIEW');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Find the coordinator's organization
  const currentOrg = organizations.find((o) => o.code === currentUser.organizationCode) || {
    id: 'org-default',
    code: currentUser.organizationCode || 'PARTNER_NGO',
    nameMr: 'भागीदार स्वयंसेवी संस्था',
    nameEn: 'Partner NGO',
    orgType: 'PARTNER_NGO' as const,
    isActive: true,
    createdAt: '2026-01-01',
  };

  // Scoped Data: ONLY belonging to this organization
  const orgTrainers = users.filter(
    (u) => u.role === 'FIELD_TRAINER' && (u.organizationCode || '') === currentOrg.code
  );

  const orgSchools = schools.filter(
    (s) =>
      (!s.financialYear || s.financialYear === financialYear) &&
      (s.organizationCode || '') === currentOrg.code
  );

  const orgSchoolIds = new Set(orgSchools.map((s) => s.id));
  const orgStudents = students.filter((st) => orgSchoolIds.has(st.schoolId));
  const orgSessionLogs = sessionLogs.filter((l) => orgSchoolIds.has(l.schoolId));

  // Assessment Delta calculations for this NGO
  const calcPaperMetrics = (pType: 'MKMH' | 'MMAT' | 'ERT') => {
    const studentIds = new Set(orgStudents.map((s) => s.id));
    const pairs = assessmentPairs.filter(
      (p) => studentIds.has(p.studentId) && p.paperType === pType && p.preTest && p.postTest
    );
    if (pairs.length === 0) return { pre: 0, post: 0, delta: 0, count: 0 };
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
      {/* Top NGO Coordinator Banner */}
      <div className="bg-[#233d76] rounded-2xl p-4 sm:p-7 text-white shadow-md border-b-4 border-[#dfaf27] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="space-y-2 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs bg-[#dfaf27] text-[#233d76] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-2xs">
              {language === 'mr' ? 'भागीदार संस्था केंद्र' : 'Partner NGO Portal'}
            </span>
            <span className="text-[10px] sm:text-xs bg-[#1a2d57] text-[#dfaf27] font-bold px-2.5 py-1 rounded-md border border-[#dfaf27]/40">
              📅 FY {financialYear}
            </span>
            <span className="text-[10px] sm:text-xs bg-[#1a2d57] text-[#f0da9a] font-semibold px-2 py-1 rounded-md border border-[#3b5998] flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-[#dfaf27]" />
              <span>DPDP Act Protected</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold trust-heading tracking-tight leading-snug">
            {language === 'mr' ? currentOrg.nameMr : currentOrg.nameEn}
          </h1>

          <div className="flex items-center space-x-2 text-xs text-[#f0da9a]">
            <span>{language === 'mr' ? 'समन्वयक:' : 'Lead / Coordinator:'}</span>
            <span className="font-bold text-white">{currentUser.fullName}</span>
            {currentUser.email && <span className="text-slate-300">({currentUser.email})</span>}
          </div>
        </div>

        {/* 1-Click NGO Filtered Excel Export */}
        <button
          onClick={() => exportToExcel()}
          className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4 text-[#233d76] stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-bold">
            {language === 'mr' ? 'संस्थेचा एक्सेल डाऊनलोड (.xlsx)' : 'Download NGO Report (.xlsx)'}
          </span>
        </button>
      </div>

      {/* Scoped KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Field Trainers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Trainers'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#233d76] font-mono">
              {orgTrainers.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">
              {language === 'mr' ? 'सक्रिय' : 'Active'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'या संस्थेअंतर्गत कार्यरत' : 'Assigned under this NGO'}
          </p>
        </div>

        {/* Metric 2: Allocated Schools */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'नोंदणीकृत शाळा' : 'Allocated Schools'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center">
              <SchoolIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#233d76] font-mono">
              {orgSchools.length}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'mr' ? 'शाळा' : 'Schools'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'प्रशिक्षकांनी प्रत्यक्ष जोडलेल्या' : 'Registered by FTs'}
          </p>
        </div>

        {/* Metric 3: Students Enrolled */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'नोंदवलेले विद्यार्थी' : 'Enrolled Students'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-[#233d76] font-mono">
              {orgStudents.length}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'mr' ? 'विद्यार्थी' : 'Students'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? 'गठ्ठा क्र. S-1 ते S-N' : 'Paper bundle rosters'}
          </p>
        </div>

        {/* Metric 4: Sessions Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'पूर्ण झालेली सत्रे' : 'Sessions Done'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              {orgSessionLogs.length}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'mr' ? 'सत्र नोंदी' : 'Sessions'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'mr' ? '२५ सत्रांपैकी पूर्ण' : 'From 25 sessions curriculum'}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '१. FT ट्रॅकिंग व प्रगती' : '1. FTs Progress & Tracking'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {orgTrainers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SCHOOLS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SCHOOLS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SchoolIcon className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '२. शाळा यादी व सत्रे' : '2. Schools & Visits'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {orgSchools.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '३. पूर्व/उत्तर चाचणी प्रभाव' : '3. Pre/Post Delta Impact'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: FIELD TRAINERS (FTs) TRACKING                       */}
      {/* ============================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900 trust-heading">
                {language === 'mr' ? 'संस्थेतील क्षेत्र प्रशिक्षक' : 'Field Trainers Under This NGO'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'तुमच्या संस्थेअंतर्गत काम करणाऱ्या सर्व प्रशिक्षकांची प्रगती येथे ट्रॅक करा.'
                  : 'Track schools, students, and session logs for each trainer in your organization.'}
              </p>
            </div>
          </div>

          {orgTrainers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {language === 'mr'
                  ? 'या संस्थेला अद्याप कोणताही क्षेत्र प्रशिक्षक जोडलेला नाही.'
                  : 'No field trainers mapped to this organization yet.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'mr'
                  ? 'ट्रस्ट ॲडमिन कडून Governance पॅनेलमधून या संस्थेसाठी प्रशिक्षक नियुक्त केले जातील.'
                  : 'Trust Admin can assign field trainers under this NGO from the Governance panel.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgTrainers.map((tr) => {
                const assignedSchools = schools.filter((s) => s.assignedTrainerId === tr.id);
                const assignedSchoolIds = new Set(assignedSchools.map((s) => s.id));
                const assignedStudents = students.filter((st) => assignedSchoolIds.has(st.schoolId));
                const trainerLogs = sessionLogs.filter((l) => assignedSchoolIds.has(l.schoolId));

                return (
                  <div key={tr.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#233d76] text-[#dfaf27] flex items-center justify-center font-bold text-sm">
                        {tr.fullName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{tr.fullName}</h4>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{tr.email}</span>
                        </div>
                      </div>
                    </div>

                    {tr.phone && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <Phone className="w-3.5 h-3.5 text-[#233d76]" />
                        <span className="font-mono">{tr.phone}</span>
                      </div>
                    )}

                    {/* Work Summary Stats */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center">
                      <div>
                        <div className="text-base font-black text-[#233d76]">{assignedSchools.length}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{language === 'mr' ? 'शाळा' : 'Schools'}</div>
                      </div>
                      <div>
                        <div className="text-base font-black text-[#233d76]">{assignedStudents.length}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{language === 'mr' ? 'विद्यार्थी' : 'Students'}</div>
                      </div>
                      <div>
                        <div className="text-base font-black text-emerald-700">{trainerLogs.length}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{language === 'mr' ? 'सत्रे' : 'Sessions'}</div>
                      </div>
                    </div>

                    {/* School Chips */}
                    {assignedSchools.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {language === 'mr' ? 'नियुक्त शाळा:' : 'Assigned Schools:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {assignedSchools.map((s) => (
                            <span
                              key={s.id}
                              className="bg-[#233d76]/5 text-[#233d76] font-semibold text-[10px] px-2 py-0.5 rounded-md border border-[#233d76]/15"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px] block text-center">
                        {language === 'mr' ? 'अद्याप शाळा जोडलेली नाही' : 'No schools registered yet'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: SCHOOLS ROSTER UNDER THIS NGO                       */}
      {/* ============================================================== */}
      {activeTab === 'SCHOOLS' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 trust-heading">
              {language === 'mr' ? 'नोंदणीकृत शाळा व प्रगती' : 'Schools Allocated Under This NGO'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'शाळेचे नाव, गावाचा पत्ता, पूर्ण झालेली सत्रे व चाचणी स्थिती.'
                : 'School details, assigned field trainer, and session completion metrics.'}
            </p>
          </div>

          {orgSchools.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <SchoolIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {language === 'mr' ? 'अद्याप कोणतीही शाळा नोंदवलेली नाही' : 'No schools registered under this NGO yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orgSchools.map((school) => {
                const schoolSts = students.filter((s) => s.schoolId === school.id);
                const schoolSessions = sessionLogs.filter((l) => l.schoolId === school.id);

                return (
                  <div
                    key={school.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#233d76] text-white flex items-center justify-center font-bold">
                        <SchoolIcon className="w-5 h-5 text-[#dfaf27]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{school.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{school.village}, {school.district} • पिन: {school.pinCode}</span>
                        </div>
                        {school.assignedTrainerName && (
                          <div className="text-[11px] text-[#233d76] font-semibold mt-1">
                            👤 {language === 'mr' ? 'प्रशिक्षक:' : 'Trainer:'} {school.assignedTrainerName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-bold px-3 py-1 rounded-full border border-[#dfaf27]/40 block">
                          {schoolSessions.length} / 25 {language === 'mr' ? 'सत्रे पूर्ण' : 'Sessions'}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          {schoolSts.length} {language === 'mr' ? 'विद्यार्थी' : 'Students'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: PRE/POST ASSESSMENT DELTA (IMPACT)                  */}
      {/* ============================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 trust-heading">
              {language === 'mr' ? 'पूर्व व उत्तर चाचणी प्रभाव (Pre ➔ Post Delta)' : 'Pre & Post Assessment Delta'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'mr'
                ? 'या संस्थेच्या विद्यार्थ्यांमधील व्यसनमुक्ती, मानसिक आरोग्य व स्व-भावना नियमनातील सकारात्मक बदल.'
                : 'Baseline vs Outcome comparison for students under this partner NGO.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Paper 1: MKMH */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-[#233d76] uppercase">
                {language === 'mr' ? 'चाचणी १' : 'Paper 1'}
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'mr' ? 'माझे ज्ञान, माझे आरोग्य (MKMH)' : 'My Knowledge, My Health (MKMH)'}
              </h4>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Pre-Test (Baseline)</span>
                  <span className="text-lg font-bold text-slate-700">{mkmhMetrics.pre}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Post-Test (Outcome)</span>
                  <span className="text-lg font-bold text-[#233d76]">{mkmhMetrics.post}%</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                mkmhMetrics.delta > 0 ? 'bg-emerald-50 text-emerald-800' : mkmhMetrics.delta < 0 ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-800'
              }`}>
                <span className="font-bold">
                  {language === 'mr' ? 'प्रभाव वाढ (Delta):' : 'Delta Improvement:'}
                </span>
                <span className={`font-black font-mono text-sm ${
                  mkmhMetrics.delta > 0 ? 'text-emerald-700' : mkmhMetrics.delta < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {mkmhMetrics.delta > 0 ? `+${mkmhMetrics.delta}%` : `${mkmhMetrics.delta}%`}
                </span>
              </div>
            </div>

            {/* Paper 2: MMAT */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-[#233d76] uppercase">
                {language === 'mr' ? 'चाचणी २' : 'Paper 2'}
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'mr' ? 'समज व गैरसमज (MMAT)' : 'Myths & Misconceptions (MMAT)'}
              </h4>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Pre-Test (Baseline)</span>
                  <span className="text-lg font-bold text-slate-700">{mmatMetrics.pre}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Post-Test (Outcome)</span>
                  <span className="text-lg font-bold text-[#233d76]">{mmatMetrics.post}%</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                mmatMetrics.delta > 0 ? 'bg-emerald-50 text-emerald-800' : mmatMetrics.delta < 0 ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-800'
              }`}>
                <span className="font-bold">
                  {language === 'mr' ? 'प्रभाव वाढ (Delta):' : 'Delta Improvement:'}
                </span>
                <span className={`font-black font-mono text-sm ${
                  mmatMetrics.delta > 0 ? 'text-emerald-700' : mmatMetrics.delta < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {mmatMetrics.delta > 0 ? `+${mmatMetrics.delta}%` : `${mmatMetrics.delta}%`}
                </span>
              </div>
            </div>

            {/* Paper 3: ERT */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[11px] font-bold text-[#233d76] uppercase">
                {language === 'mr' ? 'चाचणी ३' : 'Paper 3'}
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'mr' ? 'स्व-भावना नियमन चाचणी (ERT)' : 'Emotion Regulation Test (ERT)'}
              </h4>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Pre-Test (Baseline)</span>
                  <span className="text-lg font-bold text-slate-700">{ertMetrics.pre}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Post-Test (Outcome)</span>
                  <span className="text-lg font-bold text-[#233d76]">{ertMetrics.post}%</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                ertMetrics.delta > 0 ? 'bg-emerald-50 text-emerald-800' : ertMetrics.delta < 0 ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-800'
              }`}>
                <span className="font-bold">
                  {language === 'mr' ? 'प्रभाव वाढ (Delta):' : 'Delta Improvement:'}
                </span>
                <span className={`font-black font-mono text-sm ${
                  ertMetrics.delta > 0 ? 'text-emerald-700' : ertMetrics.delta < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {ertMetrics.delta > 0 ? `+${ertMetrics.delta}%` : `${ertMetrics.delta}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
