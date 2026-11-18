import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, School as SchoolIcon, ChevronDown, ShieldCheck, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchUser,
    logout,
    users,
    organizations,
    language,
    setLanguage,
    financialYear,
    setFinancialYear,
    availableFinancialYears,
    selectedSchool,
    setSelectedSchool,
    schools,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const currentOrg = organizations.find((o) => o.code === currentUser.organizationCode);

  return (
    <header className="bg-[#233d76] text-white sticky top-0 z-40 shadow-md pt-[max(env(safe-area-inset-top,0px),32px)] sm:pt-0">
      {/* Primary Top Bar */}
      <div className="w-full px-3 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-14 sm:h-18">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-2 sm:space-x-3.5">
            <div className="bg-white rounded-xl p-1 sm:p-1.5 flex items-center justify-center shadow-xs shrink-0 border border-white/20">
              <img
                src="/saiyam-logo.png"
                alt="संयम (Saiyam)"
                className="h-8 sm:h-11 w-auto object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-xl tracking-tight text-white trust-heading">
                  {language === 'mr' ? 'संयम' : 'SAIYAM'}
                </span>
                <span className="text-[9px] sm:text-[11px] bg-[#dfaf27] text-[#233d76] font-black px-1.5 sm:px-2 py-0.5 rounded-sm shadow-2xs">
                  TRST
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#f0da9a] font-medium hidden sm:block mt-0.5">
                {language === 'mr'
                  ? 'ताराचंद रामनाथ सेवा ट्रस्ट, पुणे'
                  : 'Tarachand Ramnath Seva Trust, Pune'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* DPDP Act Badge (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-[#f0da9a] bg-[#1a2d57] px-3 py-1.5 rounded-lg border border-[#3b5998]">
              <ShieldCheck className="w-4 h-4 text-[#dfaf27]" />
              <span className="font-medium">DPDP Act (2023) Protected</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1a2d57] text-[#f0da9a] hover:bg-[#2d4c91] transition-colors cursor-pointer shadow-2xs"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span className="text-[10px] sm:text-xs font-bold">
                {language === 'en' ? 'मराठी' : 'English'}
              </span>
            </button>

            {/* Financial Year (FY) Selector (Desktop) */}
            <div className="relative hidden sm:block">
              <select
                aria-label="Financial Year"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="text-[11px] sm:text-xs font-bold rounded-lg border border-[#dfaf27]/70 bg-[#1a2d57] text-[#f0da9a] hover:text-white py-1.5 sm:py-2 pl-2 sm:pl-2.5 pr-6 focus:outline-hidden focus:ring-2 focus:ring-[#dfaf27] cursor-pointer shadow-2xs appearance-none"
                title="Select Financial Year (आर्थिक वर्ष)"
              >
                {availableFinancialYears.map((fy) => (
                  <option key={fy} value={fy} className="bg-[#233d76] text-white font-bold">
                    FY {fy}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#dfaf27] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Role Switcher (Desktop) */}
            <div className="relative hidden sm:block">
              <select
                aria-label="Switch User or Role"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-[11px] sm:text-xs font-bold rounded-lg border border-[#3b5998] bg-[#1a2d57] text-white py-1.5 sm:py-2 pl-2 sm:pl-3 pr-7 focus:outline-hidden focus:ring-2 focus:ring-[#dfaf27] cursor-pointer shadow-2xs appearance-none max-w-[220px] truncate"
              >
                {users.map((user) => {
                  const userOrg = organizations.find((o) => o.code === user.organizationCode);
                  const orgName = userOrg ? (language === 'mr' ? userOrg.nameMr : userOrg.nameEn) : '';
                  const orgTag = orgName ? ` [${orgName}]` : '';

                  const label =
                    user.role === 'TRUST_ADMIN'
                      ? language === 'mr'
                        ? `👑 ${user.fullName} (विश्वस्त)`
                        : `👑 ${user.fullName} (Admin)`
                      : `👤 ${user.fullName}${orgTag}`;

                  return (
                    <option key={user.id} value={user.id} className="bg-[#233d76] text-white py-1">
                      {label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#dfaf27] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Logout / Switch Role Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
              title={language === 'mr' ? 'लॉगआउट करा किंवा भूमिका बदला' : 'Log Out / Switch Role'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'mr' ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Header: Active Role & Financial Year (Clean & Uncramped) */}
      <div className="sm:hidden bg-[#1a2d57] border-t border-[#345396] px-3 py-1.5 flex items-center justify-between text-xs">
        {/* Role Pill */}
        <div className="flex items-center space-x-1.5 truncate max-w-[65%]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="text-[11px] font-bold text-[#f0da9a] truncate">
            {isTrustAdmin
              ? language === 'mr' ? '👑 विश्वस्त (Admin)' : '👑 Trust Admin'
              : `👤 ${currentUser.fullName}`}
          </span>
          {currentOrg && (
            <span className="text-[10px] text-slate-300 truncate font-normal">
              [{currentOrg.nameMr}]
            </span>
          )}
        </div>

        {/* Financial Year Selector (Mobile Pill) */}
        <div className="relative shrink-0">
          <select
            aria-label="Financial Year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="text-[10px] font-black rounded-md border border-[#dfaf27]/60 bg-[#233d76] text-[#dfaf27] py-1 pl-1.5 pr-5 focus:outline-hidden appearance-none cursor-pointer"
          >
            {availableFinancialYears.map((fy) => (
              <option key={fy} value={fy} className="bg-[#233d76] text-white font-bold">
                FY {fy}
              </option>
            ))}
          </select>
          <ChevronDown className="w-2.5 h-2.5 text-[#dfaf27] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Active School Sub-Bar for Field Trainer */}
      {!isTrustAdmin && (
        <div className="bg-[#142345] border-t border-[#294279] px-3 sm:px-8 lg:px-12 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#f0da9a]">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] sm:text-[10px] font-black bg-[#dfaf27] text-[#233d76] px-1.5 py-0.5 rounded-sm shrink-0">
              {language === 'mr' ? 'क्षेत्र कार्य' : 'Field Work'}
            </span>
            <span className="text-white text-xs font-bold truncate">
              {currentUser.fullName}
            </span>
          </div>

          {selectedSchool ? (
            <div className="flex items-center space-x-2 truncate">
              <SchoolIcon className="w-3.5 h-3.5 text-[#dfaf27] shrink-0" />
              <span className="truncate text-slate-200 text-xs">
                <strong>{language === 'mr' ? 'शाळा:' : 'School:'}</strong> {selectedSchool.name}
              </span>
              {schools.length > 1 && (
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="text-xs text-[#dfaf27] underline hover:text-white shrink-0 font-bold ml-1 cursor-pointer"
                >
                  {language === 'mr' ? 'बदला' : 'Change'}
                </button>
              )}
            </div>
          ) : (
            <span className="text-slate-300 italic text-[11px]">
              {language === 'mr' ? 'सत्रे घेण्यासाठी खालीलपैकी शाळा निवडा' : 'Select a school below to conduct sessions'}
            </span>
          )}
        </div>
      )}
    </header>
  );
};
