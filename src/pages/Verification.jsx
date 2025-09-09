// Verification.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, sendOtp, setOtp, clearError } from '../store/authSlice';

const Verification = () => {
  const navigate = useNavigate();
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);
  const inputRefs = useRef([]);
  
  const dispatch = useDispatch();
  const { email, isLoading, error, isVerified, otpExpiryTime } = useSelector((state) => state.auth);

  // Initialize countdown timer
  useEffect(() => {
    if (!email) {
      navigate('/signin');
      return;
    }

    if (otpExpiryTime) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, otpExpiryTime - now);
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setIsExpired(true);
          clearInterval(intervalRef.current);
        }
      };

      updateTimer();
      intervalRef.current = setInterval(updateTimer, 1000);

      return () => clearInterval(intervalRef.current);
    }
  }, [email, otpExpiryTime, navigate]);

  // Format time display
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    
    if (value === '' || /^[0-9]$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);
      dispatch(setOtp(newOtpInputs.join('')));
      
      // Auto-focus next input
      if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otpInputs[index] === '' && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pasteData)) {
      const newOtpInputs = pasteData.split('');
      setOtpInputs(newOtpInputs);
      dispatch(setOtp(pasteData));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otpInputs.join('');
    
    if (code.length !== 6) {
      return;
    }

    // Check if OTP is expired
    if (isExpired || (otpExpiryTime && Date.now() > otpExpiryTime)) {
      setIsExpired(true);
      dispatch({ type: 'auth/verifyOtp/rejected', payload: 'Your OTP has expired. Please request a new one.' });
      return;
    }

    try {
      await dispatch(verifyOtp({ email, code })).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading) return;
    
    try {
      await dispatch(sendOtp(email)).unwrap();
      setOtpInputs(['', '', '', '', '', '']);
      setIsExpired(false);
      dispatch(clearError());
      
      // Focus first input after resend
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheck className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Successful!</h2>
          <p className="text-text-secondary">Redirecting to setup...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-surface p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
          <div className="inline-block bg-primary p-3 rounded-xl mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 7L12 12L22 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Enter Verification Code
          </h1>
          <p className="text-text-secondary mt-2 mb-6">
            We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your identity.
          </p>

          {/* Countdown Timer */}
          {!isExpired && timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 text-sm">
              <Clock size={16} className="text-orange-500" />
              <span className="text-orange-600 font-medium">
                Code expires in: {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              <strong>Code Expired!</strong> Please request a new verification code.
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2 md:gap-4 mb-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    maxLength="1"
                    value={otpInputs[i]}
                    onChange={(e) => handleInputChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 text-center text-2xl font-semibold border rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-colors ${
                      isExpired 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 focus:border-primary'
                    }`}
                    disabled={isLoading || isExpired}
                  />
                ))}
            </div>

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isLoading || otpInputs.join('').length !== 6 || isExpired}
                className="w-full !py-3 !text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <p className="text-sm text-text-secondary">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="font-medium text-primary hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </form>

          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg flex items-center gap-3 mt-6 text-left">
            <ShieldCheck size={20} className="flex-shrink-0" />
            <p>
              Your code is valid for 5 minutes for security. Keep this window
              open during verification.
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mt-6">
          Having trouble? Contact{" "}
          <a
            href="mailto:support@metacrm.com"
            className="font-medium text-primary hover:underline"
          >
            support@metacrm.com
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Verification;