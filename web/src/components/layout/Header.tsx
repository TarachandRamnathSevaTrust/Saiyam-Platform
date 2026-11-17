import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../lib/mockData';
import { ShieldCheck, UserCheck, Globe, School as SchoolIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, switchUser, language, setLanguage, selectedSchool } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Mission */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              सं
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SAIYAM (संयम)</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                  TRST × JPIP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {language === 'mr'
                  ? 'पौगंडावस्थेतील व्यसनमुक्ती व जीवनकौशल्य व्यासपीठ'
                  : 'Adolescent Anti-Addiction & Wellbeing Platform'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* DPDP Badge */}
            <div className="hidden md:flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">DPDP Act (2023) Protected</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'mr' ? 'मराठी / EN' : 'EN / मराठी'}</span>
            </button>

            {/* User / Role Switcher */}
            <div className="relative">
              <select
                aria-label="Switch User or Role"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-xs font-semibold rounded-lg border border-slate-300 bg-white py-1.5 pl-2.5 pr-8 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
              >
                {INITIAL_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.role === 'TRUST_ADMIN' ? '👑 Trust Admin: ' : '👤 Trainer: '}
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub-bar for Field Trainer context */}
        {currentUser.role === 'FIELD_TRAINER' && selectedSchool && (
          <div className="bg-amber-50/70 border-t border-amber-100 px-2 py-1.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center space-x-2">
              <SchoolIcon className="w-3.5 h-3.5 text-amber-700" />
              <span>
                <strong>{language === 'mr' ? 'शाळा:' : 'School:'}</strong> {selectedSchool.name} ({selectedSchool.village})
              </span>
            </div>
            <span className="text-amber-700">
              {language === 'mr' ? 'वर्ग शिक्षक/प्रतिनिधी:' : 'POC:'} {selectedSchool.representativeName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
