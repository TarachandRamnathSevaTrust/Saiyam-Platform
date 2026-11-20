import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_25_SESSIONS, CurriculumSession } from '@saiyam/shared';
import {
  BookOpen,
  Camera,
  Video,
  Mic,
  Save,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export const SessionLogger: React.FC<Props> = ({ onBack, onNavigate }) => {
  const {
    selectedSchool,
    sessionLogs,
    saveSessionLog,
    language,
    currentUser,
    curriculumSessions,
    curriculumModules,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const [activeSessionNumber, setActiveSessionNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'LOG' | 'MEDIA'>('LOG');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<number | 'ALL'>('ALL');
  const [mobileActiveView, setMobileActiveView] = useState<'LIST' | 'FORM'>('LIST');

  // Form state
  const [conductedDate, setConductedDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number | string>(45);
  const [girlsPresent, setGirlsPresent] = useState<number | string>('');
  const [boysPresent, setBoysPresent] = useState<number | string>('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Uploaded media state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Official 25 Curriculum Sessions mapped to the 10 Modules (from context or shared)
  const allSessionSlots =
    curriculumSessions && curriculumSessions.length > 0 ? curriculumSessions : ALL_25_SESSIONS;

  const filteredSessions =
    selectedModuleFilter === 'ALL'
      ? allSessionSlots
      : allSessionSlots.filter((s) => s.moduleNumber === selectedModuleFilter);

  const activeSession =
    allSessionSlots.find((s) => s.sessionNumber === activeSessionNumber) || allSessionSlots[0];

  const existingLog = sessionLogs.find(
    (l) => l.schoolId === selectedSchool?.id && l.sessionNumber === activeSessionNumber
  );

  // Auto-populate form from saved log whenever active session or school changes
  useEffect(() => {
    if (!selectedSchool) return;
    const log = sessionLogs.find(
      (l) => l.schoolId === selectedSchool.id && l.sessionNumber === activeSessionNumber
    );
    if (log) {
      setConductedDate(log.conductedDate || new Date().toISOString().split('T')[0]);
      setDurationMinutes(log.durationMinutes ?? 45);
      setGirlsPresent(log.girlsPresent !== undefined && log.girlsPresent !== null ? log.girlsPresent : '');
      setBoysPresent(log.boysPresent !== undefined && log.boysPresent !== null ? log.boysPresent : '');
      setToolsUsed(log.toolsUsed || '');
      setSpecialNotes(log.specialNotes || '');
      setUploadedPhotos(log.media?.map((m) => m.fileUrl) || []);
    } else {
      setConductedDate(new Date().toISOString().split('T')[0]);
      setDurationMinutes(45);
      setGirlsPresent('');
      setBoysPresent('');
      setToolsUsed('');
      setSpecialNotes('');
      setUploadedPhotos([]);
    }
  }, [activeSessionNumber, selectedSchool?.id, sessionLogs]);

  // Clean numeric input handler:
  // 1. Allows deleting completely with Backspace/Delete (setting empty string '')
  // 2. Eliminates leading zeros (e.g. typing "10" over "0" or "010" becomes 10)
  const handleNumericInput = (
    val: string,
    setter: (v: number | string) => void,
    max?: number
  ) => {
    if (val === '') {
      setter('');
      return;
    }
    const cleanDigits = val.replace(/\D/g, '');
    if (cleanDigits === '') {
      setter('');
      return;
    }
    let parsed = parseInt(cleanDigits, 10);
    if (isNaN(parsed)) {
      setter('');
      return;
    }
    if (max !== undefined && parsed > max) {
      parsed = max;
    }
    setter(parsed);
  };

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

  const handleSelectSession = (sessionNum: number) => {
    setActiveSessionNumber(sessionNum);
    setSaveSuccess(false);
    setMobileActiveView('FORM');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSession = () => {
    if (activeSessionNumber > 1) {
      setActiveSessionNumber(activeSessionNumber - 1);
      setSaveSuccess(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNextSession = () => {
    if (activeSessionNumber < 25) {
      setActiveSessionNumber(activeSessionNumber + 1);
      setSaveSuccess(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const numGirls = Number(girlsPresent) || 0;
    const numBoys = Number(boysPresent) || 0;
    const totalAttendance = numGirls + numBoys;

    saveSessionLog({
      schoolId: selectedSchool.id,
      sessionNumber: activeSessionNumber,
      conductedDate,
      durationMinutes: Number(durationMinutes) || 45,
      totalAttendance,
      girlsPresent: numGirls,
      boysPresent: numBoys,
      toolsUsed,
      specialNotes,
      conductedBy: currentUser.id,
      media: uploadedPhotos.map((url, i) => ({
        id: `med-${i}`,
        sessionLogId: `log-${activeSessionNumber}`,
        mediaType: 'PHOTO',
        fileUrl: url,
        fileName: `session_${activeSessionNumber}_photo_${i + 1}.jpg`,
        uploadedAt: conductedDate,
      })),
    });

    setSaveSuccess(true);
  };

  const handleSimulatePhotoUpload = () => {
    if (uploadedPhotos.length >= 4) {
      alert(language === 'mr' ? 'कमाल ४ फोटो मर्यादा संपली.' : 'Max 4 photos limit reached.');
      return;
    }
    const sample = `https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80`;
    setUploadedPhotos([...uploadedPhotos, sample]);
  };

  const completedCount = sessionLogs.filter((l) => l.schoolId === selectedSchool.id).length;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
              title={language === 'mr' ? 'मागे जा' : 'Back'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {language === 'mr' ? 'सत्रांच्या नोंदी (२५ सत्रे)' : 'Session Records (25 Sessions)'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {selectedSchool.name} • {selectedSchool.village}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-bold px-3 py-1.5 rounded-xl border border-[#dfaf27]/40 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#233d76]" />
            <span>
              {completedCount} / 25 {language === 'mr' ? 'सत्रे पूर्ण' : 'Sessions Done'}
            </span>
          </span>

          {/* Quick toggle between list and form when on mobile */}
          <div className="lg:hidden flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMobileActiveView('LIST')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mobileActiveView === 'LIST'
                  ? 'bg-[#233d76] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'mr' ? 'यादी (२५)' : 'List (25)'}
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveView('FORM')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mobileActiveView === 'FORM'
                  ? 'bg-[#233d76] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'mr' ? `सत्र ${activeSessionNumber}` : `Session ${activeSessionNumber}`}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Master (Session List) + Detail (Active Session Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* ============================================================ */}
        {/* COLUMN 1: Sessions List (सत्र १ ते २५)                         */}
        {/* Hidden on mobile when viewing the form                       */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileActiveView === 'FORM' ? 'hidden lg:flex' : 'flex'
          } lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex-col`}
        >
          {/* Header & Filter Dropdown (NO HORIZONTAL SCROLL) */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#233d76]" />
                <span>{language === 'mr' ? 'सर्व २५ सत्रे' : 'All 25 Sessions'}</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {language === 'mr'
                  ? `${filteredSessions.length} पैकी ${filteredSessions.length} दाखवत आहे`
                  : `Showing ${filteredSessions.length} of 25`}
              </span>
            </div>

            {/* Clean Dropdown Filter (Eliminates horizontal scrolling) */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                id="session-module-filter"
                value={selectedModuleFilter}
                onChange={(e) =>
                  setSelectedModuleFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#233d76] cursor-pointer"
              >
                <option value="ALL">
                  {language === 'mr' ? 'सर्व विभाग (१ ते २५ सत्रे)' : 'All Modules (Sessions 1 to 25)'}
                </option>
                {(curriculumModules && curriculumModules.length > 0 ? curriculumModules : []).map(
                  (m) => (
                    <option key={m.moduleNumber} value={m.moduleNumber}>
                      {m.moduleNumber === 0
                        ? language === 'mr'
                          ? 'प्रस्तावना: संयम ओळख (सत्र १)'
                          : 'Intro: Saiyam Intro (Session 1)'
                        : m.moduleNumber === 11
                        ? language === 'mr'
                          ? 'समारोप व उजळणी (सत्र २५)'
                          : 'Review & Wrap-up (Session 25)'
                        : language === 'mr'
                        ? `विभाग ${m.moduleNumber}: ${m.nameMr}`
                        : `Module ${m.moduleNumber}: ${m.nameEn}`}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* List of Sessions */}
          <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredSessions.map((sess) => {
              const isLogged = sessionLogs.some(
                (l) => l.schoolId === selectedSchool.id && l.sessionNumber === sess.sessionNumber
              );
              const isSelected = activeSessionNumber === sess.sessionNumber;

              return (
                <button
                  key={sess.sessionNumber}
                  type="button"
                  onClick={() => handleSelectSession(sess.sessionNumber)}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#f0da9a]/35 border-l-4 border-[#233d76]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-2 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {/* Explicit Session Label - NEVER S-1 / S-2 */}
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-[#233d76] text-white'
                            : 'bg-slate-100 text-[#233d76] border border-slate-200'
                        }`}
                      >
                        {language === 'mr'
                          ? `सत्र ${sess.sessionNumber}`
                          : `Session ${sess.sessionNumber}`}
                      </span>

                      {(sess.moduleNameMr || sess.moduleNameEn) && (
                        <span className="text-[10px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded truncate">
                          {language === 'mr' ? sess.moduleNameMr : sess.moduleNameEn}
                        </span>
                      )}
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                      {language === 'mr'
                        ? sess.sessionNameMr || sess.titleMr
                        : sess.sessionNameEn || sess.titleEn}
                    </span>

                    <div className="flex items-center space-x-2 mt-1">
                      {isLogged ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'mr' ? 'नोंद पूर्ण' : 'Recorded'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{language === 'mr' ? 'नोंद बाकी' : 'Pending'}</span>
                        </span>
                      )}

                      {/* Clear call-to-action on mobile */}
                      <span className="lg:hidden text-[11px] font-bold text-[#233d76]">
                        {language === 'mr' ? 'नोंद करा →' : 'Open Form →'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-1">
                    {isLogged ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUMN 2: Form Area (Active Session Detail)                   */}
        {/* Hidden on mobile when viewing the sessions list              */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileActiveView === 'LIST' ? 'hidden lg:block' : 'block'
          } lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden`}
        >
          {/* Prominent Mobile Header Navigation Bar (lg:hidden) */}
          <div className="lg:hidden p-3 bg-[#233d76] text-white flex items-center justify-between border-b border-[#1b2f5c]">
            <button
              type="button"
              onClick={() => setMobileActiveView('LIST')}
              className="flex items-center space-x-1.5 text-xs font-bold bg-white/15 hover:bg-white/25 active:bg-white/30 text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'mr' ? '← सर्व सत्रांची यादी' : '← All 25 Sessions'}</span>
            </button>

            {/* Prev / Next Session Stepper on Mobile */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={activeSessionNumber <= 1}
                onClick={handlePrevSession}
                className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title={language === 'mr' ? 'मागील सत्र' : 'Previous Session'}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'mr' ? 'मागील' : 'Prev'}</span>
              </button>
              <span className="text-xs font-black px-1.5 text-[#f0da9a]">
                {activeSessionNumber}/25
              </span>
              <button
                type="button"
                disabled={activeSessionNumber >= 25}
                onClick={handleNextSession}
                className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title={language === 'mr' ? 'पुढील सत्र' : 'Next Session'}
              >
                <span>{language === 'mr' ? 'पुढील' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Header: Session Info & Desktop Prev/Next Steppers */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-xs font-black text-[#233d76] bg-[#f0da9a]/60 px-2.5 py-0.5 rounded-lg uppercase border border-[#dfaf27]/40">
                    {language === 'mr'
                      ? `२५ पैकी सत्र ${activeSession.sessionNumber}`
                      : `Session ${activeSession.sessionNumber} of 25`}
                  </span>
                  {(activeSession.moduleNameMr || activeSession.moduleNameEn) && (
                    <span className="text-xs font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200/60">
                      {language === 'mr' ? activeSession.moduleNameMr : activeSession.moduleNameEn}
                    </span>
                  )}
                  {activeSession.phaseNumber && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                      {language === 'mr'
                        ? `टप्पा ${activeSession.phaseNumber}`
                        : `Phase ${activeSession.phaseNumber}`}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-1.5 leading-snug">
                  {language === 'mr'
                    ? activeSession.sessionNameMr || activeSession.titleMr
                    : activeSession.sessionNameEn || activeSession.titleEn}
                </h3>
                {(activeSession.descriptionMr ||
                  activeSession.descriptionEn ||
                  activeSession.description) && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === 'mr'
                      ? activeSession.descriptionMr || activeSession.description
                      : activeSession.descriptionEn || activeSession.description}
                  </p>
                )}
              </div>

              {/* Desktop Steppers (hidden on mobile since mobile header already has them) */}
              <div className="hidden lg:flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  disabled={activeSessionNumber <= 1}
                  onClick={handlePrevSession}
                  className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title={language === 'mr' ? 'मागील सत्र' : 'Previous Session'}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'mr' ? 'मागील सत्र' : 'Prev'}</span>
                </button>
                <button
                  type="button"
                  disabled={activeSessionNumber >= 25}
                  onClick={handleNextSession}
                  className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title={language === 'mr' ? 'पुढील सत्र' : 'Next Session'}
                >
                  <span>{language === 'mr' ? 'पुढील सत्र' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Logbook vs Media */}
            <div className="flex bg-slate-200/70 p-1 rounded-xl mt-3.5 w-full sm:w-auto sm:inline-flex">
              <button
                type="button"
                onClick={() => setActiveTab('LOG')}
                className={`text-xs font-bold flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'LOG'
                    ? 'bg-[#233d76] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? '१. नोंद वही माहिती' : '1. Logbook Form'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MEDIA')}
                className={`text-xs font-bold flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'MEDIA'
                    ? 'bg-[#233d76] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? '२. छायाचित्रे व पुरावे' : '2. Media Uploads'}
              </button>
            </div>
          </div>

          {/* Success Banner when saved */}
          {saveSuccess && (
            <div className="m-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 font-black" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {language === 'mr'
                      ? `सत्र ${activeSessionNumber} ची नोंद यशस्वीपणे सेव्ह झाली!`
                      : `Session ${activeSessionNumber} log saved successfully!`}
                  </p>
                  <p className="text-xs text-emerald-700">
                    {language === 'mr'
                      ? 'माहिती सुरक्षित साठवली गेली आहे.'
                      : 'Record is safely recorded in the database.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {activeSessionNumber < 25 ? (
                  <button
                    type="button"
                    onClick={handleNextSession}
                    className="w-full sm:w-auto text-xs font-bold bg-[#233d76] hover:bg-[#1b2f5c] text-white px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>
                      {language === 'mr'
                        ? `पुढील सत्र ${activeSessionNumber + 1} कडे जा →`
                        : `Next: Session ${activeSessionNumber + 1} →`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMobileActiveView('LIST')}
                    className="w-full sm:w-auto text-xs font-bold bg-[#233d76] hover:bg-[#1b2f5c] text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'mr' ? 'सर्व सत्रांची यादी पहा' : 'View All Sessions'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 1: नोंद वही माहिती (Logbook Form) */}
          {activeTab === 'LOG' && (
            <form onSubmit={handleSaveLog} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'mr' ? 'सत्र घेतल्याचा दिनांक *' : 'Conducted Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={conductedDate}
                    onChange={(e) => setConductedDate(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'mr' ? 'सत्राचा कालावधी (मिनिटे) *' : 'Duration in Minutes *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={180}
                    placeholder="45"
                    value={durationMinutes}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleNumericInput(e.target.value, setDurationMinutes, 180)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Attendance Breakdown (Girls & Boys) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    {language === 'mr' ? 'उपस्थिती तपशील (मुले व मुली)' : 'Attendance Breakdown (Boys & Girls)'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {language === 'mr' ? 'बॅकस्पेसने सहज संख्या बदला' : 'Tap to edit or backspace freely'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'mr' ? 'उपस्थित मुली' : 'Girls'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={girlsPresent}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, setGirlsPresent)}
                      className="w-full text-base sm:text-lg bg-white px-2.5 py-2 rounded-xl border border-slate-300 font-bold text-center text-slate-800 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'mr' ? 'उपस्थित मुलगे' : 'Boys'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={boysPresent}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, setBoysPresent)}
                      className="w-full text-base sm:text-lg bg-white px-2.5 py-2 rounded-xl border border-slate-300 font-bold text-center text-slate-800 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'mr' ? 'एकूण उपस्थिती' : 'Total'}
                    </label>
                    <div className="w-full text-base sm:text-lg bg-[#233d76] text-white px-2.5 py-2 rounded-xl font-black text-center flex items-center justify-center">
                      {(Number(girlsPresent) || 0) + (Number(boysPresent) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Used */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'mr' ? 'वापरलेली साधने (उदा. तक्ते, फलक, पेन)' : 'Tools / Materials Used'}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === 'mr'
                      ? 'उदा. तक्ता, खडू, प्रात्यक्षिक साहित्य...'
                      : 'e.g. Charts, Blackboard, Demonstration Kit...'
                  }
                  value={toolsUsed}
                  onChange={(e) => setToolsUsed(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
                />
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'mr' ? 'विशेष नोंदी व निरीक्षणे' : 'Special Notes & Observations'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    language === 'mr'
                      ? 'उदा. विद्यार्थ्यांचा सहभाग उत्तम होता, संकल्पना स्पष्ट समजल्या...'
                      : 'Enter session observations and feedback...'
                  }
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden bg-white"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'mr'
                    ? existingLog
                      ? `सत्र ${activeSessionNumber} ची नोंद आधी भरलेली आहे (बदल करू शकता)`
                      : `सत्र ${activeSessionNumber} ची नवीन नोंद भरा`
                    : existingLog
                    ? `Session ${activeSessionNumber} record already exists (can update)`
                    : `Fill new record for Session ${activeSessionNumber}`}
                </span>

                {!isTrustAdmin ? (
                  <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 text-[#dfaf27]" />
                    <span>
                      {language === 'mr'
                        ? `सत्र ${activeSessionNumber} नोंद सेव्ह करा`
                        : `Save Session ${activeSessionNumber} Log`}
                    </span>
                  </button>
                ) : (
                  <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-extrabold px-4 py-2.5 rounded-xl border border-[#dfaf27]/40 text-center">
                    {language === 'mr' ? 'केवळ वाचन मोड' : 'Audit View Only'}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Tab 2: मिडिया अपलोड (Photos & Proofs) */}
          {activeTab === 'MEDIA' && (
            <div className="p-4 sm:p-6 space-y-5">
              <div className="bg-[#f0da9a]/30 p-3.5 rounded-xl border border-[#dfaf27]/40 text-xs text-[#233d76] leading-relaxed">
                {language === 'mr'
                  ? 'सत्रादरम्यान घेतलेले ४ फोटो, २ ऑडिओ व २ व्हिडिओ पुरावे म्हणून जोडू शकता (२० MB पेक्षा कमी).'
                  : 'Upload up to 4 photos, 2 audios, and 2 videos as session evidence (< 20 MB).'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Photo Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Camera className="w-6 h-6 mx-auto text-[#233d76] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">
                    {language === 'mr' ? 'छायाचित्रे' : 'Photos'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mb-2.5">
                    {uploadedPhotos.length} / 4 {language === 'mr' ? 'फोटो' : 'Photos'}
                  </span>
                  {!isTrustAdmin ? (
                    <button
                      type="button"
                      onClick={handleSimulatePhotoUpload}
                      className="w-full text-xs font-bold bg-[#233d76] text-white py-2 px-3 rounded-lg shadow-2xs transition-colors cursor-pointer hover:bg-[#1b2f5c]"
                    >
                      {language === 'mr' ? '+ फोटो जोडा' : '+ Add Photo'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold block py-1">
                      {language === 'mr' ? 'पाहण्यासाठी उपलब्ध' : 'View Only'}
                    </span>
                  )}
                </div>

                {/* Video Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Video className="w-6 h-6 mx-auto text-slate-500 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">
                    {language === 'mr' ? 'व्हिडिओ क्लिप' : 'Videos'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mb-2.5">
                    0 / 2 {language === 'mr' ? 'व्हिडिओ' : 'Videos'}
                  </span>
                  <button
                    type="button"
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 py-2 px-3 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    {language === 'mr' ? '+ व्हिडिओ जोडा' : '+ Add Video'}
                  </button>
                </div>

                {/* Audio Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Mic className="w-6 h-6 mx-auto text-slate-500 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">
                    {language === 'mr' ? 'ऑडिओ रेकॉर्डिंग' : 'Audio'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mb-2.5">
                    0 / 2 {language === 'mr' ? 'ऑडिओ' : 'Audios'}
                  </span>
                  <button
                    type="button"
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 py-2 px-3 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    {language === 'mr' ? '+ ऑडिओ जोडा' : '+ Add Audio'}
                  </button>
                </div>
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'mr' ? 'अपलोड केलेले फोटो' : 'Uploaded Photos'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedPhotos.map((url, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt={`Session ${i + 1}`} className="w-full h-28 object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-[#233d76]/80 text-white text-[10px] px-2 py-0.5 font-bold">
                          {language === 'mr' ? `फोटो ${i + 1}` : `Photo ${i + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation helper */}
      {onNavigate && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 gap-3">
          <span className="text-xs text-slate-500">
            {language === 'mr'
              ? 'सर्व सत्रांनंतर शाळेचे शिक्का व सही असलेले अधिकृत पत्र अपलोड करा'
              : 'After session records, upload official school stamp & signature letter'}
          </span>
          <button
            onClick={() => onNavigate('DOCUMENTS')}
            className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>{language === 'mr' ? 'कागदपत्रे अपलोडकडे जा →' : 'Upload Documents →'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
