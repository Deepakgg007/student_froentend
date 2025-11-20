import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
import api from "../../services/api";

/* Eye Icons */
const EyeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeOffIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.584 10.587a2 2 0 0 0 2.828 2.826" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.363 5.363a9.656 9.656 0 0 1 10.477 4.27 9.656 9.656 0 0 1-1.67 1.908" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ForgetPass = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        otp_code: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/forgot-password/', { email: formData.email });
            setSuccess('OTP has been sent to your email!');
            setTimeout(() => {
                setStep(2);
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!formData.otp_code) {
            setError('Please enter the OTP code');
            return;
        }

        if (formData.otp_code.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/verify-otp/', {
                email: formData.email,
                otp_code: formData.otp_code
            });
            setSuccess('OTP verified successfully!');
            setTimeout(() => {
                setStep(3);
                setSuccess('');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!formData.new_password || !formData.confirm_password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        if (formData.new_password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/reset-password/', {
                email: formData.email,
                otp_code: formData.otp_code,
                new_password: formData.new_password,
                confirm_password: formData.confirm_password
            });
            setSuccess('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response?.data) {
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.values(errorData).flat().join(', ');
                    setError(errorMessages);
                } else {
                    setError(errorData.message || 'Failed to reset password');
                }
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Header />
            <div className="login-section padding-tb section-bg">
                <div className="container">
                    <div className="account-wrapper" style={{ maxWidth: 500, margin: "0 auto" }}>
                        {step === 1 && (
                            <>
                                <h3 className="title">Forgot Password</h3>
                                <p className="text-center mb-4">Enter your email to receive an OTP</p>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success" role="alert">
                                        {success}
                                    </div>
                                )}

                                <form className="account-form" onSubmit={handleRequestOTP}>
                                    <div className="form-row">
                                        <label className="form-label">
                                            Email <span className="required">*</span>
                                        </label>
                                        <div className="form-control-wrap">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter your email"
                                                required
                                                className="text-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row submit-row">
                                        <div />
                                        <div className="form-control-wrap">
                                            <button
                                                type="submit"
                                                className="lab-btn"
                                                disabled={loading}
                                            >
                                                <span>{loading ? 'Sending...' : 'Send OTP'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h3 className="title">Verify OTP</h3>
                                <p className="text-center mb-4">Enter the 6-digit code sent to {formData.email}</p>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success" role="alert">
                                        {success}
                                    </div>
                                )}

                                <form className="account-form" onSubmit={handleVerifyOTP}>
                                    <div className="form-row">
                                        <label className="form-label">
                                            OTP Code <span className="required">*</span>
                                        </label>
                                        <div className="form-control-wrap">
                                            <input
                                                type="text"
                                                name="otp_code"
                                                value={formData.otp_code}
                                                onChange={handleChange}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength="6"
                                                required
                                                className="text-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row submit-row">
                                        <div />
                                        <div className="form-control-wrap">
                                            <button
                                                type="submit"
                                                className="lab-btn"
                                                disabled={loading}
                                            >
                                                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                <div className="text-center mt-3">
                                    <button
                                        className="btn btn-link"
                                        onClick={() => setStep(1)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#667eea', 
                                            textDecoration: 'underline',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Back to email
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h3 className="title">Reset Password</h3>
                                <p className="text-center mb-4">Enter your new password</p>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success" role="alert">
                                        {success}
                                    </div>
                                )}

                                <form className="account-form" onSubmit={handleResetPassword}>
                                    {/* New Password Field */}
                                    <div className="form-row">
                                        <label className="form-label">
                                            New Password <span className="required">*</span>
                                        </label>
                                        <div className="form-control-wrap">
                                            <div className="pw-wrapper">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="new_password"
                                                    value={formData.new_password}
                                                    onChange={handleChange}
                                                    placeholder="Enter new password"
                                                    required
                                                    className="text-input input-with-icon"
                                                    aria-label="New Password"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                                    onClick={() => setShowNewPassword((s) => !s)}
                                                    className="icon-btn"
                                                >
                                                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="form-row">
                                        <label className="form-label">
                                            Confirm Password <span className="required">*</span>
                                        </label>
                                        <div className="form-control-wrap">
                                            <div className="pw-wrapper">
                                                <input
                                                    type={"password"}
                                                    name="confirm_password"
                                                    value={formData.confirm_password}
                                                    onChange={handleChange}
                                                    placeholder="Confirm new password"
                                                    required
                                                    className="text-input input-with-icon"
                                                    aria-label="Confirm Password"
                                                />
                                                <button
                                                    type="button"
                                                    // aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                    onClick={() => setShowConfirmPassword((s) => !s)}
                                                    className="icon-btn"
                                                >
                                                    {/* {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />} */}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="form-row submit-row">
                                        <div />
                                        <div className="form-control-wrap">
                                            <button
                                                type="submit"
                                                className="lab-btn"
                                                disabled={loading}
                                            >
                                                <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}

                        <div className="account-bottom text-center pt-3">
                            <span className="d-block cate">
                                Remember your password? <Link to="/login">Login</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Enhanced attractive styles matching login page */}
            <style>{`
                /* Layout with gradient background */
                .login-section {
                    background: #FFFFFF;
                    min-height: 100vh;
                    padding: 120px 20px 60px 20px;
                    position: relative;
                }
                
                .login-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    opacity: 0.3;
                }
                
                .account-wrapper { 
                    padding: 45px 40px; 
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border-radius: 16px; 
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1);
                    position: relative;
                    animation: slideUp 0.6s ease-out;
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .title {
                    font-size: 32px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 35px;
                    letter-spacing: -0.5px;
                    text-align: center;
                }
                
                .form-row { 
                    display: flex; 
                    align-items: center; 
                    gap: 20px; 
                    margin-bottom: 24px;
                    animation: fadeIn 0.5s ease-out backwards;
                }
                
                .form-row:nth-child(1) { animation-delay: 0.1s; }
                .form-row:nth-child(2) { animation-delay: 0.2s; }
                .form-row:nth-child(3) { animation-delay: 0.3s; }
                .form-row:nth-child(4) { animation-delay: 0.4s; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-15px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                .form-label { 
                    width: 120px; 
                    text-align: left; 
                    font-weight: 600; 
                    padding-left: 4px;
                    color: #2d3748;
                    font-size: 15px;
                }
                
                .form-control-wrap { 
                    flex: 1;
                }

                /* Enhanced Inputs with gradient border effect */
                .text-input { 
                    width: 100%; 
                    padding: 14px 16px; 
                    border: 2px solid #e2e8f0;
                    border-radius: 10px; 
                    font-size: 15px; 
                    outline: none;
                    background: white;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .text-input:hover {
                    border-color: #cbd5e0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                
                .text-input:focus { 
                    border-color: transparent;
                    background: linear-gradient(white, white) padding-box,
                                linear-gradient(135deg, #667eea, #764ba2) border-box;
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
                    transform: translateY(-1px);
                }

                /* Password wrapper + icon */
                .pw-wrapper { 
                    position: relative; 
                    display: flex; 
                    align-items: center; 
                }
                
                .input-with-icon { 
                    padding-right: 48px; 
                }
                
                .icon-btn {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    padding: 8px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #667eea;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }
                
                .icon-btn:hover { 
                    background: rgba(102, 126, 234, 0.1);
                    transform: translateY(-50%) scale(1.1);
                }
                
                .icon-btn:active {
                    transform: translateY(-50%) scale(0.95);
                }

                /* Gradient Submit button with animation */
                .submit-row { 
                    margin-top: 35px; 
                }
                
                .lab-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    padding: 14px 32px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                    letter-spacing: 0.3px;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }
                
                .lab-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s ease;
                }
                
                .lab-btn:hover::before {
                    left: 100%;
                }
                
                .lab-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.45);
                }
                
                .lab-btn:active {
                    transform: translateY(0);
                }
                
                .lab-btn:disabled { 
                    opacity: 0.6; 
                    cursor: not-allowed;
                    transform: none;
                }

                /* Required star */
                .required { 
                    color: #e53e3e; 
                    margin-left: 4px;
                    font-size: 16px;
                }

                /* Enhanced Alert styles */
                .alert {
                    padding: 16px 20px;
                    border-radius: 10px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    line-height: 1.6;
                    animation: slideDown 0.4s ease-out;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .alert-danger {
                    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
                    color: #c53030;
                    border: 2px solid #fc8181;
                }

                .alert-success {
                    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
                    color: #2d7d32;
                    border: 2px solid #9ae6b4;
                }

                /* Links with gradient underline */
                .account-bottom a {
                    color: #667eea;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    position: relative;
                }
                
                .account-bottom a::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.3s ease;
                }
                
                .account-bottom a:hover::after {
                    width: 100%;
                }
                
                /* Account bottom link with animation */
                .account-bottom {
                    margin-top: 30px;
                    padding-top: 24px;
                    border-top: 2px solid #e2e8f0;
                }
                
                .account-bottom .cate {
                    color: #4a5568;
                    font-size: 15px;
                }

                /* Utility classes */
                .text-center {
                    text-align: center;
                }
                
                .mb-4 {
                    margin-bottom: 1.5rem;
                }
                
                .pt-3 {
                    padding-top: 1rem;
                }
                
                .mt-3 {
                    margin-top: 1rem;
                }
                
                .d-block {
                    display: block;
                }

                /* Responsive: stack on small screens */
                @media (max-width: 700px) {
                    .account-wrapper {
                        padding: 28px 20px;
                    }
                    
                    .title {
                        font-size: 26px;
                    }
                    
                    .form-row { 
                        flex-direction: column; 
                        align-items: stretch;
                        gap: 8px;
                    }
                    
                    .form-label { 
                        width: 100%; 
                        margin-bottom: 4px; 
                        text-align: left; 
                    }
                    
                    .submit-row { 
                        display: flex; 
                        justify-content: center; 
                        flex-direction: column;
                    }
                    
                    .lab-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </Fragment>
    );
}

export default ForgetPass;