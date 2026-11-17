import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
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
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, language, selectedSchool } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>(
    isTrustAdmin ? 'DASHBOARD' : 'SCHOOLS'
  );

  // If trainer has not selected a school yet, prompt them to pick a school
  const requiresSchool =
    !isTrustAdmin &&
    activeTab !== 'SCHOOLS' &&
    selectedSchool === null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 sm:pb-0">
      <Header />

      {/* Desktop Navigation Sub-Header (Hidden on Mobile) */}
      <div className="hidden sm:block bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-3 overflow-x-auto py-2.5">
            {isTrustAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'विश्वस्त डॅशबोर्ड व विश्लेषण' : 'Trust Dashboard & Delta Engine'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SCHOOLS'
                      ? 'bg-[#233d76] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#dfaf27]" />
                  <span>{language === 'mr' ? 'शाळा यादी व प्रगती' : 'Schools & Progress'}</span>
                </button>
              </>
            ) : (
              /* Field Trainer Desktop Navigation */
              <>
                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                  className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                  className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                  className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                  className={`flex items-center space-x-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        {/* If school is required but not selected yet, show helpful selection banner & school list */}
        {requiresSchool ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-[#f0da9a]/40 border border-[#dfaf27] rounded-xl p-4 text-[#233d76] flex items-center space-x-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-[#233d76] shrink-0" />
              <div className="text-xs sm:text-sm font-semibold">
                {language === 'mr'
                  ? 'कृपया आधी खालीलपैकी शाळा निवडा किंवा नवीन शाळा नोंदणी करा.'
                  : 'Please select a school below or register a new one to continue.'}
              </div>
            </div>
            <SchoolList onNavigateToTab={(t) => setActiveTab(t)} />
          </div>
        ) : (
          <>
            {/* Trust Admin Dashboard */}
            {isTrustAdmin && activeTab === 'DASHBOARD' && <AdminDashboard />}

            {/* Schools List View */}
            {activeTab === 'SCHOOLS' && <SchoolList onNavigateToTab={(t) => setActiveTab(t)} />}

            {/* Field Trainer Core Modules */}
            {activeTab === 'STUDENTS' && <StudentRoster onBack={() => setActiveTab('SCHOOLS')} />}
            {activeTab === 'ASSESSMENTS' && <AssessmentDataEntry onBack={() => setActiveTab('SCHOOLS')} />}
            {activeTab === 'SESSIONS' && <SessionLogger onBack={() => setActiveTab('SCHOOLS')} />}
            {activeTab === 'DOCUMENTS' && <DocumentUpload onBack={() => setActiveTab('SCHOOLS')} />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Native App Style for Phone Screen) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 shadow-lg">
        {isTrustAdmin ? (
          <div className="grid grid-cols-2 h-14">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'DASHBOARD' ? 'text-[#233d76] font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === 'DASHBOARD' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px]">{language === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
            </button>
            <button
              onClick={() => setActiveTab('SCHOOLS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'SCHOOLS' ? 'text-[#233d76] font-bold' : 'text-slate-500'
              }`}
            >
              <Building2 className={`w-5 h-5 ${activeTab === 'SCHOOLS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[10px]">{language === 'mr' ? 'शाळा' : 'Schools'}</span>
            </button>
          </div>
        ) : (
          /* Trainer 5 Bottom Tabs */
          <div className="grid grid-cols-5 h-14">
            <button
              onClick={() => setActiveTab('SCHOOLS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'SCHOOLS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'SCHOOLS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] truncate max-w-[60px]">{language === 'mr' ? 'शाळा' : 'Schools'}</span>
            </button>

            <button
              onClick={() => setActiveTab('STUDENTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'STUDENTS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'STUDENTS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] truncate max-w-[60px]">{language === 'mr' ? 'विद्यार्थी' : 'Students'}</span>
            </button>

            <button
              onClick={() => setActiveTab('ASSESSMENTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'ASSESSMENTS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <ClipboardCheck className={`w-4 h-4 ${activeTab === 'ASSESSMENTS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] truncate max-w-[60px]">{language === 'mr' ? 'चाचण्या' : 'Tests'}</span>
            </button>

            <button
              onClick={() => setActiveTab('SESSIONS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'SESSIONS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'SESSIONS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] truncate max-w-[60px]">{language === 'mr' ? 'सत्रे' : 'Sessions'}</span>
            </button>

            <button
              onClick={() => setActiveTab('DOCUMENTS')}
              className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                activeTab === 'DOCUMENTS' ? 'text-[#233d76] font-extrabold' : 'text-slate-500'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'DOCUMENTS' ? 'text-[#233d76]' : 'text-slate-400'}`} />
              <span className="text-[9px] truncate max-w-[60px]">{language === 'mr' ? 'कागदपत्रे' : 'Docs'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Footer */}
      <footer className="hidden sm:block bg-white border-t border-slate-200 py-5 mt-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-[#233d76]">
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
