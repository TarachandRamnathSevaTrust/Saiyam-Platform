import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../lib/api';
import { PaperType } from '@saiyam/shared';
import {
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Save,
  UserPlus,
  ArrowRight,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export const AssessmentDataEntry: React.FC<Props> = ({ onBack, onNavigate }) => {
  const {
    selectedSchool,
    setSelectedSchool,
    schools,
    students,
    questions,
    saveAssessmentSubmission,
    assessmentPairs,
    language,
    currentUser,
  } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  // Available schools for current user
  const availableSchools =
    currentUser.role === 'FIELD_TRAINER'
      ? schools.filter((s) => s.assignedTrainerId === currentUser.id || !s.assignedTrainerId)
      : schools;

  const activeSchool = selectedSchool || availableSchools[0] || null;

  // 1. Default to Paper 1 (MKMH) as expected by field trainers
  const [phase, setPhase] = useState<'PRE' | 'POST'>('PRE');
  const [selectedPaper, setSelectedPaper] = useState<PaperType>('MKMH');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Local state for answers being entered
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Student filter & search for easy navigation
  const [studentFilter, setStudentFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const schoolStudents = activeSchool
    ? students
        .filter((s) => s.schoolId === activeSchool.id)
        .sort((a, b) => a.bundleSequenceNo - b.bundleSequenceNo)
    : [];

  const activeStudent =
    schoolStudents.find((s) => s.id === selectedStudentId) || schoolStudents[0];
  const paperQuestions = questions.filter((q) => q.paperType === selectedPaper);

  const activePair = assessmentPairs.find(
    (p) => p.studentId === activeStudent?.id && p.paperType === selectedPaper
  );
  const savedRecord = phase === 'PRE' ? activePair?.preTest : activePair?.postTest;

  // Student stepper calculation (Sequential physical paper grading S-1, S-2...)
  const currentStudentIndex = activeStudent
    ? schoolStudents.findIndex((s) => s.id === activeStudent.id)
    : -1;
  const hasPrevStudent = currentStudentIndex > 0;
  const hasNextStudent =
    currentStudentIndex >= 0 && currentStudentIndex < schoolStudents.length - 1;
  const prevStudent = hasPrevStudent ? schoolStudents[currentStudentIndex - 1] : null;
  const nextStudent = hasNextStudent ? schoolStudents[currentStudentIndex + 1] : null;

  // Statistics per paper
  const getPaperStats = (pType: PaperType) => {
    const done = schoolStudents.filter((st) => {
      const pair = assessmentPairs.find(
        (p) => p.studentId === st.id && p.paperType === pType
      );
      return phase === 'PRE' ? Boolean(pair?.preTest) : Boolean(pair?.postTest);
    }).length;
    return { done, total: schoolStudents.length };
  };

  const mkmhStats = getPaperStats('MKMH');
  const mmatStats = getPaperStats('MMAT');
  const ertStats = getPaperStats('ERT');

  // Filtered student list for left sidebar
  const filteredStudents = schoolStudents.filter((st) => {
    const pair = assessmentPairs.find(
      (p) => p.studentId === st.id && p.paperType === selectedPaper
    );
    const isDone = phase === 'PRE' ? Boolean(pair?.preTest) : Boolean(pair?.postTest);

    if (studentFilter === 'PENDING' && isDone) return false;
    if (studentFilter === 'DONE' && !isDone) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = st.fullName.toLowerCase().includes(q);
      const matchesBundle =
        `s-${st.bundleSequenceNo}`.includes(q) || `${st.bundleSequenceNo}` === q;
      return matchesName || matchesBundle;
    }
    return true;
  });

  // Auto-populate saved answers whenever activeStudent, selectedPaper, phase, or assessmentPairs change
  useEffect(() => {
    if (!activeStudent) {
      setAnswers({});
      return;
    }

    // 1. Look in local assessmentPairs first for instant response
    const pair = assessmentPairs.find(
      (p) => p.studentId === activeStudent.id && p.paperType === selectedPaper
    );
    const record = phase === 'PRE' ? pair?.preTest : pair?.postTest;

    if (record?.responses && record.responses.length > 0) {
      const map: Record<string, string> = {};
      record.responses.forEach((r) => {
        if (r.selectedOptionCode) {
          map[r.questionId] = r.selectedOptionCode;
        }
      });
      setAnswers(map);
      return;
    }

    // 2. Query Supabase backend if not in memory
    if (apiService.isConnected()) {
      apiService
        .getStudentAssessmentResponses(activeStudent.id, selectedPaper, phase)
        .then((backendMap) => {
          if (backendMap && Object.keys(backendMap).length > 0) {
            setAnswers(backendMap);
          } else {
            setAnswers({});
          }
        })
        .catch(() => setAnswers({}));
    } else {
      setAnswers({});
    }
  }, [activeStudent?.id, selectedPaper, phase, assessmentPairs]);

  // Navigate directly to a student and scroll to top
  const goToStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSaveMessage(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStudent = () => {
    if (prevStudent) {
      goToStudent(prevStudent.id);
    }
  };

  const handleNextStudent = () => {
    if (nextStudent) {
      goToStudent(nextStudent.id);
    }
  };

  // Toggle answer selection (Clicking once selects; clicking again unselects it)
  const handleSelectOption = (questionId: string, optionCode: string) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      if (current === optionCode) {
        const copy = { ...prev };
        delete copy[questionId];
        return copy;
      }
      return { ...prev, [questionId]: optionCode };
    });
  };

  // Save handler with optional auto-advance to next student
  const handleSave = (advanceToNext: boolean = false) => {
    if (!activeStudent) return;

    const payload = paperQuestions.map((q) => ({
      questionId: q.id,
      questionNumber: q.questionNumber,
      selectedOptionCode: answers[q.id],
    }));

    saveAssessmentSubmission(activeStudent.id, selectedPaper, phase, payload);

    if (advanceToNext && nextStudent) {
      setSaveMessage(
        language === 'mr'
          ? `✓ S-${activeStudent.bundleSequenceNo} (${activeStudent.fullName}) सेव्ह झाले! आता पुढील विद्यार्थी S-${nextStudent.bundleSequenceNo} (${nextStudent.fullName}) चा पेपर समोर आहे.`
          : `✓ S-${activeStudent.bundleSequenceNo} (${activeStudent.fullName}) saved! Now grading S-${nextStudent.bundleSequenceNo} (${nextStudent.fullName}).`
      );
      setSelectedStudentId(nextStudent.id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setSaveMessage(
        language === 'mr'
          ? `✓ S-${activeStudent.bundleSequenceNo} (${activeStudent.fullName}) यशस्वीरित्या सेव्ह झाले!`
          : `✓ S-${activeStudent.bundleSequenceNo} (${activeStudent.fullName}) saved successfully!`
      );
    }

    setTimeout(() => {
      setSaveMessage(null);
    }, 4500);
  };

  const answeredCount = paperQuestions.filter((q) => Boolean(answers[q.id])).length;
  const currentPaperStats = getPaperStats(selectedPaper);

  if (!activeSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto shadow-2xs">
        <p className="text-slate-600 font-semibold mb-3">
          {language === 'mr' ? 'कोणतीही शाळा उपलब्ध नाही.' : 'No schools available.'}
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

  return (
    <div className="space-y-4 w-full">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'mr' ? 'विद्यार्थी चाचण्या नोंदणी (Pre / Post Tests)' : 'Pre & Post Assessments Entry'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-semibold">
                {activeSchool.name} • {activeSchool.village}
              </span>
              {availableSchools.length > 1 && (
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-400 font-medium">| {language === 'mr' ? 'शाळा बदला:' : 'Switch:'}</span>
                  <select
                    value={activeSchool.id}
                    onChange={(e) => {
                      const found = availableSchools.find((s) => s.id === e.target.value);
                      if (found) {
                        setSelectedSchool(found);
                        setSelectedStudentId('');
                        setAnswers({});
                      }
                    }}
                    className="text-[11px] font-bold bg-slate-50 hover:bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-[#233d76] cursor-pointer focus:ring-1 focus:ring-[#233d76]"
                  >
                    {availableSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.village})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Helper Pill */}
        <div className="inline-flex items-center space-x-1.5 text-xs text-[#233d76] bg-[#f0da9a]/40 px-3 py-1.5 rounded-full border border-[#dfaf27]/40 font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#dfaf27] shrink-0" />
          <span>
            {language === 'mr'
              ? 'बंडल क्रमानुसार (S-1, S-2...) सलग उत्तरे भरा'
              : 'Enter marks sequentially by physical bundle (S-1, S-2...)'}
          </span>
        </div>
      </div>

      {/* Field Trainer Workflow Box: 3 Simple Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
        {/* Step 1: Phase (Pre vs Post) */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-[#233d76] text-white text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {language === 'mr' ? 'पायरी १: चाचणीची वेळ निवडा' : 'Step 1: Select Assessment Phase'}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setPhase('PRE');
                setSaveMessage(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                phase === 'PRE'
                  ? 'bg-[#233d76] text-white border-[#233d76] shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm">
                  {language === 'mr' ? 'सत्राच्या आधी (पूर्व चाचणी)' : '1. Pre-Test (Baseline)'}
                </span>
                {phase === 'PRE' && <CheckCircle2 className="w-4 h-4 text-[#dfaf27]" />}
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  phase === 'PRE' ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {language === 'mr'
                  ? '२५ सत्रांची सुरुवात करण्यापूर्वी घेतलेली चाचणी'
                  : 'Administered before starting the 25 sessions'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPhase('POST');
                setSaveMessage(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                phase === 'POST'
                  ? 'bg-[#dfaf27] text-[#233d76] border-[#dfaf27] shadow-xs font-extrabold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm">
                  {language === 'mr' ? 'सत्राच्या नंतर (उत्तर चाचणी)' : '2. Post-Test (Outcome)'}
                </span>
                {phase === 'POST' && <CheckCircle2 className="w-4 h-4 text-[#233d76]" />}
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  phase === 'POST' ? 'text-[#233d76]/80 font-medium' : 'text-slate-500'
                }`}
              >
                {language === 'mr'
                  ? '२५ सत्रे पूर्ण झाल्यानंतर घेतलेली चाचणी'
                  : 'Administered after completing all 25 sessions'}
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Choose Paper (Default MKMH) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-[#233d76] text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {language === 'mr' ? 'पायरी २: चाचणी विषय निवडा' : 'Step 2: Choose Test Paper'}
              </label>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {language === 'mr'
                ? `निवडलेला विषय: ${selectedPaper}`
                : `Selected Paper: ${selectedPaper}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Paper 1: MKMH */}
            <button
              type="button"
              onClick={() => {
                setSelectedPaper('MKMH');
                setSaveMessage(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                selectedPaper === 'MKMH'
                  ? 'bg-[#f0da9a]/35 border-[#233d76] ring-2 ring-[#233d76]/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#233d76] uppercase tracking-wide">
                  {language === 'mr' ? 'चाचणी १ • MKMH' : 'Paper 1 • MKMH'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mkmhStats.done === mkmhStats.total && mkmhStats.total > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {mkmhStats.done}/{mkmhStats.total} {language === 'mr' ? 'पूर्ण' : 'Done'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                {language === 'mr' ? 'माझे ज्ञान, माझे आरोग्य चाचणी' : 'My Knowledge, My Health'}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {language === 'mr' ? '३ पर्याय • ३० प्रश्न' : '3 Options • 30 Questions'}
              </p>
            </button>

            {/* Paper 2: MMAT */}
            <button
              type="button"
              onClick={() => {
                setSelectedPaper('MMAT');
                setSaveMessage(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                selectedPaper === 'MMAT'
                  ? 'bg-[#f0da9a]/35 border-[#233d76] ring-2 ring-[#233d76]/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#233d76] uppercase tracking-wide">
                  {language === 'mr' ? 'चाचणी २ • MMAT' : 'Paper 2 • MMAT'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mmatStats.done === mmatStats.total && mmatStats.total > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {mmatStats.done}/{mmatStats.total} {language === 'mr' ? 'पूर्ण' : 'Done'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                {language === 'mr' ? 'व्यसनाधीनता समज व गैरसमज' : 'Myths & Misconceptions'}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {language === 'mr' ? '३ पर्याय • ३० प्रश्न' : '3 Options • 30 Questions'}
              </p>
            </button>

            {/* Paper 3: ERT */}
            <button
              type="button"
              onClick={() => {
                setSelectedPaper('ERT');
                setSaveMessage(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                selectedPaper === 'ERT'
                  ? 'bg-[#f0da9a]/35 border-[#233d76] ring-2 ring-[#233d76]/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#233d76] uppercase tracking-wide">
                  {language === 'mr' ? 'चाचणी ३ • ERT' : 'Paper 3 • ERT'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ertStats.done === ertStats.total && ertStats.total > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ertStats.done}/{ertStats.total} {language === 'mr' ? 'पूर्ण' : 'Done'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                {language === 'mr' ? 'स्व-भावना नियमन चाचणी' : 'Emotion Regulation Test'}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {language === 'mr' ? '४ पर्याय • १० प्रश्न' : '4 Options • 10 Questions'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Students List (Left) + Question Paper Stepper (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Student Roster Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-fit">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <span>{language === 'mr' ? 'विद्यार्थी यादी (बंडल क्रम)' : 'Student Bundle Roster'}</span>
              </h4>
              <span className="text-[11px] font-bold text-[#233d76] bg-[#f0da9a]/50 px-2 py-0.5 rounded">
                {currentPaperStats.done} / {currentPaperStats.total} {language === 'mr' ? 'पूर्ण' : 'Graded'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#233d76] h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    currentPaperStats.total > 0
                      ? (currentPaperStats.done / currentPaperStats.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={
                  language === 'mr'
                    ? 'विद्यार्थी नाव किंवा S-क्र. शोधा...'
                    : 'Search by name or S-number...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#233d76]"
              />
            </div>

            {/* Quick Filter Chips */}
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setStudentFilter('ALL')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                  studentFilter === 'ALL'
                    ? 'bg-[#233d76] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {language === 'mr' ? `सर्व (${schoolStudents.length})` : `All (${schoolStudents.length})`}
              </button>
              <button
                type="button"
                onClick={() => setStudentFilter('PENDING')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                  studentFilter === 'PENDING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {language === 'mr'
                  ? `शिल्लक (${schoolStudents.length - currentPaperStats.done})`
                  : `Pending (${schoolStudents.length - currentPaperStats.done})`}
              </button>
              <button
                type="button"
                onClick={() => setStudentFilter('DONE')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                  studentFilter === 'DONE'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {language === 'mr'
                  ? `पूर्ण (${currentPaperStats.done})`
                  : `Done (${currentPaperStats.done})`}
              </button>
            </div>
          </div>

          {/* Student List Items */}
          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
            {schoolStudents.length === 0 ? (
              <div className="p-6 text-center text-xs space-y-3">
                <p className="text-slate-500 font-medium">
                  {language === 'mr'
                    ? 'या शाळेत अद्याप विद्यार्थी नोंदवलेले नाहीत'
                    : 'No students registered for this school yet'}
                </p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('STUDENTS')}
                    className="inline-flex items-center space-x-1.5 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#dfaf27]" />
                    <span>{language === 'mr' ? 'विद्यार्थी नोंदणी करा' : 'Register Students'}</span>
                  </button>
                )}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {language === 'mr' ? 'कोणतेही विद्यार्थी आढळले नाहीत' : 'No matching students found'}
              </div>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = activeStudent?.id === st.id;
                const pair = assessmentPairs.find(
                  (p) => p.studentId === st.id && p.paperType === selectedPaper
                );
                const record = phase === 'PRE' ? pair?.preTest : pair?.postTest;
                const hasTaken = Boolean(record);

                return (
                  <button
                    key={st.id}
                    onClick={() => goToStudent(st.id)}
                    className={`w-full text-left p-3 flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#f0da9a]/30 border-l-4 border-[#233d76]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                          isSelected
                            ? 'bg-[#233d76] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        S-{st.bundleSequenceNo}
                      </span>
                      <div className="truncate">
                        <span
                          className={`text-xs block truncate ${
                            isSelected ? 'font-black text-[#233d76]' : 'font-bold text-slate-800'
                          }`}
                        >
                          {st.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {st.gender === 'FEMALE'
                            ? language === 'mr'
                              ? 'मुलगी'
                              : 'Female'
                            : language === 'mr'
                            ? 'मुलगा'
                            : 'Male'}
                          {record ? ` • ${record.scorePercentage}%` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {hasTaken ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'mr' ? 'पूर्ण' : 'Done'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{language === 'mr' ? 'शिल्लक' : 'Pending'}</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Question Paper & Sequential Stepper */}
        <div className="lg:col-span-8 space-y-4">
          {activeStudent ? (
            <>
              {/* Sequential Student Navigation Stepper (Essential for grading physical bundles) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Previous Student Button */}
                  <button
                    type="button"
                    disabled={!hasPrevStudent}
                    onClick={handlePrevStudent}
                    className={`w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      hasPrevStudent
                        ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                        : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>
                      {language === 'mr'
                        ? prevStudent
                          ? `मागील (S-${prevStudent.bundleSequenceNo})`
                          : 'मागील विद्यार्थी'
                        : prevStudent
                        ? `Prev (S-${prevStudent.bundleSequenceNo})`
                        : 'Previous'}
                    </span>
                  </button>

                  {/* Active Student Center Card & Dropdown */}
                  <div className="flex-1 text-center w-full sm:w-auto">
                    <div className="inline-flex items-center justify-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 max-w-full">
                      <span className="font-mono text-xs font-black bg-[#233d76] text-white px-2 py-0.5 rounded">
                        S-{activeStudent.bundleSequenceNo}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {activeStudent.fullName}
                      </h3>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        ({activeStudent.gender === 'FEMALE' ? (language === 'mr' ? 'मुलगी' : 'F') : (language === 'mr' ? 'मुलगा' : 'M')})
                      </span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 mt-1 text-[11px] text-slate-500">
                      <span>
                        {language === 'mr'
                          ? `विद्यार्थी ${currentStudentIndex + 1} / ${schoolStudents.length}`
                          : `Student ${currentStudentIndex + 1} of ${schoolStudents.length}`}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-[#233d76]">
                        {phase === 'PRE'
                          ? language === 'mr'
                            ? 'पूर्व चाचणी'
                            : 'Pre-Test'
                          : language === 'mr'
                          ? 'उत्तर चाचणी'
                          : 'Post-Test'}
                        {' '}({selectedPaper})
                      </span>
                    </div>
                  </div>

                  {/* Next Student Button */}
                  <button
                    type="button"
                    disabled={!hasNextStudent}
                    onClick={handleNextStudent}
                    className={`w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      hasNextStudent
                        ? 'border-slate-300 bg-white hover:bg-slate-50 text-[#233d76] cursor-pointer'
                        : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {language === 'mr'
                        ? nextStudent
                          ? `पुढील (S-${nextStudent.bundleSequenceNo})`
                          : 'पुढील विद्यार्थी'
                        : nextStudent
                        ? `Next (S-${nextStudent.bundleSequenceNo})`
                        : 'Next'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
              {saveMessage && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 text-xs font-bold flex items-center space-x-2.5 shadow-xs animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              {/* Previously Saved Status Banner */}
              {savedRecord && !saveMessage && (
                <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'mr'
                        ? `या विद्यार्थ्याची नोंद आधीच सेव्ह आहे: ${savedRecord.answeredCount}/${savedRecord.totalQuestions} उत्तरे • गुण: ${savedRecord.scorePercentage}%`
                        : `Saved assessment: ${savedRecord.answeredCount}/${savedRecord.totalQuestions} answered • Score: ${savedRecord.scorePercentage}%`}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded font-bold">
                    {language === 'mr' ? 'पुन्हा बदलू शकता' : 'Editable'}
                  </span>
                </div>
              )}

              {/* Questions Container */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
                {/* Questions Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#233d76]" />
                    <h3 className="font-bold text-sm text-slate-900">
                      {selectedPaper === 'MKMH' &&
                        (language === 'mr'
                          ? 'चाचणी १: माझे ज्ञान, माझे आरोग्य (MKMH)'
                          : 'Paper 1: My Knowledge, My Health (MKMH)')}
                      {selectedPaper === 'MMAT' &&
                        (language === 'mr'
                          ? 'चाचणी २: व्यसनाधीनता समज व गैरसमज (MMAT)'
                          : 'Paper 2: Myths & Misconceptions Test (MMAT)')}
                      {selectedPaper === 'ERT' &&
                        (language === 'mr'
                          ? 'चाचणी ३: स्व-भावना नियमन चाचणी (ERT)'
                          : 'Paper 3: Emotion Regulation Test (ERT)')}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-[#233d76] bg-[#f0da9a]/40 px-2.5 py-1 rounded-full border border-[#dfaf27]/40">
                      {answeredCount} / {paperQuestions.length}{' '}
                      {language === 'mr' ? 'उत्तरे नोंदवली' : 'answered'}
                    </span>
                  </div>
                </div>

                {/* Dynamic Questions List */}
                <div className="space-y-4">
                  {paperQuestions.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-full bg-[#f0da9a]/40 text-[#233d76] flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-[#233d76]" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {language === 'mr'
                          ? `${selectedPaper} चाचणीचे प्रश्न उपलब्ध नाहीत`
                          : `No questions found for ${selectedPaper}`}
                      </h4>
                    </div>
                  ) : (
                    paperQuestions.map((q) => {
                      const selectedCode = answers[q.id];

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                              <strong className="text-[#233d76] mr-1.5 font-bold">
                                {language === 'mr' ? `प्र. ${q.questionNumber}.` : `Q. ${q.questionNumber}.`}
                              </strong>
                              {language === 'mr' ? q.textMr : q.textEn}
                            </p>

                            {/* Clear/Unselect button */}
                            {selectedCode && (
                              <button
                                type="button"
                                onClick={() => handleSelectOption(q.id, selectedCode)}
                                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center ml-2 cursor-pointer transition-colors shrink-0"
                                title={language === 'mr' ? 'पर्याय रद्द करा' : 'Clear selection'}
                              >
                                <RotateCcw className="w-3 h-3 mr-0.5" />
                                {language === 'mr' ? 'रद्द' : 'Clear'}
                              </button>
                            )}
                          </div>

                          {/* Dynamic Option Buttons (Auto-adapts to 3 or 4 options) */}
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

                {/* Bottom Action Footer with "Save & Next Student" */}
                <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 text-center sm:text-left">
                    {isTrustAdmin
                      ? language === 'mr'
                        ? '👁️ विश्वस्त केवळ नोंदी तपासू शकतात (वाचन मोड)'
                        : '👁️ Trust Audit View: Inspection only (read-only mode)'
                      : language === 'mr'
                      ? 'विद्यार्थ्याने सोडवलेल्या प्रत्यक्ष उत्तरांची खात्री करून सेव्ह करा.'
                      : 'Verify student answers before saving.'}
                  </span>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
                    {!isTrustAdmin ? (
                      <>
                        {/* Secondary Button: Save Only */}
                        <button
                          type="button"
                          onClick={() => handleSave(false)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          <Save className="w-4 h-4 text-slate-500" />
                          <span>{language === 'mr' ? 'फक्त सेव्ह करा' : 'Save Only'}</span>
                        </button>

                        {/* Primary Button: Save & Next Student (Sequence Friendly) */}
                        {hasNextStudent && nextStudent ? (
                          <button
                            type="button"
                            onClick={() => handleSave(true)}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <Save className="w-4 h-4 text-[#dfaf27]" />
                            <span>
                              {language === 'mr'
                                ? `सेव्ह करा व पुढील विद्यार्थी (S-${nextStudent.bundleSequenceNo}) →`
                                : `Save & Next Student (S-${nextStudent.bundleSequenceNo}) →`}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSave(false)}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-[#dfaf27]" />
                            <span>
                              {language === 'mr'
                                ? 'सेव्ह करा (शेवटचा विद्यार्थी) ✓'
                                : 'Save Final Student ✓'}
                            </span>
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs bg-[#f0da9a]/60 text-[#233d76] font-extrabold px-4 py-2 rounded-xl border border-[#dfaf27]/40">
                        {language === 'mr' ? 'केवळ वाचन मोड' : 'Audit View Only'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-12 text-center text-slate-400 text-xs">
              {language === 'mr' ? 'डावीकडून विद्यार्थी निवडा' : 'Select a student on the left'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Link to Sessions */}
      {onNavigate && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 gap-3">
          <span className="text-xs text-slate-500">
            {language === 'mr'
              ? 'चाचण्या नोंदवल्यानंतर २५ सत्रांची नोंद करा'
              : 'After recording assessment tests, proceed to log the 25 sessions'}
          </span>
          <button
            onClick={() => onNavigate('SESSIONS')}
            className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>{language === 'mr' ? '२५ सत्र नोंदींकडे जा →' : '25 Session Logs →'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
