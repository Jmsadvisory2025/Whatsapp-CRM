// SignIn.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, clearError } from '../store/authSlice';

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const dispatch = useDispatch();
    const { isLoading, error, otpSent } = useSelector((state) => state.auth);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendCode = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setEmailError('');

        try {
            const result = await dispatch(sendOtp(email)).unwrap();
            navigate('/verify');
        } catch (error) {
            console.error('Send OTP error:', error);
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 22V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Sign in to META-CRM</h1>
                        <p className="text-text-secondary mt-2">Access your account to manage leads effectively</p>
                    </div>

                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div className="flex items-center justify-center gap-3 text-lg font-semibold text-text-primary">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                <Mail size={20} />
                            </div>
                            <span>User Login</span>
                        </div>

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
                        
                        <Button 
                            type="submit" 
                            disabled={isLoading || !email.trim() || !validateEmail(email)} 
                            className="w-full !py-3 !text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Send Login Code'
                            )}
                        </Button>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {otpSent && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                            >
                                OTP sent successfully to {email}
                            </motion.div>
                        )}

                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg flex items-center gap-3">
                            <ShieldCheck size={20} />
                            <div>
                                <h4 className="font-semibold">Secure Email Verification</h4>
                                <p>Access granted by your administrator.</p>
                            </div>
                        </div>
                    </form>
                    
                    <p className="text-xs text-text-secondary text-center mt-8">
                        By signing in, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </p>
                </div>

                <div className="text-center mt-6 bg-surface p-4 rounded-lg shadow-md border flex items-center gap-4 max-w-xs mx-auto">
                    <ShieldCheck className="text-primary" size={32}/>
                    <div>
                        <p className="font-semibold text-text-primary">Secure Access</p>
                        <p className="text-sm text-text-secondary">Choose your login method based on your role.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignIn;
