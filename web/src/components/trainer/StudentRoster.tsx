import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Plus, Check, UserPlus, Info, Hash } from 'lucide-react';
import { Gender } from '@saiyam/shared';

export const StudentRoster: React.FC = () => {
  const { selectedSchool, students, addStudent, language } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('FEMALE');
  const [standard, setStandard] = useState('8');
  const [division, setDivision] = useState('A');

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-500">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
      </div>
    );
  }

  // Filter students for the selected school
  const schoolStudents = students
    .filter((s) => s.schoolId === selectedSchool.id)
    .sort((a, b) => a.bundleSequenceNo - b.bundleSequenceNo);

  const nextSequenceNo = schoolStudents.length + 1;

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    addStudent({
      schoolId: selectedSchool.id,
      bundleSequenceNo: nextSequenceNo,
      fullName: fullName.trim(),
      gender,
      standard,
      division,
    });

    setFullName('');
    // Keep standard and division for quick serial batch entry
  };

  return (
    <div className="space-y-6">
      {/* Physical Paper Bundle Instructions Banner (Matching Page 105 of Manual) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 text-amber-900 flex items-start space-x-3 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-sm">
            {language === 'mr'
              ? 'महत्त्वाची सूचना: पूर्व चाचणी गठ्ठा क्रमानुसार नोंदणी'
              : 'Important: Sequential Paper Bundle Alignment'}
          </h4>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            {language === 'mr'
              ? 'पूर्व चाचणीच्या सांगितलेल्या क्रमाने लावलेला आणि नंबर लिहिलेला गठ्ठा घेऊन बसावे. त्यात जो क्रम आहे (S-1, S-2, S-3...) त्याच क्रमाने ही नोंदणी करावी, ज्यामुळे नंतर उत्तर चाचण्या भरताना चुका होणार नाहीत.'
              : 'Arrange the physical test papers in numerical order. Register students in the exact same serial sequence (S-1, S-2...) so answer sheets match 1:1 with app records.'}
          </p>
        </div>
      </div>

      {/* Roster Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-slate-900">
                {language === 'mr' ? 'विद्यार्थी यादी (Student Roster)' : 'Enrolled Students'}
              </h3>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                {schoolStudents.length} {language === 'mr' ? 'विद्यार्थी' : 'Students'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedSchool.name} • {language === 'mr' ? 'इयत्ता:' : 'Grade:'} {standard}-{division}
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'mr' ? 'नवीन विद्यार्थी जोडा' : 'Add Student'}</span>
          </button>
        </div>

        {/* Quick Add Form (Collapsible or Open) */}
        {isAdding && (
          <form
            onSubmit={handleAddStudent}
            className="bg-amber-50/50 p-5 border-b border-amber-100 animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-amber-700" />
                <span>
                  {language === 'mr' ? `नवीन विद्यार्थी नोंदणी (गठ्ठा क्र. S-${nextSequenceNo})` : `Add Student (Bundle Serial # S-${nextSequenceNo})`}
                </span>
              </span>
              <span className="text-[11px] text-amber-700">
                {language === 'mr' ? 'नाव लिहून Enter दाबा' : 'Type name and press Enter'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Token Number */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'गठ्ठा क्र.' : 'Bundle #'}
                </label>
                <div className="w-full text-sm font-mono font-bold bg-white px-3 py-2 rounded-xl border border-slate-300 text-slate-700 flex items-center">
                  <Hash className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  S-{nextSequenceNo}
                </div>
              </div>

              {/* Full Name */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'विद्यार्थ्याचे नाव *' : 'Student Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'mr' ? 'उदा. अनघा कुलकर्णी' : 'e.g. Anagha Kulkarni'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-sm bg-white px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              {/* Gender */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'लिंग *' : 'Gender *'}
                </label>
                <select
                  aria-label="Select Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full text-sm bg-white px-2.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="FEMALE">{language === 'mr' ? 'मुलगी' : 'Female'}</option>
                  <option value="MALE">{language === 'mr' ? 'मुलगा' : 'Male'}</option>
                  <option value="OTHER">{language === 'mr' ? 'इतर' : 'Other'}</option>
                </select>
              </div>

              {/* Standard */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'इयत्ता' : 'Class'}
                </label>
                <input
                  type="text"
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full text-sm bg-white px-2 py-2 rounded-xl border border-slate-300 text-center"
                />
              </div>

              {/* Division */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'तुकडी' : 'Div'}
                </label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full text-sm bg-white px-2 py-2 rounded-xl border border-slate-300 text-center"
                />
              </div>

              {/* Save Button */}
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold p-2 rounded-xl shadow-xs flex items-center justify-center cursor-pointer transition-colors"
                  title="Save Student"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Student List Table */}
        <div className="divide-y divide-slate-100">
          {schoolStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {language === 'mr' ? 'अद्याप विद्यार्थी नोंदवले नाहीत' : 'No students added yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'mr'
                  ? 'वरील बटण दाबून पूर्व चाचणी गठ्ठ्यातील विद्यार्थ्यांची नोंदणी सुरू करा.'
                  : 'Click the button above to begin registering student papers.'}
              </p>
            </div>
          ) : (
            schoolStudents.map((student) => (
              <div
                key={student.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                    S-{student.bundleSequenceNo}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{student.fullName}</h4>
                    <span className="text-xs text-slate-500">
                      {student.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा'} • {language === 'mr' ? 'इयत्ता' : 'Grade'}{' '}
                      {student.standard}-{student.division}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
                  {language === 'mr' ? 'नोंदणी पूर्ण' : 'Registered'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
