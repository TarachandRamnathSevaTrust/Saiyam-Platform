import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, Calendar, MapPin, User, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolRegistrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addSchool, currentUser, language } = useApp();

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
      name,
      village,
      taluka,
      district,
      pinCode,
      programStartDate,
      representativeName,
      representativeContact,
      assignedTrainerId: currentUser.id,
      assignedTrainerName: currentUser.fullName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-lg">
              {language === 'mr' ? 'शाळा / संस्था नोंदणी' : 'Register School / Institute'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-lg hover:bg-amber-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'शाळा/संस्थेचे नाव *' : 'School Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'mr' ? 'उदा. हुजूरपागा शाळा' : 'e.g. Hujurpaga High School'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* School Representative */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'mr' ? 'शाळा/संस्थेच्या प्रतिनिधीचे नाव *' : 'School Representative / POC Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'mr' ? 'उदा. पाटील मॅडम / जोशी सर' : 'e.g. Patil Madam'}
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'mr' ? 'सेव्ह करा' : 'Save School'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
