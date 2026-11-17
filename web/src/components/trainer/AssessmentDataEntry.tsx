import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaperType, AnswerOption } from '@saiyam/shared';
import {
  FileText,
  CheckCircle,
  HelpCircle,
  XCircle,
  User,
  Save,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AssessmentDataEntry: React.FC = () => {
  const {
    selectedSchool,
    students,
    questions,
    saveAssessmentSubmission,
    assessmentPairs,
    language,
  } = useApp();

  const [phase, setPhase] = useState<'PRE' | 'POST'>('PRE');
  const [selectedPaper, setSelectedPaper] = useState<PaperType>('MMAT');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );

  // Local state for answers being entered for the active student & paper
  const [answers, setAnswers] = useState<Record<string, AnswerOption>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-500">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
      </div>
    );
  }

  const schoolStudents = students
    .filter((s) => s.schoolId === selectedSchool.id)
    .sort((a, b) => a.bundleSequenceNo - b.bundleSequenceNo);

  const activeStudent = schoolStudents.find((s) => s.id === selectedStudentId) || schoolStudents[0];
  const paperQuestions = questions.filter((q) => q.paperType === selectedPaper);

  // Load existing answers if already taken
  const currentPair = assessmentPairs.find(
    (p) => p.studentId === activeStudent?.id && p.paperType === selectedPaper
  );
  const activeRecord = phase === 'PRE' ? currentPair?.preTest : currentPair?.postTest;

  // Toggle answer selection (Fixes the old app bug where clicking once locked it!)
  const handleSelectOption = (questionId: string, option: AnswerOption) => {
    setAnswers((prev) => {
      // If already selected, clicking it again unselects it (sets to BLANK)!
      const current = prev[questionId];
      if (current === option) {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      }
      return { ...prev, [questionId]: option };
    });
  };

  const handleSave = () => {
    if (!activeStudent) return;

    const payload = paperQuestions.map((q) => ({
      questionId: q.id,
      questionNumber: q.questionNumber,
      selectedOption: answers[q.id] || ('BLANK' as AnswerOption),
    }));

    saveAssessmentSubmission(activeStudent.id, selectedPaper, phase, payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Phase Switcher (Pre vs Post) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-2xs flex">
        <button
          onClick={() => setPhase('PRE')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            phase === 'PRE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {language === 'mr' ? '१. सत्राच्या आधी (पूर्व चाचणी / Pre-Test)' : '1. Pre-Session (Baseline)'}
        </button>
        <button
          onClick={() => setPhase('POST')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            phase === 'POST'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {language === 'mr' ? '२. सत्राच्या नंतर (उत्तर चाचणी / Post-Test)' : '2. Post-Session (Evaluation)'}
        </button>
      </div>

      {/* 3 Papers Tabs (MKMH, MMAT, ERT) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Paper 1: MKMH */}
        <button
          onClick={() => {
            setSelectedPaper('MKMH');
            setAnswers({});
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPaper === 'MKMH'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-blue-700 uppercase">चाचणी १ / Paper 1</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">माझे ज्ञान, माझे आरोग्य (MKMH)</h4>
          <p className="text-xs text-slate-500 mt-0.5">My Knowledge, My Health</p>
        </button>

        {/* Paper 2: MMAT */}
        <button
          onClick={() => {
            setSelectedPaper('MMAT');
            setAnswers({});
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPaper === 'MMAT'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-amber-700 uppercase">चाचणी २ / Paper 2</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">समज व गैरसमज (MMAT)</h4>
          <p className="text-xs text-slate-500 mt-0.5">Myths & Misconceptions</p>
        </button>

        {/* Paper 3: ERT */}
        <button
          onClick={() => {
            setSelectedPaper('ERT');
            setAnswers({});
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPaper === 'ERT'
              ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-purple-700 uppercase">चाचणी ३ / Paper 3</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">स्व-भावना नियमन (ERT)</h4>
          <p className="text-xs text-slate-500 mt-0.5">Emotional Regulation Test</p>
        </button>
      </div>

      {/* Main Data Entry Area: Student Selector on Left + Questions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student List Sidebar (Matching serial paper stack order) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {language === 'mr' ? 'विद्यार्थी निवडा (गठ्ठा क्रमाने)' : 'Select Student (Bundle Order)'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {schoolStudents.length} {language === 'mr' ? 'नोंदणीकृत' : 'enrolled'}
            </p>
          </div>

          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
            {schoolStudents.map((st) => {
              const isSelected = activeStudent?.id === st.id;
              const pair = assessmentPairs.find((p) => p.studentId === st.id && p.paperType === selectedPaper);
              const hasTakenPhase = phase === 'PRE' ? Boolean(pair?.preTest) : Boolean(pair?.postTest);

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStudentId(st.id);
                    setAnswers({});
                  }}
                  className={`w-full text-left p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-50/90 border-l-4 border-amber-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      S-{st.bundleSequenceNo}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block truncate">{st.fullName}</span>
                      <span className="text-[11px] text-slate-500">
                        {st.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा'} • {st.standard}-{st.division}
                      </span>
                    </div>
                  </div>

                  {hasTakenPhase && (
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question-by-Question Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                  S-{activeStudent?.bundleSequenceNo}
                </span>
                <h3 className="font-bold text-base text-slate-900">{activeStudent?.fullName}</h3>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {phase === 'PRE' ? 'सत्राच्या आधी (Pre-Test)' : 'सत्राच्या नंतर (Post-Test)'} • {selectedPaper}
              </span>
            </div>

            {/* Old App Bug Fix Banner */}
            <div className="flex items-center space-x-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'mr' ? 'पर्याय बदलता येतो / अनसिलेक्ट होतो' : 'Click to unselect / change freely'}</span>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-5 my-6">
            {paperQuestions.map((q) => {
              const selected = answers[q.id];

              return (
                <div key={q.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      <strong className="text-amber-800 mr-1.5 font-bold">प्र. {q.questionNumber}.</strong>
                      {language === 'mr' ? q.textMr : q.textEn}
                    </p>

                    {/* Clear button if selected */}
                    {selected && (
                      <button
                        onClick={() => handleSelectOption(q.id, selected)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center ml-2 cursor-pointer transition-colors"
                        title="Clear answer"
                      >
                        <RotateCcw className="w-3 h-3 mr-0.5" />
                        रद्द
                      </button>
                    )}
                  </div>

                  {/* 3 Radio Options */}
                  <div className="grid grid-cols-3 gap-2.5 mt-3.5">
                    {/* Option: बरोबर (Correct) */}
                    <button
                      type="button"
                      onClick={() => handleSelectOption(q.id, 'CORRECT')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selected === 'CORRECT'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'बरोबर' : 'Correct'}</span>
                    </button>

                    {/* Option: चूक (Wrong) */}
                    <button
                      type="button"
                      onClick={() => handleSelectOption(q.id, 'WRONG')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selected === 'WRONG'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'चूक' : 'Wrong'}</span>
                    </button>

                    {/* Option: माहित नाही (Don't Know) */}
                    <button
                      type="button"
                      onClick={() => handleSelectOption(q.id, 'DONT_KNOW')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selected === 'DONT_KNOW'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'माहित नाही' : "Don't Know"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {Object.keys(answers).length} / {paperQuestions.length}{' '}
              {language === 'mr' ? 'प्रश्नांची उत्तरे भरली' : 'questions answered'}
            </span>

            <div className="flex items-center space-x-3">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1 animate-pulse">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'mr' ? 'यशस्वीरित्या सेव्ह झाले!' : 'Saved successfully!'}</span>
                </span>
              )}
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'mr' ? 'सेव्ह करा' : 'Save Test Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
