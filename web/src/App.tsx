import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GovernancePanel } from './components/admin/GovernancePanel';
import { PartnerCoordinatorDashboard } from './components/partner/PartnerCoordinatorDashboard';
import { SchoolList } from './components/trainer/SchoolList';
import { StudentRoster } from './components/trainer/StudentRoster';
import { AssessmentDataEntry } from './components/trainer/AssessmentDataEntry';
import { SessionLogger } from './components/trainer/SessionLogger';
import { DocumentUpload } from './components/trainer/DocumentUpload';
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardCheck,
  BookOpen,
  FileText,
  ShieldCheck,
  AlertCircle,
  School as SchoolIcon,
} from 'lucide-react';

export const App: React.FC = () => {
  const { isLoggedIn, currentUser, language, selectedSchool } = useApp();

  const isTrustAdmin = currentUser?.role === 'TRUST_ADMIN';
  const isOrgCoordinator = currentUser?.role === 'ORG_COORDINATOR';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>(
    isTrustAdmin ? 'DASHBOARD' : isOrgCoordinator ? 'NGO_PORTAL' : 'SCHOOLS'
  );

  // Sync activeTab when role changes
  useEffect(() => {
    if (isTrustAdmin) {
      if (activeTab !== 'DASHBOARD' && activeTab !== 'GOVERNANCE' && activeTab !== 'SCHOOLS') {
        setActiveTab('DASHBOARD');
      }
    } else if (isOrgCoordinator) {
      setActiveTab('NGO_PORTAL');
    } else {
      if (activeTab === 'DASHBOARD' || activeTab === 'GOVERNANCE' || activeTab === 'NGO_PORTAL') {
        setActiveTab('SCHOOLS');
      }
    }
  }, [isTrustAdmin, isOrgCoordinator]);

  // If not logged in, show the official Login Page first!
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  const requiresSchool =
    !isTrustAdmin &&
    !isOrgCoordinator &&
    activeTab !== 'SCHOOLS' &&
    selectedSchool === null;

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col font-sans">
      <Header />

      {/* Desktop Navigation Sub-Header (Full Width & Clean Margins) */}
      <div className="hidden sm:block bg-white border-b border-slate-200 sticky top-16 sm:top-18 z-20 shadow-2xs">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5">
            {isTrustAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'विश्वस्त डॅशबोर्ड व विश्लेषण' : 'Trust Dashboard & Delta Engine'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('GOVERNANCE')}
                  className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'GOVERNANCE'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'प्रशासन (संस्था व प्रशिक्षक)' : 'Governance (Orgs & Facilitators)'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SCHOOLS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'शाळा यादी व प्रगती' : 'Schools & Progress'}</span>
                </button>
              </>
            ) : isOrgCoordinator ? (
              <>
                <button
                  onClick={() => setActiveTab('NGO_PORTAL')}
                  className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'NGO_PORTAL'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'संस्था नियंत्रण कक्ष (NGO Portal)' : 'NGO Coordinator Portal'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SCHOOLS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <SchoolIcon className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'शाळा यादी व प्रगती' : 'Schools & Progress'}</span>
                </button>
              </>
            ) : (
              /* Field Trainer Desktop Navigation */
              <>
                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SCHOOLS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? '१. शाळा नोंदणी' : '1. Schools'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('STUDENTS')}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'STUDENTS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? '२. विद्यार्थी नोंदणी' : '2. Students (Bundle)'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ASSESSMENTS')}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'ASSESSMENTS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? '३. पूर्व / उत्तर चाचण्या' : '3. Pre/Post Tests'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('SESSIONS')}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SESSIONS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? '४. सत्र नोंदी (२५)' : '4. 25 Sessions'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('DOCUMENTS')}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'DOCUMENTS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? '५. कागदपत्रे अपलोड' : '5. Documents'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Viewport: Full Width with Generous Margins & Safe Area Bottom */}
      <main className="w-full px-3 sm:px-8 lg:px-12 py-4 sm:py-8 flex-1 pb-24 sm:pb-8">
        {requiresSchool ? (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="bg-[#f0da9a]/40 border border-[#dfaf27] rounded-2xl p-4 sm:p-5 text-[#233d76] flex items-center space-x-3.5 shadow-2xs">
              <AlertCircle className="w-6 h-6 text-[#233d76] shrink-0" />
              <div className="text-xs sm:text-sm font-bold">
                {language === 'mr'
                  ? 'कृपया आधी खालीलपैकी शाळा निवडा किंवा नवीन शाळा नोंदणी करा.'
                  : 'Please select a school below or register a new one to continue.'}
              </div>
            </div>
            <SchoolList onNavigateToTab={(t) => setActiveTab(t)} />
          </div>
        ) : (
          <>
            {isTrustAdmin && activeTab === 'DASHBOARD' && <AdminDashboard />}
            {isTrustAdmin && activeTab === 'GOVERNANCE' && <GovernancePanel />}
            {isOrgCoordinator && activeTab === 'NGO_PORTAL' && <PartnerCoordinatorDashboard />}
            {activeTab === 'SCHOOLS' && <SchoolList onNavigateToTab={(t) => setActiveTab(t)} />}
            {activeTab === 'STUDENTS' && (
              <StudentRoster
                onBack={() => setActiveTab('SCHOOLS')}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}
            {activeTab === 'ASSESSMENTS' && (
              <AssessmentDataEntry
                onBack={() => setActiveTab('SCHOOLS')}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}
            {activeTab === 'SESSIONS' && (
              <SessionLogger
                onBack={() => setActiveTab('SCHOOLS')}
                onNavigate={(t) => setActiveTab(t)}
              />
            )}
            {activeTab === 'DOCUMENTS' && <DocumentUpload onBack={() => setActiveTab('SCHOOLS')} />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Optimized for All Phone Screens) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 shadow-xl pb-[max(env(safe-area-inset-bottom),6px)]">
        {isTrustAdmin ? (
          <div className="grid grid-cols-3 h-15">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                activeTab === 'DASHBOARD' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'DASHBOARD' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
            </button>
            <button
              onClick={() => setActiveTab('GOVERNANCE')}
              className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                activeTab === 'GOVERNANCE' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${activeTab === 'GOVERNANCE' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'mr' ? 'प्रशासन' : 'Admin'}</span>
            </button>
            <button
              onClick={() => setActiveTab('SCHOOLS')}
              className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                activeTab === 'SCHOOLS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <Building2 className={`w-5 h-5 ${activeTab === 'SCHOOLS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'mr' ? 'शाळा' : 'Schools'}</span>
            </button>
          </div>
        ) : isOrgCoordinator ? (
          <div className="grid grid-cols-2 h-15">
            <button
              onClick={() => setActiveTab('NGO_PORTAL')}
              className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                activeTab === 'NGO_PORTAL' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <Building2 className={`w-5 h-5 ${activeTab === 'NGO_PORTAL' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'mr' ? 'संस्था नियंत्रण कक्ष' : 'NGO Portal'}</span>
            </button>
            <button
              onClick={() => setActiveTab('SCHOOLS')}
              className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                activeTab === 'SCHOOLS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <SchoolIcon className={`w-5 h-5 ${activeTab === 'SCHOOLS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{language === 'mr' ? 'शाळा व प्रगती' : 'Schools'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 h-15">
            <button
              onClick={() => setActiveTab('SCHOOLS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer transition-colors ${
                activeTab === 'SCHOOLS' ? 'text-[#233d76] font-black' : 'text-slate-500'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'SCHOOLS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{language === 'mr' ? 'शाळा' : 'Schools'}</span>
            </button>
            <button
              onClick={() => setActiveTab('STUDENTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer transition-colors ${
                activeTab === 'STUDENTS' ? 'text-[#233d76] font-black' : 'text-slate-500'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'STUDENTS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{language === 'mr' ? 'विद्यार्थी' : 'Students'}</span>
            </button>
            <button
              onClick={() => setActiveTab('ASSESSMENTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer transition-colors ${
                activeTab === 'ASSESSMENTS' ? 'text-[#233d76] font-black' : 'text-slate-500'
              }`}
            >
              <ClipboardCheck className={`w-4 h-4 ${activeTab === 'ASSESSMENTS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{language === 'mr' ? 'चाचण्या' : 'Tests'}</span>
            </button>
            <button
              onClick={() => setActiveTab('SESSIONS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer transition-colors ${
                activeTab === 'SESSIONS' ? 'text-[#233d76] font-black' : 'text-slate-500'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'SESSIONS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{language === 'mr' ? '२५ सत्रे' : 'Sessions'}</span>
            </button>
            <button
              onClick={() => setActiveTab('DOCUMENTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer transition-colors ${
                activeTab === 'DOCUMENTS' ? 'text-[#233d76] font-black' : 'text-slate-500'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'DOCUMENTS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{language === 'mr' ? 'कागदपत्रे' : 'Docs'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Footer */}
      <footer className="hidden sm:block bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="w-full px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-[#233d76]">
            Initiative By : Tarachand Ramnath Seva Trust (TRST). All rights reserved.
          </span>
          <div className="flex items-center space-x-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#233d76]" />
            <span>DPDP Act (2023) Protected Data Flow</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
