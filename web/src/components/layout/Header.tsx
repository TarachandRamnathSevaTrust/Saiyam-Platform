import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../lib/mockData';
import { Globe, School as SchoolIcon, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, switchUser, language, setLanguage, selectedSchool, setSelectedSchool, schools } = useApp();

  return (
    <header className="bg-[#233d76] text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Official Saiyam Logo & Branding */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="bg-white rounded-lg p-1 sm:p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/saiyam-logo.png"
                alt="संयम - An Addiction Prevention Initiative"
                className="h-7 sm:h-9 w-auto object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  संयम (SAIYAM)
                </span>
                <span className="text-[10px] bg-[#dfaf27] text-[#233d76] font-bold px-1.5 py-0.2 rounded-full">
                  TRST
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#f0da9a] font-medium hidden xs:block truncate max-w-[200px] sm:max-w-none">
                {language === 'mr'
                  ? 'व्यसनमुक्ती प्रतिबंधात्मक उपक्रम • TRST'
                  : 'An Addiction Prevention Initiative • TRST'}
              </p>
            </div>
          </div>

          {/* Right Controls: Compact & Mobile Optimized */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1b2f5c] text-white hover:bg-[#2e4d94] transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span>{language === 'mr' ? 'मराठी' : 'EN'}</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <select
                aria-label="Switch User or Role"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1b2f5c] text-white py-1.5 pl-2 pr-6 focus:outline-hidden focus:ring-1 focus:ring-[#dfaf27] cursor-pointer shadow-xs appearance-none"
              >
                {INITIAL_USERS.map((user) => (
                  <option key={user.id} value={user.id} className="bg-[#233d76] text-white">
                    {user.role === 'TRUST_ADMIN' ? '👑 Admin' : '👤 Trainer'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#dfaf27] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active School Sub-Bar for Field Trainer */}
        {currentUser.role === 'FIELD_TRAINER' && (
          <div className="bg-[#1b2f5c] border-t border-[#345396] px-3 py-1.5 flex items-center justify-between text-[11px] text-[#f0da9a]">
            {selectedSchool ? (
              <>
                <div className="flex items-center space-x-1.5 truncate pr-2">
                  <SchoolIcon className="w-3.5 h-3.5 text-[#dfaf27] shrink-0" />
                  <span className="truncate">
                    <strong>{language === 'mr' ? 'शाळा:' : 'School:'}</strong> {selectedSchool.name}
                  </span>
                </div>
                {schools.length > 1 && (
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="text-[10px] text-white underline hover:text-[#dfaf27] shrink-0 font-semibold cursor-pointer"
                  >
                    {language === 'mr' ? 'शाळा बदला' : 'Change'}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between w-full text-slate-300">
                <span className="italic">
                  {language === 'mr' ? 'शाळा निवडलेली नाही' : 'No school selected'}
                </span>
                <span className="text-[10px] bg-[#dfaf27] text-[#233d76] font-bold px-2 py-0.5 rounded-sm">
                  {language === 'mr' ? 'आधी शाळा निवडा' : 'Select School'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
