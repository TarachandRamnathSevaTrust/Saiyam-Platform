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
  Sparkles,
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, language, selectedSchool } = useApp();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* Navigation Sub-Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {/* If Trust Admin, show Admin options */}
            {isTrustAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{language === 'mr' ? 'विश्वस्त डॅशबोर्ड व विश्लेषण' : 'Trust Dashboard & Delta Engine'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SCHOOLS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{language === 'mr' ? 'शाळा यादी व प्रगती' : 'Schools & Sessions Audit'}</span>
                </button>
              </>
            ) : (
              /* If Field Trainer, show exact modules matching manual */
              <>
                <button
                  onClick={() => setActiveTab('SCHOOLS')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SCHOOLS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{language === 'mr' ? 'शाळा नोंदणी' : 'Schools'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('STUDENTS')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'STUDENTS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'mr' ? 'विद्यार्थी नोंदणी (गठ्ठा)' : 'Student Roster'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ASSESSMENTS')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'ASSESSMENTS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>{language === 'mr' ? 'पूर्व / उत्तर चाचण्या (३ पेपर्स)' : 'Pre/Post Assessments'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('SESSIONS')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'SESSIONS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{language === 'mr' ? 'सत्र नोंदी व मिडिया (२५ सत्रे)' : '25 Sessions Log'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('DOCUMENTS')}
                  className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'DOCUMENTS'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{language === 'mr' ? 'कागदपत्रे अपलोड (शिक्का)' : 'Documents'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* If Trust Admin and Tab is Dashboard */}
        {isTrustAdmin && activeTab === 'DASHBOARD' && <AdminDashboard />}

        {/* If Schools Tab */}
        {activeTab === 'SCHOOLS' && <SchoolList />}

        {/* Field Trainer Specific Screens */}
        {activeTab === 'STUDENTS' && <StudentRoster />}
        {activeTab === 'ASSESSMENTS' && <AssessmentDataEntry />}
        {activeTab === 'SESSIONS' && <SessionLogger />}
        {activeTab === 'DOCUMENTS' && <DocumentUpload />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Tarachand Ramnath Seva Trust (TRST) & Jnana Prabodhini (JPIP). All rights reserved.
          </span>
          <div className="flex items-center space-x-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Personal Data Protection Act (DPDP Act, 2023) Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
