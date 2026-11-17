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
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, language } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  // Navigation tab (defaults to SCHOOLS for trainer, DASHBOARD for admin)
  const [activeTab, setActiveTab] = useState<string>(
    isTrustAdmin ? 'DASHBOARD' : 'SCHOOLS'
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Navigation Sub-Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
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
              /* Field Trainer Navigation: Exact same 4 options as Page 105 of Old App */
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

      {/* Main Screen Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Trust Admin Dashboard */}
        {isTrustAdmin && activeTab === 'DASHBOARD' && <AdminDashboard />}

        {/* Schools List View */}
        {activeTab === 'SCHOOLS' && <SchoolList onNavigateToTab={(t) => setActiveTab(t)} />}

        {/* Field Trainer Core Modules */}
        {activeTab === 'STUDENTS' && <StudentRoster onBack={() => setActiveTab('SCHOOLS')} />}
        {activeTab === 'ASSESSMENTS' && <AssessmentDataEntry onBack={() => setActiveTab('SCHOOLS')} />}
        {activeTab === 'SESSIONS' && <SessionLogger onBack={() => setActiveTab('SCHOOLS')} />}
        {activeTab === 'DOCUMENTS' && <DocumentUpload onBack={() => setActiveTab('SCHOOLS')} />}
      </main>

      {/* Footer strictly adhering to Trust branding guidelines */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
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
