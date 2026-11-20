import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_25_SESSIONS, CurriculumSession, SessionLog } from '@saiyam/shared';
import {
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  User,
  Image as ImageIcon,
  Eye,
  X,
  FileSpreadsheet,
  Building2,
  Users,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  onNavigateToForm?: (sessionNumber: number) => void;
  onNavigate?: (tab: string) => void;
}

export const SessionTableView: React.FC<Props> = ({
  onBack,
  onNavigateToForm,
  onNavigate,
}) => {
  const {
    selectedSchool,
    sessionLogs,
    language,
    currentUser,
    curriculumSessions,
    curriculumModules,
    users,
    exportToExcel,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const isOrgCoordinator = currentUser.role === 'ORG_COORDINATOR';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECORDED' | 'PENDING'>('ALL');
  const [moduleFilter, setModuleFilter] = useState<number | 'ALL'>('ALL');

  // Modals state
  const [inspectSession, setInspectSession] = useState<{
    session: CurriculumSession;
    log?: SessionLog;
  } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    caption: string;
    sessionNumber: number;
    trainerName: string;
    conductedDate: string;
  } | null>(null);

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto shadow-2xs">
        <p className="text-slate-600 font-semibold mb-3">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs bg-[#233d76] text-white font-bold py-2.5 px-5 rounded-xl cursor-pointer hover:bg-[#1b2f5c] transition-colors"
          >
            {language === 'mr' ? '← शाळा यादीकडे जा' : '← Back to Schools'}
          </button>
        )}
      </div>
    );
  }

  // 25 Official Curriculum Sessions
  const allSessionSlots =
    curriculumSessions && curriculumSessions.length > 0 ? curriculumSessions : ALL_25_SESSIONS;

  // Find trainer name for any session or school
  const getTrainerInfo = (log?: SessionLog) => {
    let trainerUser = null;
    if (log?.conductedBy) {
      trainerUser = users.find((u) => u.id === log.conductedBy);
    }
    if (!trainerUser && selectedSchool.assignedTrainerId) {
      trainerUser = users.find((u) => u.id === selectedSchool.assignedTrainerId);
    }

    const name =
      trainerUser?.fullName ||
      selectedSchool.assignedTrainerName ||
      (language === 'mr' ? 'नेमून दिलेले प्रशिक्षक' : 'Assigned Trainer');

    const org =
      trainerUser?.organizationCode ||
      selectedSchool.organizationCode ||
      'TRST_DIRECT';

    return { name, org, role: trainerUser?.role || 'FIELD_TRAINER' };
  };

  // Match logs with all 25 sessions
  const sessionRows = allSessionSlots.map((session) => {
    const log = sessionLogs.find(
      (l) => l.schoolId === selectedSchool.id && l.sessionNumber === session.sessionNumber
    );
    const trainer = getTrainerInfo(log);
    const isRecorded = Boolean(log);
    const photos = (log?.media || []).filter(
      (m) => Boolean(m.fileUrl && !m.fileUrl.includes('example.com'))
    );

    return {
      session,
      log,
      trainer,
      isRecorded,
      photos,
    };
  });

  // Calculate high-level summary metrics
  const totalCompleted = sessionRows.filter((r) => r.isRecorded).length;
  const totalAttendanceSum = sessionRows.reduce(
    (sum, r) => sum + (r.log?.totalAttendance || 0),
    0
  );
  const totalPhotosSum = sessionRows.reduce((sum, r) => sum + r.photos.length, 0);

  // Apply filters
  const filteredRows = sessionRows.filter((row) => {
    // Status Filter
    if (statusFilter === 'RECORDED' && !row.isRecorded) return false;
    if (statusFilter === 'PENDING' && row.isRecorded) return false;

    // Module Filter
    if (moduleFilter !== 'ALL' && row.session.moduleNumber !== moduleFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = `सत्र ${row.session.sessionNumber}`.includes(q) || `session ${row.session.sessionNumber}`.includes(q) || String(row.session.sessionNumber) === q;
      const matchTitle =
        (row.session.titleMr || '').toLowerCase().includes(q) ||
        (row.session.titleEn || '').toLowerCase().includes(q) ||
        (row.session.sessionNameMr || '').toLowerCase().includes(q) ||
        (row.session.sessionNameEn || '').toLowerCase().includes(q);
      const matchModule =
        (row.session.moduleNameMr || '').toLowerCase().includes(q) ||
        (row.session.moduleNameEn || '').toLowerCase().includes(q);
      const matchTrainer = row.trainer.name.toLowerCase().includes(q);
      const matchNotes = (row.log?.specialNotes || '').toLowerCase().includes(q);

      if (!matchNumber && !matchTitle && !matchModule && !matchTrainer && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
              title={language === 'mr' ? 'मागे जा' : 'Back to Schools'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#233d76] text-white px-2.5 py-0.5 rounded-md">
                {isTrustAdmin ? (language === 'mr' ? 'विश्वस्त तपासणी' : 'Trust Oversight') : (language === 'mr' ? 'सत्र अहवाल' : 'Session Table')}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                {selectedSchool.organizationCode || 'TRST_DIRECT'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1 trust-heading leading-tight">
              {language === 'mr'
                ? '२५ सत्रांचा सविस्तर तपासणी तक्ता'
                : 'Session Audit & Monitoring Table (25 Sessions)'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedSchool.name} • {selectedSchool.village}, {selectedSchool.district}
            </p>
          </div>
        </div>

        {/* Action Buttons: Form View Toggle & Export */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto shrink-0">
          {onNavigateToForm && !isTrustAdmin && (
            <button
              type="button"
              onClick={() => onNavigateToForm(1)}
              className="text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#233d76]" />
              <span>{language === 'mr' ? 'नोंद फॉर्म भरा →' : 'Open Form Entry →'}</span>
            </button>
          )}

          {exportToExcel && (
            <button
              type="button"
              onClick={() => exportToExcel(selectedSchool.id)}
              className="text-xs font-bold bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
              title={language === 'mr' ? 'एक्सेल अहवाल डाउनलोड करा' : 'Export Excel Report'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#233d76]" />
              <span>{language === 'mr' ? 'एक्सेल अहवाल' : 'Export Excel'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Trust Oversight KPI Bar (Field Trainer Name prominently displayed) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Assigned Field Trainer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'mr' ? 'क्षेत्र प्रशिक्षक (Field Trainer)' : 'Assigned Field Trainer'}
            </span>
            <p className="text-sm font-black text-slate-900 truncate mt-0.5">
              {selectedSchool.assignedTrainerName ||
                users.find((u) => u.id === selectedSchool.assignedTrainerId)?.fullName ||
                (language === 'mr' ? 'नेमून दिलेले' : 'Assigned Trainer')}
            </p>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {selectedSchool.organizationCode || 'TRST_DIRECT'}
            </span>
          </div>
        </div>

        {/* KPI 2: Sessions Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'mr' ? 'सत्रे पूर्ण' : 'Sessions Done'}
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-lg font-black text-slate-900">{totalCompleted}</span>
              <span className="text-xs text-slate-400 font-bold">/ 25</span>
              <span className="text-[11px] font-extrabold text-emerald-700 ml-1">
                ({Math.round((totalCompleted / 25) * 100)}%)
              </span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${(totalCompleted / 25) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Total Attendance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'mr' ? 'एकूण नोंदवलेली उपस्थिती' : 'Recorded Attendance'}
            </span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {totalAttendanceSum}
              <span className="text-xs text-slate-500 font-normal ml-1">
                {language === 'mr' ? 'विद्यार्थी' : 'students'}
              </span>
            </p>
            <span className="text-[10px] text-slate-400">
              {language === 'mr' ? 'सत्रांमध्ये प्रत्यक्ष उपस्थित' : 'Across conducted sessions'}
            </span>
          </div>
        </div>

        {/* KPI 4: Evidence Photos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'mr' ? 'पुरावा छायाचित्रे' : 'Evidence Photos'}
            </span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {totalPhotosSum}
              <span className="text-xs text-slate-500 font-normal ml-1">
                {language === 'mr' ? 'फोटो' : 'photos'}
              </span>
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {language === 'mr' ? '✓ वर्गातील पुरावे उपलब्ध' : 'Verified Classroom Evidence'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === 'mr'
                  ? 'सत्राचे नाव, विषय किंवा प्रशिक्षकाचे नाव शोधा...'
                  : 'Search by session name, module, or trainer name...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
            {/* Status Pills Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#233d76] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? `सर्व (२५)` : `All (25)`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RECORDED')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'RECORDED'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? `पूर्ण (${totalCompleted})` : `Done (${totalCompleted})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr'
                  ? `प्रलंबित (${25 - totalCompleted})`
                  : `Pending (${25 - totalCompleted})`}
              </button>
            </div>

            {/* Module Filter Dropdown */}
            <div className="relative shrink-0">
              <select
                value={moduleFilter}
                onChange={(e) =>
                  setModuleFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
                className="text-xs font-bold bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-xl focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">
                  {language === 'mr' ? 'सर्व १० विषय (Modules)' : 'All 10 Modules'}
                </option>
                <option value={0}>0. {language === 'mr' ? 'प्रस्तावना' : 'Orientation'}</option>
                <option value={1}>1. {language === 'mr' ? 'पंचकोश' : 'Panchakosh'}</option>
                <option value={2}>2. {language === 'mr' ? 'सौंदर्य' : 'Beauty'}</option>
                <option value={3}>3. {language === 'mr' ? 'आरोग्य' : 'Health'}</option>
                <option value={4}>4. {language === 'mr' ? 'भावना' : 'Emotions'}</option>
                <option value={5}>5. {language === 'mr' ? 'विचार' : 'Thought'}</option>
                <option value={6}>6. {language === 'mr' ? 'संवाद' : 'Communication'}</option>
                <option value={7}>7. {language === 'mr' ? 'मित्र' : 'Friendship'}</option>
                <option value={8}>8. {language === 'mr' ? 'व्यसन' : 'Addiction'}</option>
                <option value={9}>9. {language === 'mr' ? 'ध्येय' : 'Goal Setting'}</option>
                <option value={10}>10. {language === 'mr' ? 'समारोप' : 'Conclusion'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Showing row count info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {language === 'mr'
              ? `एकूण २५ पैकी ${filteredRows.length} सत्रे दिसत आहेत`
              : `Showing ${filteredRows.length} of 25 curriculum sessions`}
          </span>
          {(searchQuery || statusFilter !== 'ALL' || moduleFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setModuleFilter('ALL');
              }}
              className="text-[#233d76] font-bold hover:underline cursor-pointer"
            >
              {language === 'mr' ? 'फिल्टर्स साफ करा' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DETAILED DATA TABLE                                          */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#233d76] text-white text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-3.5 text-center w-14">#</th>
                <th className="py-3 px-4 min-w-[200px]">
                  {language === 'mr' ? 'सत्राचा विषय व टप्पा' : 'Session & Topic'}
                </th>
                <th className="py-3 px-3.5 text-center min-w-[110px]">
                  {language === 'mr' ? 'स्थिती' : 'Status'}
                </th>
                <th className="py-3 px-4 min-w-[170px]">
                  {language === 'mr' ? 'क्षेत्र प्रशिक्षक (Trainer)' : 'Field Trainer'}
                </th>
                <th className="py-3 px-3.5 min-w-[120px]">
                  {language === 'mr' ? 'दिनांक व वेळ' : 'Date & Duration'}
                </th>
                <th className="py-3 px-3.5 min-w-[150px]">
                  {language === 'mr' ? 'उपस्थिती' : 'Attendance'}
                </th>
                <th className="py-3 px-3.5 min-w-[120px]">
                  {language === 'mr' ? 'पुरावा फोटो' : 'Evidence Photos'}
                </th>
                <th className="py-3 px-4 min-w-[180px]">
                  {language === 'mr' ? 'निरीक्षणे व साधने' : 'Observations & Tools'}
                </th>
                <th className="py-3 px-3.5 text-center w-24">
                  {language === 'mr' ? 'कृती' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="font-bold text-sm">
                      {language === 'mr'
                        ? 'निवडलेल्या फिल्टरनुसार कोणतेही सत्र सापडले नाही.'
                        : 'No sessions found matching your filters.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setModuleFilter('ALL');
                      }}
                      className="mt-2 text-xs font-bold text-[#233d76] hover:underline cursor-pointer"
                    >
                      {language === 'mr' ? 'सर्व सत्रे पहा' : 'View All Sessions'}
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ session, log, trainer, isRecorded, photos }) => {
                  return (
                    <tr
                      key={session.sessionNumber}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRecorded ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* 1. Session # Badge */}
                      <td className="py-3 px-3.5 text-center align-top">
                        <span className="inline-flex flex-col items-center justify-center w-9 h-9 rounded-xl font-black bg-[#233d76]/10 text-[#233d76] border border-[#233d76]/20">
                          <span className="text-[9px] uppercase font-bold text-slate-500 leading-none">
                            {language === 'mr' ? 'सत्र' : 'S'}
                          </span>
                          <span className="text-sm font-black leading-none mt-0.5">
                            {session.sessionNumber}
                          </span>
                        </span>
                      </td>

                      {/* 2. Topic & Module */}
                      <td className="py-3 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-1">
                            {(session.moduleNameMr || session.moduleNameEn) && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900 border border-amber-200/50">
                                {language === 'mr' ? session.moduleNameMr : session.moduleNameEn}
                              </span>
                            )}
                            {session.phaseNumber && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                {language === 'mr' ? `टप्पा ${session.phaseNumber}` : `Phase ${session.phaseNumber}`}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm trust-heading">
                            {language === 'mr'
                              ? session.sessionNameMr || session.titleMr
                              : session.sessionNameEn || session.titleEn}
                          </p>
                          {(session.descriptionMr || session.descriptionEn) && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight">
                              {language === 'mr' ? session.descriptionMr : session.descriptionEn}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Status Badge */}
                      <td className="py-3 px-3.5 text-center align-top">
                        {isRecorded ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            <span>{language === 'mr' ? 'पूर्ण' : 'Recorded'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{language === 'mr' ? 'प्रलंबित' : 'Pending'}</span>
                          </span>
                        )}
                      </td>

                      {/* 4. Field Trainer Name */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-start space-x-2">
                          <div className="w-7 h-7 rounded-full bg-[#233d76]/10 text-[#233d76] flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {trainer.name}
                            </p>
                            <span className="text-[10px] text-slate-400 block">
                              {isRecorded
                                ? language === 'mr'
                                  ? 'सत्र नोंदवणारे FT'
                                  : 'Conducted & Logged'
                                : language === 'mr'
                                ? 'नेमलेले क्षेत्र प्रशिक्षक'
                                : 'Assigned Field Trainer'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Date & Duration */}
                      <td className="py-3 px-3.5 align-top">
                        {isRecorded && log ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 text-slate-800 font-bold">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{log.conductedDate}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {log.durationMinutes || 45} {language === 'mr' ? 'मिनिटे' : 'min'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* 6. Attendance */}
                      <td className="py-3 px-3.5 align-top">
                        {isRecorded && log ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center space-x-1 bg-[#233d76] text-white px-2 py-0.5 rounded-md font-black text-[11px]">
                              <span>{log.totalAttendance}</span>
                              <span className="text-[9px] font-normal text-slate-200">
                                {language === 'mr' ? 'विद्यार्थी' : 'Total'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center space-x-2">
                              <span>
                                {language === 'mr' ? 'मुली:' : 'G:'}{' '}
                                <strong className="text-slate-800">{log.girlsPresent ?? 0}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                {language === 'mr' ? 'मुलगे:' : 'B:'}{' '}
                                <strong className="text-slate-800">{log.boysPresent ?? 0}</strong>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* 7. Evidence Photos */}
                      <td className="py-3 px-3.5 align-top">
                        {photos.length > 0 ? (
                          <div className="flex items-center space-x-1.5">
                            {photos.slice(0, 2).map((p, idx) => (
                              <div
                                key={idx}
                                onClick={() =>
                                  setPreviewPhoto({
                                    url: p.fileUrl,
                                    caption:
                                      language === 'mr'
                                        ? `सत्र ${session.sessionNumber} पुरावा फोटो ${idx + 1}`
                                        : `Session ${session.sessionNumber} Photo ${idx + 1}`,
                                    sessionNumber: session.sessionNumber,
                                    trainerName: trainer.name,
                                    conductedDate: log?.conductedDate || '',
                                  })
                                }
                                className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-2xs group"
                                title={language === 'mr' ? 'फोटो मोठा करून पहा' : 'Click to view photo'}
                              >
                                <img
                                  src={p.fileUrl}
                                  alt={`Evidence ${idx + 1}`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80';
                                  }}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                              </div>
                            ))}
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {photos.length} / 2
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            {language === 'mr' ? 'फोटो नाही' : 'No photos'}
                          </span>
                        )}
                      </td>

                      {/* 8. Observations & Tools */}
                      <td className="py-3 px-4 align-top">
                        {isRecorded && log ? (
                          <div className="space-y-1 max-w-xs">
                            {log.toolsUsed && (
                              <div className="text-[11px] text-slate-700">
                                <span className="font-semibold text-slate-500">
                                  {language === 'mr' ? 'साधने: ' : 'Tools: '}
                                </span>
                                {log.toolsUsed}
                              </div>
                            )}
                            {log.specialNotes ? (
                              <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                                "{log.specialNotes}"
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {language === 'mr' ? 'कोणतीही नोंद नाही' : 'No notes'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* 9. Action Button */}
                      <td className="py-3 px-3.5 text-center align-top">
                        <button
                          type="button"
                          onClick={() => setInspectSession({ session, log })}
                          className="text-xs font-bold bg-slate-100 hover:bg-[#233d76] hover:text-white text-[#233d76] p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center mx-auto shadow-2xs"
                          title={language === 'mr' ? 'सविस्तर तपशील पहा' : 'View Session Details'}
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

      {/* ============================================================ */}
      {/* MODAL 1: FULL SESSION INSPECTION DETAIL                      */}
      {/* ============================================================ */}
      {inspectSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-[#233d76] text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black bg-[#dfaf27] text-[#233d76] px-2.5 py-0.5 rounded-lg uppercase">
                    {language === 'mr'
                      ? `सत्र ${inspectSession.session.sessionNumber} / २५`
                      : `Session ${inspectSession.session.sessionNumber} of 25`}
                  </span>
                  {(inspectSession.session.moduleNameMr || inspectSession.session.moduleNameEn) && (
                    <span className="text-xs font-bold text-amber-200">
                      {language === 'mr'
                        ? inspectSession.session.moduleNameMr
                        : inspectSession.session.moduleNameEn}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold trust-heading mt-1.5">
                  {language === 'mr'
                    ? inspectSession.session.sessionNameMr || inspectSession.session.titleMr
                    : inspectSession.session.sessionNameEn || inspectSession.session.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectSession(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Field Trainer Information Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#233d76] text-white flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {language === 'mr' ? 'क्षेत्र प्रशिक्षक (Field Trainer)' : 'Field Trainer'}
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {getTrainerInfo(inspectSession.log).name}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {selectedSchool.organizationCode || 'TRST_DIRECT'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {language === 'mr' ? 'स्थिती' : 'Status'}
                  </span>
                  {inspectSession.log ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>{language === 'mr' ? 'पूर्ण' : 'Conducted'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>{language === 'mr' ? 'प्रलंबित' : 'Pending'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Conducted Details or Pending Notice */}
              {inspectSession.log ? (
                <>
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-500 block">
                        {language === 'mr' ? 'दिनांक' : 'Conducted Date'}
                      </span>
                      <strong className="text-sm text-slate-900 mt-0.5 block">
                        {inspectSession.log.conductedDate}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-500 block">
                        {language === 'mr' ? 'कालावधी' : 'Duration'}
                      </span>
                      <strong className="text-sm text-slate-900 mt-0.5 block">
                        {inspectSession.log.durationMinutes || 45} {language === 'mr' ? 'मिनिटे' : 'min'}
                      </strong>
                    </div>
                    <div className="bg-[#233d76] text-white p-3.5 rounded-2xl text-center">
                      <span className="text-[11px] text-slate-200 block">
                        {language === 'mr' ? 'एकूण उपस्थिती' : 'Total Attendance'}
                      </span>
                      <strong className="text-lg font-black text-[#dfaf27] mt-0.5 block">
                        {inspectSession.log.totalAttendance}
                      </strong>
                    </div>
                  </div>

                  {/* Attendance Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-around text-center">
                    <div>
                      <span className="text-xs text-slate-500 block">
                        {language === 'mr' ? 'उपस्थित मुली' : 'Girls Present'}
                      </span>
                      <span className="text-base font-bold text-slate-800 mt-0.5 block">
                        {inspectSession.log.girlsPresent ?? 0}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <span className="text-xs text-slate-500 block">
                        {language === 'mr' ? 'उपस्थित मुलगे' : 'Boys Present'}
                      </span>
                      <span className="text-base font-bold text-slate-800 mt-0.5 block">
                        {inspectSession.log.boysPresent ?? 0}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <span className="text-xs text-slate-500 block">
                        {language === 'mr' ? 'एकूण संख्या' : 'Total'}
                      </span>
                      <span className="text-base font-black text-[#233d76] mt-0.5 block">
                        {inspectSession.log.totalAttendance}
                      </span>
                    </div>
                  </div>

                  {/* Tools & Materials */}
                  {inspectSession.log.toolsUsed && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {language === 'mr' ? 'वापरलेली साधने व साहित्य' : 'Tools & Materials Used'}
                      </span>
                      <p className="text-xs text-slate-800 font-semibold">
                        {inspectSession.log.toolsUsed}
                      </p>
                    </div>
                  )}

                  {/* Observations & Feedback */}
                  {inspectSession.log.specialNotes && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {language === 'mr' ? 'प्रशिक्षकाची विशेष निरीक्षणे' : 'Special Notes & Observations'}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{inspectSession.log.specialNotes}"
                      </p>
                    </div>
                  )}

                  {/* Evidence Photos Gallery */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5 flex items-center space-x-1.5">
                      <Camera className="w-4 h-4 text-[#233d76]" />
                      <span>{language === 'mr' ? 'सत्राची पुरावा छायाचित्रे' : 'Evidence Photographs'}</span>
                    </span>

                    {(inspectSession.log.media || []).filter(
                      (m) => Boolean(m.fileUrl && !m.fileUrl.includes('example.com'))
                    ).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(inspectSession.log.media || [])
                          .filter((m) => Boolean(m.fileUrl && !m.fileUrl.includes('example.com')))
                          .map((m, idx) => (
                            <div
                              key={idx}
                              onClick={() =>
                                setPreviewPhoto({
                                  url: m.fileUrl,
                                  caption:
                                    language === 'mr'
                                      ? `सत्र ${inspectSession.session.sessionNumber} - फोटो ${idx + 1}`
                                      : `Session ${inspectSession.session.sessionNumber} - Photo ${idx + 1}`,
                                  sessionNumber: inspectSession.session.sessionNumber,
                                  trainerName: getTrainerInfo(inspectSession.log).name,
                                  conductedDate: inspectSession.log?.conductedDate || '',
                                })
                              }
                              className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer shadow-xs hover:shadow-md transition-all"
                            >
                              <img
                                src={m.fileUrl}
                                alt={`Evidence ${idx + 1}`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80';
                                }}
                                className="w-full h-44 object-cover group-hover:scale-102 transition-transform"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-[#233d76]/90 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between">
                                <span>
                                  {language === 'mr' ? `फोटो ${idx + 1}` : `Photo ${idx + 1}`}
                                </span>
                                <span className="text-[10px] text-[#dfaf27]">
                                  {language === 'mr' ? 'मोठा करा 🔍' : 'Enlarge 🔍'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        {language === 'mr'
                          ? 'या सत्रासाठी कोणतेही पुरावा छायाचित्र जोडलेले नाही.'
                          : 'No evidence photos uploaded for this session.'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Pending Session Card */
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-amber-600" />
                  <h4 className="text-sm font-bold text-amber-900">
                    {language === 'mr' ? 'सत्र अद्याप प्रलंबित आहे' : 'Session Not Yet Conducted'}
                  </h4>
                  <p className="text-xs text-amber-700 max-w-md mx-auto">
                    {language === 'mr'
                      ? 'हे सत्र नेमून दिलेल्या क्षेत्र प्रशिक्षकांकडून प्रत्यक्ष शाळेत आयोजित केल्यावर त्याची उपस्थिती व फोटो येथे दिसतील.'
                      : 'Once this session is conducted on-ground by the assigned field trainer, attendance and evidence photos will appear here.'}
                  </p>
                </div>
              )}

              {/* Curriculum Learning Objectives */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">
                  {language === 'mr' ? 'सत्राचे उद्दिष्ट व रूपरेषा:' : 'Curriculum Objectives:'}
                </span>
                <p>
                  {language === 'mr'
                    ? inspectSession.session.descriptionMr || inspectSession.session.description
                    : inspectSession.session.descriptionEn || inspectSession.session.description}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectSession(null)}
                className="text-xs font-bold bg-[#233d76] text-white px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#1b2f5c] transition-colors"
              >
                {language === 'mr' ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: FULL-SIZE PHOTO LIGHTBOX                            */}
      {/* ============================================================ */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full border border-slate-700 shadow-2xl overflow-hidden cursor-default"
          >
            <div className="bg-[#233d76] text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{previewPhoto.caption}</h4>
                <p className="text-xs text-slate-300">
                  {selectedSchool.name} • {previewPhoto.trainerName} • {previewPhoto.conductedDate}
                </p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 bg-slate-900 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80';
                }}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="p-3 bg-white border-t border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold">
                {language === 'mr'
                  ? 'अधिकृत वर्ग पुरावा छायाचित्र (संयम उपक्रम)'
                  : 'Official Classroom Evidence Photograph (Saiyam Initiative)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
