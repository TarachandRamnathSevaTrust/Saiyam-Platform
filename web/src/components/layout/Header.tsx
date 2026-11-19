import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, School as SchoolIcon, ShieldCheck, LogOut, Calendar } from 'lucide-react';
import { formatOrgName } from '../../lib/formatters';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    organizations,
    language,
    setLanguage,
    financialYear,
    selectedSchool,
    setSelectedSchool,
    schools,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const isOrgCoordinator = currentUser.role === 'ORG_COORDINATOR';
  const currentOrg = organizations.find((o) => o.code === currentUser.organizationCode);

  return (
    <header className="bg-[#233d76] text-white sticky top-0 z-40 shadow-md pt-[max(env(safe-area-inset-top,0px),32px)] sm:pt-0">
      {/* Primary Top Bar */}
      <div className="w-full max-w-[1650px] mx-auto px-3 sm:px-8 lg:px-10">
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

            {/* Language Switcher: Explicit Two-Pill Segmented Control (Zero Ambiguity) */}
            <div className="flex items-center rounded-lg border border-[#3b5998] bg-[#1a2d57] p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#dfaf27] text-[#233d76] font-black shadow-xs'
                    : 'text-[#f0da9a] hover:text-white hover:bg-white/10'
                }`}
                title="Switch to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'mr'
                    ? 'bg-[#dfaf27] text-[#233d76] font-black shadow-xs'
                    : 'text-[#f0da9a] hover:text-white hover:bg-white/10'
                }`}
                title="मराठी भाषेवर जा"
              >
                मराठी
              </button>
            </div>

            {/* Active Financial Year Badge (Desktop) */}
            <div
              className="hidden sm:flex items-center space-x-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#dfaf27]/50 bg-[#1a2d57] text-[#f0da9a] shadow-2xs select-none"
              title={language === 'mr' ? 'चालू शैक्षणिक व आर्थिक वर्ष: २०२५-२६' : 'Active Financial Year: FY 2025–26'}
            >
              <Calendar className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span className="tracking-wide">FY {financialYear}</span>
            </div>

            {/* Active Authenticated User Badge (Desktop - Static & Clean) */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#3b5998] bg-[#1a2d57] text-white shadow-2xs select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight flex items-center space-x-1">
                  <span>{currentUser.role === 'TRUST_ADMIN' ? '👑' : currentUser.role === 'ORG_COORDINATOR' ? '🏢' : '👤'}</span>
                  <span>{currentUser.fullName}</span>
                </span>
                <span className="text-[10px] text-[#f0da9a] leading-tight">
                  {currentUser.role === 'TRUST_ADMIN'
                    ? (language === 'mr' ? 'विश्वस्त (Admin)' : 'Trust Executive')
                    : currentUser.role === 'ORG_COORDINATOR'
                    ? (language === 'mr' ? 'संस्था समन्वयक' : 'NGO Coordinator')
                    : (language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Facilitator')}
                  {currentOrg ? ` • ${formatOrgName(currentOrg, language)}` : ''}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              title={language === 'mr' ? 'खात्यातून लॉगआउट करा' : 'Sign Out'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'लॉगआउट' : 'Logout'}</span>
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
              ? language === 'mr' ? '👑 विश्वस्त' : '👑 Trust Admin'
              : isOrgCoordinator
              ? language === 'mr' ? `🏢 समन्वयक: ${currentUser.fullName}` : `🏢 Lead: ${currentUser.fullName}`
              : `👤 ${currentUser.fullName}`}
          </span>
          {currentOrg && (
            <span className="text-[10px] text-slate-300 truncate font-normal">
              [{formatOrgName(currentOrg, language)}]
            </span>
          )}
        </div>

        {/* Active Financial Year (Mobile Badge) */}
        <div
          className="shrink-0 flex items-center space-x-1 text-[10px] font-black rounded-md border border-[#dfaf27]/60 bg-[#233d76] text-[#dfaf27] px-2 py-0.5 select-none"
          title={language === 'mr' ? 'चालू आर्थिक वर्ष' : 'Active Financial Year'}
        >
          <Calendar className="w-2.5 h-2.5 text-[#dfaf27]" />
          <span>FY {financialYear}</span>
        </div>
      </div>

      {/* Coordinator Sub-Bar for NGO Coordinator */}
      {isOrgCoordinator && (
        <div className="bg-[#142345] border-t border-[#294279] px-3 sm:px-8 lg:px-12 py-1.5 sm:py-2 flex items-center justify-between text-xs text-[#f0da9a]">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[9px] sm:text-[10px] font-black bg-[#dfaf27] text-[#233d76] px-1.5 py-0.5 rounded-sm shrink-0">
              {language === 'mr' ? 'संस्था नियंत्रण कक्ष' : 'Partner Portal'}
            </span>
            <span className="text-white text-xs font-bold truncate">
              {currentUser.fullName} {currentOrg ? `• ${formatOrgName(currentOrg, language)}` : ''}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 hidden sm:inline">
            {language === 'mr' ? 'प्रशिक्षक व शाळा प्रगती नियंत्रण' : 'FTs & School Progress Desk'}
          </span>
        </div>
      )}

      {/* Active School Sub-Bar for Field Trainer */}
      {!isTrustAdmin && !isOrgCoordinator && (
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
