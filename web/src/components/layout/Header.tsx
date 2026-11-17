import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../lib/mockData';
import { Globe, School as SchoolIcon, ChevronDown, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, switchUser, language, setLanguage, selectedSchool, setSelectedSchool, schools } = useApp();

  return (
    <header className="bg-[#233d76] text-white sticky top-0 z-40 shadow-md">
      <div className="w-full px-3 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Official Saiyam Logo & Trust Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            <div className="bg-white rounded-xl p-1 sm:p-1.5 flex items-center justify-center shadow-sm shrink-0 border border-white/20">
              <img
                src="/saiyam-logo.png"
                alt="संयम"
                className="h-9 sm:h-12 w-auto object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-xl tracking-tight text-white trust-heading">
                  संयम (SAIYAM)
                </span>
                <span className="text-[10px] sm:text-[11px] bg-[#dfaf27] text-[#233d76] font-black px-1.5 sm:px-2 py-0.5 rounded-sm shadow-2xs">
                  TRST
                </span>
              </div>
              <p className="text-[11px] text-[#f0da9a] font-medium hidden sm:block mt-0.5">
                Initiative By : Tarachand Ramnath Seva Trust
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* DPDP Act Badge on Desktop */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-[#f0da9a] bg-[#1a2d57] px-3 py-1.5 rounded-lg border border-[#3b5998]">
              <ShieldCheck className="w-4 h-4 text-[#dfaf27]" />
              <span className="font-medium">DPDP Act (2023) Protected</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1a2d57] text-white hover:bg-[#2d4c91] transition-colors cursor-pointer shadow-2xs"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span className="text-[11px] sm:text-xs">{language === 'mr' ? 'मराठी / EN' : 'EN / मराठी'}</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <select
                aria-label="Switch User or Role"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-[11px] sm:text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1a2d57] text-white py-1.5 sm:py-2 pl-2 sm:pl-3 pr-7 focus:outline-hidden focus:ring-2 focus:ring-[#dfaf27] cursor-pointer shadow-2xs appearance-none"
              >
                {INITIAL_USERS.map((user) => (
                  <option key={user.id} value={user.id} className="bg-[#233d76] text-white">
                    {user.role === 'TRUST_ADMIN' ? '👑 Trust Admin' : '👤 क्षेत्र प्रशिक्षक'}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#dfaf27] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active School Sub-Bar for Field Trainer */}
        {currentUser.role === 'FIELD_TRAINER' && (
          <div className="bg-[#1a2d57] border-t border-[#345396] px-4 py-2 flex items-center justify-between text-xs text-[#f0da9a]">
            {selectedSchool ? (
              <>
                <div className="flex items-center space-x-2 truncate">
                  <SchoolIcon className="w-4 h-4 text-[#dfaf27] shrink-0" />
                  <span className="truncate">
                    <strong>{language === 'mr' ? 'शाळा:' : 'School:'}</strong> {selectedSchool.name} ({selectedSchool.village})
                  </span>
                </div>
                {schools.length > 1 && (
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="text-xs text-white underline hover:text-[#dfaf27] shrink-0 font-bold ml-4 cursor-pointer"
                  >
                    {language === 'mr' ? 'शाळा बदला' : 'Change School'}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-slate-300 italic text-xs">
                  {language === 'mr' ? 'शाळा निवडलेली नाही' : 'No school selected'}
                </span>
                <span className="text-xs bg-[#dfaf27] text-[#233d76] font-extrabold px-2.5 py-0.5 rounded-sm">
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
