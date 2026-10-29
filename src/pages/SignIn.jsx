// SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import jmsLogo from '../assets/jms.png';
import SignInSimpleArt from '../components/ui/SignInSimpleArt';

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Reset PIN states
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        let isValid = true;
        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!isValid) return;

        try {
            await dispatch(loginUser({ email: email.trim(), password })).unwrap();
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) dispatch(clearError());
        if (emailError) setEmailError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) dispatch(clearError());
        if (passwordError) setPasswordError('');
    };

    const handleSendResetCode = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setIsResetting(true);
        setResetMessage('');

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const url = `${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}api/auth/reset-pin/send-code/`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset code');
            }

            setResetMessage('Reset code sent to your email!');
            setResetStep(2);
        } catch (err) {
            setEmailError(err.message);
        } finally {
            setIsResetting(false);
        }
    };

    const handleVerifyReset = async (e) => {
        e.preventDefault();
        if (!resetCode.trim()) {
            setPasswordError('Reset code is required');
            return;
        }
        if (!newPassword.trim()) {
            setPasswordError('New password is required');
            return;
        }

        setIsResetting(true);
        setPasswordError('');
        setResetMessage('');

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const url = `${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}api/auth/reset-pin/verify/`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    code: resetCode.trim(),
                    new_password: newPassword.trim()
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setResetMessage('Password reset successful! You can now login.');
            setTimeout(() => {
                setIsResetMode(false);
                setResetStep(1);
                setResetCode('');
                setNewPassword('');
                setPassword('');
                setResetMessage('');
            }, 2000);
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#FAFAFC] flex flex-col font-sans overflow-hidden">
            {/* Top Brand Logo - Clean, without sticky bar border/background */}
            <div className="w-full px-8 sm:px-14 pt-6 pb-2 shrink-0">
                <img
                    src={jmsLogo}
                    alt="JMS Logo"
                    className="h-16 sm:h-20 w-auto object-contain cursor-pointer"
                    onClick={() => navigate("/signin")}
                />
            </div>

            {/* Split Screen Content - elevated and centered */}
            <main className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center px-6 sm:px-12 pb-8 gap-8 lg:gap-14 overflow-hidden -mt-4">

                {/* ── LEFT COLUMN: Clean Minimal Art ── */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center">
                    <SignInSimpleArt />
                </div>

                {/* ── RIGHT COLUMN: NWORX Style Clean Auth Form ── */}
                <div className="lg:col-span-6 w-full max-w-[440px] mx-auto flex flex-col justify-center">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-blue-500/5">

                        {/* Title Header */}
                        <div className="mb-5 text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
                                {isResetMode ? 'Reset Password' : 'Good to have you back.'}
                            </h1>
                            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed font-normal">
                                {isResetMode
                                    ? 'Recover access to your account securely'
                                    : 'Your leads, customer conversations, and campaign activity are all ready when you are.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            {!isResetMode ? (
                                <>
                                    {/* Email Address Input */}
                                    <div>
                                        <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={handleEmailChange}
                                                placeholder="name@company.com"
                                                className={`w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border transition-all outline-none ${emailError ? 'border-red-400 focus:border-red-500' : 'border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10'
                                                    }`}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {emailError && (
                                            <p className="text-xs text-red-600 mt-1">{emailError}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter your password"
                                                className={`w-full pl-3.5 pr-10 py-2.5 text-xs bg-white rounded-xl border transition-all outline-none tracking-normal ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10'
                                                    }`}
                                                required
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {passwordError && (
                                            <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                                        )}
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#64748B]">
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="w-4 h-4 rounded text-[#165DFF] border-slate-300 focus:ring-[#165DFF]"
                                            />
                                            <span>Keep me signed in</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetMode(true)}
                                            className="text-xs text-[#165DFF] hover:underline font-medium cursor-pointer"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    {/* Sign In Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full !mt-3 py-3 px-4 text-xs font-semibold rounded-xl text-white bg-[#165DFF] hover:bg-[#1247CC] active:bg-[#0D38A8] transition-all shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <span>Sign In &rarr;</span>
                                        )}
                                    </button>

                                    <div className="pt-2 text-center">
                                        <p className="text-xs text-[#64748B]">
                                            New to JMS?{" "}
                                            <span
                                                onClick={() => navigate("/signup")}
                                                className="text-[#165DFF] font-medium cursor-pointer hover:underline"
                                            >
                                                Create an account
                                            </span>
                                        </p>
                                    </div>
                                </>
                            ) : (
                                /* RESET PIN FLOW */
                                <>
                                    {resetStep === 1 && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={handleEmailChange}
                                                        placeholder="Enter registered email"
                                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] outline-none"
                                                        required
                                                        disabled={isResetting}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleSendResetCode}
                                                disabled={isResetting || !email.trim() || !validateEmail(email)}
                                                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-[#165DFF] hover:bg-[#1247CC] transition-all shadow-md shadow-blue-500/20 disabled:bg-slate-300 cursor-pointer"
                                            >
                                                {isResetting ? "Sending Code..." : "Send Verification Code"}
                                            </button>
                                        </>
                                    )}

                                    {resetStep === 2 && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                                                    6-Digit Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={resetCode}
                                                    onChange={(e) => setResetCode(e.target.value)}
                                                    placeholder="123456"
                                                    maxLength={6}
                                                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] outline-none tracking-widest text-center font-bold"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                                                    New PIN / Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new PIN"
                                                    className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] outline-none"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleVerifyReset}
                                                disabled={isResetting || resetCode.length !== 6 || !newPassword.trim()}
                                                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-[#165DFF] hover:bg-[#1247CC] transition-all shadow-md shadow-blue-500/20 disabled:bg-slate-300 cursor-pointer"
                                            >
                                                {isResetting ? "Updating..." : "Reset PIN"}
                                            </button>
                                        </>
                                    )}

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setIsResetMode(false); setResetStep(1); setResetMessage(''); setPasswordError(''); setEmailError(''); }}
                                            className="text-xs text-[#64748B] hover:text-[#172033] font-medium cursor-pointer"
                                        >
                                            Back to Sign In
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Notifications / Errors */}
                            {resetMessage && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-xs">
                                    {resetMessage}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SignIn;
