import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  UserPlus,
  Phone,
  Mail,
  School as SchoolIcon,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Layers,
  LogIn,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { Organization, UserProfile, School } from '@saiyam/shared';

export const GovernancePanel: React.FC = () => {
  const {
    organizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    users,
    addUser,
    deleteUser,
    updateUser,
    switchUser,
    schools,
    assignTrainerToSchool,
    language,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'TRAINERS' | 'ORGS' | 'ALLOCATIONS'>('TRAINERS');

  // --- Add Organization Form State ---
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [orgNameMr, setOrgNameMr] = useState('');
  const [orgNameEn, setOrgNameEn] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [orgType, setOrgType] = useState<Organization['orgType']>('PARTNER_NGO');
  const [orgContactPerson, setOrgContactPerson] = useState('');
  const [orgContactPhone, setOrgContactPhone] = useState('');
  const [orgContactEmail, setOrgContactEmail] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  // --- Add/Edit Trainer Form State ---
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [trainerPhone, setTrainerPhone] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [selectedOrgCode, setSelectedOrgCode] = useState('');

  // Feedback notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const triggerNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Organization Handlers ---
  const handleOpenEditOrg = (org: Organization) => {
    setEditingOrgId(org.id);
    setOrgNameMr(org.nameMr);
    setOrgNameEn(org.nameEn);
    setOrgCode(org.code);
    setOrgType(org.orgType);
    setOrgContactPerson(org.contactPerson || '');
    setOrgContactPhone(org.contactPhone || '');
    setOrgContactEmail(org.contactEmail || '');
    setOrgDescription(org.description || '');
    setIsAddingOrg(true);
  };

  const handleResetOrgForm = () => {
    setEditingOrgId(null);
    setOrgNameMr('');
    setOrgNameEn('');
    setOrgCode('');
    setOrgContactPerson('');
    setOrgContactPhone('');
    setOrgContactEmail('');
    setOrgDescription('');
    setIsAddingOrg(false);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgNameMr.trim() || !orgCode.trim()) {
      alert(language === 'mr' ? 'कृपया संस्थेचे नाव व कोड भरा.' : 'Please enter organization name and code.');
      return;
    }

    const cleanCode = orgCode.trim().toUpperCase().replace(/\s+/g, '_');

    if (editingOrgId) {
      updateOrganization(editingOrgId, {
        code: cleanCode,
        nameMr: orgNameMr.trim(),
        nameEn: orgNameEn.trim() || orgNameMr.trim(),
        orgType,
        contactPerson: orgContactPerson.trim(),
        contactPhone: orgContactPhone.trim(),
        contactEmail: orgContactEmail.trim(),
        description: orgDescription.trim(),
      });
      triggerNotify(language === 'mr' ? 'संस्थेची माहिती अद्ययावत केली!' : 'Organization updated successfully!');
    } else {
      addOrganization({
        code: cleanCode,
        nameMr: orgNameMr.trim(),
        nameEn: orgNameEn.trim() || orgNameMr.trim(),
        orgType,
        contactPerson: orgContactPerson.trim(),
        contactPhone: orgContactPhone.trim(),
        contactEmail: orgContactEmail.trim(),
        description: orgDescription.trim(),
      });
      triggerNotify(language === 'mr' ? 'नवीन संस्था यशस्वीरित्या जोडली!' : 'Organization created successfully!');
    }

    handleResetOrgForm();
  };

  // --- Field Trainer Handlers ---
  const handleOpenEditTrainer = (user: UserProfile) => {
    setEditingTrainerId(user.id);
    setTrainerName(user.fullName);
    setTrainerPhone(user.phone || '');
    setTrainerEmail(user.email);
    setSelectedOrgCode(user.organizationCode || '');
    setIsAddingTrainer(true);
  };

  const handleResetTrainerForm = () => {
    setEditingTrainerId(null);
    setTrainerName('');
    setTrainerPhone('');
    setTrainerEmail('');
    setSelectedOrgCode('');
    setIsAddingTrainer(false);
  };

  const handleSaveTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerName.trim()) {
      alert(language === 'mr' ? 'कृपया प्रशिक्षकाचे पूर्ण नाव भरा.' : 'Please enter trainer full name.');
      return;
    }

    const assignedOrg = organizations.find((o) => o.code === selectedOrgCode);

    if (editingTrainerId) {
      updateUser(editingTrainerId, {
        fullName: trainerName.trim(),
        phone: trainerPhone.trim(),
        email: trainerEmail.trim() || `trainer_${Date.now()}@trst.org.in`,
        organizationId: assignedOrg?.id,
        organizationCode: selectedOrgCode || undefined,
      });
      triggerNotify(language === 'mr' ? 'प्रशिक्षकाची माहिती अद्ययावत केली!' : 'Trainer updated successfully!');
    } else {
      addUser({
        fullName: trainerName.trim(),
        email: trainerEmail.trim() || `trainer_${Date.now()}@trst.org.in`,
        phone: trainerPhone.trim(),
        role: 'FIELD_TRAINER',
        organizationId: assignedOrg?.id,
        organizationCode: selectedOrgCode || undefined,
        isActive: true,
      });
      triggerNotify(language === 'mr' ? 'नवीन क्षेत्र प्रशिक्षक यशस्वीरित्या जोडला!' : 'Field Trainer added successfully!');
    }

    handleResetTrainerForm();
  };

  const fieldTrainers = users.filter((u) => u.role === 'FIELD_TRAINER');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#233d76] rounded-2xl p-6 text-white shadow-md border-b-4 border-[#dfaf27] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs bg-[#dfaf27] text-[#233d76] uppercase tracking-wider font-extrabold px-3 py-1 rounded-md shadow-2xs">
            {language === 'mr' ? 'प्रशासन केंद्र (Trust Governance)' : 'Trust Administration'}
          </span>
          <h1 className="text-2xl font-bold trust-heading mt-2">
            {language === 'mr' ? 'संस्था व क्षेत्र प्रशिक्षक थेट व्यवस्थापन' : 'Organizations & Trainers Governance'}
          </h1>
          <p className="text-xs text-[#f0da9a] mt-0.5">
            {language === 'mr'
              ? 'कोणताही डेटा हार्डकोड न ठेवता संस्था, प्रशिक्षक, आणि शाळा वाटपाचे १००% थेट नियंत्रण.'
              : 'Zero hardcoded data: Full control over partner organizations, field facilitators, and school allocations.'}
          </p>
        </div>

        {/* Dynamic Toast */}
        {notification && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('TRAINERS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'TRAINERS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '१. क्षेत्र प्रशिक्षक व्यवस्थापन' : '1. Field Facilitators'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {fieldTrainers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ORGS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ORGS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '२. संस्था व भागीदार' : '2. Implementing Organizations'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {organizations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('ALLOCATIONS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ALLOCATIONS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SchoolIcon className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '३. शाळा व प्रशिक्षक वाटप' : '3. School Allocations'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {schools.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: FIELD TRAINERS MANAGEMENT                               */}
      {/* ============================================================== */}
      {activeSubTab === 'TRAINERS' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 trust-heading">
                {language === 'mr' ? 'क्षेत्र प्रशिक्षकांची यादी व नियंत्रण' : 'Field Facilitators Directory'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'येथे नवीन प्रशिक्षक जोडा, संस्था नियुक्त करा आणि थेट त्या खात्यातून काम करून तपासा.'
                  : 'Add facilitators, assign organizations, and impersonate/switch to test on-ground flows.'}
              </p>
            </div>

            <button
              onClick={() => {
                if (isAddingTrainer) {
                  handleResetTrainerForm();
                } else {
                  setIsAddingTrainer(true);
                }
              }}
              className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[3]" />
              <span>
                {isAddingTrainer
                  ? language === 'mr' ? 'फॉर्म बंद करा' : 'Close Form'
                  : language === 'mr' ? '+ नवीन प्रशिक्षक जोडा' : '+ Add Field Trainer'}
              </span>
            </button>
          </div>

          {/* Add / Edit Trainer Form */}
          {isAddingTrainer && (
            <form onSubmit={handleSaveTrainer} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-[#233d76]" />
                  <h4 className="font-bold text-xs text-[#233d76] uppercase tracking-wider">
                    {editingTrainerId
                      ? language === 'mr' ? 'प्रशिक्षकाची माहिती बदला' : 'Edit Field Facilitator'
                      : language === 'mr' ? 'नवीन क्षेत्र प्रशिक्षकाची नोंदणी' : 'Register New Field Facilitator'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleResetTrainerForm}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'प्रशिक्षकाचे पूर्ण नाव *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. राहुल शिंदे...' : 'e.g. Facilitator Name...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={trainerPhone}
                    onChange={(e) => setTrainerPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'ईमेल आयडी' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={trainerEmail}
                    onChange={(e) => setTrainerEmail(e.target.value)}
                    placeholder="facilitator@domain.org"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्था नियुक्त करा (Assign Org)' : 'Assign Organization'}
                  </label>
                  <select
                    value={selectedOrgCode}
                    onChange={(e) => setSelectedOrgCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-[#233d76] bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  >
                    <option value="">-- {language === 'mr' ? 'थेट TRST (Direct)' : 'Direct TRST'} --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.code}>
                        {org.nameMr} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetTrainerForm}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-[#233d76] hover:bg-[#1a2d57] text-white shadow-xs cursor-pointer"
                >
                  {editingTrainerId
                    ? language === 'mr' ? 'बदल जतन करा' : 'Update Trainer'
                    : language === 'mr' ? 'प्रशिक्षक जतन करा' : 'Save Trainer'}
                </button>
              </div>
            </form>
          )}

          {/* Field Trainers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="min-w-full text-xs">
              <thead className="bg-[#233d76] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'प्रशिक्षकाचे नाव' : 'Trainer Name'}</th>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'संस्था' : 'Organization'}</th>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'संपर्क' : 'Contact'}</th>
                  <th className="px-4 py-3 text-center font-bold">{language === 'mr' ? 'वाटप केलेल्या शाळा' : 'Assigned Schools'}</th>
                  <th className="px-4 py-3 text-center font-bold">{language === 'mr' ? 'कृती / नियंत्रण' : 'Actions & Login'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fieldTrainers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      {language === 'mr'
                        ? 'अद्याप कोणताही क्षेत्र प्रशिक्षक जोडलेला नाही. वर "+ नवीन प्रशिक्षक जोडा" बटणावर क्लिक करा.'
                        : 'No field trainers added yet. Click "+ Add Field Trainer" above.'}
                    </td>
                  </tr>
                ) : (
                  fieldTrainers.map((tr) => {
                    const trainerOrg = organizations.find((o) => o.code === tr.organizationCode);
                    const assignedSchools = schools.filter((s) => s.assignedTrainerId === tr.id);

                    return (
                      <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold text-xs shrink-0">
                              {tr.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{tr.fullName}</div>
                              <span className="text-[10px] text-slate-400">ID: {tr.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {trainerOrg ? (
                            <span className="bg-[#233d76]/10 text-[#233d76] font-bold px-2.5 py-1 rounded-md text-[11px] inline-block">
                              {trainerOrg.nameMr}
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                              {language === 'mr' ? 'थेट TRST' : 'Direct TRST'}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          <div className="font-mono text-[11px]">{tr.email}</div>
                          {tr.phone && <div className="text-[11px] text-slate-400">{tr.phone}</div>}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {assignedSchools.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[200px] mx-auto">
                              {assignedSchools.map((s) => (
                                <span
                                  key={s.id}
                                  className="bg-emerald-50 text-emerald-800 font-medium text-[10px] px-2 py-0.5 rounded border border-emerald-200"
                                >
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              {language === 'mr' ? 'शाळा जोडलेली नाही' : 'No schools'}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Fast Login / Switch */}
                            <button
                              onClick={() => {
                                switchUser(tr.id);
                                triggerNotify(language === 'mr' ? `${tr.fullName} खात्यात स्विच केले!` : `Switched to ${tr.fullName}!`, 'info');
                              }}
                              className="bg-[#233d76] hover:bg-[#1a2d57] text-[#f0da9a] hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                              title="प्रशिक्षक म्हणून पोर्टल वापरा"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">{language === 'mr' ? 'खात्यात जा' : 'Switch'}</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditTrainer(tr)}
                              className="text-slate-500 hover:text-[#233d76] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="बदला"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(language === 'mr' ? `खात्री करा: ${tr.fullName} हे प्रशिक्षक काढून टाकायचे आहे का?` : `Are you sure you want to delete ${tr.fullName}?`)) {
                                  deleteUser(tr.id);
                                  triggerNotify(language === 'mr' ? 'प्रशिक्षक खाते हटवले!' : 'Trainer deleted!');
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="हटवा"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ORGANIZATIONS MANAGEMENT                                */}
      {/* ============================================================== */}
      {activeSubTab === 'ORGS' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 trust-heading">
                {language === 'mr' ? 'नोंदणीकृत संस्था व भागीदार' : 'Implementing Organizations Directory'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'सर्व भागीदार स्वयंसेवी संस्था, संस्था कोड व प्रतिनिधींची नोंद येथे थेट करा.'
                  : 'Manage partner NGOs, unique codes, and coordination points dynamically.'}
              </p>
            </div>

            <button
              onClick={() => {
                if (isAddingOrg) {
                  handleResetOrgForm();
                } else {
                  setIsAddingOrg(true);
                }
              }}
              className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>
                {isAddingOrg
                  ? language === 'mr' ? 'फॉर्म बंद करा' : 'Close Form'
                  : language === 'mr' ? '+ नवीन संस्था जोडा' : '+ Add Organization'}
              </span>
            </button>
          </div>

          {/* Add / Edit Org Form */}
          {isAddingOrg && (
            <form onSubmit={handleSaveOrg} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#233d76]" />
                  <h4 className="font-bold text-xs text-[#233d76] uppercase tracking-wider">
                    {editingOrgId
                      ? language === 'mr' ? 'संस्थेची माहिती बदला' : 'Edit Organization'
                      : language === 'mr' ? 'नवीन संस्थेची माहिती भरा' : 'Add New Organization Details'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleResetOrgForm}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्थेचे नाव (मराठी) *' : 'Name (Marathi) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgNameMr}
                    onChange={(e) => setOrgNameMr(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. सामाजिक संस्था...' : 'e.g. Partner NGO...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'Organization Name (English)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={orgNameEn}
                    onChange={(e) => setOrgNameEn(e.target.value)}
                    placeholder="e.g. Partner Foundation..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्था कोड (Unique Code) *' : 'Organization Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NGO_1, FOUNDATION..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्थेचा प्रकार (Type)' : 'Type'}
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  >
                    <option value="IN_HOUSE">🏛️ In-House (TRST Direct)</option>
                    <option value="PARTNER_NGO">🤝 Partner NGO</option>
                    <option value="ACADEMIC_INSTITUTE">📘 Academic / Research Institute</option>
                    <option value="GOVERNMENT">🏛️ Government Body</option>
                    <option value="OTHER">🌐 Other Partner</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संपर्क प्रतिनिधी (Lead Person)' : 'Lead Person'}
                  </label>
                  <input
                    type="text"
                    value={orgContactPerson}
                    onChange={(e) => setOrgContactPerson(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. समन्वयक नाव...' : 'e.g. Coordinator Name...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'मोबाईल / फोन नंबर' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={orgContactPhone}
                    onChange={(e) => setOrgContactPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'ईमेल आयडी' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={orgContactEmail}
                    onChange={(e) => setOrgContactEmail(e.target.value)}
                    placeholder="contact@organization.org"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  {language === 'mr' ? 'वर्णन व कार्यक्षेत्र (Description)' : 'Description & Scope'}
                </label>
                <textarea
                  rows={2}
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. कार्यक्षेत्र, उद्दिष्टे...' : 'e.g. Geographic scope, mission...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetOrgForm}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-[#233d76] hover:bg-[#1a2d57] text-white shadow-xs cursor-pointer"
                >
                  {editingOrgId
                    ? language === 'mr' ? 'बदल जतन करा' : 'Update Organization'
                    : language === 'mr' ? 'संस्था जतन करा' : 'Save Organization'}
                </button>
              </div>
            </form>
          )}

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.length === 0 ? (
              <div className="col-span-full p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                {language === 'mr'
                  ? 'अद्याप कोणतीही संस्था जोडलेली नाही. वर "+ नवीन संस्था जोडा" बटणावर क्लिक करा.'
                  : 'No organizations registered yet. Click "+ Add Organization" above.'}
              </div>
            ) : (
              organizations.map((org) => {
                const linkedSchools = schools.filter((s) => (s.organizationCode || '') === org.code);
                const linkedTrainers = users.filter((u) => (u.organizationCode || '') === org.code);

                return (
                  <div
                    key={org.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#dfaf27] transition-all flex flex-col justify-between shadow-2xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-black text-xs bg-[#233d76] text-white px-2 py-0.5 rounded">
                          {org.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                          {org.orgType}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{org.nameMr}</h4>
                      <div className="text-[11px] text-slate-400">{org.nameEn}</div>

                      {org.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {org.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      {org.contactPerson && (
                        <div className="text-slate-600 font-semibold flex items-center space-x-1.5">
                          <span className="text-[#dfaf27]">👤</span>
                          <span>{org.contactPerson}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] font-bold text-[#233d76]">
                        <span>{linkedTrainers.length} {language === 'mr' ? 'प्रशिक्षक' : 'trainers'}</span>
                        <span>{linkedSchools.length} {language === 'mr' ? 'शाळा' : 'schools'}</span>
                      </div>

                      <div className="pt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditOrg(org)}
                          className="text-xs text-[#233d76] hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'बदला' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(language === 'mr' ? `खात्री करा: ${org.nameMr} संस्था काढून टाकायची आहे का?` : `Are you sure you want to delete ${org.nameMr}?`)) {
                              deleteOrganization(org.id);
                              triggerNotify(language === 'mr' ? 'संस्था हटवली!' : 'Organization deleted!');
                            }
                          }}
                          className="text-xs text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'हटवा' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SCHOOL ALLOCATIONS (DIRECT ASSIGNMENT)                  */}
      {/* ============================================================== */}
      {activeSubTab === 'ALLOCATIONS' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 trust-heading">
                {language === 'mr' ? 'शाळा व प्रशिक्षक थेट वाटप (Allocations)' : 'Direct School & Facilitator Allocations'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'प्रत्येक शाळेसाठी थेट क्षेत्र प्रशिक्षक नियुक्त करा. निवडताच प्रशिक्षकाच्या खात्यात ती शाळा दिसेल.'
                  : 'Assign field facilitators directly to registered schools with instant synchronization.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="min-w-full text-xs">
              <thead className="bg-[#233d76] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'शाळा / संस्था' : 'School'}</th>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'गाव / शहर' : 'Location'}</th>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'अंमलबजावणी संस्था' : 'Organization'}</th>
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'नियुक्त क्षेत्र प्रशिक्षक' : 'Assigned Facilitator'}</th>
                  <th className="px-4 py-3 text-center font-bold">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      {language === 'mr'
                        ? 'अद्याप कोणत्याही शाळेची नोंद झालेली नाही. प्रशिक्षक जेव्हा शाळेत जाऊन नोंदणी करतील तेव्हा ती येथे दिसेल.'
                        : 'No schools registered yet. Registered field schools will appear here for allocation.'}
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    return (
                      <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center space-x-2">
                            <SchoolIcon className="w-4 h-4 text-[#dfaf27]" />
                            <span>{school.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {school.village}, {school.district}
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {school.organizationCode || 'TRST_DIRECT'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={school.assignedTrainerId || ''}
                            onChange={(e) => {
                              assignTrainerToSchool(school.id, e.target.value);
                              triggerNotify(language === 'mr' ? 'शाळा वाटप यशस्वीरीत्या बदलले!' : 'School allocation updated!');
                            }}
                            className="p-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#233d76] bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#233d76] cursor-pointer"
                          >
                            <option value="">-- {language === 'mr' ? 'प्रशिक्षक निवडा' : 'Select Facilitator'} --</option>
                            {fieldTrainers.map((tr) => (
                              <option key={tr.id} value={tr.id}>
                                {tr.fullName} {tr.organizationCode ? `(${tr.organizationCode})` : ''}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {school.assignedTrainerId ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>{language === 'mr' ? 'नियुक्त' : 'Assigned'}</span>
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">
                              {language === 'mr' ? 'प्रतिक्षेत' : 'Pending'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
