import React, { useState } from 'react';
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
} from 'lucide-react';

export const SessionLogger: React.FC = () => {
  const { selectedSchool, sessionLogs, saveSessionLog, language } = useApp();

  const [activeSessionNumber, setActiveSessionNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'LOG' | 'MEDIA'>('LOG');

  // Form state
  const [conductedDate, setConductedDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [girlsPresent, setGirlsPresent] = useState(30);
  const [boysPresent, setBoysPresent] = useState(30);
  const [toolsUsed, setToolsUsed] = useState('फलक, पेन, चार्ट्स (Board, pen, charts)');
  const [specialNotes, setSpecialNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sample media uploaded state for preview
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
  ]);

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-500">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
      </div>
    );
  }

  const activeSession: CurriculumSession =
    ALL_25_SESSIONS.find((s: CurriculumSession) => s.sessionNumber === activeSessionNumber) || ALL_25_SESSIONS[0];

  const existingLog = sessionLogs.find(
    (l) => l.schoolId === selectedSchool.id && l.sessionNumber === activeSessionNumber
  );

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAttendance = Number(girlsPresent) + Number(boysPresent);

    saveSessionLog({
      schoolId: selectedSchool.id,
      sessionNumber: activeSessionNumber,
      conductedDate,
      durationMinutes: Number(durationMinutes),
      totalAttendance,
      girlsPresent: Number(girlsPresent),
      boysPresent: Number(boysPresent),
      toolsUsed,
      specialNotes,
      conductedBy: 'Anagha Kadolkar',
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
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSimulatePhotoUpload = () => {
    if (uploadedPhotos.length >= 4) {
      alert(language === 'mr' ? 'कमाल ४ फोटो मर्यादा संपली.' : 'Max 4 photos limit reached.');
      return;
    }
    const newSample =
      uploadedPhotos.length % 2 === 0
        ? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80';
    setUploadedPhotos([...uploadedPhotos, newSample]);
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Layout: 25 Sessions List on Left + Log & Media Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions Sidebar (25 Sessions from Saiyam Manual) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{language === 'mr' ? 'संयम सत्रांची यादी (२५ सत्रे)' : 'Saiyam Curriculum (25 Sessions)'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'mr' ? 'सत्रावर क्लिक करून माहिती भरा' : 'Select session to record logs and media'}
            </p>
          </div>

          <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100">
            {ALL_25_SESSIONS.map((sess: CurriculumSession) => {
              const isLogged = sessionLogs.some(
                (l) => l.schoolId === selectedSchool.id && l.sessionNumber === sess.sessionNumber
              );
              const isSelected = activeSessionNumber === sess.sessionNumber;

              return (
                <button
                  key={sess.sessionNumber}
                  onClick={() => {
                    setActiveSessionNumber(sess.sessionNumber);
                    setSaveSuccess(false);
                  }}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-50/90 border-l-4 border-amber-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-2">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {language === 'mr' ? sess.titleMr : sess.titleEn}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{sess.description}</span>
                  </div>

                  <div className="shrink-0">
                    {isLogged ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Area: Logbook vs Media Upload (Matching Page 108 & 109 of Manual) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Sub-Tabs */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase">
                सत्र क्र. {activeSession.sessionNumber}
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                {language === 'mr' ? activeSession.titleMr : activeSession.titleEn}
              </h3>
            </div>

            <div className="flex bg-slate-200/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('LOG')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'LOG' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'नोंद वही माहिती' : 'Logbook Form'}
              </button>
              <button
                onClick={() => setActiveTab('MEDIA')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'MEDIA' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'मिडिया अपलोड' : 'Media Proof'}
              </button>
            </div>
          </div>

          {/* Tab 1: Logbook Info Form */}
          {activeTab === 'LOG' && (
            <form onSubmit={handleSaveLog} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'सत्र घेतल्याचा दिनांक *' : 'Conducted Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={conductedDate}
                    onChange={(e) => setConductedDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'वेळ मिनिटांमध्ये (उदा. ४५) *' : 'Duration in Minutes *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Attendance Breakdown (Girls & Boys) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {language === 'mr' ? 'उपस्थिती तपशील (Attendance)' : 'Attendance Details'}
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {language === 'mr' ? 'उपस्थित मुली' : 'Girls Present'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={girlsPresent}
                      onChange={(e) => setGirlsPresent(Number(e.target.value))}
                      className="w-full text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {language === 'mr' ? 'उपस्थित मुलगे' : 'Boys Present'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={boysPresent}
                      onChange={(e) => setBoysPresent(Number(e.target.value))}
                      className="w-full text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {language === 'mr' ? 'एकूण उपस्थिती' : 'Total'}
                    </label>
                    <div className="w-full text-sm bg-slate-200/80 px-3 py-1.5 rounded-lg font-black text-center text-slate-800">
                      {Number(girlsPresent) + Number(boysPresent)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Used */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'वापरलेली साधने (उदा. फलक, पेन, चार्ट्स)' : 'Materials / Tools Used'}
                </label>
                <input
                  type="text"
                  value={toolsUsed}
                  onChange={(e) => setToolsUsed(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'विशेष नोंदी / निरीक्षणे' : 'Special Observations / Notes'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    language === 'mr'
                      ? 'उदा. विद्यार्थ्यांनी उत्स्फूर्त सहभाग घेतला व संकल्पना समजून घेतल्या...'
                      : 'e.g. Students actively participated in the activity...'
                  }
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'mr' ? 'सत्र नोंद सेव्ह झाली!' : 'Session log saved!'}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    {existingLog ? 'या सत्राची आधीची नोंद उपलब्ध आहे' : 'नवीन सत्र नोंद भरा'}
                  </span>
                )}

                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'mr' ? 'सेव्ह करा' : 'Save Session Log'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Media Upload (Photos, Audio, Video Proofs) */}
          {activeTab === 'MEDIA' && (
            <div className="p-6 space-y-5">
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                {language === 'mr'
                  ? 'या सत्राचे पुरावे म्हणून ४ फोटो, २ ऑडिओ आणि २ व्हिडिओ (२० MB पेक्षा कमी) अपलोड करू शकता.'
                  : 'Upload verified proof for this session: up to 4 photos, 2 audios, and 2 videos (<20 MB).'}
              </div>

              {/* Upload Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Photo Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Camera className="w-6 h-6 mx-auto text-amber-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">फोटो (Photos)</span>
                  <span className="text-[11px] text-slate-500 block mb-2">{uploadedPhotos.length} / 4 फोटो</span>
                  <button
                    type="button"
                    onClick={handleSimulatePhotoUpload}
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 py-1.5 px-2 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    + फोटो जोडा
                  </button>
                </div>

                {/* Video Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Video className="w-6 h-6 mx-auto text-blue-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">व्हिडिओ (Videos)</span>
                  <span className="text-[11px] text-slate-500 block mb-2">0 / 2 व्हिडिओ</span>
                  <button
                    type="button"
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 py-1.5 px-2 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    + व्हिडिओ जोडा
                  </button>
                </div>

                {/* Audio Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Mic className="w-6 h-6 mx-auto text-purple-600 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">ऑडिओ (Audios)</span>
                  <span className="text-[11px] text-slate-500 block mb-2">0 / 2 ऑडिओ</span>
                  <button
                    type="button"
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 py-1.5 px-2 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    + ऑडिओ जोडा
                  </button>
                </div>
              </div>

              {/* Uploaded Gallery Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {language === 'mr' ? 'अपलोड केलेले फोटो' : 'Uploaded Photos Preview'}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {uploadedPhotos.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={url} alt={`Session ${i + 1}`} className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[10px] px-2 py-1 font-mono">
                        फोटो {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
