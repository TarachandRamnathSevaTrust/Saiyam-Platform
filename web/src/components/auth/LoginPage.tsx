import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '@saiyam/shared';
import { apiService } from '../../lib/api';
import {
  ShieldCheck,
  Globe,
  LogIn,
  Crown,
  UserCheck,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Loader2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    login,
    users,
    organizations,
    language,
    setLanguage,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'DEMO' | 'AUTH'>(() => {
    return apiService.isConnected() ? 'AUTH' : 'DEMO';
  });

  // Handle standard email/password login using real Supabase Auth
  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया ईमेल आणि पासवर्ड दोन्ही प्रविष्ट करा.'
          : 'Please enter both email and password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      if (apiService.isConnected()) {
        const { user, error } = await apiService.signIn(email, password);
        if (error) {
          setErrorMsg(error);
          setIsLoading(false);
          return;
        }
        if (user) {
          login(user);
          setIsLoading(false);
          return;
        }
      }

      // Offline / fallback login
      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedUser) {
        login(matchedUser);
      } else {
        setErrorMsg(
          language === 'mr'
            ? 'अवैध ईमेल किंवा पासवर्ड.'
            : 'Invalid login credentials in Supabase Auth.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo 1: Trust Admin
  const handleDemoAdmin = () => {
    const adminUser = users.find((u) => u.role === 'TRUST_ADMIN') || {
      id: 'u-trust-admin',
      fullName: language === 'mr' ? 'विश्वस्त प्रतिनिधी' : 'Trust Executive',
      email: 'admin@trst.org.in',
      role: 'TRUST_ADMIN',
      isActive: true,
      createdAt: '2026-01-01',
    };
    login(adminUser);
  };

  // Demo 2: Field Trainer
  const handleDemoTrainer = () => {
    const existingTrainer = users.find((u) => u.role === 'FIELD_TRAINER');
    if (existingTrainer) {
      login(existingTrainer);
      return;
    }

    const demoTrainer: UserProfile = {
      id: 'demo-field-trainer',
      fullName: language === 'mr' ? 'क्षेत्र प्रशिक्षक' : 'Field Trainer',
      email: 'trainer@trst.org.in',
      role: 'FIELD_TRAINER',
      organizationCode: organizations[0]?.code || 'TRST_DIRECT',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    login(demoTrainer);
  };

  // Demo 3: Partner NGO Coordinator
  const handleDemoPartner = () => {
    // 1. Look for an existing ORG_COORDINATOR user
    const existingCoordinator = users.find((u) => u.role === 'ORG_COORDINATOR');
    if (existingCoordinator) {
      login(existingCoordinator);
      return;
    }

    // 2. Or check if any organization has a coordinator assigned
    const orgWithCoord = organizations.find((o) => o.coordinatorEmail || o.coordinatorUserName);
    if (orgWithCoord) {
      const coordUser: UserProfile = {
        id: orgWithCoord.coordinatorUserId || `coord-${orgWithCoord.id}`,
        fullName: orgWithCoord.coordinatorUserName || (language === 'mr' ? `${orgWithCoord.nameMr} समन्वयक` : `${orgWithCoord.nameEn} Coordinator`),
        email: orgWithCoord.coordinatorEmail || `coordinator@${orgWithCoord.code.toLowerCase()}.org`,
        role: 'ORG_COORDINATOR',
        organizationCode: orgWithCoord.code,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      login(coordUser);
      return;
    }

    // 3. Fallback to first partner organization (e.g. JPIP)
    const partnerOrg = organizations.find((o) => o.code !== 'TRST_DIRECT') || organizations[0];
    const demoPartner: UserProfile = {
      id: 'demo-partner-coord',
      fullName: language === 'mr'
        ? `${partnerOrg?.nameMr || 'ज्ञान प्रबोधिनी (JPIP)'} समन्वयक`
        : `${partnerOrg?.nameEn || 'Jnana Prabodhini (JPIP)'} Coordinator`,
      email: partnerOrg?.contactEmail || 'coordinator@jpip.org',
      role: 'ORG_COORDINATOR',
      organizationCode: partnerOrg?.code || 'JPIP_PUNE',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    login(demoPartner);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2d57] via-[#233d76] to-[#122040] flex flex-col justify-between p-3 sm:p-6 lg:p-8 pt-[env(safe-area-inset-top,0px)] sm:pt-6">
      {/* Top Navbar: Clean & Free of Any Filter */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-2 text-xs text-[#f0da9a]">
          <ShieldCheck className="w-4 h-4 text-[#dfaf27]" />
          <span className="font-semibold hidden sm:inline">DPDP Act (2023) Protected Platform</span>
          <span className="font-semibold sm:hidden">DPDP Act Protected</span>
        </div>

        {/* Language Toggle: Clear one-click toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#dfaf27]/60 bg-[#16274d] text-white hover:bg-[#203a73] transition-colors cursor-pointer shadow-xs"
        >
          <Globe className="w-3.5 h-3.5 text-[#dfaf27]" />
          <span className="text-[11px] font-bold text-[#f0da9a]">
            {language === 'en' ? 'मराठी मध्ये पहा' : 'View in English'}
          </span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#233d76] text-white p-6 sm:p-7 text-center relative border-b-4 border-[#dfaf27]">
            {/* Official Saiyam Logo */}
            <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto mb-3 shadow-md border-2 border-[#dfaf27] flex items-center justify-center">
              <img
                src="/saiyam-logo.png"
                alt="संयम (Saiyam)"
                className="h-11 w-auto object-contain"
              />
            </div>

            <div className="inline-flex items-center space-x-1.5 bg-[#dfaf27] text-[#233d76] font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 shadow-2xs">
              <span>{language === 'mr' ? 'टीआरएसटी पुणे' : 'TRST PUNE'}</span>
            </div>

            {/* Dynamic Title (No mixed names) */}
            <h1 className="text-2xl font-bold trust-heading text-white tracking-tight">
              {language === 'mr' ? 'संयम प्रकल्प' : 'SAIYAM PLATFORM'}
            </h1>
            <p className="text-xs text-[#f0da9a] mt-1 font-medium">
              {language === 'mr'
                ? 'किशोरवयीन व्यसनमुक्ती व मूल्यशिक्षण प्रकल्प'
                : 'Adolescent Anti-Addiction Initiative'}
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {language === 'mr'
                ? 'ताराचंद रामनाथ सेवा ट्रस्ट (TRST), पुणे'
                : 'Tarachand Ramnath Seva Trust (TRST), Pune'}
            </p>
          </div>

          {/* Tabs: Demo Access vs Direct Auth */}
          <div className="grid grid-cols-2 p-2 bg-slate-50 border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('DEMO')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'DEMO'
                  ? 'bg-white text-[#233d76] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#dfaf27]" />
              <span>{language === 'mr' ? '१-क्लिक डेमो प्रवेश' : '1-Click Demo Login'}</span>
            </button>
            <button
              onClick={() => setActiveTab('AUTH')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'AUTH'
                  ? 'bg-white text-[#233d76] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#233d76]" />
              <span>{language === 'mr' ? 'थेट खाते लॉगिन' : 'Account Sign In'}</span>
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {/* TAB 1: ONE-CLICK DEMO ACCESS FOR ALL ROLES */}
            {activeTab === 'DEMO' && (
              <div className="space-y-3.5">
                <div className="text-center pb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'mr' ? 'कोणत्या भूमिकेतून चाचणी करायची आहे?' : 'Select a role to preview the platform:'}
                  </span>
                </div>

                {/* Role 1: Trust Admin */}
                <button
                  onClick={handleDemoAdmin}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233d76] bg-gradient-to-r from-slate-50 hover:from-[#f0da9a]/20 to-white text-left transition-all group cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#233d76] text-[#dfaf27] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-[#233d76]">
                          {language === 'mr' ? '१. विश्वस्त / मुख्य ॲडमिन' : '1. Trust Executive / Admin'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'mr'
                            ? 'डॅशबोर्ड, संस्था व्यवस्थापन, प्रशिक्षक मॅपिंग व एक्सेल रिपोर्ट'
                            : 'Full Governance, Delta Impact Engine & Excel'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#233d76] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </button>

                {/* Role 2: Field Trainer */}
                <button
                  onClick={handleDemoTrainer}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233d76] bg-gradient-to-r from-slate-50 hover:from-[#dfaf27]/15 to-white text-left transition-all group cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#dfaf27] text-[#233d76] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-[#233d76]">
                          {language === 'mr' ? '२. क्षेत्र प्रशिक्षक' : '2. Field Trainer'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'mr'
                            ? 'शाळा नोंदणी, विद्यार्थी गठ्ठा (S-1 ते S-50), चाचण्या व २५ सत्रे'
                            : 'School visits, paper bundles, pre/post tests & 25 sessions'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#233d76] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </button>

                {/* Role 3: Partner NGO Coordinator */}
                <button
                  onClick={handleDemoPartner}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233d76] bg-gradient-to-r from-slate-50 hover:from-indigo-50 to-white text-left transition-all group cursor-pointer shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-[#233d76]">
                          {language === 'mr' ? '३. भागीदार संस्था समन्वयक' : '3. Implementing Partner NGO'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'mr'
                            ? 'संस्थेअंतर्गत क्षेत्रीय प्रशिक्षक, शाळा व प्रगती ट्रॅकिंग'
                            : 'Track Field Trainers, schools & sessions under this NGO'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#233d76] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </button>

                <div className="pt-2 text-center text-[11px] text-slate-400">
                  {language === 'mr'
                    ? '⚡ पासवर्डची आवश्यकता नाही — चाचणीसाठी एका क्लिकवर प्रवेश करा.'
                    : '⚡ No password required — tap any role to test immediately.'}
                </div>
              </div>
            )}

            {/* TAB 2: SUPABASE AUTH DIRECT CREDENTIAL LOGIN */}
            {activeTab === 'AUTH' && (
              <form onSubmit={handleAuthLogin} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'नोंदणीकृत ईमेल आयडी' : 'Registered Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@trst.org.in / trainer@..."
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#233d76] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'mr' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#233d76]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#233d76] hover:bg-[#1a2d57] text-[#f0da9a] hover:text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#dfaf27]" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading
                      ? language === 'mr'
                        ? 'प्रमाणीकरण चालू आहे...'
                        : 'Authenticating with Supabase...'
                      : language === 'mr'
                      ? 'लॉगिन करा'
                      : 'Sign In to Portal'}
                  </span>
                </button>

                <p className="text-[11px] text-center text-slate-400 mt-3">
                  {language === 'mr'
                    ? 'Supabase Auth द्वारे सुरक्षित डेटा ॲक्सेस.'
                    : 'Secured via Supabase Row Level Security (RLS).'}
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Trust Signature */}
        <div className="text-center text-slate-300 text-xs mt-4">
          <span>
            {language === 'mr'
              ? 'ताराचंद रामनाथ सेवा ट्रस्ट (TRST), पुणे'
              : 'Tarachand Ramnath Seva Trust (TRST), Pune'}
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        <span>
          {language === 'mr'
            ? 'संयम प्लॅटफॉर्म v1.0 • Android Native व Web PWA'
            : 'Saiyam Platform v1.0 • Android Native & Web PWA'}
        </span>
      </div>
    </div>
  );
};
