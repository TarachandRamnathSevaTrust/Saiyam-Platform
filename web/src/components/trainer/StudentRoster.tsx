import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Check,
  UserPlus,
  Info,
  Hash,
  ArrowLeft,
  Edit2,
  Trash2,
  X,
  UserCheck,
} from 'lucide-react';
import { Gender, Student } from '@saiyam/shared';

interface Props {
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export const StudentRoster: React.FC<Props> = ({ onBack, onNavigate }) => {
  const {
    selectedSchool,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    language,
    currentUser,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const [isAdding, setIsAdding] = useState(!isTrustAdmin);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('FEMALE');
  const [standard, setStandard] = useState('8');
  const [division, setDivision] = useState('A');

  // Edit Student state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editGender, setEditGender] = useState<Gender>('FEMALE');
  const [editStandard, setEditStandard] = useState('8');
  const [editDivision, setEditDivision] = useState('A');
  const [editBundleSequenceNo, setEditBundleSequenceNo] = useState<number | string>(1);

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto shadow-2xs">
        <p className="text-slate-600 font-semibold mb-3">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs bg-[#233d76] text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
          >
            {language === 'mr' ? '← शाळा यादीकडे जा' : '← Back to Schools'}
          </button>
        )}
      </div>
    );
  }

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
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditFullName(student.fullName);
    setEditGender(student.gender);
    setEditStandard(student.standard);
    setEditDivision(student.division);
    setEditBundleSequenceNo(student.bundleSequenceNo);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId || !editFullName.trim()) return;

    updateStudent(editingStudentId, {
      fullName: editFullName.trim(),
      gender: editGender,
      standard: editStandard,
      division: editDivision,
      bundleSequenceNo: Number(editBundleSequenceNo) || 1,
    });

    setEditingStudentId(null);
  };

  const handleDelete = (student: Student) => {
    const confirmText =
      language === 'mr'
        ? `खात्री करा: ${student.fullName} (S-${student.bundleSequenceNo}) ची नोंद काढून टाकायची आहे का? यामुळे या विद्यार्थ्याच्या चाचण्यांची नोंदही हटवली जाईल.`
        : `Are you sure you want to delete ${student.fullName} (S-${student.bundleSequenceNo})? This will also remove their test records.`;

    if (window.confirm(confirmText)) {
      deleteStudent(student.id);
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Back button & Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'mr' ? 'विद्यार्थी नोंदणी' : 'Student Registration'}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedSchool.name} • {selectedSchool.village}
            </p>
          </div>
        </div>

        {!isTrustAdmin ? (
          <button
            onClick={() => {
              setEditingStudentId(null);
              setIsAdding(!isAdding);
            }}
            className="flex items-center space-x-1.5 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#dfaf27]" />
            <span>
              {isAdding
                ? language === 'mr'
                  ? 'फॉर्म बंद करा'
                  : 'Close Form'
                : language === 'mr'
                ? 'नवीन विद्यार्थी'
                : 'Add Student'}
            </span>
          </button>
        ) : (
          <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-bold px-3 py-1.5 rounded-lg border border-[#dfaf27]/40">
            {language === 'mr' ? 'विश्वस्त निरीक्षण (Read-Only)' : 'Trust Audit Mode'}
          </span>
        )}
      </div>

      {/* Trust Admin Read-Only Notice */}
      {isTrustAdmin && (
        <div className="bg-[#233d76] text-white p-3 rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold">
            {language === 'mr'
              ? '👁️ विश्वस्त निरीक्षण मोड: आपण विद्यार्थ्यांची यादी तपासत आहात. केवळ क्षेत्र प्रशिक्षक प्रत्यक्ष नोंदणी करू शकतात.'
              : '👁️ Trust Audit View: Reviewing registered students. Only field trainers can register students on-ground.'}
          </span>
          <span className="font-mono text-[#f0da9a] font-bold">
            {schoolStudents.length} {language === 'mr' ? 'विद्यार्थी' : 'students'}
          </span>
        </div>
      )}

      {/* Physical Paper Bundle Alignment Banner (Matching Page 105 of Manual) */}
      <div className="bg-[#f0da9a]/30 border border-[#dfaf27]/50 rounded-2xl p-4 text-[#233d76] flex items-start space-x-3 shadow-2xs">
        <div className="w-7 h-7 rounded-lg bg-[#dfaf27]/40 text-[#233d76] flex items-center justify-center shrink-0 mt-0.5 font-bold">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs leading-relaxed">
          <strong>{language === 'mr' ? 'सूचना: ' : 'Instruction: '}</strong>
          {language === 'mr'
            ? 'पूर्व चाचणीच्या क्रमाने लावलेला आणि नंबर लिहिलेला गठ्ठा घेऊन बसावे. गठ्ठ्याचा क्रम (S-1, S-2...) आणि app मधला क्रम सारखाच असावा. गरज भासल्यास आपण विद्यार्थ्यास संपादित किंवा हटवू शकता.'
            : 'Hold the numbered physical bundle of test sheets. Register students in the exact same serial order (S-1, S-2...). You can edit or delete students anytime.'}
        </div>
      </div>

      {/* Roster & Add Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Quick Add Form (Matching Page 105: विद्यार्थी माहिती) */}
        {!isTrustAdmin && isAdding && !editingStudentId && (
          <form
            onSubmit={handleAddStudent}
            className="bg-slate-50/70 p-5 border-b border-slate-200 animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#233d76] flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-[#dfaf27]" />
                <span>
                  {language === 'mr'
                    ? `विद्यार्थी माहिती (गठ्ठा क्र. S-${nextSequenceNo})`
                    : `Student Information (Serial # S-${nextSequenceNo})`}
                </span>
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'mr' ? 'माहिती भरून सेव्ह करा' : 'Fill details & press save'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Token Number */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'गठ्ठा क्र.' : 'Bundle #'}
                </label>
                <div className="w-full text-sm font-mono font-bold bg-white px-3 py-2 rounded-xl border border-slate-300 text-[#233d76] flex items-center justify-center">
                  <Hash className="w-3.5 h-3.5 mr-0.5 text-[#dfaf27]" />
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
                  placeholder={language === 'mr' ? 'विद्यार्थ्याचे पूर्ण नाव' : 'Student Full Name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-sm bg-white px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
                  autoFocus
                />
              </div>

              {/* Gender (मुलगी / मुलगा from manual) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'लिंग *' : 'Gender *'}
                </label>
                <select
                  aria-label="Select Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full text-sm bg-white px-2.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
                >
                  <option value="FEMALE">{language === 'mr' ? 'मुलगी' : 'Female'}</option>
                  <option value="MALE">{language === 'mr' ? 'मुलगा' : 'Male'}</option>
                </select>
              </div>

              {/* Standard (इयत्ता) */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'इयत्ता' : 'Class'}
                </label>
                <input
                  type="text"
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full text-sm bg-white px-2 py-2 rounded-xl border border-slate-300 text-center font-bold"
                />
              </div>

              {/* Division (तुकडी) */}
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {language === 'mr' ? 'तुकडी' : 'Div'}
                </label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full text-sm bg-white px-2 py-2 rounded-xl border border-slate-300 text-center font-bold"
                />
              </div>

              {/* Save Button */}
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold p-2.5 rounded-xl shadow-xs flex items-center justify-center cursor-pointer transition-colors"
                  title={language === 'mr' ? 'जतन करा' : 'Save Student'}
                >
                  <Check className="w-4 h-4 text-[#dfaf27]" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Student List (Matching Page 106: विद्यार्थी - यादी) */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {language === 'mr' ? 'विद्यार्थी - यादी' : 'Student List'}
          </span>
          <span className="text-xs bg-[#233d76] text-white font-bold px-2.5 py-0.5 rounded-full">
            {schoolStudents.length} {language === 'mr' ? 'नोंदवलेले' : 'Registered'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {schoolStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {language === 'mr' ? 'अद्याप विद्यार्थी नोंदवलेले नाहीत' : 'No students added yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'mr'
                  ? 'वरील फॉर्ममध्ये नाव लिहून "सेव्ह" करा.'
                  : 'Enter student details in the form above and click save.'}
              </p>
            </div>
          ) : (
            schoolStudents.map((student) => {
              const isEditingThis = editingStudentId === student.id;

              if (isEditingThis) {
                return (
                  <form
                    key={student.id}
                    onSubmit={handleSaveEdit}
                    className="p-4 bg-[#f0da9a]/25 border-y-2 border-[#dfaf27] space-y-3 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#233d76] flex items-center space-x-1.5">
                        <Edit2 className="w-3.5 h-3.5 text-[#dfaf27]" />
                        <span>
                          {language === 'mr'
                            ? `विद्यार्थी माहिती संपादित करा (S-${editBundleSequenceNo})`
                            : `Edit Student Information (S-${editBundleSequenceNo})`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingStudentId(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                      {/* Bundle Serial # */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'mr' ? 'गठ्ठा क्र.' : 'Bundle #'}
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={editBundleSequenceNo}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setEditBundleSequenceNo('');
                              return;
                            }
                            const parsed = parseInt(val.replace(/\D/g, ''), 10);
                            setEditBundleSequenceNo(isNaN(parsed) ? '' : parsed);
                          }}
                          className="w-full font-mono font-bold bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-center"
                        />
                      </div>

                      {/* Full Name */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'mr' ? 'विद्यार्थ्याचे पूर्ण नाव *' : 'Student Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#233d76]"
                          autoFocus
                        />
                      </div>

                      {/* Gender */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'mr' ? 'लिंग' : 'Gender'}
                        </label>
                        <select
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value as Gender)}
                          className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                        >
                          <option value="FEMALE">{language === 'mr' ? 'मुलगी' : 'Female'}</option>
                          <option value="MALE">{language === 'mr' ? 'मुलगा' : 'Male'}</option>
                        </select>
                      </div>

                      {/* Standard */}
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'mr' ? 'इयत्ता' : 'Class'}
                        </label>
                        <input
                          type="text"
                          value={editStandard}
                          onChange={(e) => setEditStandard(e.target.value)}
                          className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold"
                        />
                      </div>

                      {/* Division */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {language === 'mr' ? 'तुकडी' : 'Div'}
                        </label>
                        <input
                          type="text"
                          value={editDivision}
                          onChange={(e) => setEditDivision(e.target.value)}
                          className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingStudentId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#233d76] hover:bg-[#1b2f5c] text-white shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5 text-[#dfaf27]" />
                        <span>{language === 'mr' ? 'बदल जतन करा' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={student.id}
                  className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold bg-[#f0da9a]/50 text-[#233d76] px-2.5 py-1 rounded-lg border border-[#dfaf27]/40">
                      S-{student.bundleSequenceNo}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{student.fullName}</h4>
                      <span className="text-xs text-slate-500">
                        {student.gender === 'FEMALE' ? (language === 'mr' ? 'मुलगी' : 'Female') : (language === 'mr' ? 'मुलगा' : 'Male')} • {language === 'mr' ? 'इयत्ता' : 'Class'}{' '}
                        {student.standard}-{student.division}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 hidden sm:inline-block">
                      {language === 'mr' ? 'नोंद झाली' : 'Saved'}
                    </span>

                    {!isTrustAdmin && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStartEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-[#233d76] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title={language === 'mr' ? 'विद्यार्थी माहिती संपादित करा' : 'Edit student details'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={language === 'mr' ? 'विद्यार्थी हटवा' : 'Delete student'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {schoolStudents.length > 0 && onNavigate && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {language === 'mr' ? 'पुढील पायरी: पूर्व चाचण्या नोंदवा' : 'Next Step: Conduct Pre-Tests'}
            </span>
            <button
              onClick={() => onNavigate('ASSESSMENTS')}
              className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>{language === 'mr' ? 'पूर्व / उत्तर चाचण्या →' : 'Pre / Post Tests →'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
