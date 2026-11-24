import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../lib/api';
import { UserProfile } from '@saiyam/shared';
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
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users = [], organizations = [], language, setLanguage } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'DEMO' | 'AUTH'>('DEMO');

  // Handle standard email/password login using real Supabase Auth
  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया ईमेल आणि पासवर्ड दोन्ही प्रविष्ट करा.'
          : 'Please enter both registered email and password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      if (!apiService.isConnected()) {
        setErrorMsg(
          language === 'mr'
            ? 'सुरक्षित ऑथेंटिकेशन सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट कनेक्शन तपासा.'
            : 'Authentication service is offline or unreachable. Please check your network connection.'
        );
        setIsLoading(false);
        return;
      }

      const { user, error } = await apiService.signIn(cleanEmail, cleanPassword);
      if (error) {
        const isCredError =
          error.toLowerCase().includes('invalid') ||
          error.toLowerCase().includes('credential');
        setErrorMsg(
          isCredError
            ? language === 'mr'
              ? 'अवैध ईमेल किंवा पासवर्ड. कृपया योग्य माहिती भरा.'
              : 'Invalid email or password. Please verify your credentials.'
            : error
        );
        setIsLoading(false);
        return;
      }

      if (user) {
        login(user, false);
        setIsLoading(false);
        return;
      }

      setErrorMsg(
        language === 'mr'
          ? 'वापरकर्ता प्रोफाइल सापडली नाही.'
          : 'User profile not found in Supabase Auth.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo 1: Trust Admin (1-Click)
  const handleDemoAdmin = () => {
    const adminUser = users.find((u) => u.role === 'TRUST_ADMIN') || {
      id: 'demo-trust-admin',
      fullName: language === 'mr' ? 'विश्वस्त प्रतिनिधी' : 'TRST Admin',
      email: 'admin@trst.org',
      role: 'TRUST_ADMIN',
      organizationCode: 'TRST_DIRECT',
      isActive: true,
      createdAt: '2026-01-01',
    };
    login(adminUser, true);
  };

  // Demo 2: Field Trainer (1-Click)
  const handleDemoTrainer = () => {
    const existingTrainer = users.find((u) => u.role === 'FIELD_TRAINER');
    const demoTrainer: UserProfile = existingTrainer || {
      id: 'demo-field-trainer',
      fullName: language === 'mr' ? 'तुकाराम मुंढे (क्षेत्र प्रशिक्षक)' : 'Tukaram Munde (Field Trainer)',
      email: 'trainer@trst.org',
      role: 'FIELD_TRAINER',
      organizationCode: 'TRST_DIRECT',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    login(demoTrainer, true);
  };

  // Demo 3: Partner NGO Coordinator (1-Click)
  const handleDemoPartner = () => {
    const existingCoord = users.find((u) => u.role === 'ORG_COORDINATOR');
    const partnerOrg = organizations.find((o) => o.code !== 'TRST_DIRECT') || organizations[0];
    const demoPartner: UserProfile = existingCoord || {
      id: 'demo-partner-coord',
      fullName: language === 'mr' ? 'डॉ. अनघा कादोलकर (JPIP)' : 'Dr. Anagha Kadolkar (JPIP)',
      email: 'coordinator@jpip.org',
      role: 'ORG_COORDINATOR',
      organizationCode: partnerOrg?.code || 'JPIP',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    login(demoPartner, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2d57] via-[#233d76] to-[#122040] flex flex-col justify-between p-3 sm:p-6 lg:p-8 pt-[env(safe-area-inset-top,0px)] sm:pt-6">
      {/* Top Navbar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-2 text-xs text-[#f0da9a]">
          <ShieldCheck className="w-4 h-4 text-[#dfaf27]" />
          <span className="font-semibold hidden sm:inline">
            DPDP Act (2023) Protected Platform
          </span>
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

            {/* Platform Title */}
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

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                setActiveTab('DEMO');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'DEMO'
                  ? 'border-[#233d76] text-[#233d76] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#dfaf27]" />
              <span>{language === 'mr' ? '१-क्लिक डेमो (Presentation)' : '1-Click Demo Access'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('AUTH');
                setErrorMsg('');
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'AUTH'
                  ? 'border-[#233d76] text-[#233d76] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>{language === 'mr' ? 'पासवर्ड लॉगिन' : 'Password Login'}</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: 1-CLICK DEMO CARDS FOR PRESENTATION */}
            {activeTab === 'DEMO' && (
              <div className="space-y-3">
                <div className="mb-3 text-center">
                  <span className="text-xs text-slate-500 font-medium">
                    {language === 'mr'
                      ? 'सादरीकरणासाठी भूमिका निवडा (१-क्लिक थेट प्रवेश):'
                      : 'Select a role below for instant presentation access:'}
                  </span>
                </div>

                {/* 1. TRST Admin Card */}
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233d76] bg-slate-50/70 hover:bg-white transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-[#233d76] transition-colors">
                          {language === 'mr'
                            ? '१. विश्वस्त प्रतिनिधी (TRST Admin)'
                            : '1. Trust Executive (Admin)'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'mr'
                            ? 'सर्वंकष डॅशबोर्ड, संस्था पर्यवेक्षण व देखरेख'
                            : 'Full oversight, NGO management & supervision tables'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#233d76] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </button>

                {/* 2. Field Trainer Card */}
                <button
                  type="button"
                  onClick={handleDemoTrainer}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233d76] bg-slate-50/70 hover:bg-white transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-[#233d76] transition-colors">
                          {language === 'mr'
                            ? '२. क्षेत्र प्रशिक्षक (Field Trainer)'
                            : '2. Field Facilitator (Trainer)'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'mr'
                            ? 'शाळा नोंदणी, विद्यार्थी यादी (S-1), चाचण्या व २५ सत्रे'
                            : 'School visits, student roster (S-1), tests & 25 sessions'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#233d76] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </button>

                {/* 3. Partner NGO Coordinator Card */}
                <button
                  type="button"
                  onClick={handleDemoPartner}
                  className="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-[#233d76] bg-slate-50/70 hover:bg-white transition-all group shadow-2xs hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-[#233d76] transition-colors">
                          {language === 'mr'
                            ? '३. भागीदार संस्था समन्वयक'
                            : '3. Partner NGO Coordinator'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'mr'
                            ? 'नियुक्त शाळांचे निरीक्षण व समन्वय (JPIP)'
                            : 'Partner-scoped oversight & allocated schools (JPIP)'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#233d76] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </button>

                <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#dfaf27]" />
                  <span>
                    {language === 'mr'
                      ? '⚡ पासवर्डची आवश्यकता नाही — चाचणी व सादरीकरणासाठी १-क्लिक प्रवेश.'
                      : '⚡ No password required — 1-click tap for presentation & testing.'}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: SUPABASE AUTH DIRECT CREDENTIAL LOGIN */}
            {activeTab === 'AUTH' && (
              <form onSubmit={handleAuthLogin} className="space-y-4">
                <div className="mb-3 text-center">
                  <p className="text-xs text-slate-500">
                    {language === 'mr'
                      ? 'तुमचा नोंदणीकृत ईमेल आणि पासवर्ड प्रविष्ट करा'
                      : 'Enter your registered email and password to continue'}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start space-x-2">
                    <span className="shrink-0 text-sm">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'mr' ? 'नोंदणीकृत ईमेल आयडी' : 'Registered Email Address'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        language === 'mr'
                          ? 'तुमचा ईमेल टाका (उदा. admin@trst.org)'
                          : 'e.g. admin@trst.org or trainer@...'
                      }
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#233d76] font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'mr' ? 'पासवर्ड' : 'Password'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#233d76] font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#233d76] hover:bg-[#1a2d57] text-[#f0da9a] hover:text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
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
                      ? 'सुरक्षित लॉगिन करा'
                      : 'Sign In Securely'}
                  </span>
                </button>

                <div className="pt-2 text-center">
                  <div className="inline-flex items-center space-x-1 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {language === 'mr'
                        ? 'DPDP कायदा २०२३ अंतर्गत एंड-टू-एंड एनक्रिप्टेड'
                        : 'End-to-End Encrypted under DPDP Act (2023)'}
                    </span>
                  </div>
                </div>
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
