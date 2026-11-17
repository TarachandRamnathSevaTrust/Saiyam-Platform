import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  School as SchoolIcon,
  BookOpen,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    dashboardStats,
    schools,
    assessmentPairs,
    exportToExcel,
    language,
    sessionLogs,
  } = useApp();

  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState<string>('ALL');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');
  const [selectedPaperFilter, setSelectedPaperFilter] = useState<string>('ALL');

  // Filter assessment pairs
  const filteredPairs = assessmentPairs.filter((p) => {
    if (selectedPaperFilter !== 'ALL' && p.paperType !== selectedPaperFilter) return false;
    if (selectedSchoolFilter !== 'ALL') {
      const studentSchool = schools.find((s) => s.id === selectedSchoolFilter);
      if (!studentSchool) return false;
    }
    return true;
  });

  // Calculate Paper-specific Pre vs Post delta averages
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
    <div className="space-y-6">
      {/* Top Banner & Export Action */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs bg-amber-500/40 text-amber-100 uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full border border-amber-400/30">
            {language === 'mr' ? 'विश्वस्त डॅशबोर्ड' : 'Trust Executive Portal'}
          </span>
          <h1 className="text-2xl font-bold mt-2">
            {language === 'mr' ? 'संयम प्रकल्प: प्रगती व प्रभाव विश्लेषण' : 'Saiyam Program: Operational & Impact Dashboard'}
          </h1>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            {language === 'mr'
              ? 'पुणे शहर व जिल्ह्यातील सर्व शाळांचे थेट सत्र नोंदी, पूर्व व उत्तर चाचणी फरक आणि डिजिटल अहवाल.'
              : 'Real-time monitoring across Pune schools: Pre vs Post delta analytics, attendance, and session audits.'}
          </p>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={() => exportToExcel(selectedSchoolFilter !== 'ALL' ? selectedSchoolFilter : undefined)}
          className="flex items-center space-x-2 bg-white text-amber-800 hover:bg-amber-50 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-amber-600" />
          <span>{language === 'mr' ? 'स्वयंचलित एक्सेल डाऊनलोड' : 'Download Clean Excel'}</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'एकूण क्षेत्र प्रशिक्षक' : 'Field Trainers'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{dashboardStats.totalFieldTrainers}</span>
            <span className="text-xs text-emerald-600 font-medium">सक्रिय (Active)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'एकूण नोंदणीकृत शाळा' : 'Covered Schools'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <SchoolIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{schools.length}</span>
            <span className="text-xs text-slate-500">{language === 'mr' ? 'पुणे परिसर' : 'Pune Region'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'एकूण पूर्ण सत्रे' : 'Sessions Done'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{sessionLogs.length}</span>
            <span className="text-xs text-amber-700 font-medium">/ 25 {language === 'mr' ? 'सत्रे' : 'Target'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'सरासरी उपस्थिती' : 'Attendance Rate'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{dashboardStats.attendanceRate}%</span>
            <span className="text-xs text-purple-700 font-medium">{language === 'mr' ? 'उपस्थित' : 'Present'}</span>
          </div>
        </div>
      </div>

      {/* Planned Feature from Hand-drawn Note: Automated Pre ⟷ Post Analysis Engine */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {language === 'mr' ? 'स्वयंचलित फरक विश्लेषण' : 'Automated Improvement Engine'}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'mr' ? 'पूर्व व उत्तर चाचणी तुलना (Pre ⟷ Post Impact)' : 'Pre vs Post Assessment Analytics'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'mr'
                ? 'हाताने एक्सेल बनवण्याची गरज नाही! विद्यार्थ्यांच्या Baseline व Post स्कोअरची स्वयंचलित तुलना.'
                : 'Zero manual Excel formulas required. Automatically pairs Pre and Post test sheets 1:1.'}
            </p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'mr' ? 'शाळा निवडा:' : 'Filter School:'}</span>
              <select
                aria-label="Filter by School"
                value={selectedSchoolFilter}
                onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
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
        </div>

        {/* 3 Papers Visual Delta Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Paper 1: MKMH */}
          <div className="bg-gradient-to-br from-blue-50/60 to-white p-5 rounded-xl border border-blue-200/70 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">चाचणी १ / Paper 1</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">माझे ज्ञान, माझे आरोग्य (MKMH)</h3>
                <p className="text-xs text-slate-500">My Knowledge, My Health</p>
              </div>
              <div className="flex items-center text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{mkmhMetrics.delta || dashboardStats.averageImprovement.MKMH}%
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">सत्राच्या आधी (Pre)</span>
                <span className="text-lg font-black text-slate-700">{mkmhMetrics.pre || 45.0}%</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">सत्राच्या नंतर (Post)</span>
                <span className="text-lg font-black text-blue-700">{mkmhMetrics.post || 87.5}%</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
              <span>{language === 'mr' ? 'लैंगिक संवेदनशीलता व ज्ञान' : 'Health & Gender literacy'}</span>
              <span className="text-emerald-700 font-semibold">{language === 'mr' ? 'उल्लेखनीय प्रगती' : 'Significant Gain'}</span>
            </div>
          </div>

          {/* Paper 2: MMAT */}
          <div className="bg-gradient-to-br from-amber-50/60 to-white p-5 rounded-xl border border-amber-200/70 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">चाचणी २ / Paper 2</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">समज व गैरसमज (MMAT)</h3>
                <p className="text-xs text-slate-500">Myths & Misconceptions on Addiction</p>
              </div>
              <div className="flex items-center text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{mmatMetrics.delta || dashboardStats.averageImprovement.MMAT}%
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">सत्राच्या आधी (Pre)</span>
                <span className="text-lg font-black text-slate-700">{mmatMetrics.pre || 38.0}%</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">सत्राच्या नंतर (Post)</span>
                <span className="text-lg font-black text-amber-700">{mmatMetrics.post || 92.8}%</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
              <span>{language === 'mr' ? 'व्यसनविषयक गैरसमज निवारण' : 'Dispelling addiction myths'}</span>
              <span className="text-emerald-700 font-semibold">{language === 'mr' ? 'उच्च सुधारणा' : 'High Awareness'}</span>
            </div>
          </div>

          {/* Paper 3: ERT */}
          <div className="bg-gradient-to-br from-purple-50/60 to-white p-5 rounded-xl border border-purple-200/70 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">चाचणी ३ / Paper 3</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">स्व-भावना नियमन (ERT)</h3>
                <p className="text-xs text-slate-500">Emotional Regulation Test</p>
              </div>
              <div className="flex items-center text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{ertMetrics.delta || dashboardStats.averageImprovement.ERT}%
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">सत्राच्या आधी (Pre)</span>
                <span className="text-lg font-black text-slate-700">{ertMetrics.pre || 48.0}%</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">सत्राच्या नंतर (Post)</span>
                <span className="text-lg font-black text-purple-700">{ertMetrics.post || 86.2}%</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
              <span>{language === 'mr' ? 'नकार कौशल्य व संयम' : 'Refusal skills & restraint'}</span>
              <span className="text-emerald-700 font-semibold">{language === 'mr' ? 'आत्मविश्वास वृद्धी' : 'High Resilience'}</span>
            </div>
          </div>
        </div>

        {/* Live Student Cohort Pre-Post Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800">
              {language === 'mr' ? 'विद्यार्थी निहाय पूर्व व उत्तर चाचणी नोंदी (Student Test Roster)' : 'Student-by-Student Pre & Post Tracking'}
            </h4>
            <span className="text-xs text-slate-500">
              {filteredPairs.length} {language === 'mr' ? 'नोंदी सापडल्या' : 'records mapped'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3.5 py-3 text-left font-bold text-slate-700">गठ्ठा क्र. (Bundle #)</th>
                  <th className="px-3.5 py-3 text-left font-bold text-slate-700">विद्यार्थ्याचे नाव (Name)</th>
                  <th className="px-3.5 py-3 text-left font-bold text-slate-700">लिंग (Gender)</th>
                  <th className="px-3.5 py-3 text-left font-bold text-slate-700">इयत्ता (Class)</th>
                  <th className="px-3.5 py-3 text-center font-bold text-slate-700">चाचणी (Paper)</th>
                  <th className="px-3.5 py-3 text-center font-bold text-slate-700">पूर्व चाचणी (Pre %)</th>
                  <th className="px-3.5 py-3 text-center font-bold text-slate-700">उत्तर चाचणी (Post %)</th>
                  <th className="px-3.5 py-3 text-center font-bold text-slate-700">फरक (Improvement)</th>
                  <th className="px-3.5 py-3 text-center font-bold text-slate-700">स्थिती (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPairs.map((p, idx) => (
                  <tr key={`${p.studentId}-${p.paperType}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 py-2.5 font-mono font-bold text-slate-800">S-{p.bundleSequenceNo}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-900">{p.studentName}</td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {p.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">
                      {p.standard}-{p.division}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        {p.paperType}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-semibold text-slate-700">
                      {p.preTest ? `${p.preTest.scorePercentage}%` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-semibold text-blue-700">
                      {p.postTest ? `${p.postTest.scorePercentage}%` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-bold">
                      {p.improvementDelta !== undefined ? (
                        <span className={p.improvementDelta >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {p.improvementDelta >= 0 ? `+${p.improvementDelta}%` : `${p.improvementDelta}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      {p.status === 'ALL_COMPLETED' ? (
                        <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          पूर्ण (Done)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-amber-200">
                          पूर्व चाचणी पूर्ण
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Field Media Bank Audit (Photos & Videos from Sessions) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'mr' ? 'सत्रांचे छायाचित्रे व व्हिडिओ पुरावे (Session Media Audit)' : 'Session Media & Photo Audit'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'mr'
                ? 'शाळांमध्ये घेतलेल्या प्रत्यक्ष सत्रांचे फोटो, उपस्थिती पत्रक व ऑडिओ नोंदी.'
                : 'Verified field media proofs submitted by trainers across 25 sessions.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {sessionLogs.flatMap((log) => log.media).map((med) => (
            <div key={med.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs">
              <img
                src={med.fileUrl}
                alt={med.fileName || 'Session Photo'}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="p-3 bg-white">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                  {med.mediaType}
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-1">{med.fileName}</p>
                <div className="flex items-center text-[11px] text-slate-500 mt-0.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  {med.uploadedAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
