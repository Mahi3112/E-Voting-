import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import img from '../assets/download.jpg';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Autofocus first input on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (!email) {
      toast.error('Email missing. Please login again.');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:3000/user/verify-otp',
        { email, token: enteredOtp },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { token, role, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('OTP Verified!');
      navigate(role === 'admin' ? '/admin' : '/user/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Try again.');
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email missing. Please login again.');
      navigate('/login');
      return;
    }
    setResending(true);
    try {
      await axios.post('http://localhost:3000/user/resend-otp', { email });
      toast.success('OTP resent! Please check your email or authenticator app.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP.');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-12 rounded-2xl shadow-2xl w-[500px] text-center">
        <img
          src={img}
          alt="Phone Verification"
          className="w-100 h-100 mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold mb-2">Account Verification</h2>
        <p className="text-base text-gray-500 mb-8">
          Enter the code sent to your email
        </p>

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                className="w-12 h-14 border border-gray-300 rounded-md text-center text-xl text-black focus:outline-blue-500"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 transition"
          >
            Verify Code
          </button>

          <p
            className={`text-sm text-purple-600 mt-5 cursor-pointer hover:underline ${resending ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleResend}
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;