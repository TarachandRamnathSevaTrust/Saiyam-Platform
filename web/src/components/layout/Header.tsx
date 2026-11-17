import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../lib/mockData';
import { ShieldCheck, Globe, School as SchoolIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, switchUser, language, setLanguage, selectedSchool } = useApp();

  return (
    <header className="bg-[#233d76] text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Trust Nomenclature (Strictly Tarachand Ramnath Seva Trust) */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#dfaf27] flex items-center justify-center text-[#233d76] font-extrabold text-xl shadow-xs">
              सं
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SAIYAM (संयम)</span>
                <span className="text-[11px] bg-[#dfaf27] text-[#233d76] font-bold px-2 py-0.5 rounded-full">
                  TRST
                </span>
              </div>
              <p className="text-[11px] text-[#f0da9a] hidden sm:block font-medium">
                Initiative By : Tarachand Ramnath Seva Trust
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1b2f5c] text-white hover:bg-[#2e4d94] transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span>{language === 'mr' ? 'मराठी / EN' : 'EN / मराठी'}</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <select
                aria-label="Switch User or Role"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1b2f5c] text-white py-1.5 pl-2.5 pr-8 focus:outline-hidden focus:ring-2 focus:ring-[#dfaf27] cursor-pointer shadow-xs"
              >
                {INITIAL_USERS.map((user) => (
                  <option key={user.id} value={user.id} className="bg-[#233d76] text-white">
                    {user.role === 'TRUST_ADMIN' ? '👑 Trust Admin' : '👤 क्षेत्र प्रशिक्षक (Trainer)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub-bar for Field Trainer context */}
        {currentUser.role === 'FIELD_TRAINER' && selectedSchool && (
          <div className="bg-[#1b2f5c] border-t border-[#345396] px-3 py-1.5 flex items-center justify-between text-xs text-[#f0da9a]">
            <div className="flex items-center space-x-2">
              <SchoolIcon className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span>
                <strong>{language === 'mr' ? 'शाळा:' : 'School:'}</strong> {selectedSchool.name} ({selectedSchool.village})
              </span>
            </div>
            <span className="text-white">
              {language === 'mr' ? 'प्रतिनिधी:' : 'POC:'} {selectedSchool.representativeName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
