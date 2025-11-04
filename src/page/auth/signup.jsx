// SignupPage.jsx

import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/layout/footer";
import Header from "../../component/layout/header";
import PageHeader from "../../component/layout/pageheader";
import api from "../../services/api";

const title = "Register Now";
const btnText = "Get Started Now";

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: '',
        usn: '',
        college: '',
        college_name: '',
    });
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            const response = await api.get('/colleges/');
            // Handle both array and paginated response
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || response.data.data || [];
            setColleges(data);
        } catch (err) {
            console.error('Failed to fetch colleges:', err);
            setColleges([]); // Set empty array on error
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.password2) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.password2,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                date_of_birth: formData.date_of_birth || null,
                usn: formData.usn,
                college: formData.college ? parseInt(formData.college) : null,
                college_name: formData.college_name,
            };

            await api.post('/auth/register/', payload);
            setSuccess('Registration successful! Please check your email to verify your account.');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response?.data) {
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('\n');
                    setError(errorMessages);
                } else {
                    setError(errorData.message || 'Registration failed');
                }
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Header />
            {/* <PageHeader title={'Register Now'} curPage={'Sign Up'} /> */}
            <div className="login-section padding-tb section-bg">
                <div className="container">
                    <div className="account-wrapper">
                        <h3 className="title">{title}</h3>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error.split('\n').map((msg, idx) => (
                                    <div key={idx}>{msg}</div>
                                ))}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success" role="alert">
                                {success}
                            </div>
                        )}

                        <form className="account-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Username *"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email *"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    placeholder="Date of Birth"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="usn"
                                    value={formData.usn}
                                    onChange={handleChange}
                                    placeholder="USN (University Seat Number)"
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="">Select College</option>
                                    {colleges.map((college) => (
                                        <option key={college.id} value={college.id}>
                                            {college.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="college_name"
                                    value={formData.college_name}
                                    onChange={handleChange}
                                    placeholder="College Name (if not in list)"
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
                                <input
                                    type="password"
                                    name="password2"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    placeholder="Confirm Password *"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <button
                                    type="submit"
                                    className="lab-btn"
                                    disabled={loading}
                                >
                                    <span>{loading ? 'Registering...' : btnText}</span>
                                </button>
                            </div>
                        </form>
                        <div className="account-bottom">
                            <span className="d-block cate pt-10">
                                Already have an account? <Link to="/login">Login</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}

export default SignupPage;