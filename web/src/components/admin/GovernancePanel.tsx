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
  KeyRound,
  GraduationCap,
  ArrowRight,
  Database,
  Sparkles,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { Organization, UserProfile, School } from '@saiyam/shared';

export const GovernancePanel: React.FC = () => {
  const {
    organizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    users,
    refreshProfiles,
    addUser,
    deleteUser,
    updateUser,
    switchUser,
    schools,
    students,
    assignTrainerToSchool,
    language,
  } = useApp();

  // Organizations is FIRST as per natural hierarchy (Org -> Trainer -> School)
  const [activeSubTab, setActiveSubTab] = useState<'ORGS' | 'TRAINERS' | 'ALLOCATIONS'>('ORGS');

  // --- Add Organization Form State ---
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [orgType, setOrgType] = useState<Organization['orgType']>('PARTNER_NGO');
  const [orgContactPerson, setOrgContactPerson] = useState('');
  const [orgContactPhone, setOrgContactPhone] = useState('');
  const [orgContactEmail, setOrgContactEmail] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  // NGO Coordinator / Lead Account State
  const [hasCoordinator, setHasCoordinator] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isRefreshingProfiles, setIsRefreshingProfiles] = useState(false);
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [coordinatorPhone, setCoordinatorPhone] = useState('');
  const [coordinatorAuthUserId, setCoordinatorAuthUserId] = useState('');

  // --- Add/Edit Trainer Form State ---
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [trainerPhone, setTrainerPhone] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [selectedOrgCode, setSelectedOrgCode] = useState('');
  const [authUserId, setAuthUserId] = useState('');

  // Feedback notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const triggerNotify = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Organization Handlers ---
  const handleOpenEditOrg = (org: Organization) => {
    setEditingOrgId(org.id);
    setOrgName(org.nameMr || org.nameEn);
    setOrgCode(org.code);
    setOrgType(org.orgType);
    setOrgContactPerson(org.contactPerson || '');
    setOrgContactPhone(org.contactPhone || '');
    setOrgContactEmail(org.contactEmail || '');
    setOrgDescription(org.description || '');

    // Check if a coordinator is assigned to this org
    const existingCoord = users.find(
      (u) => u.role === 'ORG_COORDINATOR' && u.organizationCode === org.code
    );
    if (existingCoord || org.coordinatorEmail) {
      setHasCoordinator(true);
      setCoordinatorName(existingCoord?.fullName || org.coordinatorUserName || org.contactPerson || '');
      setCoordinatorEmail(existingCoord?.email || org.coordinatorEmail || org.contactEmail || '');
      setCoordinatorPhone(existingCoord?.phone || org.contactPhone || '');
      setCoordinatorAuthUserId(existingCoord?.authUserId || '');
    } else {
      setHasCoordinator(false);
      setCoordinatorName('');
      setCoordinatorEmail('');
      setCoordinatorPhone('');
      setCoordinatorAuthUserId('');
    }
    setIsAddingOrg(true);
  };

  const handleResetOrgForm = () => {
    setEditingOrgId(null);
    setOrgName('');
    setOrgCode('');
    setOrgContactPerson('');
    setOrgContactPhone('');
    setOrgContactEmail('');
    setOrgDescription('');
    setHasCoordinator(false);
    setSelectedProfileId('');
    setCoordinatorName('');
    setCoordinatorEmail('');
    setCoordinatorPhone('');
    setCoordinatorAuthUserId('');
    setIsAddingOrg(false);
  };

  const handleRefreshProfiles = async () => {
    setIsRefreshingProfiles(true);
    try {
      await refreshProfiles();
      triggerNotify(language === 'mr' ? 'बॅकएंड प्रोफाइल रीफ्रेश झाले!' : 'Backend profiles refreshed!');
    } finally {
      setTimeout(() => setIsRefreshingProfiles(false), 500);
    }
  };

  const handleSelectProfile = (pId: string) => {
    setSelectedProfileId(pId);
    if (!pId) {
      setCoordinatorName('');
      setCoordinatorEmail('');
      setCoordinatorPhone('');
      setCoordinatorAuthUserId('');
      return;
    }
    if (pId === '__NEW_MANUAL__') {
      setCoordinatorName(orgContactPerson || '');
      setCoordinatorEmail(orgContactEmail || '');
      setCoordinatorPhone(orgContactPhone || '');
      return;
    }
    const found = users.find((u) => u.id === pId);
    if (found) {
      setCoordinatorName(found.fullName);
      setCoordinatorEmail(found.email);
      setCoordinatorPhone(found.phone || '');
      setCoordinatorAuthUserId(found.authUserId || found.id);
    }
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgCode.trim()) {
      alert(language === 'mr' ? 'कृपया संस्थेचे नाव व कोड भरा.' : 'Please enter organization name and code.');
      return;
    }

    const cleanCode = orgCode.trim().toUpperCase().replace(/\s+/g, '_');
    let coordUserId: string | undefined = undefined;

    // Handle Coordinator Account Creation/Update
    if (hasCoordinator && coordinatorEmail.trim()) {
      const cName = coordinatorName.trim() || orgContactPerson.trim() || `${cleanCode} Lead`;
      const cEmail = coordinatorEmail.trim();
      const resolvedAuthId = coordinatorAuthUserId.trim() || `auth-coord-${cleanCode.toLowerCase()}-${Date.now().toString(36)}`;
      const existingCoord = users.find(
        (u) => u.role === 'ORG_COORDINATOR' && u.organizationCode === cleanCode
      );

      if (existingCoord) {
        updateUser(existingCoord.id, {
          fullName: cName,
          email: cEmail,
          phone: coordinatorPhone.trim() || orgContactPhone.trim(),
          authUserId: resolvedAuthId,
          organizationCode: cleanCode,
        });
        coordUserId = existingCoord.id;
      } else {
        const newCoord = addUser({
          fullName: cName,
          email: cEmail,
          phone: coordinatorPhone.trim() || orgContactPhone.trim(),
          role: 'ORG_COORDINATOR',
          organizationCode: cleanCode,
          authUserId: resolvedAuthId,
          isActive: true,
        });
        coordUserId = newCoord.id;
      }
    }

    const orgPayload = {
      code: cleanCode,
      nameMr: orgName.trim(),
      nameEn: orgName.trim(),
      orgType,
      contactPerson: orgContactPerson.trim(),
      contactPhone: orgContactPhone.trim(),
      contactEmail: orgContactEmail.trim(),
      description: orgDescription.trim(),
      coordinatorUserId: coordUserId,
      coordinatorUserName: hasCoordinator ? (coordinatorName.trim() || orgContactPerson.trim()) : undefined,
      coordinatorEmail: hasCoordinator ? coordinatorEmail.trim() : undefined,
    };

    if (editingOrgId) {
      updateOrganization(editingOrgId, orgPayload);
      triggerNotify(language === 'mr' ? 'संस्थेची माहिती व समन्वयक खाते अद्ययावत केले!' : 'Organization & Coordinator updated successfully!');
    } else {
      addOrganization(orgPayload);
      triggerNotify(language === 'mr' ? 'नवीन संस्था व समन्वयक खाते यशस्वीरित्या जोडले!' : 'Organization & Coordinator created successfully!');
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
    setAuthUserId(user.authUserId || user.id);
    setIsAddingTrainer(true);
  };

  const handleResetTrainerForm = () => {
    setEditingTrainerId(null);
    setTrainerName('');
    setTrainerPhone('');
    setTrainerEmail('');
    setSelectedOrgCode('');
    setAuthUserId('');
    setIsAddingTrainer(false);
  };

  const handleSaveTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerName.trim() || !trainerEmail.trim()) {
      alert(language === 'mr' ? 'कृपया प्रशिक्षकाचे पूर्ण नाव आणि लॉगिन ईमेल भरा.' : 'Please enter trainer full name and email.');
      return;
    }

    const assignedOrg = organizations.find((o) => o.code === selectedOrgCode);
    const resolvedAuthId = authUserId.trim() || `auth-${Date.now()}`;

    if (editingTrainerId) {
      updateUser(editingTrainerId, {
        fullName: trainerName.trim(),
        phone: trainerPhone.trim(),
        email: trainerEmail.trim(),
        organizationId: assignedOrg?.id,
        organizationCode: selectedOrgCode || undefined,
        authUserId: resolvedAuthId,
      });
      triggerNotify(language === 'mr' ? 'प्रशिक्षकाची माहिती व Auth प्रोफाइल अद्ययावत केली!' : 'Trainer & Auth Profile updated successfully!');
    } else {
      addUser({
        fullName: trainerName.trim(),
        email: trainerEmail.trim(),
        phone: trainerPhone.trim(),
        role: 'FIELD_TRAINER',
        organizationId: assignedOrg?.id,
        organizationCode: selectedOrgCode || undefined,
        authUserId: resolvedAuthId,
        isActive: true,
      });
      triggerNotify(language === 'mr' ? 'नवीन क्षेत्र प्रशिक्षक व Supabase प्रोफाइल जोडली!' : 'Field Trainer & Auth Profile mapped successfully!');
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
            {language === 'mr' ? 'प्रशासन केंद्र' : 'Trust Administration'}
          </span>
          <h1 className="text-2xl font-bold trust-heading mt-2">
            {language === 'mr' ? 'संस्था व क्षेत्र प्रशिक्षक थेट व्यवस्थापन' : 'Organizations & Trainers Governance'}
          </h1>
          <p className="text-xs text-[#f0da9a] mt-0.5">
            {language === 'mr'
              ? '१. संस्था ➔ २. क्षेत्र प्रशिक्षक ➔ ३. शाळा ➔ ४. विद्यार्थी थेट मॅपिंग.'
              : 'Strict Data Lineage: 1. Organization ➔ 2. Field Facilitators ➔ 3. School Allocations ➔ 4. Students.'}
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

      {/* Visual Pipeline Flow Card (Explaining the 4-Step Architecture) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 mb-3">
          <Database className="w-4 h-4 text-[#233d76]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            {language === 'mr' ? 'प्रणाली डेटा प्रवाह व मॅपिंग' : 'System Data Lineage Flow'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#233d76] text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {language === 'mr' ? 'संस्था जोडा' : 'Add Organization'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {language === 'mr' ? 'TRST Direct किंवा भागीदार NGO तयार करा.' : 'Create in-house or partner NGO entity.'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#dfaf27] text-[#233d76] flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {language === 'mr' ? 'प्रशिक्षक व Auth प्रोफाइल' : 'Trainer & Auth Profile'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {language === 'mr' ? 'Supabase Auth युझर जोडून प्रोफाइल नियुक्त करा.' : 'Map Supabase Auth user to trainer profile.'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {language === 'mr' ? 'प्रशिक्षक शाळा नोंदवतात' : 'Trainers Add Schools'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {language === 'mr' ? 'शाळा थेट प्रशिक्षक व संस्थेच्या अंतर्गत मॅप होते.' : 'Schools lock automatically under their trainer.'}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {language === 'mr' ? 'विद्यार्थी व सत्रे' : 'Students & Sessions'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {language === 'mr' ? 'चाचण्या व २५ सत्र नोंदी आपोआप ट्रॅक होतात.' : 'Tests and 25 sessions roll up cleanly.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs: 1. Implementing Organizations, 2. Field Facilitators, 3. School Allocations */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('ORGS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'ORGS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '१. संस्था व भागीदार' : '1. Implementing Organizations'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {organizations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('TRAINERS')}
          className={`flex items-center space-x-2 pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'TRAINERS'
              ? 'border-[#233d76] text-[#233d76]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-[#dfaf27]" />
          <span>{language === 'mr' ? '२. क्षेत्र प्रशिक्षक व्यवस्थापन' : '2. Field Facilitators'}</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-full font-mono">
            {fieldTrainers.length}
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
      {/* TAB 1: ORGANIZATIONS MANAGEMENT (FIRST IN HIERARCHY)           */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्थेचे नाव *' : 'Organization Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. ज्ञान प्रबोधिनी, सह्याद्री...' : 'e.g. Jnana Prabodhini, VOPA...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
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
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                    placeholder="e.g. NGO_1, JPIP..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'संस्थेचा प्रकार' : 'Organization Type'}
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
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
                    value={orgContactPerson}
                    onChange={(e) => setOrgContactPerson(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. समन्वयक नाव...' : 'e.g. Coordinator Name...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
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
                    {language === 'mr' ? 'ईमेल आयडी' : 'Email Address'}
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
                  {language === 'mr' ? 'वर्णन व कार्यक्षेत्र' : 'Description & Scope'}
                </label>
                <textarea
                  rows={2}
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. कार्यक्षेत्र, उद्दिष्टे...' : 'e.g. Geographic scope, mission...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                />
              </div>

              {/* Assign Organization Coordinator / Lead User */}
              <div className="bg-[#233d76]/5 border border-[#233d76]/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-[#233d76]" />
                    <span className="font-bold text-xs text-[#233d76] uppercase tracking-wider">
                      {language === 'mr' ? 'संस्था समन्वयक खाते नियुक्त करा' : 'Assign Coordinator Login User'}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCoordinator}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setHasCoordinator(val);
                        if (val && !coordinatorName) {
                          setCoordinatorName(orgContactPerson || '');
                          setCoordinatorEmail(orgContactEmail || '');
                          setCoordinatorPhone(orgContactPhone || '');
                        }
                      }}
                      className="w-4 h-4 accent-[#233d76] rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {language === 'mr' ? 'समन्वयक खाते जोडा' : 'Enable Coordinator Login'}
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {language === 'mr'
                    ? 'या संस्थेसाठी स्वतंत्र समन्वयक खाते तयार करा. हा युझर लॉगिन करून त्याच्या अंतर्गत असलेले सर्व क्षेत्र प्रशिक्षक, शाळा व प्रगती ट्रॅक करू शकेल.'
                    : 'Assign a lead user to oversee this NGO. When they log in, they track all FTs, allocated schools, and sessions under this organization.'}
                </p>

                {hasCoordinator && (
                  <div className="space-y-3 pt-2 border-t border-[#233d76]/10">
                    {/* Select from existing Supabase backend users */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 block text-xs">
                          {language === 'mr'
                            ? 'बॅकएंड प्रोफाइलमधून वापरकर्ता निवडा (Supabase Profiles)'
                            : 'Select User from Backend Profiles (Supabase Auth)'}
                        </label>
                        <button
                          type="button"
                          onClick={handleRefreshProfiles}
                          className="text-[11px] text-[#233d76] hover:text-[#b88d18] flex items-center space-x-1 font-bold cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRefreshingProfiles ? 'animate-spin text-[#dfaf27]' : ''}`} />
                          <span>{language === 'mr' ? 'बॅकएंड रीफ्रेश करा' : 'Refresh Profiles'}</span>
                        </button>
                      </div>

                      <select
                        value={selectedProfileId}
                        onChange={(e) => handleSelectProfile(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                      >
                        <option value="">
                          {language === 'mr'
                            ? `-- नोंदणीकृत वापरकर्ता निवडा (${users.length} उपलब्ध) --`
                            : `-- Choose a registered backend profile (${users.length} available) --`}
                        </option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.email}) — [{u.role}] {u.organizationCode ? `(Org: ${u.organizationCode})` : ''}
                          </option>
                        ))}
                        <option value="__NEW_MANUAL__">
                          {language === 'mr'
                            ? '+ नवीन वापरकर्ता माहिती मॅन्युअली प्रविष्ट करा (Manual Entry)'
                            : '+ Enter details manually'}
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'mr' ? 'समन्वयकाचे नाव *' : 'Coordinator Name *'}
                      </label>
                      <input
                        type="text"
                        required={hasCoordinator}
                        value={coordinatorName}
                        onChange={(e) => setCoordinatorName(e.target.value)}
                        placeholder="e.g. Lead Person Name"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'mr' ? 'लॉगिन ईमेल *' : 'Login Email *'}
                      </label>
                      <input
                        type="email"
                        required={hasCoordinator}
                        value={coordinatorEmail}
                        onChange={(e) => setCoordinatorEmail(e.target.value)}
                        placeholder="coordinator@org.org.in"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'mr' ? 'फोन नंबर' : 'Phone'}
                      </label>
                      <input
                        type="tel"
                        value={coordinatorPhone}
                        onChange={(e) => setCoordinatorPhone(e.target.value)}
                        placeholder="+91 98000 00000"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'mr' ? 'Supabase Auth ID (UUID)' : 'Supabase Auth UUID'}
                      </label>
                      <div className="flex space-x-1.5">
                        <input
                          type="text"
                          value={coordinatorAuthUserId}
                          onChange={(e) => setCoordinatorAuthUserId(e.target.value)}
                          placeholder="auth-uuid..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                        />
                        <button
                          type="button"
                          onClick={() => setCoordinatorAuthUserId(`auth-coord-${(orgCode || 'org').toLowerCase()}-${Date.now().toString(36)}`)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                          title="Generate Auto ID"
                        >
                          Auto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                const linkedSchoolIds = new Set(linkedSchools.map((s) => s.id));
                const linkedStudents = students.filter((st) => linkedSchoolIds.has(st.schoolId));
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

                      <div className="grid grid-cols-3 gap-1 py-1 px-2 bg-slate-50 rounded-lg text-center text-[11px] font-bold text-[#233d76]">
                        <div>
                          <div className="text-sm font-black">{linkedTrainers.length}</div>
                          <div className="text-[10px] text-slate-500">{language === 'mr' ? 'प्रशिक्षक' : 'Trainers'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-black">{linkedSchools.length}</div>
                          <div className="text-[10px] text-slate-500">{language === 'mr' ? 'शाळा' : 'Schools'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-black">{linkedStudents.length}</div>
                          <div className="text-[10px] text-slate-500">{language === 'mr' ? 'विद्यार्थी' : 'Students'}</div>
                        </div>
                      </div>

                      {/* Coordinator Account Info */}
                      {(() => {
                        const orgCoord = users.find(
                          (u) => u.role === 'ORG_COORDINATOR' && u.organizationCode === org.code
                        );
                        if (!orgCoord && !org.coordinatorUserName) return null;
                        return (
                          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
                            <div className="overflow-hidden">
                              <span className="text-[11px] font-bold text-indigo-900 block truncate">
                                🏢 {language === 'mr' ? 'समन्वयक:' : 'Lead:'} {orgCoord?.fullName || org.coordinatorUserName}
                              </span>
                              <span className="text-[10px] text-indigo-600 block truncate">
                                {orgCoord?.email || org.coordinatorEmail}
                              </span>
                            </div>
                            {orgCoord && (
                              <button
                                onClick={() => {
                                  switchUser(orgCoord.id);
                                  triggerNotify(
                                    language === 'mr'
                                      ? `${orgCoord.fullName} खात्यात स्विच केले!`
                                      : `Switched to ${orgCoord.fullName}!`,
                                    'info'
                                  );
                                }}
                                className="ml-2 px-2.5 py-1 bg-[#233d76] hover:bg-[#1a2d57] text-[#f0da9a] hover:text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 shadow-2xs shrink-0 cursor-pointer"
                                title="समन्वयक म्हणून डॅशबोर्ड पहा"
                              >
                                <LogIn className="w-3 h-3" />
                                <span>{language === 'mr' ? 'खाते पहा' : 'View'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}

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
      {/* TAB 2: FIELD TRAINERS MANAGEMENT (SECOND IN HIERARCHY)         */}
      {/* ============================================================== */}
      {activeSubTab === 'TRAINERS' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 trust-heading">
                {language === 'mr' ? 'क्षेत्र प्रशिक्षकांची यादी व प्रोफाइल मॅपिंग' : 'Field Facilitators & Auth Profiles'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'mr'
                  ? 'येथे प्रशिक्षक जोडा, संस्था नियुक्त करा आणि Supabase Auth युझर मॅप करा.'
                  : 'Add facilitators, map to partner organizations, and link to Supabase Auth login accounts.'}
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
                      ? language === 'mr' ? 'प्रशिक्षकाची माहिती व Auth मॅपिंग बदला' : 'Edit Field Facilitator Profile'
                      : language === 'mr' ? 'नवीन क्षेत्र प्रशिक्षकाची नोंदणी व Auth लिंक' : 'Register Field Trainer & Map Auth Profile'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'प्रशिक्षकाचे पूर्ण नाव *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                    placeholder={language === 'mr' ? 'उदा. सचिन शिंदे...' : 'e.g. Facilitator Name...'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'mr' ? 'लॉगिन ईमेल आयडी *' : 'Login Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={trainerEmail}
                    onChange={(e) => setTrainerEmail(e.target.value)}
                    placeholder="trainer@domain.org"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
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
                    {language === 'mr' ? 'संस्था नियुक्त करा' : 'Assign Organization'}
                  </label>
                  <select
                    value={selectedOrgCode}
                    onChange={(e) => setSelectedOrgCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-[#233d76] bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  >
                    <option value="">-- {language === 'mr' ? 'थेट TRST अंतर्गत' : 'Direct TRST (In-House)'} --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.code}>
                        {language === 'mr' ? org.nameMr : (org.nameEn || org.nameMr)} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      {language === 'mr' ? 'Supabase Auth User ID (UUID)' : 'Supabase Auth User ID (UUID)'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthUserId(`usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`)}
                      className="text-[11px] text-[#233d76] font-bold hover:underline"
                    >
                      {language === 'mr' ? 'स्वयंचलित ID तयार करा' : 'Auto-Generate ID'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={authUserId}
                    onChange={(e) => setAuthUserId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'mr'
                      ? 'बॅकएंडमध्ये या ईमेलने युझर तयार केल्यावर हा आयडी public.profiles शी थेट जोडला जातो.'
                      : 'When created in Supabase Auth, the trigger populates public.profiles and maps to this trainer.'}
                  </p>
                </div>
              </div>

              {/* Explanatory Callout */}
              <div className="bg-[#f0da9a]/30 border border-[#dfaf27]/40 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-[#233d76]">
                <KeyRound className="w-4 h-4 text-[#233d76] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>{language === 'mr' ? 'लॉगिन अधिकार:' : 'Access Rights:'}</strong>{' '}
                  {language === 'mr'
                    ? 'जेव्हा हा प्रशिक्षक या ईमेलने लॉग इन करेल, तेव्हा त्याला फक्त त्याच्या संस्थेच्या अंतर्गत येणाऱ्या शाळा व विद्यार्थ्यांचे संचलन दिसेल.'
                    : 'When this facilitator signs in with this login, they will automatically access their assigned schools and students.'}
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
                    : language === 'mr' ? 'प्रशिक्षक व प्रोफाइल जतन करा' : 'Save Trainer & Profile'}
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
                  <th className="px-4 py-3 text-left font-bold">{language === 'mr' ? 'Supabase Auth प्रोफाइल' : 'Auth Profile'}</th>
                  <th className="px-4 py-3 text-center font-bold">{language === 'mr' ? 'मॅप झालेली व्याप्ती' : 'Mapped Scope'}</th>
                  <th className="px-4 py-3 text-center font-bold">{language === 'mr' ? 'लॉगिन / कृती' : 'Test Login & Actions'}</th>
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
                    const assignedSchoolIds = new Set(assignedSchools.map((s) => s.id));
                    const assignedStudents = students.filter((st) => assignedSchoolIds.has(st.schoolId));

                    return (
                      <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#233d76]/10 text-[#233d76] flex items-center justify-center font-bold text-xs shrink-0">
                              {tr.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{tr.fullName}</div>
                              {tr.phone && <div className="text-[11px] text-slate-400">{tr.phone}</div>}
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
                          <div className="font-mono text-[11px] text-[#233d76] font-bold">{tr.email}</div>
                          <div className="flex items-center space-x-1 text-[10px] text-emerald-700 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{language === 'mr' ? 'Auth प्रोफाइल जोडली' : 'Auth Profile Linked'}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-[#233d76] text-xs">
                              {assignedSchools.length} {language === 'mr' ? 'शाळा' : 'schools'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {assignedStudents.length} {language === 'mr' ? 'विद्यार्थी' : 'students'}
                            </span>
                          </div>
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
      {/* TAB 3: SCHOOL ALLOCATIONS (DIRECT ASSIGNMENT)                  */}
      {/* ============================================================== */}
      {activeSubTab === 'ALLOCATIONS' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 trust-heading">
                {language === 'mr' ? 'शाळा व प्रशिक्षक थेट वाटप' : 'Direct School & Facilitator Allocations'}
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
