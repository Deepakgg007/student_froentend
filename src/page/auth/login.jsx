//login.jsx

import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const title = "Login";
const btnText = "Login Now";

/* Inline icons to avoid external dependency */
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

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('student_remembered_email');
        const rememberedPassword = localStorage.getItem('student_remembered_password');
        if (rememberedEmail) {
            setFormData(prev => ({
                ...prev,
                email: rememberedEmail,
                password: rememberedPassword || '',
                rememberMe: true
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(
                formData.email,
                formData.password,
                formData.rememberMe
            );

            const responseData = response.data.data || response.data;
            const user = responseData.user;
            const accessToken = responseData.access;
            const refreshToken = responseData.refresh;

            if (!user) {
                setError('Invalid response from server');
                setLoading(false);
                return;
            }

            localStorage.setItem('student_access_token', accessToken);
            localStorage.setItem('student_refresh_token', refreshToken);
            localStorage.setItem('student_user', JSON.stringify(user));

            // Update AuthContext state
            setAuth(true);

            // Remember email and password if "Remember Me" is checked
            if (formData.rememberMe) {
                localStorage.setItem('student_remembered_email', formData.email);
                localStorage.setItem('student_remembered_password', formData.password);
            } else {
                localStorage.removeItem('student_remembered_email');
                localStorage.removeItem('student_remembered_password');
            }

            navigate('/');
        } catch (err) {
            console.error('Login error:', err.response?.data);
            let errorMessage = 'Login failed. Please check your credentials.';

            if (err.response?.data) {
                const responseData = err.response.data;
                if (responseData.email) {
                    errorMessage = Array.isArray(responseData.email)
                        ? responseData.email[0]
                        : responseData.email;
                } else if (responseData.password) {
                    errorMessage = Array.isArray(responseData.password)
                        ? responseData.password[0]
                        : responseData.password;
                } else if (responseData.non_field_errors) {
                    errorMessage = Array.isArray(responseData.non_field_errors)
                        ? responseData.non_field_errors[0]
                        : responseData.non_field_errors;
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData.detail) {
                    errorMessage = responseData.detail;
                } else if (responseData.error) {
                    errorMessage = responseData.error;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <div className="login-section padding-tb section-bg">
                <div className="container">
                    <div className="account-wrapper" style={{ maxWidth: 500, margin: "0 auto" }}>
                        <h3 className="title text-center mb-4">{title}</h3>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form className="account-form" onSubmit={handleSubmit}>
                            {/* Email Field */}
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

                            {/* Password Field */}
                            <div className="form-row">
                                <label className="form-label">
                                    Password <span className="required">*</span>
                                </label>
                                <div className="form-control-wrap">
                                    <div className="pw-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            required
                                            className="text-input input-with-icon"
                                            aria-label="Password"
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="icon-btn"
                                        >
                                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Remember Me & Forget Password */}
                            <div className="form-row">
                                <label className="form-label"></label>
                                <div className="form-control-wrap">
                                    <div className="d-flex justify-content-between flex-wrap">
                                        <div className="checkgroup">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                id="remember"
                                                checked={formData.rememberMe}
                                                onChange={handleChange}
                                            />
                                            <label htmlFor="remember">Remember Me</label>
                                        </div>
                                        <Link to="/forgetpass" className="forget-link">Forget Password?</Link>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="form-row submit-row">
                                <div />
                                <div className="form-control-wrap">
                                    <button type="submit" className="lab-btn" disabled={loading}>
                                        <span>{loading ? 'Logging in...' : btnText}</span>
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="account-bottom text-center pt-3">
                            <span className="d-block cate">
                                Don't Have any Account? <Link to="/signup">Sign Up</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced attractive styles */}
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
                    font-family: 'Satoshi', Verdana, sans-serif;
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

                /* Checkbox styling with custom design */
                .checkgroup {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .checkgroup input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #667eea;
                }
                
                .checkgroup label {
                    cursor: pointer;
                    font-size: 14px;
                    color: #4a5568;
                    margin: 0;
                    font-weight: 500;
                }

                /* Links with gradient underline */
                .forget-link {
                    color: #667eea;
                    font-weight: 600;
                    text-decoration: none;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    position: relative;
                }
                
                .forget-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.3s ease;
                }
                
                .forget-link:hover::after {
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

                /* Utility classes */
                .d-flex {
                    display: flex;
                }
                
                .justify-content-between {
                    justify-content: space-between;
                }
                
                .flex-wrap {
                    flex-wrap: wrap;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .mb-4 {
                    margin-bottom: 1.5rem;
                }
                
                .pt-3 {
                    padding-top: 1rem;
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
                    
                    .d-flex.justify-content-between {
                        gap: 12px;
                    }
                }
            `}</style>
        </Fragment>
    );
};

export default LoginPage;