import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolRegistrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addSchool, currentUser, organizations, language, financialYear } = useApp();

  const [organizationCode, setOrganizationCode] = useState(
    currentUser.organizationCode || (organizations[0]?.code || '')
  );
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Pune');
  const [taluka, setTaluka] = useState('Pune');
  const [district, setDistrict] = useState('Pune');
  const [pinCode, setPinCode] = useState('411030');
  const [programStartDate, setProgramStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [representativeName, setRepresentativeName] = useState('');
  const [representativeContact, setRepresentativeContact] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !representativeName.trim()) {
      alert(language === 'mr' ? 'कृपया सर्व आवश्यक माहिती भरा.' : 'Please fill all required fields.');
      return;
    }

    addSchool({
      name: name.trim(),
      financialYear,
      organizationCode,
      village: village.trim(),
      taluka: taluka.trim(),
      district: district.trim(),
      pinCode: pinCode.trim(),
      programStartDate,
      representativeName: representativeName.trim(),
      representativeContact: representativeContact.trim(),
      assignedTrainerId: currentUser.id,
      assignedTrainerName: currentUser.fullName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#233d76]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Trust Blue */}
        <div className="bg-[#233d76] px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <Building2 className="w-5 h-5 text-[#dfaf27]" />
            <h3 className="font-bold text-base">
              {language === 'mr' ? 'शाळा / संस्था नोंदणी' : 'School / Institute Registration'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Matching Page 104 in Old Manual) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Trainer & Organization Lineage Indicator */}
          <div className="bg-[#233d76]/5 border border-[#233d76]/20 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">
                {language === 'mr' ? 'नोंदणीकर्ता प्रशिक्षक:' : 'Field Trainer:'}
              </span>
              <span className="font-bold text-[#233d76]">{currentUser.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">
                {language === 'mr' ? 'संस्था:' : 'Organization:'}
              </span>
              <span className="font-bold text-slate-800">
                {organizations.find((o) => o.code === (currentUser.organizationCode || organizationCode))?.nameMr ||
                  (currentUser.organizationCode || 'TRST Direct')}
              </span>
            </div>
          </div>

          {/* Implementing Organization Assignment (dropdown shown if Admin or unassigned) */}
          {!currentUser.organizationCode && organizations.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'अंमलबजावणी संस्था' : 'Implementing Organization'}
              </label>
              <select
                value={organizationCode}
                onChange={(e) => setOrganizationCode(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-[#233d76] bg-slate-50 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
              >
                <option value="">{language === 'mr' ? '-- संस्था निवडा --' : '-- Select Organization --'}</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.code}>
                    {language === 'mr' ? org.nameMr : (org.nameEn || org.nameMr)} ({org.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'शाळा/संस्थेचे नाव *' : 'School Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'mr' ? 'उदा. शाळेचे नाव...' : 'e.g. School / Institution Name...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
              autoFocus
            />
          </div>

          {/* Location fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'गाव / शहर *' : 'Village / City *'}
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'तालुका *' : 'Taluka *'}
              </label>
              <input
                type="text"
                required
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'जिल्हा *' : 'District *'}
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'mr' ? 'पिन कोड *' : 'PIN Code *'}
              </label>
              <input
                type="text"
                required
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Program Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'उपक्रमाची सुरवात दिनांक *' : 'Program Start Date *'}
            </label>
            <input
              type="date"
              required
              value={programStartDate}
              onChange={(e) => setProgramStartDate(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* School Representative */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'शाळा/संस्थेच्या प्रतिनिधीचे नाव *' : 'School Representative Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'mr' ? 'उदा. पाटील मॅडम / जोशी सर' : 'e.g. Patil Madam'}
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
            />
          </div>

          {/* Representative Contact */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'प्रतिनिधी संपर्क क्रमांक' : 'POC Contact Number'}
            </label>
            <input
              type="tel"
              placeholder="+91 98220 00000"
              value={representativeContact}
              onChange={(e) => setRepresentativeContact(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#233d76] focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#233d76] hover:bg-[#1b2f5c] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#dfaf27]" />
              <span>{language === 'mr' ? 'सेव्ह करा' : 'Save School'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
