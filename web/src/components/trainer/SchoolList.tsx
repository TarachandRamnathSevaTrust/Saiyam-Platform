import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolRegistrationModal } from './SchoolRegistrationModal';
import {
  Building2,
  Plus,
  MapPin,
  Users,
  ClipboardCheck,
  BookOpen,
  FileText,
  Calendar,
  Frown,
} from 'lucide-react';

interface Props {
  onNavigateToTab?: (tab: string) => void;
}

export const SchoolList: React.FC<Props> = ({ onNavigateToTab }) => {
  const { schools, selectedSchool, setSelectedSchool, language, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Trainer Bar (Only shown for Field Trainers who conduct visits) */}
      {!isTrustAdmin ? (
        <div className="bg-[#233d76] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#dfaf27] uppercase tracking-wider block">
              {language === 'mr' ? 'क्षेत्र प्रशिक्षक (Field Trainer)' : 'Field Trainer'}
            </span>
            <h2 className="text-lg font-bold trust-heading mt-0.5">{currentUser.fullName}</h2>
          </div>

          {/* Only Field Trainers can add schools */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'mr' ? 'नोंदणी करा (Register School)' : 'Register School'}</span>
          </button>
        </div>
      ) : (
        /* Trust Admin View: Pure Audit & Monitoring Header (NO Add School button) */
        <div className="bg-[#233d76] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-bold text-[#dfaf27] uppercase tracking-wider block">
              {language === 'mr' ? 'विश्वस्त निरीक्षण (Audit & Monitoring)' : 'Trust Supervision'}
            </span>
            <h2 className="text-lg font-bold trust-heading mt-0.5">
              {language === 'mr' ? 'क्षेत्रातील सर्व नोंदणीकृत शाळा' : 'Field Schools Roster'}
            </h2>
          </div>
          <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-extrabold px-3 py-1 rounded-full border border-[#dfaf27]/40">
            {schools.length} {language === 'mr' ? 'शाळा सक्रिय' : 'Active Schools'}
          </span>
        </div>
      )}

      {/* If No Schools Registered Yet */}
      {schools.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Frown className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 trust-heading">
            {language === 'mr' ? 'अद्याप कोणतीही शाळा/संस्था नोंदवलेली नाही...' : 'No school registered yet...'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isTrustAdmin
              ? language === 'mr'
                ? 'क्षेत्र प्रशिक्षकांनी प्रत्यक्ष शाळेत जाऊन नोंदणी केल्यानंतर ती येथे दिसेल.'
                : 'Schools will appear here once field trainers register them during visits.'
              : language === 'mr'
                ? 'सत्रे घेण्यापूर्वी तुम्ही ज्या शाळेत जाणार आहात त्या शाळेची नोंदणी करा.'
                : 'Before conducting sessions, register the school you are visiting.'}
          </p>

          {/* Only show Register button to Field Trainers */}
          {!isTrustAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex items-center space-x-2 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#dfaf27]" />
              <span>{language === 'mr' ? 'नोंदणी करा' : 'Register Now'}</span>
            </button>
          )}
        </div>
      ) : (
        /* Schools Cards */
        <div className="space-y-5">
          {schools.map((school) => {
            const isSelected = selectedSchool?.id === school.id;

            return (
              <div
                key={school.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'border-[#233d76] ring-2 ring-[#233d76]/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* School Card Header */}
                <div
                  onClick={() => setSelectedSchool(school)}
                  className="p-5 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between cursor-pointer border-b border-slate-100"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#233d76] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                      <Building2 className="w-5 h-5 text-[#dfaf27]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 trust-heading">{school.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {school.village}, {school.district} • पिन: {school.pinCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-bold px-2.5 py-1 rounded-full border border-[#dfaf27]/40">
                      {school.completedSessionsCount || 0} / 25 {language === 'mr' ? 'सत्रे पूर्ण' : 'Sessions Done'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {language === 'mr' ? 'प्रतिनिधी:' : 'POC:'} {school.representativeName}
                    </span>
                  </div>
                </div>

                {/* 4 Action / Inspection Buttons */}
                <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setSelectedSchool(school);
                      onNavigateToTab?.('STUDENTS');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4 text-[#233d76]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'mr' ? 'विद्यार्थी यादी' : 'Student Roster'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {isTrustAdmin ? 'तपासा (View)' : 'गठ्ठा क्रमाने'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSchool(school);
                      onNavigateToTab?.('ASSESSMENTS');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <ClipboardCheck className="w-4 h-4 text-[#233d76]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'mr' ? 'पूर्व / उत्तर चाचण्या' : 'Pre / Post Tests'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">३ पेपर्स (MKMH, MMAT, ERT)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSchool(school);
                      onNavigateToTab?.('SESSIONS');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#233d76]/10 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4 text-[#233d76]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'mr' ? 'सत्र नोंदी' : 'Session Logs'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">२५ सत्रे व मिडिया</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedSchool(school);
                      onNavigateToTab?.('DOCUMENTS');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-[#f0da9a]/30 hover:border-[#dfaf27] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4 text-[#233d76]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'mr' ? 'कागदपत्रे पुरावे' : 'Documents'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">सही व शिक्का</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal only callable by Field Trainers */}
      {!isTrustAdmin && (
        <SchoolRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
