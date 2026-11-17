import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Smartphone, 
  RefreshCw, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Authentic Multi-Color Google 'G' SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const COUNTRY_CODES = [
  { code: '+880', label: 'BD (+880)', flag: '🇧🇩' },
  { code: '+1', label: 'US/CA (+1)', flag: '🇺🇸' },
  { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: '+61', label: 'AU (+61)', flag: '🇦🇺' },
  { code: '+41', label: 'CH (+41)', flag: '🇨🇭' },
  { code: '+65', label: 'SG (+65)', flag: '🇸🇬' }
];

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    closeAuthModal, 
    openAuthModal,
    loginWithEmail,
    signupWithEmail,
    loginWithPhone,
    loginWithGoogle,
    resetPassword
  } = useAuth();

  const [activeTab, setActiveTab] = useState(authModalTab || 'login'); // 'login' | 'signup' | 'phone' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCountryCode, setSignupCountryCode] = useState('+880');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Phone OTP state
  const [phoneCountryCode, setPhoneCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('1711234567');
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter phone, 2 = Enter OTP
  const [otpDigits, setOtpDigits] = useState(['6', '9', '0', '2', '4', '8']);
  const [countdown, setCountdown] = useState(59);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = identifier, 2 = code & new pass, 3 = success
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Sync tab with context trigger
  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [authModalTab]);

  // Countdown timer for Phone OTP
  useEffect(() => {
    let timer = null;
    if (isTimerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerActive, countdown]);

  if (!isAuthModalOpen) return null;

  // Handle Google Login with Firebase
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    try {
      setIsLoading(true);
      await loginWithGoogle();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to complete Google sign-in.');
    }
  };

  // Handle Email Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginIdentifier || !loginPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithEmail(loginIdentifier, loginPassword, rememberMe);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Invalid credentials provided. Please try again.');
    }
  };

  // Handle Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName || !signupEmail || !signupPhone || !signupPassword) {
      setErrorMessage('Please fill in all information correctly.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify again.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the terms of service.');
      return;
    }

    try {
      setIsLoading(true);
      await signupWithEmail({
        name: signupName,
        email: signupEmail,
        phone: `${signupCountryCode}${signupPhone}`,
        password: signupPassword
      });
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to create account. Please try again.');
    }
  };

  // Handle Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phoneNumber) {
      setErrorMessage('Please enter your mobile number.');
      return;
    }
    setOtpStep(2);
    setCountdown(59);
    setIsTimerActive(true);
    setSuccessMessage(`Demo 6-digit OTP code [690248] has been sent to ${phoneCountryCode} ${phoneNumber}`);
  };

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithPhone(`${phoneCountryCode}${phoneNumber}`, fullCode);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Invalid OTP code. Enter 690248 to verify.');
    }
  };

  // Handle Forgot Password with Firebase
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotIdentifier || !forgotIdentifier.includes('@')) {
      setErrorMessage('Please enter your valid registered email address.');
      return;
    }
    try {
      setIsLoading(true);
      await resetPassword(forgotIdentifier);
      setIsLoading(false);
      setForgotStep(3);
      setSuccessMessage(`Password reset link has been sent to ${forgotIdentifier}. Please check your email.`);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to send password reset email.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newPassword || !confirmNewPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setForgotStep(3);
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl">
          
          {/* Liquid Glass Auth Container with iOS Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 10, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className="relative w-full max-w-md max-h-[86vh] flex flex-col rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_20px_60px_rgba(15,23,42,0.3)] dark:shadow-2xl my-auto text-white transition-all"
          >
            
            {/* Ambient Top Glow Blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#69EBDA]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 backdrop-blur-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="p-4 sm:p-5 pb-3 relative z-10 shrink-0 border-b border-white/15 dark:border-white/10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] text-[11px] font-bold mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Etheria Traveler Pass</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
                {activeTab === 'login' && <span key="h-login">Welcome Back</span>}
                {activeTab === 'signup' && <span key="h-signup">Create New Account</span>}
                {activeTab === 'phone' && <span key="h-phone">Instant Mobile Login</span>}
                {activeTab === 'forgot' && <span key="h-forgot">Reset Password</span>}
              </h2>

              <p className="mt-1 text-slate-100 dark:text-slate-300 text-xs sm:text-sm font-medium">
                {activeTab === 'login' && <span key="p-login">View your saved itineraries, booking statuses & details.</span>}
                {activeTab === 'signup' && <span key="p-signup">Join the elite travelers club and enjoy exclusive privileges.</span>}
                {activeTab === 'phone' && <span key="p-phone">Log in directly via secure SMS OTP without needing a password.</span>}
                {activeTab === 'forgot' && <span key="p-forgot">Verify your identity to safely regain access to your account.</span>}
              </p>

              {/* Tab Selector with Shared layoutId Sliding Pill */}
              {activeTab !== 'forgot' && (
                <div className="mt-5 p-1 rounded-2xl bg-slate-800/50 dark:bg-slate-950/50 backdrop-blur-md border border-white/20 dark:border-white/10 grid grid-cols-3 gap-1">
                  {[
                    { id: 'login', label: 'Sign In', icon: Mail },
                    { id: 'signup', label: 'Sign Up', icon: User },
                    { id: 'phone', label: 'Mobile OTP', icon: Smartphone }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isTabActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setErrorMessage('');
                          if (tab.id === 'phone') setOtpStep(1);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        className={`
                          relative py-2.5 px-3 rounded-xl text-xs font-extrabold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer
                          ${isTabActive
                            ? 'text-slate-950 font-black'
                            : 'text-slate-200 dark:text-slate-300 hover:text-white'
                          }
                        `}
                      >
                        {isTabActive && (
                          <motion.div
                            layoutId="activeAuthTabPill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-400 shadow-md shadow-[#69EBDA]/25"
                            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <TabIcon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 relative z-10 overflow-y-auto flex-1">
          
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: LOGIN VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <form key="tab-login" onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Google One-Click Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 min-h-[46px] rounded-2xl bg-slate-800/60 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15 text-white border border-white/20 shadow-sm flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-white/15 dark:border-white/10 w-full" />
                <span className="bg-[#5C6977] dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                  Or with email & password
                </span>
              </div>

              {/* Email / Phone Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                  Email or Mobile Number
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA] focus:ring-1 focus:ring-[#69EBDA] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setForgotIdentifier(loginIdentifier);
                      setForgotStep(1);
                    }}
                    className="text-xs text-[#69EBDA] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 min-h-[46px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA] focus:ring-1 focus:ring-[#69EBDA] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs text-slate-200 dark:text-slate-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 border-white/20 focus:ring-[#69EBDA]"
                  />
                  <span>Remember login on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 hover:from-[#69EBDA] hover:to-cyan-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SIGN UP VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'signup' && (
            <form key="tab-signup" onSubmit={handleSignupSubmit} className="space-y-3.5">
              
              {/* Google Signup */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 min-h-[46px] rounded-2xl bg-slate-800/60 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15 text-white border border-white/20 shadow-sm flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer"
              >
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-white/15 dark:border-white/10 w-full" />
                <span className="bg-[#5C6977] dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                  Or register with email
                </span>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA]"
                  />
                </div>
              </div>

              {/* Phone with Country Code */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                  Mobile Number (WhatsApp linked)
                </label>
                <div className="flex gap-2">
                  <select
                    value={signupCountryCode}
                    onChange={(e) => setSignupCountryCode(e.target.value)}
                    className="w-32 py-2.5 px-3 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1 flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="1712345678"
                      className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA]"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-9 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#69EBDA]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-slate-300 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-9 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#69EBDA]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 p-1 text-slate-300 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-200 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-teal-500 border-white/20 focus:ring-[#69EBDA]"
                />
                <span>I agree to the Terms of Service & Privacy Policy of Etheria Travels.</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PHONE OTP VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'phone' && (
            <div key="tab-phone" className="space-y-4">
              {otpStep === 1 ? (
                <form key="otp-step-1" onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                      Enter your registered mobile number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="w-32 py-3 px-3 min-h-[46px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1 flex items-center">
                        <Phone className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="1711234567"
                          className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA]"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-200 dark:text-slate-400 font-medium">
                    We will send an instant 6-digit verification code to your device via SMS.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs text-slate-200 dark:text-slate-300">
                      Code sent to: <strong className="text-white">{phoneCountryCode} {phoneNumber}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="ml-2 text-xs text-[#69EBDA] hover:underline cursor-pointer"
                    >
                      (Change)
                    </button>
                  </div>

                  {/* 6-digit OTP Inputs */}
                  <div className="flex justify-center gap-2 sm:gap-3 my-4">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-mono font-bold rounded-2xl bg-slate-800/60 dark:bg-white/10 border-2 border-[#69EBDA]/50 dark:border-white/20 text-white focus:outline-none focus:border-[#69EBDA] focus:ring-2 focus:ring-[#69EBDA]/30 transition-all"
                      />
                    ))}
                  </div>

                  {/* Resend Timer */}
                  <div className="flex items-center justify-between text-xs text-slate-200 dark:text-slate-400">
                    {isTimerActive ? (
                      <span>Resend code in: <strong className="text-white">{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCountdown(59);
                          setIsTimerActive(true);
                          setSuccessMessage('New demo OTP code [690248] sent.');
                        }}
                        className="text-[#69EBDA] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend 6-digit code</span>
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-[#69EBDA]">Demo OTP: 690248</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: FORGOT PASSWORD FLOW */}
          {/* ========================================================================= */}
          {activeTab === 'forgot' && (
            <div key="tab-forgot" className="space-y-4">
              {forgotStep === 1 && (
                <form key="forgot-step-1" onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                      Enter your account email or phone number
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#69EBDA]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="w-full text-center text-xs text-slate-200 dark:text-slate-400 hover:text-white cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="Enter 6-digit code (e.g. 789123)"
                      className="w-full px-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#69EBDA]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full pl-10 pr-9 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white text-xs focus:outline-none focus:border-[#69EBDA]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 p-1 text-slate-300 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-200 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-9 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 dark:border-white/15 text-white text-xs focus:outline-none focus:border-[#69EBDA]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 p-1 text-slate-300 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password & Enter</span>
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA] text-[#69EBDA] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(105,235,218,0.5)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                    Password Changed Successfully!
                  </h3>
                  <p className="text-xs text-slate-100 dark:text-slate-300 max-w-xs mx-auto">
                    Your password has been securely updated. You can now log in with your new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setForgotStep(1);
                    }}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </motion.div>

    </div>
    )}
  </AnimatePresence>
  );
};
