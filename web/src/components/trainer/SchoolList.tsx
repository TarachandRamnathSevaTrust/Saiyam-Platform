import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolRegistrationModal } from './SchoolRegistrationModal';
import { Building2, Plus, MapPin, Calendar, User, ChevronRight, CheckCircle2 } from 'lucide-react';

export const SchoolList: React.FC = () => {
  const { schools, selectedSchool, setSelectedSchool, language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'mr' ? 'शाळा / संस्था व्यवस्थापन' : 'School & Institute Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr'
              ? 'सत्रे घेण्यापूर्वी शाळेची नोंदणी करा व शाळा निवडून काम सुरू करा.'
              : 'Register or select a school to begin logging sessions and test papers.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'mr' ? 'नवीन शाळा नोंदणी करा' : 'Register New School'}</span>
        </button>
      </div>

      {/* School Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schools.map((school) => {
          const isSelected = selectedSchool?.id === school.id;

          return (
            <div
              key={school.id}
              onClick={() => setSelectedSchool(school)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-amber-50/70 border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">
                  {language === 'mr' ? 'सक्रिय शाळा' : 'Active'}
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="pr-4">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{school.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    <span>
                      {school.village}, {school.district}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">{language === 'mr' ? 'प्रतिनिधी:' : 'POC:'}</span>
                  <span className="font-semibold text-slate-700">{school.representativeName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">{language === 'mr' ? 'सत्रे पूर्ण:' : 'Progress:'}</span>
                  <span className="font-semibold text-amber-800">
                    {school.completedSessionsCount || 0} / 25 {language === 'mr' ? 'सत्रे' : 'sessions'}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-amber-700 font-bold pt-2 border-t border-slate-100">
                <span>{isSelected ? (language === 'mr' ? 'निवडलेली शाळा' : 'Selected') : (language === 'mr' ? 'काम करण्यासाठी निवडा' : 'Select to work')}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <SchoolRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
