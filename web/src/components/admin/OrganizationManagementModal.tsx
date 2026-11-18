import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, Plus, Check, ShieldCheck, Phone, Mail, User, Layers, Trash2 } from 'lucide-react';
import { Organization } from '@saiyam/shared';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { organizations, addOrganization, deleteOrganization, schools, language } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [orgType, setOrgType] = useState<Organization['orgType']>('PARTNER_NGO');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert(language === 'mr' ? 'कृपया संस्थेचे नाव आणि कोड प्रविष्ट करा.' : 'Please enter organization name and code.');
      return;
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');

    addOrganization({
      code: cleanCode,
      nameMr: name.trim(),
      nameEn: name.trim(),
      orgType,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      description: description.trim(),
    });

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);

    // Reset form
    setName('');
    setCode('');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#233d76]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#233d76] px-6 py-4 text-white flex justify-between items-center border-b-2 border-[#dfaf27]">
          <div className="flex items-center space-x-2.5">
            <Building2 className="w-5 h-5 text-[#dfaf27]" />
            <div>
              <h3 className="font-bold text-base trust-heading">
                {language === 'mr' ? 'संस्था व्यवस्थापन' : 'Organization Management'}
              </h3>
              <p className="text-[11px] text-[#f0da9a]">
                {language === 'mr' ? 'TRST द्वारे सर्व भागीदार संस्थांचे थेट नियंत्रण' : 'Fully dynamic organization registry managed by TRST'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {language === 'mr' ? 'नोंदणीकृत संस्था यादी' : 'Registered Organizations'}
              </h4>
              <p className="text-xs text-slate-500">
                {organizations.length} {language === 'mr' ? 'संस्था सक्रिय' : 'active organizations'}
              </p>
            </div>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isAdding ? (language === 'mr' ? 'रद्द करा' : 'Cancel') : (language === 'mr' ? 'नवीन संस्था जोडा' : 'Add Organization')}</span>
            </button>
          </div>

          {/* Add New Organization Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                <Plus className="w-4 h-4 text-[#233d76]" />
                <h5 className="font-bold text-xs text-[#233d76] uppercase tracking-wider">
                  {language === 'mr' ? 'नवीन संस्था माहिती' : 'Add New Organization Details'}
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्थेचे नाव *' : 'Organization Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. ज्ञान प्रबोधिनी, सह्याद्री...' : 'e.g. Jnana Prabodhini, VOPA...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्था कोड *' : 'Organization Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NGO_CODE, JPIP..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्थेचा प्रकार' : 'Organization Type'}
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  >
                    <option value="IN_HOUSE">{language === 'mr' ? '🏛️ थेट TRST (अंतर्गत)' : '🏛️ In-House (TRST Direct)'}</option>
                    <option value="PARTNER_NGO">{language === 'mr' ? '🤝 भागीदार स्वयंसेवी संस्था' : '🤝 Partner NGO'}</option>
                    <option value="ACADEMIC_INSTITUTE">{language === 'mr' ? '📘 शैक्षणिक / संशोधन संस्था' : '📘 Academic / Research Institute'}</option>
                    <option value="GOVERNMENT">{language === 'mr' ? '🏛️ शासकीय संस्था' : '🏛️ Government Body'}</option>
                    <option value="OTHER">{language === 'mr' ? '🌐 इतर संस्था' : '🌐 Other Partner'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संपर्क प्रतिनिधी' : 'Contact Person / Lead'}
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. संध्याताई, प्रकल्प संचालक...' : 'e.g. Project Director, Lead...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  {language === 'mr' ? 'वर्णन व कार्यक्षेत्र' : 'Description & Scope'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. पुणे परिसरातील ५० शाळांचे प्रत्यक्ष सत्र संचलन...' : 'e.g. Direct facilitation across 50 schools...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-[#233d76] hover:bg-[#1a2d57] text-white shadow-xs cursor-pointer"
                >
                  {language === 'mr' ? 'संस्था जतन करा' : 'Save Organization'}
                </button>
              </div>
            </form>
          )}

          {/* List of Dynamic Organizations */}
          <div className="space-y-3">
            {organizations.map((org) => {
              const linkedSchoolsCount = schools.filter(
                (s) => (s.organizationCode || 'TRST_DIRECT') === org.code
              ).length;

              return (
                <div
                  key={org.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#dfaf27] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-xs bg-[#233d76] text-white px-2 py-0.5 rounded-md">
                        {org.code}
                      </span>
                      <h5 className="font-bold text-sm text-slate-900">{org.nameMr}</h5>
                      <span className="text-xs text-slate-400">({org.nameEn})</span>
                    </div>

                    {org.description && (
                      <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                        {org.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      {org.contactPerson && (
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-[#dfaf27]" />
                          <span>{org.contactPerson}</span>
                        </span>
                      )}
                      {org.contactPhone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{org.contactPhone}</span>
                        </span>
                      )}
                      <span className="bg-[#f0da9a]/50 text-[#233d76] font-bold px-2 py-0.5 rounded-sm">
                        {linkedSchoolsCount} {language === 'mr' ? 'शाळा जोडलेल्या' : 'schools linked'}
                      </span>
                    </div>
                  </div>

                  {/* Protection: TRST_DIRECT is base in-house */}
                  {org.code !== 'TRST_DIRECT' && (
                    <button
                      onClick={() => {
                        if (confirm(`खात्री करा: ${org.nameMr} संस्था काढून टाकायची आहे का?`)) {
                          deleteOrganization(org.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="संस्था हटवा"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>TRST Governance & Organization Master</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold text-[#233d76] hover:underline cursor-pointer"
          >
            {language === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
