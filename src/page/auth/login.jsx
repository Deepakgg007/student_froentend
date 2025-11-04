//login.jsx

import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
// import PageHeader from "../../component/layout/pageheader";
import api from "../../services/api";

const title = "Login";
const btnText = "Login Now";

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load remembered credentials on mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('student_remembered_email');
        const rememberedPassword = localStorage.getItem('student_remembered_password');
        if (rememberedEmail && rememberedPassword) {
            setFormData(prev => ({
                ...prev,
                email: rememberedEmail,
                password: rememberedPassword,
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
            const response = await api.post('/auth/login/', {
                email: formData.email,
                password: formData.password,
            });

            const responseData = response.data.data || response.data;
            const user = responseData.user;
            const accessToken = responseData.access;
            const refreshToken = responseData.refresh;

            if (!user) {
                setError('Invalid response from server');
                setLoading(false);
                return;
            }

            // Save tokens and user info
            localStorage.setItem('student_access_token', accessToken);
            localStorage.setItem('student_refresh_token', refreshToken);
            localStorage.setItem('student_user', JSON.stringify(user));

            // Remember Me: store email + password
            if (formData.rememberMe) {
                localStorage.setItem('student_remembered_email', formData.email);
                localStorage.setItem('student_remembered_password', formData.password);
            } else {
                localStorage.removeItem('student_remembered_email');
                localStorage.removeItem('student_remembered_password');
            }

            // Redirect to courses page
            navigate('/course');
        } catch (err) {
            console.error('Login error:', err.response?.data);
            setError(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                err.response?.data?.error ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Header />
            {/* <PageHeader title={'Login Page'} curPage={'Login'} /> */}
            <div className="login-section padding-tb section-bg">
                <div className="container">
                    <div className="account-wrapper">
                        <h3 className="title">{title}</h3>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form className="account-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address *"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password *"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <div className="d-flex justify-content-between flex-wrap pt-sm-2">
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
                                    <Link to="/forgetpass">Forget Password?</Link>
                                </div>
                            </div>
                            <div className="form-group text-center">
                                <button
                                    type="submit"
                                    className="d-block lab-btn"
                                    disabled={loading}
                                >
                                    <span>{loading ? 'Logging in...' : btnText}</span>
                                </button>
                            </div>
                        </form>
                        <div className="account-bottom">
                            <span className="d-block cate pt-10">
                                Don't Have any Account? <Link to="/signup">Sign Up</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Fragment>
    );
}

export default LoginPage;