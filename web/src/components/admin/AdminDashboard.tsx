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
  ShieldCheck,
  Building2,
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

  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');

  const filteredPairs = assessmentPairs.filter((p) => {
    if (selectedSchoolFilter !== 'ALL') {
      const studentSchool = schools.find((s) => s.id === selectedSchoolFilter);
      if (!studentSchool) return false;
    }
    return true;
  });

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
      {/* Top Banner with Trust Brand Colors */}
      <div className="bg-[#233d76] rounded-2xl p-6 sm:p-8 text-white shadow-md border-b-4 border-[#dfaf27] flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <span className="text-xs bg-[#dfaf27] text-[#233d76] uppercase tracking-wider font-extrabold px-3 py-1 rounded-md shadow-2xs">
            {language === 'mr' ? 'विश्वस्त डॅशबोर्ड (Trust Dashboard)' : 'Trust Executive Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2.5 trust-heading">
            {language === 'mr' ? 'संयम प्रकल्प - प्रगती व प्रभाव विश्लेषण' : 'Saiyam Program - Executive Monitoring'}
          </h1>
          <p className="text-[#f0da9a] text-xs sm:text-sm mt-1 font-medium">
            Initiative By : Tarachand Ramnath Seva Trust (TRST)
          </p>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={() => exportToExcel(selectedSchoolFilter !== 'ALL' ? selectedSchoolFilter : undefined)}
          className="flex items-center space-x-2.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Download className="w-5 h-5 text-[#233d76] stroke-[2.5]" />
          <span className="text-sm font-bold">{language === 'mr' ? 'स्वयंचलित एक्सेल डाऊनलोड' : 'Download Clean Excel'}</span>
        </button>
      </div>

      {/* KPI Cards Row (Grid spanning 4 columns evenly without empty gaps) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        </div>

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
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#dfaf27] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'mr' ? 'पूर्ण झालेली सत्रे' : 'Sessions Conducted'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4 text-[#233d76]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#233d76]">{sessionLogs.length}</span>
            <span className="text-xs text-slate-500 font-medium">/ 25 {language === 'mr' ? 'सत्रे' : 'sessions'}</span>
          </div>
        </div>

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
        </div>
      </div>

      {/* Automated Pre vs Post Impact Engine */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#f0da9a]/60 text-[#233d76] border border-[#dfaf27]/50">
                {language === 'mr' ? 'स्वयंचलित फरक विश्लेषण' : 'Automated Improvement Engine'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2 trust-heading">
              {language === 'mr' ? 'पूर्व व उत्तर चाचणी तुलना (Pre ⟷ Post Impact)' : 'Pre vs Post Assessment Analytics'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'mr'
                ? 'हाताने एक्सेल तयार न करता Baseline व Outcome स्कोअरची स्वयंचलित तुलना.'
                : 'Direct correlation engine replacing manual Excel calculations.'}
            </p>
          </div>

          {/* School Filter Dropdown */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-[#233d76]" />
            <select
              aria-label="Filter by School"
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="bg-transparent font-bold text-[#233d76] focus:outline-hidden cursor-pointer text-xs sm:text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {/* Paper 1: MKMH */}
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#233d76] uppercase tracking-wider">चाचणी १ / Paper 1</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">माझे ज्ञान, माझे आरोग्य (MKMH)</h3>
              </div>
              <div className="flex items-center text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{mkmhMetrics.delta}%
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-xs font-medium">Pre %</span>
                <span className="text-lg font-bold text-slate-700">{mkmhMetrics.pre}%</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-xs font-medium">Post %</span>
                <span className="text-lg font-bold text-[#233d76]">{mkmhMetrics.post}%</span>
              </div>
            </div>
          </div>

          {/* Paper 2: MMAT */}
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#233d76] uppercase tracking-wider">चाचणी २ / Paper 2</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">समज व गैरसमज (MMAT)</h3>
              </div>
              <div className="flex items-center text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{mmatMetrics.delta}%
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-xs font-medium">Pre %</span>
                <span className="text-lg font-bold text-slate-700">{mmatMetrics.pre}%</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-xs font-medium">Post %</span>
                <span className="text-lg font-bold text-[#233d76]">{mmatMetrics.post}%</span>
              </div>
            </div>
          </div>

          {/* Paper 3: ERT */}
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-200 hover:border-[#233d76] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#233d76] uppercase tracking-wider">चाचणी ३ / Paper 3</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">स्व-भावना नियमन (ERT)</h3>
              </div>
              <div className="flex items-center text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{ertMetrics.delta}%
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-xs font-medium">Pre %</span>
                <span className="text-lg font-bold text-slate-700">{ertMetrics.pre}%</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-xs font-medium">Post %</span>
                <span className="text-lg font-bold text-[#233d76]">{ertMetrics.post}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Table with Strict Trust Colors from Brand Guidelines:
            - Header Background: #233d76, Header Font: #ffffff
            - Odd Row: #f0da9a, Even Row: #ffffff
            - Font: #233d76
        */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-sm font-bold text-slate-800">
              {language === 'mr' ? 'विद्यार्थी निहाय पूर्व व उत्तर चाचणी नोंदी' : 'Student-by-Student Records'}
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              {filteredPairs.length} {language === 'mr' ? 'नोंदी' : 'records'}
            </span>
          </div>

          <div className="overflow-x-auto border border-[#233d76] rounded-xl shadow-xs">
            <table className="min-w-full text-xs sm:text-sm border-collapse">
              <thead className="bg-[#233d76] text-white">
                <tr>
                  <th className="px-4 py-3.5 text-left font-bold border-b border-white">गठ्ठा क्र. (Bundle #)</th>
                  <th className="px-4 py-3.5 text-left font-bold border-b border-white">विद्यार्थ्याचे नाव (Name)</th>
                  <th className="px-4 py-3.5 text-left font-bold border-b border-white">लिंग (Gender)</th>
                  <th className="px-4 py-3.5 text-left font-bold border-b border-white">इयत्ता (Class)</th>
                  <th className="px-4 py-3.5 text-center font-bold border-b border-white">चाचणी (Paper)</th>
                  <th className="px-4 py-3.5 text-center font-bold border-b border-white">Pre %</th>
                  <th className="px-4 py-3.5 text-center font-bold border-b border-white">Post %</th>
                  <th className="px-4 py-3.5 text-center font-bold border-b border-white">फरक (Delta)</th>
                  <th className="px-4 py-3.5 text-center font-bold border-b border-white">स्थिती (Status)</th>
                </tr>
              </thead>
              <tbody className="text-[#233d76]">
                {filteredPairs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400 bg-white">
                      {language === 'mr'
                        ? 'अद्याप चाचणी नोंदी भरलेल्या नाहीत. क्षेत्र प्रशिक्षकांनी भरलेला डेटा येथे थेट दिसेल.'
                        : 'No test records yet. Real data entered by field trainers will appear here.'}
                    </td>
                  </tr>
                ) : (
                  filteredPairs.map((p, idx) => (
                    <tr
                      key={`${p.studentId}-${p.paperType}-${idx}`}
                      className={idx % 2 === 0 ? 'bg-[#f0da9a]/30' : 'bg-white'}
                    >
                      <td className="px-4 py-3 font-mono font-bold">S-{p.bundleSequenceNo}</td>
                      <td className="px-4 py-3 font-bold">{p.studentName}</td>
                      <td className="px-4 py-3">{p.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा'}</td>
                      <td className="px-4 py-3">{p.standard}-{p.division}</td>
                      <td className="px-4 py-3 text-center font-bold">{p.paperType}</td>
                      <td className="px-4 py-3 text-center font-bold">{p.preTest ? `${p.preTest.scorePercentage}%` : '—'}</td>
                      <td className="px-4 py-3 text-center font-bold">{p.postTest ? `${p.postTest.scorePercentage}%` : '—'}</td>
                      <td className="px-4 py-3 text-center font-black">
                        {p.improvementDelta !== undefined ? `+${p.improvementDelta}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
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
  );
};
