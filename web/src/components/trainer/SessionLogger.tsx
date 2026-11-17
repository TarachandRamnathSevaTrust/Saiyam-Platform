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
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const SessionLogger: React.FC<Props> = ({ onBack }) => {
  const { selectedSchool, sessionLogs, saveSessionLog, language, currentUser } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const [activeSessionNumber, setActiveSessionNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'LOG' | 'MEDIA'>('LOG');

  // Form state
  const [conductedDate, setConductedDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [girlsPresent, setGirlsPresent] = useState(0);
  const [boysPresent, setBoysPresent] = useState(0);
  const [toolsUsed, setToolsUsed] = useState('फलक, पेन');
  const [specialNotes, setSpecialNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Uploaded media state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto shadow-2xs">
        <p className="text-slate-600 font-semibold mb-3">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs bg-[#233d76] text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
          >
            ← शाळा निवडा (Back to Schools)
          </button>
        )}
      </div>
    );
  }

  // Dynamic 25 Sessions generated dynamically without hardcoded fake titles
  const allSessionSlots = Array.from({ length: 25 }, (_, i) => ({
    sessionNumber: i + 1,
    titleMr: `सत्र ${i + 1}`,
    titleEn: `Session ${i + 1}`,
  }));

  const activeSession = allSessionSlots.find((s) => s.sessionNumber === activeSessionNumber) || allSessionSlots[0];

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
    // Simple canvas/placeholder data URL representing uploaded photo
    const sample = `https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80`;
    setUploadedPhotos([...uploadedPhotos, sample]);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'mr' ? 'सत्रांच्या नोंदी (२५ सत्रे)' : 'Session Records (25 Sessions)'}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedSchool.name} • {selectedSchool.village}
            </p>
          </div>
        </div>

        <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-bold px-3 py-1 rounded-full border border-[#dfaf27]/40">
          {sessionLogs.filter((l) => l.schoolId === selectedSchool.id).length} / 25 पूर्ण
        </span>
      </div>

      {/* 2-Column Layout Matching Page 108 of Old App */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sessions List Sidebar (सत्र १ ते २५) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#233d76]" />
              <span>{language === 'mr' ? 'सत्र क्रमांक आणि नाव' : 'Session Number & Title'}</span>
            </h3>
          </div>

          <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100">
            {allSessionSlots.map((sess) => {
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
                    isSelected
                      ? 'bg-[#f0da9a]/40 border-l-4 border-[#233d76]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-2">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {language === 'mr' ? sess.titleMr : sess.titleEn}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isLogged ? 'नोंद पूर्ण' : 'नोंद बाकी'}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isLogged ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Area: Logbook vs Media (Matching Page 108 & 109 of Manual) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header Sub-Tabs */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-[#233d76] bg-[#f0da9a]/60 px-2 py-0.5 rounded uppercase border border-[#dfaf27]/40">
                सत्र {activeSession.sessionNumber}
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                {language === 'mr' ? activeSession.titleMr : activeSession.titleEn}
              </h3>
            </div>

            <div className="flex bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('LOG')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'LOG'
                    ? 'bg-[#233d76] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'नोंद वही माहिती' : 'Logbook'}
              </button>
              <button
                onClick={() => setActiveTab('MEDIA')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'MEDIA'
                    ? 'bg-[#233d76] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'mr' ? 'मिडिया अपलोड' : 'Media'}
              </button>
            </div>
          </div>

          {/* Tab 1: नोंद वही माहिती (Matching Page 109 of Old App) */}
          {activeTab === 'LOG' && (
            <form onSubmit={handleSaveLog} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'दिनांक *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={conductedDate}
                    onChange={(e) => setConductedDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
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
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Attendance Breakdown (Girls & Boys) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {language === 'mr' ? 'उपस्थिती तपशील' : 'Attendance Breakdown'}
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      {language === 'mr' ? 'उपस्थित मुली' : 'Girls'}
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
                      {language === 'mr' ? 'उपस्थित मुलगे' : 'Boys'}
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
                    <div className="w-full text-sm bg-[#233d76] text-white px-3 py-1.5 rounded-lg font-black text-center">
                      {Number(girlsPresent) + Number(boysPresent)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Used */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'वापरलेली साधने (उदा. फलक, पेन)' : 'Tools / Materials Used'}
                </label>
                <input
                  type="text"
                  value={toolsUsed}
                  onChange={(e) => setToolsUsed(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
                />
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'mr' ? 'विशेष नोंदी' : 'Special Notes'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    language === 'mr'
                      ? 'उदा. पंचकोश संकल्पना - अन्नमय व प्राणमय कोष समजावून सांगितले.'
                      : 'Enter session observations...'
                  }
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'mr' ? 'सत्र नोंद सेव्ह झाली!' : 'Saved successfully!'}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    {existingLog ? 'नोंद अपडेट करा' : 'नवीन सत्र माहिती भरा'}
                  </span>
                )}

                {!isTrustAdmin ? (
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#dfaf27]" />
                    <span>{language === 'mr' ? 'सेव्ह करा' : 'Save Log'}</span>
                  </button>
                ) : (
                  <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-extrabold px-4 py-2 rounded-xl border border-[#dfaf27]/40">
                    {language === 'mr' ? 'केवळ वाचन (Read-Only)' : 'Audit View Only'}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Tab 2: मिडिया अपलोड (Matching Page 109: ४ फोटो, २ व्हिडिओ, २ ऑडिओ) */}
          {activeTab === 'MEDIA' && (
            <div className="p-6 space-y-5">
              <div className="bg-[#f0da9a]/30 p-3.5 rounded-xl border border-[#dfaf27]/40 text-xs text-[#233d76] leading-relaxed">
                {language === 'mr'
                  ? '४ फोटो, २ ऑडिओ आणि २ व्हिडिओ (२० MB पेक्षा कमी) अपलोड करू शकता.'
                  : 'Upload up to 4 photos, 2 audios, and 2 videos (< 20 MB).'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Photo Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Camera className="w-6 h-6 mx-auto text-[#233d76] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">फोटो (Photos)</span>
                  <span className="text-[11px] text-slate-500 block mb-2">{uploadedPhotos.length} / 4 फोटो</span>
                  {!isTrustAdmin ? (
                    <button
                      type="button"
                      onClick={handleSimulatePhotoUpload}
                      className="w-full text-xs font-bold bg-[#233d76] text-white py-1.5 px-2 rounded-lg shadow-2xs transition-colors cursor-pointer hover:bg-[#1b2f5c]"
                    >
                      + फोटो जोडा
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold block py-1">पाहण्यासाठी उपलब्ध</span>
                  )}
                </div>

                {/* Video Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Video className="w-6 h-6 mx-auto text-slate-500 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">व्हिडिओ (Videos)</span>
                  <span className="text-[11px] text-slate-500 block mb-2">0 / 2 व्हिडिओ</span>
                  <button
                    type="button"
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    + व्हिडिओ जोडा
                  </button>
                </div>

                {/* Audio Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <Mic className="w-6 h-6 mx-auto text-slate-500 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 block">ऑडिओ (Audios)</span>
                  <span className="text-[11px] text-slate-500 block mb-2">0 / 2 ऑडिओ</span>
                  <button
                    type="button"
                    className="w-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 py-1.5 px-2 rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    + ऑडिओ जोडा
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
                          फोटो {i + 1}
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
    </div>
  );
};
