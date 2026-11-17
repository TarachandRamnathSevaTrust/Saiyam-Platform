import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaperType } from '@saiyam/shared';
import {
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Save,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const AssessmentDataEntry: React.FC<Props> = ({ onBack }) => {
  const {
    selectedSchool,
    students,
    questions,
    saveAssessmentSubmission,
    assessmentPairs,
    language,
    currentUser,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  const [phase, setPhase] = useState<'PRE' | 'POST'>('PRE');
  const [selectedPaper, setSelectedPaper] = useState<PaperType>('MMAT');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Local state for answers being entered
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

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
            ← शाळा निवडा (Back to Schools)
          </button>
        )}
      </div>
    );
  }

  const schoolStudents = students
    .filter((s) => s.schoolId === selectedSchool.id)
    .sort((a, b) => a.bundleSequenceNo - b.bundleSequenceNo);

  const activeStudent =
    schoolStudents.find((s) => s.id === selectedStudentId) || schoolStudents[0];
  const paperQuestions = questions.filter((q) => q.paperType === selectedPaper);

  // Toggle answer selection (Clicking once selects; clicking again UNSELECTS it!)
  const handleSelectOption = (questionId: string, optionCode: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      if (current === optionCode) {
        // Unselect (clear back to blank)
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      }
      return { ...prev, [questionId]: optionCode };
    });
  };

  const handleSave = () => {
    if (!activeStudent) return;

    const payload = paperQuestions.map((q) => ({
      questionId: q.id,
      questionNumber: q.questionNumber,
      selectedOptionCode: answers[q.id],
    }));

    saveAssessmentSubmission(activeStudent.id, selectedPaper, phase, payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Header & Back Button */}
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
              {language === 'mr' ? 'पूर्व / उत्तर चाचण्या (चाचणी काम)' : 'Pre & Post Assessments'}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedSchool.name} • {selectedSchool.village}
            </p>
          </div>
        </div>

        {/* Bug Fix Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#233d76] bg-[#f0da9a]/50 px-3 py-1 rounded-full border border-[#dfaf27]/40 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#dfaf27]" />
          <span>{language === 'mr' ? 'क्लिक करून पर्याय बदलावा किंवा रद्द करावा' : 'Click to unselect / change freely'}</span>
        </div>
      </div>

      {/* Phase Switcher (सत्राच्या आधी vs सत्राच्या नंतर from Page 106 of Manual) */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex">
        <button
          onClick={() => {
            setPhase('PRE');
            setAnswers({});
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            phase === 'PRE'
              ? 'bg-[#233d76] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {language === 'mr' ? 'सत्राच्या आधी (पूर्व चाचणी)' : '1. Pre-Test (Baseline)'}
        </button>
        <button
          onClick={() => {
            setPhase('POST');
            setAnswers({});
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            phase === 'POST'
              ? 'bg-[#dfaf27] text-[#233d76] shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {language === 'mr' ? 'सत्राच्या नंतर (उत्तर चाचणी)' : '2. Post-Test (Outcome)'}
        </button>
      </div>

      {/* 3 Papers Tabs (Matching Page 106 in Manual) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Paper 1: MKMH */}
        <button
          onClick={() => {
            setSelectedPaper('MKMH');
            setAnswers({});
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPaper === 'MKMH'
              ? 'bg-[#f0da9a]/30 border-[#233d76] ring-2 ring-[#233d76]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-[#233d76] uppercase">चाचणी १ / Paper 1</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">माझे ज्ञान, माझे आरोग्य चाचणी</h4>
          <span className="text-[10px] text-slate-500 block mt-1">३ पर्याय: बरोबर / चूक / माहीत नाही</span>
        </button>

        {/* Paper 2: MMAT */}
        <button
          onClick={() => {
            setSelectedPaper('MMAT');
            setAnswers({});
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPaper === 'MMAT'
              ? 'bg-[#f0da9a]/30 border-[#233d76] ring-2 ring-[#233d76]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-[#233d76] uppercase">चाचणी २ / Paper 2</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">व्यसनाधीनता समज व गैरसमज</h4>
          <span className="text-[10px] text-slate-500 block mt-1">३ पर्याय: बरोबर / चूक / सांगता येत नाही</span>
        </button>

        {/* Paper 3: ERT */}
        <button
          onClick={() => {
            setSelectedPaper('ERT');
            setAnswers({});
          }}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedPaper === 'ERT'
              ? 'bg-[#f0da9a]/30 border-[#233d76] ring-2 ring-[#233d76]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-[#233d76] uppercase">चाचणी ३ / Paper 3</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">स्व-भावना नियमन चाचणी</h4>
          <span className="text-[10px] text-slate-500 block mt-1">४ पर्याय: नेहमी / बऱ्याच वेळा / कधी कधी / कधीच नाही</span>
        </button>
      </div>

      {/* Main Screen: Student List on Left + Questions on Right (Matching Page 107 of Old App) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Students Sidebar (Sequential Order S-1, S-2...) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {language === 'mr' ? 'विद्यार्थी निवडा (क्रमाने)' : 'Select Student (By Bundle)'}
            </h4>
          </div>

          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
            {schoolStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {language === 'mr' ? 'अद्याप विद्यार्थी नोंदवले नाहीत' : 'No students found'}
              </div>
            ) : (
              schoolStudents.map((st) => {
                const isSelected = activeStudent?.id === st.id;
                const pair = assessmentPairs.find(
                  (p) => p.studentId === st.id && p.paperType === selectedPaper
                );
                const hasTaken =
                  phase === 'PRE' ? Boolean(pair?.preTest) : Boolean(pair?.postTest);

                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      setAnswers({});
                    }}
                    className={`w-full text-left p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#f0da9a]/40 border-l-4 border-[#233d76]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold bg-[#233d76] text-white px-2 py-0.5 rounded">
                        S-{st.bundleSequenceNo}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {st.fullName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {st.gender === 'FEMALE' ? 'मुलगी' : 'मुलगा'}
                        </span>
                      </div>
                    </div>

                    {hasTaken ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Question Answering View (Matching Page 107 of Old App) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          {activeStudent ? (
            <>
              {/* Active Student Top Info */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-[#233d76] text-white px-2.5 py-0.5 rounded">
                      S-{activeStudent.bundleSequenceNo}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{activeStudent.fullName}</h3>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {phase === 'PRE' ? 'सत्राच्या आधी (Pre-Test)' : 'सत्राच्या नंतर (Post-Test)'} • {selectedPaper}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#233d76]">
                    {Object.keys(answers).length} / {paperQuestions.length} उत्तर दिले
                  </span>
                </div>
              </div>

              {/* Dynamic Question List */}
              <div className="space-y-5 my-6">
                {paperQuestions.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-[#f0da9a]/40 text-[#233d76] flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-[#233d76]" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {language === 'mr'
                        ? `${selectedPaper} चाचणीचे प्रश्न लोड होण्याची प्रतीक्षा आहे`
                        : `Awaiting official ${selectedPaper} questions`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      {language === 'mr'
                        ? 'TRST शैक्षणिक टीमकडून अधिकृत ~९० प्रश्न व गुणांकन (marks weightage) प्राप्त झाल्यानंतर ते येथे थेट दिसतील. सिस्टिममध्ये कोणताही डमी प्रश्न भरला जाणार नाही.'
                        : 'Once official questions and marks weightage are loaded from the TRST team, they will appear here dynamically. No synthetic questions are populated.'}
                    </p>
                  </div>
                ) : (
                  paperQuestions.map((q) => {
                    const selectedCode = answers[q.id];

                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            <strong className="text-[#233d76] mr-1.5 font-bold">
                              प्र. {q.questionNumber}.
                            </strong>
                            {language === 'mr' ? q.textMr : q.textEn}
                          </p>

                          {/* Clear/Unselect button */}
                          {selectedCode && (
                            <button
                              onClick={() => handleSelectOption(q.id, selectedCode)}
                              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center ml-2 cursor-pointer transition-colors"
                              title="पर्याय रद्द करा (Clear)"
                            >
                              <RotateCcw className="w-3 h-3 mr-0.5" />
                              रद्द
                            </button>
                          )}
                        </div>

                        {/* Dynamic Option Buttons (Auto-adapts to 3 or 4 options!) */}
                        <div
                          className={`grid gap-2.5 mt-3.5 ${
                            q.options.length === 4
                              ? 'grid-cols-2 sm:grid-cols-4'
                              : 'grid-cols-3'
                          }`}
                        >
                          {q.options.map((opt) => {
                            const isOptSelected = selectedCode === opt.code;

                            return (
                              <button
                                key={opt.code}
                                type="button"
                                disabled={isTrustAdmin}
                                onClick={() => handleSelectOption(q.id, opt.code)}
                                className={`py-2 px-2.5 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                                  isTrustAdmin ? 'cursor-default' : 'cursor-pointer'
                                } ${
                                  isOptSelected
                                    ? 'bg-[#233d76] text-white border-[#233d76] shadow-xs ring-2 ring-[#233d76]/20'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-[#f0da9a]/30'
                                }`}
                              >
                                <span>{language === 'mr' ? opt.labelMr : opt.labelEn}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Save Button Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {isTrustAdmin
                    ? language === 'mr'
                      ? '👁️ विश्वस्त केवळ नोंदी तपासू शकतात (नोंदी बदलता येत नाहीत)'
                      : '👁️ Trust Audit View: Inspection only (read-only mode)'
                    : language === 'mr'
                    ? 'विद्यार्थ्याने सोडवलेल्या उत्तरांची नोंद तपासा'
                    : 'Verify student answers before saving'}
                </span>

                <div className="flex items-center space-x-3">
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1 animate-pulse">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'mr' ? 'यशस्वीरित्या सेव्ह झाले!' : 'Saved successfully!'}</span>
                    </span>
                  )}
                  {!isTrustAdmin ? (
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#dfaf27]" />
                      <span>{language === 'mr' ? 'सेव्ह करा' : 'Save Test Data'}</span>
                    </button>
                  ) : (
                    <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-extrabold px-4 py-2 rounded-xl border border-[#dfaf27]/40">
                      {language === 'mr' ? 'केवळ वाचन (Read-Only)' : 'Audit View Only'}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              {language === 'mr' ? 'डावीकडून विद्यार्थी निवडा' : 'Select a student on the left'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
