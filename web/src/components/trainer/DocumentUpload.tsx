import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../lib/api';
import { SchoolDocument } from '@saiyam/shared';
import {
  FileCheck,
  Upload,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Trash2,
  Eye,
  X,
  Loader2,
  Sparkles,
  Building2,
} from 'lucide-react';

interface Props {
  onBack?: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ onBack }) => {
  const { selectedSchool, setSelectedSchool, schools, language, currentUser } = useApp();

  const isTrustAdmin = currentUser.role === 'TRUST_ADMIN';

  // Available schools for current user
  const availableSchools =
    currentUser.role === 'FIELD_TRAINER'
      ? schools.filter((s) => s.assignedTrainerId === currentUser.id || !s.assignedTrainerId)
      : schools;

  const activeSchool = selectedSchool || availableSchools[0] || null;

  // Documents state for active school
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<SchoolDocument | null>(null);

  // Hidden native file input references (triggers real file selector!)
  const requestLetterInputRef = useRef<HTMLInputElement>(null);
  const stampedSheetInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents whenever activeSchool changes
  useEffect(() => {
    if (!activeSchool) {
      setDocuments([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    if (apiService.isConnected()) {
      apiService
        .getSchoolDocuments(activeSchool.id)
        .then((backendDocs) => {
          if (isMounted) {
            setDocuments(backendDocs || []);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.warn('Failed to load school documents:', err);
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [activeSchool?.id]);

  // Compress image helper using canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Real native file upload handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'REQUEST_LETTER' | 'STAMPED_COMPLETION_SHEET',
    defaultTitle: string
  ) => {
    if (isTrustAdmin || !activeSchool) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingType(docType);

    try {
      let fileUrl = '';
      if (file.type.startsWith('image/')) {
        fileUrl = await compressImage(file);
      } else {
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      if (!fileUrl) {
        alert(language === 'mr' ? 'फाईल वाचण्यात त्रुटी आली.' : 'Failed to read file.');
        setUploadingType(null);
        return;
      }

      const newDoc: SchoolDocument = {
        id: `doc-${Date.now()}`,
        schoolId: activeSchool.id,
        financialYear: activeSchool.financialYear || '2025-26',
        documentType: docType,
        title: file.name || defaultTitle,
        fileUrl,
        fileSizeBytes: file.size,
        uploadedBy: currentUser.id,
        uploadedAt: new Date().toISOString(),
      };

      // Optimistic update
      setDocuments((prev) => [
        ...prev.filter((d) => d.documentType !== docType),
        newDoc,
      ]);

      // Sync to Supabase
      if (apiService.isConnected()) {
        await apiService.saveSchoolDocument({
          schoolId: activeSchool.id,
          financialYear: activeSchool.financialYear || '2025-26',
          documentType: docType,
          title: file.name || defaultTitle,
          fileUrl,
          fileSizeBytes: file.size,
          uploadedBy: currentUser.id,
        });
      }
    } catch (err) {
      console.warn('Failed to upload document:', err);
      alert(language === 'mr' ? 'कागदपत्र अपलोड अयशस्वी.' : 'Document upload failed.');
    } finally {
      setUploadingType(null);
      e.target.value = '';
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (docType: 'REQUEST_LETTER' | 'STAMPED_COMPLETION_SHEET') => {
    if (isTrustAdmin || !activeSchool) return;

    const confirmMsg =
      language === 'mr'
        ? 'तुम्हाला हे कागदपत्र काढून टाकायचे आहे का?'
        : 'Are you sure you want to remove this document?';

    if (!window.confirm(confirmMsg)) return;

    setDocuments((prev) => prev.filter((d) => d.documentType !== docType));

    if (apiService.isConnected()) {
      await apiService.deleteSchoolDocument(activeSchool.id, docType);
    }
  };

  const letterDoc = documents.find((d) => d.documentType === 'REQUEST_LETTER');
  const stampDoc = documents.find((d) => d.documentType === 'STAMPED_COMPLETION_SHEET');

  if (!activeSchool) {
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Hidden Native File Inputs */}
      <input
        ref={requestLetterInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) =>
          handleFileUpload(
            e,
            'REQUEST_LETTER',
            language === 'mr' ? 'मुख्याध्यापक विनंती पत्र' : 'Principal Request Letter'
          )
        }
      />
      <input
        ref={stampedSheetInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) =>
          handleFileUpload(
            e,
            'STAMPED_COMPLETION_SHEET',
            language === 'mr' ? 'मुख्याध्यापक सही व शिक्का' : 'Official School Seal & Sign'
          )
        }
      />

      {/* Top Header & School Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
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
              {language === 'mr' ? 'शाळा कागदपत्रे अपलोड (Documents)' : 'School Documents Upload'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeSchool.name} • {activeSchool.village}
            </p>
          </div>
        </div>

        {/* School Selector Dropdown */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-[#233d76]" />
            <span>{language === 'mr' ? 'शाळा निवडा:' : 'Select School:'}</span>
          </label>
          <select
            value={activeSchool.id}
            onChange={(e) => {
              const found = availableSchools.find((s) => s.id === e.target.value);
              if (found) setSelectedSchool(found);
            }}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-[#233d76] focus:ring-2 focus:ring-[#233d76] cursor-pointer"
          >
            {availableSchools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.village})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guidelines Banner (Matching Page 110 of Saiyam Manual) */}
      <div className="bg-[#f0da9a]/30 border border-[#dfaf27]/50 rounded-2xl p-4 text-[#233d76] shadow-2xs">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#233d76] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>{language === 'mr' ? 'शाळेशी संबंधित कागदपत्रे: ' : 'Required Documents: '}</strong>
            {language === 'mr'
              ? '१. मुख्याध्यापकांना दिलेले सहीचे विनंती पत्र आणि २. नोंद वहीच्या शेवटच्या पानावर घेतलेला मुख्याध्यापकांचा अधिकृत सही-शिक्का असे दोन अधिकृत पुरावे अपलोड करावेत.'
              : 'Upload two required proofs: 1. Signed request letter from Principal, 2. Final logbook page with official school seal and stamp.'}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 text-[#233d76] animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-500 font-semibold">
            {language === 'mr' ? 'कागदपत्रे लोड होत आहेत...' : 'Loading documents...'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Document 1: Principal Request Letter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5 text-[#233d76]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'mr' ? '१. मुख्याध्यापक विनंती पत्र' : '1. Principal Request Letter'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'mr'
                      ? 'मुख्याध्यापकांची स्वाक्षरी असलेले पत्र'
                      : 'Signed permission letter from Principal'}
                  </p>
                </div>
              </div>

              {letterDoc ? (
                <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-900 block truncate">
                          {letterDoc.title}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-emerald-700 mt-0.5">
                          {letterDoc.fileSizeBytes && (
                            <span>{formatFileSize(letterDoc.fileSizeBytes)}</span>
                          )}
                          <span>•</span>
                          <span>{formatDate(letterDoc.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded shrink-0">
                      {language === 'mr' ? 'अपलोड पूर्ण' : 'Uploaded'}
                    </span>
                  </div>

                  {/* Thumbnail Preview if Image */}
                  {letterDoc.fileUrl && letterDoc.fileUrl.startsWith('data:image') && (
                    <div
                      onClick={() => setPreviewDoc(letterDoc)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-emerald-200 max-h-36 bg-slate-900/5 group relative"
                    >
                      <img
                        src={letterDoc.fileUrl}
                        alt="Letter Preview"
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{language === 'mr' ? 'मोठे करून पहा' : 'Click to View'}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(letterDoc)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#233d76] hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'पहा (Preview)' : 'Preview'}</span>
                    </button>

                    {!isTrustAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('REQUEST_LETTER')}
                        className="inline-flex items-center space-x-1 text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'काढून टाका' : 'Remove'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (!isTrustAdmin && uploadingType !== 'REQUEST_LETTER') {
                      requestLetterInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-all ${
                    !isTrustAdmin
                      ? 'hover:border-[#233d76] hover:bg-slate-50 cursor-pointer'
                      : 'bg-slate-50'
                  }`}
                >
                  {uploadingType === 'REQUEST_LETTER' ? (
                    <div className="space-y-2">
                      <Loader2 className="w-8 h-8 mx-auto text-[#233d76] animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">
                        {language === 'mr' ? 'अपलोड होत आहे...' : 'Uploading file...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {isTrustAdmin
                          ? language === 'mr'
                            ? 'अद्याप संमतीपत्र अपलोड झालेले नाही'
                            : 'Awaiting permission letter upload'
                          : language === 'mr'
                          ? 'फोटो किंवा PDF निवडण्यासाठी येथे क्लिक करा'
                          : 'Click to choose photo or PDF'}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        JPG, PNG, PDF (कमाल 5 MB)
                      </span>
                      {!isTrustAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestLetterInputRef.current?.click();
                          }}
                          className="mt-3 inline-flex items-center space-x-1.5 text-xs bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#dfaf27]" />
                          <span>{language === 'mr' ? 'फाईल निवडा' : 'Choose File'}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Document 2: Stamped Completion Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#dfaf27]/20 text-[#233d76] flex items-center justify-center font-bold shrink-0">
                  <FileCheck className="w-5 h-5 text-[#233d76]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'mr' ? '२. मुख्याध्यापकांची सही व शिक्का' : '2. Official School Seal & Sign'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'mr'
                      ? 'नोंद वहीच्या शेवटच्या पानावरील शिक्का'
                      : 'Final logbook page with official seal'}
                  </p>
                </div>
              </div>

              {stampDoc ? (
                <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-900 block truncate">
                          {stampDoc.title}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-emerald-700 mt-0.5">
                          {stampDoc.fileSizeBytes && (
                            <span>{formatFileSize(stampDoc.fileSizeBytes)}</span>
                          )}
                          <span>•</span>
                          <span>{formatDate(stampDoc.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded shrink-0">
                      {language === 'mr' ? 'अपलोड पूर्ण' : 'Uploaded'}
                    </span>
                  </div>

                  {/* Thumbnail Preview if Image */}
                  {stampDoc.fileUrl && stampDoc.fileUrl.startsWith('data:image') && (
                    <div
                      onClick={() => setPreviewDoc(stampDoc)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-emerald-200 max-h-36 bg-slate-900/5 group relative"
                    >
                      <img
                        src={stampDoc.fileUrl}
                        alt="Stamp Preview"
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{language === 'mr' ? 'मोठे करून पहा' : 'Click to View'}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(stampDoc)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#233d76] hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'mr' ? 'पहा (Preview)' : 'Preview'}</span>
                    </button>

                    {!isTrustAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('STAMPED_COMPLETION_SHEET')}
                        className="inline-flex items-center space-x-1 text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'काढून टाका' : 'Remove'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (!isTrustAdmin && uploadingType !== 'STAMPED_COMPLETION_SHEET') {
                      stampedSheetInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-all ${
                    !isTrustAdmin
                      ? 'hover:border-[#233d76] hover:bg-slate-50 cursor-pointer'
                      : 'bg-slate-50'
                  }`}
                >
                  {uploadingType === 'STAMPED_COMPLETION_SHEET' ? (
                    <div className="space-y-2">
                      <Loader2 className="w-8 h-8 mx-auto text-[#233d76] animate-spin" />
                      <p className="text-xs font-semibold text-slate-700">
                        {language === 'mr' ? 'अपलोड होत आहे...' : 'Uploading file...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {isTrustAdmin
                          ? language === 'mr'
                            ? 'अद्याप सही-शिक्का पत्रक अपलोड झालेले नाही'
                            : 'Awaiting completion sheet upload'
                          : language === 'mr'
                          ? 'फोटो किंवा PDF निवडण्यासाठी येथे क्लिक करा'
                          : 'Click to choose photo or PDF'}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        JPG, PNG, PDF (कमाल 5 MB)
                      </span>
                      {!isTrustAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            stampedSheetInputRef.current?.click();
                          }}
                          className="mt-3 inline-flex items-center space-x-1.5 text-xs bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#dfaf27]" />
                          <span>{language === 'mr' ? 'फाईल निवडा' : 'Choose File'}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{previewDoc.title}</h4>
                <p className="text-[11px] text-slate-500">
                  {activeSchool.name} • {formatDate(previewDoc.uploadedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
              {previewDoc.fileUrl.startsWith('data:image') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-[70vh] object-contain rounded-lg shadow-xs"
                />
              ) : previewDoc.fileUrl.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title={previewDoc.title}
                  className="w-full h-[65vh] rounded-lg border border-slate-200"
                />
              ) : (
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#233d76] hover:underline p-4 bg-white rounded-xl shadow-xs"
                >
                  {language === 'mr' ? 'कागदपत्र नवीन टॅबमध्ये उघडा' : 'Open Document in New Tab'}
                </a>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-xs font-bold bg-[#233d76] text-white px-4 py-2 rounded-xl cursor-pointer"
              >
                {language === 'mr' ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
