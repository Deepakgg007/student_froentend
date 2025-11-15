import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
import api from "../../services/api";

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
                    <div className="account-wrapper">
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
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email *"
                                            required
                                        />
                                    </div>
                                    <div className="form-group text-center">
                                        <button
                                            type="submit"
                                            className="d-block lab-btn"
                                            disabled={loading}
                                        >
                                            <span>{loading ? 'Sending...' : 'Send OTP'}</span>
                                        </button>
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
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="otp_code"
                                            value={formData.otp_code}
                                            onChange={handleChange}
                                            placeholder="Enter 6-digit OTP *"
                                            maxLength="6"
                                            required
                                        />
                                    </div>
                                    <div className="form-group text-center">
                                        <button
                                            type="submit"
                                            className="d-block lab-btn"
                                            disabled={loading}
                                        >
                                            <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                                        </button>
                                    </div>
                                </form>
                                <div className="text-center mt-3">
                                    <button
                                        className="btn btn-link"
                                        onClick={() => setStep(1)}
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
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            placeholder="New Password *"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            placeholder="Confirm New Password *"
                                            required
                                        />
                                    </div>
                                    <div className="form-group text-center">
                                        <button
                                            type="submit"
                                            className="d-block lab-btn"
                                            disabled={loading}
                                        >
                                            <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        <div className="account-bottom">
                            <span className="d-block cate pt-10">
                                Remember your password? <Link to="/login">Login</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
}

export default ForgetPass;