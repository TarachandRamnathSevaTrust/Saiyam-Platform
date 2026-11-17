import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, Upload, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DocumentUpload: React.FC = () => {
  const { selectedSchool, language } = useApp();

  const [requestLetterUploaded, setRequestLetterUploaded] = useState(true);
  const [stampedSheetUploaded, setStampedSheetUploaded] = useState(true);

  if (!selectedSchool) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-500">
          {language === 'mr' ? 'कृपया आधी शाळा निवडा.' : 'Please select a school first.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Guidelines Banner (Matching Page 110 of Manual) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 text-amber-900 shadow-2xs">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">
              {language === 'mr' ? 'कागदपत्रे अपलोड (शाळा अधिकृत पुरावे)' : 'Official School Document Verification'}
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              {language === 'mr'
                ? 'शाळेशी संबंधित दोन महत्त्वाची कागदपत्रे अपलोड करावीत: १. मुख्याध्यापकांना दिलेले सहीचे विनंती पत्र, २. नोंद वहीच्या शेवटच्या पानावर घेतलेला मुख्याध्यापकांचा अधिकृत सही-शिक्का.'
                : 'Upload two required school proofs: 1. Headmaster signed program request letter, 2. Final session logbook sheet bearing official school stamp & signature.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document 1: Principal Request Letter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'mr' ? '१. मुख्याध्यापक विनंती पत्र' : '1. Headmaster Request Letter'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr' ? 'मुख्याध्यापकांची स्वाक्षरी असलेले पत्र' : 'Signed permission letter'}
              </p>
            </div>
          </div>

          {requestLetterUploaded ? (
            <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    hujurpaga_principal_signed_letter.pdf
                  </span>
                  <span className="text-[11px] text-emerald-700">अपलोड पूर्ण (Verified) • 1.2 MB</span>
                </div>
              </div>
              <button
                onClick={() => alert(language === 'mr' ? 'कागदपत्र तपासले जात आहे.' : 'Viewing document')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                पहा (View)
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">फोटो किंवा PDF निवडा</p>
              <button
                onClick={() => setRequestLetterUploaded(true)}
                className="mt-3 text-xs bg-amber-600 text-white font-bold py-1.5 px-4 rounded-lg cursor-pointer"
              >
                अपलोड करा
              </button>
            </div>
          )}
        </div>

        {/* Document 2: Stamped Completion Sheet */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'mr' ? '२. शाळेचा सही व शिक्का पत्रक' : '2. Official Stamped Sheet'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr' ? 'सत्र समाप्तीचा शाळेचा अधिकृत शिक्का' : 'School official seal & sign'}
              </p>
            </div>
          </div>

          {stampedSheetUploaded ? (
            <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    hujurpaga_school_official_stamp.jpg
                  </span>
                  <span className="text-[11px] text-emerald-700">अपलोड पूर्ण (Verified) • 2.4 MB</span>
                </div>
              </div>
              <button
                onClick={() => alert(language === 'mr' ? 'कागदपत्र तपासले जात आहे.' : 'Viewing document')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                पहा (View)
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">फोटो किंवा PDF निवडा</p>
              <button
                onClick={() => setStampedSheetUploaded(true)}
                className="mt-3 text-xs bg-amber-600 text-white font-bold py-1.5 px-4 rounded-lg cursor-pointer"
              >
                अपलोड करा
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
