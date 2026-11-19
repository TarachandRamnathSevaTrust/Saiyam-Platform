import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  Plus,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Trash2,
  LogIn,
  Edit2,
  UserPlus,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Organization, UserProfile } from '@saiyam/shared';
import { formatOrgName } from '../../lib/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationManagementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    organizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    users,
    refreshProfiles,
    addUser,
    updateUser,
    switchUser,
    schools,
    language,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  // Organization fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [orgType, setOrgType] = useState<Organization['orgType']>('PARTNER_NGO');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');

  // Coordinator User Assignment fields
  const [assignCoordinator, setAssignCoordinator] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [coordinatorPhone, setCoordinatorPhone] = useState('');
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setCode('');
    setOrgType('PARTNER_NGO');
    setContactPerson('');
    setContactPhone('');
    setContactEmail('');
    setDescription('');
    setAssignCoordinator(true);
    setSelectedUserId('');
    setCoordinatorName('');
    setCoordinatorEmail('');
    setCoordinatorPhone('');
    setEditingOrgId(null);
    setIsAdding(false);
  };

  const handleRefreshUsers = async () => {
    setIsRefreshingUsers(true);
    try {
      await refreshProfiles();
    } finally {
      setTimeout(() => setIsRefreshingUsers(false), 500);
    }
  };

  const handleSelectExistingUser = (userId: string) => {
    setSelectedUserId(userId);
    if (!userId) {
      setCoordinatorName('');
      setCoordinatorEmail('');
      setCoordinatorPhone('');
      return;
    }

    if (userId === '__NEW_MANUAL__') {
      setCoordinatorName(contactPerson || '');
      setCoordinatorEmail(contactEmail || '');
      setCoordinatorPhone(contactPhone || '');
      return;
    }

    const found = users.find((u) => u.id === userId);
    if (found) {
      setCoordinatorName(found.fullName);
      setCoordinatorEmail(found.email);
      setCoordinatorPhone(found.phone || '');
    }
  };

  const handleStartEdit = (org: Organization) => {
    setEditingOrgId(org.id);
    setName(org.nameMr || org.nameEn);
    setCode(org.code);
    setOrgType(org.orgType);
    setContactPerson(org.contactPerson || '');
    setContactPhone(org.contactPhone || '');
    setContactEmail(org.contactEmail || '');
    setDescription(org.description || '');

    // Check existing coordinator user from state
    const existingCoord = users.find(
      (u) =>
        (u.organizationCode === org.code && u.role === 'ORG_COORDINATOR') ||
        u.id === org.coordinatorUserId ||
        (org.coordinatorEmail && u.email.toLowerCase() === org.coordinatorEmail.toLowerCase())
    );

    if (existingCoord) {
      setAssignCoordinator(true);
      setSelectedUserId(existingCoord.id);
      setCoordinatorName(existingCoord.fullName);
      setCoordinatorEmail(existingCoord.email);
      setCoordinatorPhone(existingCoord.phone || '');
    } else if (org.coordinatorEmail) {
      setAssignCoordinator(true);
      setSelectedUserId('__NEW_MANUAL__');
      setCoordinatorName(org.coordinatorUserName || '');
      setCoordinatorEmail(org.coordinatorEmail);
      setCoordinatorPhone(org.contactPhone || '');
    } else {
      setAssignCoordinator(false);
      setSelectedUserId('');
      setCoordinatorName('');
      setCoordinatorEmail('');
      setCoordinatorPhone('');
    }

    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert(language === 'mr' ? 'कृपया संस्थेचे नाव आणि कोड प्रविष्ट करा.' : 'Please enter organization name and code.');
      return;
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');
    let coordUserId: string | undefined = undefined;
    let coordUserName: string | undefined = undefined;
    let coordUserEmail: string | undefined = undefined;

    // Handle Coordinator User Assignment
    if (assignCoordinator) {
      if (selectedUserId && selectedUserId !== '__NEW_MANUAL__') {
        // Link to existing backend user from Supabase profiles
        const chosenUser = users.find((u) => u.id === selectedUserId);
        if (chosenUser) {
          coordUserId = chosenUser.id;
          coordUserName = chosenUser.fullName;
          coordUserEmail = chosenUser.email;

          // Update user role to ORG_COORDINATOR and assign org code
          updateUser(chosenUser.id, {
            role: 'ORG_COORDINATOR',
            organizationCode: cleanCode,
          });
        }
      } else if (coordinatorEmail.trim()) {
        // Manual creation / link by email
        const cName = coordinatorName.trim() || contactPerson.trim() || `${name.trim()} Coordinator`;
        const cEmail = coordinatorEmail.trim().toLowerCase();
        const cPhone = coordinatorPhone.trim() || contactPhone.trim();

        const existingUser = users.find(
          (u) =>
            u.email.toLowerCase() === cEmail ||
            (u.organizationCode === cleanCode && u.role === 'ORG_COORDINATOR')
        );

        if (existingUser) {
          updateUser(existingUser.id, {
            fullName: cName,
            email: cEmail,
            phone: cPhone,
            role: 'ORG_COORDINATOR',
            organizationCode: cleanCode,
          });
          coordUserId = existingUser.id;
        } else {
          const newUser = addUser({
            fullName: cName,
            email: cEmail,
            phone: cPhone,
            role: 'ORG_COORDINATOR',
            organizationCode: cleanCode,
            isActive: true,
          });
          coordUserId = newUser.id;
        }

        coordUserName = cName;
        coordUserEmail = cEmail;
      }
    }

    const orgPayload = {
      code: cleanCode,
      nameMr: name.trim(),
      nameEn: name.trim(),
      orgType,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      description: description.trim(),
      coordinatorUserId: coordUserId,
      coordinatorUserName: coordUserName,
      coordinatorEmail: coordUserEmail,
    };

    if (editingOrgId) {
      updateOrganization(editingOrgId, orgPayload);
    } else {
      addOrganization(orgPayload);
    }

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
    resetForm();
  };

  const handleSwitchToCoordinator = (user: { id: string }) => {
    switchUser(user.id);
    onClose();
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
                {language === 'mr'
                  ? 'TRST द्वारे सर्व भागीदार संस्था व समन्वयक खात्यांचे थेट नियंत्रण'
                  : 'Manage partner organizations and assign coordinator login users'}
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
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'mr'
                  ? 'संस्था आणि समन्वयक खाते यशस्वीरित्या सेव्ह झाले!'
                  : 'Organization and coordinator user account saved successfully!'}
              </span>
            </div>
          )}

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
              onClick={() => {
                if (isAdding) {
                  resetForm();
                } else {
                  setIsAdding(true);
                }
              }}
              className="flex items-center space-x-1.5 bg-[#dfaf27] hover:bg-[#b88d18] text-[#233d76] font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>
                {isAdding
                  ? language === 'mr'
                    ? 'रद्द करा'
                    : 'Cancel'
                  : language === 'mr'
                  ? 'नवीन संस्था जोडा'
                  : 'Add Organization'}
              </span>
            </button>
          </div>

          {/* Add / Edit Organization Form */}
          {isAdding && (
            <form onSubmit={handleSave} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
                <Plus className="w-4 h-4 text-[#233d76]" />
                <h5 className="font-bold text-xs text-[#233d76] uppercase tracking-wider">
                  {editingOrgId
                    ? language === 'mr'
                      ? 'संस्था माहिती संपादित करा'
                      : 'Edit Organization Details'
                    : language === 'mr'
                    ? 'नवीन संस्था व समन्वयक माहिती'
                    : 'Add New Organization & Assign User'}
                </h5>
              </div>

              {/* Organization Basic Info */}
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
                    placeholder={language === 'mr' ? 'उदा. सचिन कुलकर्णी, प्रकल्प संचालक...' : 'e.g. Project Director, Lead...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
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

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'अधिकृत ईमेल' : 'Official Email'}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@organization.org"
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
                  placeholder={language === 'mr' ? 'उदा. पुणे परिसरातील शाळांचे प्रत्यक्ष सत्र संचलन...' : 'e.g. Direct facilitation across schools...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                />
              </div>

              {/* Coordinator User Assignment Section */}
              <div className="bg-[#233d76]/5 rounded-xl p-4 border border-[#233d76]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignCoordinator}
                      onChange={(e) => setAssignCoordinator(e.target.checked)}
                      className="w-4 h-4 rounded text-[#233d76] accent-[#233d76]"
                    />
                    <span className="font-bold text-xs text-[#233d76] flex items-center space-x-1.5">
                      <UserPlus className="w-4 h-4 text-[#dfaf27]" />
                      <span>
                        {language === 'mr'
                          ? 'या संस्थेला समन्वयक वापरकर्ता नियुक्त करा'
                          : 'Assign Coordinator User to this Organization'}
                      </span>
                    </span>
                  </label>

                  {assignCoordinator && (
                    <button
                      type="button"
                      onClick={handleRefreshUsers}
                      className="text-[11px] text-[#233d76] hover:text-[#b88d18] flex items-center space-x-1 font-bold cursor-pointer transition-colors"
                      title={language === 'mr' ? 'Supabase मधून नवीन प्रोफाइल्स रीफ्रेश करा' : 'Refresh profiles from Supabase'}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingUsers ? 'animate-spin text-[#dfaf27]' : ''}`} />
                      <span>{language === 'mr' ? 'बॅकएंड वापरकर्ते रीफ्रेश' : 'Refresh Backend Users'}</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 pl-6">
                  {language === 'mr'
                    ? 'बॅकएंड (Supabase Auth / Profiles) मध्ये तयार केलेला वापरकर्ता निवडा, जेणेकरून तो या संस्थेच्या शाळांचे व्यवस्थापन करू शकेल.'
                    : 'Select a user created in backend (Supabase Auth / Profiles) so they can manage this organization’s schools & field trainers.'}
                </p>

                {assignCoordinator && (
                  <div className="space-y-3 pt-1 pl-6">
                    {/* User Selection Dropdown */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        {language === 'mr'
                          ? 'बॅकएंड प्रोफाइलमधून वापरकर्ता निवडा *'
                          : 'Select Existing User from Backend (Supabase Profiles) *'}
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => handleSelectExistingUser(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#233d76]"
                      >
                        <option value="">
                          {language === 'mr'
                            ? `-- नोंदणीकृत वापरकर्ता निवडा (${users.length} उपलब्ध) --`
                            : `-- Choose a registered user (${users.length} available) --`}
                        </option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email}) — [{u.role}] {u.organizationCode ? `(Org: ${u.organizationCode})` : ''}
                          </option>
                        ))}
                        <option value="__NEW_MANUAL__">
                          {language === 'mr'
                            ? '+ नवीन वापरकर्ता माहिती मॅन्युअली प्रविष्ट करा (Manual Entry)'
                            : '+ Enter new user details manually'}
                        </option>
                      </select>
                    </div>

                    {/* Highlighted Profile Card when user is selected */}
                    {selectedUserId && selectedUserId !== '__NEW_MANUAL__' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900 animate-fadeIn">
                        <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {language === 'mr' ? 'नियुक्त समन्वयक:' : 'Assigned Coordinator:'} {coordinatorName}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Email: <span className="font-mono font-bold">{coordinatorEmail}</span>
                          {coordinatorPhone ? ` | Phone: ${coordinatorPhone}` : ''}
                        </p>
                        <p className="text-[10px] text-emerald-600">
                          {language === 'mr'
                            ? 'हा वापरकर्ता या संस्थेचा ORG_COORDINATOR म्हणून Supabase बॅकएंडमध्ये सेव्ह होईल.'
                            : 'This user will be linked as the ORG_COORDINATOR for this NGO in Supabase backend.'}
                        </p>
                      </div>
                    )}

                    {/* Manual Input Fields if chosen */}
                    {selectedUserId === '__NEW_MANUAL__' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            {language === 'mr' ? 'समन्वयक नाव *' : 'Coordinator Name *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={coordinatorName}
                            onChange={(e) => setCoordinatorName(e.target.value)}
                            placeholder="e.g. Sachin Kulkarni"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#233d76]"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            {language === 'mr' ? 'लॉगिन ईमेल *' : 'Login Email *'}
                          </label>
                          <input
                            type="email"
                            required
                            value={coordinatorEmail}
                            onChange={(e) => setCoordinatorEmail(e.target.value)}
                            placeholder="coord@partner.org"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#233d76]"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            {language === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                          </label>
                          <input
                            type="tel"
                            value={coordinatorPhone}
                            onChange={(e) => setCoordinatorPhone(e.target.value)}
                            placeholder="+91 98000 00000"
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#233d76]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-[#233d76] hover:bg-[#1a2d57] text-white shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {editingOrgId
                      ? language === 'mr'
                        ? 'बदल जतन करा'
                        : 'Update Organization'
                      : language === 'mr'
                      ? 'संस्था जतन करा'
                      : 'Save Organization'}
                  </span>
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

              // Find assigned coordinator user from state
              const assignedUser = users.find(
                (u) =>
                  (u.organizationCode === org.code && u.role === 'ORG_COORDINATOR') ||
                  u.id === org.coordinatorUserId ||
                  (org.coordinatorEmail && u.email.toLowerCase() === org.coordinatorEmail.toLowerCase())
              ) || (org.coordinatorEmail ? { id: org.coordinatorUserId || `u-${org.code}`, fullName: org.coordinatorUserName || 'Coordinator', email: org.coordinatorEmail, phone: org.contactPhone } : null);

              return (
                <div
                  key={org.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#dfaf27] transition-all flex flex-col gap-3 shadow-2xs"
                >
                  {/* Row 1: Code, Name, Type, Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-xs bg-[#233d76] text-white px-2 py-0.5 rounded-md">
                        {org.code}
                      </span>
                      <h5 className="font-bold text-sm text-slate-900">{formatOrgName(org, language)}</h5>
                      {language === 'mr' && org.nameEn && org.nameEn !== org.nameMr && (
                        <span className="text-xs text-slate-400">({org.nameEn})</span>
                      )}
                      {language === 'en' && org.nameMr && org.nameMr !== org.nameEn && (
                        <span className="text-xs text-slate-400">({org.nameMr})</span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {org.orgType === 'PARTNER_NGO' ? '🤝 NGO' : org.orgType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(org)}
                        className="text-slate-400 hover:text-[#233d76] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title={language === 'mr' ? 'संपादित करा' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {org.code !== 'TRST_DIRECT' && (
                        <button
                          onClick={() => {
                            if (confirm(language === 'mr' ? `खात्री करा: ${org.nameMr} संस्था काढून टाकायची आहे का?` : `Are you sure you want to delete ${org.nameMr}?`)) {
                              deleteOrganization(org.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title={language === 'mr' ? 'संस्था हटवा' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {org.description && (
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                      {org.description}
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
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

                  {/* Coordinator Account Assignment Bar */}
                  <div className="mt-1 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    {assignedUser ? (
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="flex items-center space-x-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {language === 'mr' ? 'समन्वयक:' : 'Coordinator:'} {assignedUser.fullName}
                          </span>
                          <span className="text-slate-400 font-normal">({assignedUser.email})</span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'mr' ? 'समन्वयक खाते नियुक्त नाही' : 'No coordinator assigned yet'}</span>
                      </div>
                    )}

                    {assignedUser ? (
                      <button
                        onClick={() => handleSwitchToCoordinator(assignedUser)}
                        className="flex items-center space-x-1 text-xs font-bold text-[#233d76] bg-[#f0da9a]/60 hover:bg-[#dfaf27] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title={language === 'mr' ? 'या समन्वयक म्हणून त्वरित लॉगिन करा' : 'Login as this coordinator'}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{language === 'mr' ? 'समन्वयक लॉगिन करा' : 'Login as Coordinator'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(org)}
                        className="text-xs font-bold text-[#233d76] hover:underline cursor-pointer flex items-center space-x-1"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#dfaf27]" />
                        <span>{language === 'mr' ? 'खाते नियुक्त करा' : 'Assign Coordinator'}</span>
                      </button>
                    )}
                  </div>
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
