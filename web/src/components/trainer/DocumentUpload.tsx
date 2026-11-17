import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, Upload, FileText, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ onBack }) => {
  const { selectedSchool, language, currentUser } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';
  const [requestLetterUploaded, setRequestLetterUploaded] = useState(false);
  const [stampedSheetUploaded, setStampedSheetUploaded] = useState(false);

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

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
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
              {language === 'mr' ? 'कागदपत्रे अपलोड' : 'Documents Upload'}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedSchool.name} • {selectedSchool.village}
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines Banner (Matching Page 110 of Manual) */}
      <div className="bg-[#f0da9a]/30 border border-[#dfaf27]/50 rounded-2xl p-4 text-[#233d76] shadow-2xs">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#233d76] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>{language === 'mr' ? 'शाळेशी संबंधित कागदपत्रे: ' : 'Required Documents: '}</strong>
            {language === 'mr'
              ? '१. मुख्याध्यापकांना दिलेले सहीचे विनंती पत्र आणि २. नोंद वहीच्या शेवटच्या पानावर घेतलेला मुख्याध्यापकांचा अधिकृत सही-शिक्का असे दोन फोटो अपलोड करावेत.'
              : 'Upload two required proofs: 1. Signed request letter from Principal, 2. Final logbook page with official school seal and stamp.'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Document 1: Principal Request Letter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-[#233d76]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'mr' ? '१. मुख्याध्यापक विनंती पत्र' : '1. Principal Request Letter'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'mr' ? 'स्वाक्षरी असलेले पत्र' : 'Signed permission letter'}
              </p>
            </div>
          </div>

          {requestLetterUploaded ? (
            <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    {selectedSchool.name}_letter.jpg
                  </span>
                  <span className="text-[11px] text-emerald-700">अपलोड पूर्ण (Uploaded)</span>
                </div>
              </div>
              {!isTrustAdmin && (
                <button
                  onClick={() => setRequestLetterUploaded(false)}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  काढून टाका
                </button>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {isTrustAdmin
                  ? language === 'mr'
                    ? 'अद्याप संमतीपत्र अपलोड झालेले नाही'
                    : 'Awaiting permission letter upload'
                  : language === 'mr'
                  ? 'फोटो किंवा फाईल अपलोडसाठी क्लिक करा'
                  : 'Click to upload photo or PDF'}
              </p>
              {!isTrustAdmin && (
                <button
                  onClick={() => setRequestLetterUploaded(true)}
                  className="mt-3 text-xs bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                >
                  {language === 'mr' ? 'अपलोड करा' : 'Upload File'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Document 2: Stamped Completion Sheet */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5 text-[#233d76]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'mr' ? '२. मुख्याध्यापकांची सही व शिक्का' : '2. Official School Seal & Sign'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'mr' ? 'नोंद वहीच्या शेवटच्या पानावरील शिक्का' : 'Final logbook page with seal'}
              </p>
            </div>
          </div>

          {stampedSheetUploaded ? (
            <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    {selectedSchool.name}_stamp.jpg
                  </span>
                  <span className="text-[11px] text-emerald-700">अपलोड पूर्ण (Uploaded)</span>
                </div>
              </div>
              {!isTrustAdmin && (
                <button
                  onClick={() => setStampedSheetUploaded(false)}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  काढून टाका
                </button>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {isTrustAdmin
                  ? language === 'mr'
                    ? 'अद्याप सही-शिक्का पत्रक अपलोड झालेले नाही'
                    : 'Awaiting completion sheet upload'
                  : language === 'mr'
                  ? 'फोटो किंवा फाईल अपलोडसाठी क्लिक करा'
                  : 'Click to upload photo or PDF'}
              </p>
              {!isTrustAdmin && (
                <button
                  onClick={() => setStampedSheetUploaded(true)}
                  className="mt-3 text-xs bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                >
                  {language === 'mr' ? 'अपलोड करा' : 'Upload File'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
