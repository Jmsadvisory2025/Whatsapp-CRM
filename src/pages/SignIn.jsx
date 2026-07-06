// SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, ShieldCheck, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    // Reset PIN states
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code & New PIN
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const dispatch = useDispatch();
    const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

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
            setPasswordError('PIN/Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!isValid) return;

        try {
            await dispatch(loginUser({ email, password })).unwrap();
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) {
            dispatch(clearError());
        }
        if (emailError) {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) {
            dispatch(clearError());
        }
        if (passwordError) {
            setPasswordError('');
        }
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
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to send reset code');
            
            setResetMessage(data.message);
            setResetStep(2);
        } catch (err) {
            setEmailError(err.message);
        } finally {
            setIsResetting(false);
        }
    };

    const handleVerifyReset = async (e) => {
        e.preventDefault();
        if (!resetCode.trim() || !newPassword.trim()) {
            setPasswordError('Both reset code and new PIN are required');
            return;
        }
        
        setIsResetting(true);
        setResetMessage('');
        
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const url = `${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}api/auth/reset-pin/verify-code/`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: resetCode, new_password: newPassword })
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to reset PIN');
            
            setResetMessage(data.message);
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-surface p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
                    <div className="text-center mb-8">
                        <div className="inline-block bg-primary p-3 rounded-xl mb-4">
                            {isResetMode ? <Key size={24} color="white" /> : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 22V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{isResetMode ? 'Reset PIN' : 'Sign In'}</h1>
                        <p className="text-text-secondary mt-2">{isResetMode ? 'Recover access to your account securely' : 'Access your account to manage leads effectively'}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {!isResetMode && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary mb-1 block">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="Enter your email address"
                                        required
                                        disabled={isLoading}
                                    />
                                    {emailError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1"
                                        >
                                            {emailError}
                                        </motion.div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-text-secondary mb-1 block">
                                        PIN / Password
                                    </label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter your PIN or password"
                                        required
                                        disabled={isLoading}
                                    />
                                    {passwordError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-600 mt-1"
                                        >
                                            {passwordError}
                                        </motion.div>
                                    )}
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsResetMode(true)}
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            Forgot PIN?
                                        </button>
                                    </div>
                                </div>
                                
                                <Button 
                                    type="button"
                                    onClick={handleLogin}
                                    disabled={isLoading || !email.trim() || !validateEmail(email) || !password.trim()} 
                                    className="w-full !py-3 !text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Signing in...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </>
                        )}

                        {isResetMode && resetStep === 1 && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary mb-1 block">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                                        placeholder="Enter your email address"
                                        required
                                        disabled={isResetting}
                                    />
                                    {emailError && (
                                        <motion.div className="text-sm text-red-600 mt-1">{emailError}</motion.div>
                                    )}
                                </div>
                                
                                <Button 
                                    type="button"
                                    onClick={handleSendResetCode}
                                    disabled={isResetting || !email.trim() || !validateEmail(email)} 
                                    className="w-full !py-3 !text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isResetting ? 'Sending code...' : 'Send Reset Code'}
                                </Button>
                            </>
                        )}

                        {isResetMode && resetStep === 2 && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-text-secondary mb-1 block">
                                        Reset Code (from Email)
                                    </label>
                                    <Input
                                        type="text"
                                        value={resetCode}
                                        onChange={(e) => { setResetCode(e.target.value); setPasswordError(''); }}
                                        placeholder="6-digit code"
                                        required
                                        disabled={isResetting}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-text-secondary mb-1 block">
                                        New PIN
                                    </label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                                        placeholder="Enter your new PIN"
                                        required
                                        disabled={isResetting}
                                    />
                                    {passwordError && (
                                        <motion.div className="text-sm text-red-600 mt-1">{passwordError}</motion.div>
                                    )}
                                </div>
                                
                                <Button 
                                    type="button"
                                    onClick={handleVerifyReset}
                                    disabled={isResetting || !resetCode.trim() || !newPassword.trim()} 
                                    className="w-full !py-3 !text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isResetting ? 'Resetting PIN...' : 'Confirm Reset'}
                                </Button>
                            </>
                        )}

                        {resetMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {resetMessage}
                            </motion.div>
                        )}

                        {isResetMode && (
                            <div className="text-center mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setIsResetMode(false); setResetStep(1); setResetMessage(''); setPasswordError(''); setEmailError(''); }}
                                    className="text-sm text-gray-500 hover:text-gray-700 font-medium underline"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}

                        {error && !isResetMode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {!isResetMode && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg flex items-center gap-3">
                                <ShieldCheck size={20} />
                                <div>
                                    <h4 className="font-semibold">Secure PIN Login</h4>
                                    <p>Access your organization data securely.</p>
                                </div>
                            </div>
                        )}
                    </form>
                    
                    {/* <p className="text-xs text-text-secondary text-center mt-8">
                        By signing in, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </p> */}
                </div>

                <div className="m-2 bg-surface p-3 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4 max-w-sm mx-auto">
                    
                        <ShieldCheck className="text-primary" size={40}/>
                    
                    <div className="text-left">
                        <p className="font-semibold text-text-primary text-sm">Secure Access</p>
                        <p className="text-text-secondary text-xs mt-1 leading-relaxed">Your data is protected with enterprise-grade security</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignIn;
