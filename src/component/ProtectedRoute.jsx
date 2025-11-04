import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

const ApprovalPendingMessage = ({ user }) => (
    <div className="login-section padding-tb section-bg">
        <div className="container">
            <div className="account-wrapper">
                <div className="alert alert-warning text-center">
                    <h4>Approval Request Pending</h4>
                    <p>Your account is currently pending approval from your college administrator.</p>
                    <p>Status: <strong>{user.approval_status}</strong></p>
                    <p>Please wait for approval to access the platform features.</p>
                </div>
            </div>
        </div>
    </div>
);

const AccountNotVerifiedMessage = () => (
    <div className="login-section padding-tb section-bg">
        <div className="container">
            <div className="account-wrapper">
                <div className="alert alert-warning text-center">
                    <h4>Account Not Verified</h4>
                    <p>Your account email has not been verified yet.</p>
                    <p>Please check your email inbox for the verification link.</p>
                </div>
            </div>
        </div>
    </div>
);

const AccountRejectedMessage = ({ user }) => (
    <div className="login-section padding-tb section-bg">
        <div className="container">
            <div className="account-wrapper">
                <div className="alert alert-danger text-center">
                    <h4>Approval Request Rejected</h4>
                    <p>Your account approval request has been rejected.</p>
                    {user.rejection_reason && (
                        <p>Reason: <strong>{user.rejection_reason}</strong></p>
                    )}
                    <p>Please contact your college administrator for more information.</p>
                </div>
            </div>
        </div>
    </div>
);

const CollegeInactiveMessage = ({ user }) => (
    <div className="login-section padding-tb section-bg">
        <div className="container">
            <div className="account-wrapper">
                <div className="alert alert-danger text-center">
                    <h4>College Inactive</h4>
                    <p>Your college ({user.college_details?.name || user.college_name}) is currently inactive.</p>
                    <p>Please contact your college administrator or platform support.</p>
                </div>
            </div>
        </div>
    </div>
);

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('student_access_token');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await api.get('/auth/profile/');
                const userData = response.data.data || response.data;
                setUser(userData);
                localStorage.setItem('student_user', JSON.stringify(userData));
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('student_access_token');
                    localStorage.removeItem('student_refresh_token');
                    localStorage.removeItem('student_user');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    if (loading) {
        return (
            <div className="login-section padding-tb section-bg">
                <div className="container">
                    <div className="account-wrapper">
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.approval_status === 'rejected') {
        return <AccountRejectedMessage user={user} />;
    }

    if (user.approval_status !== 'approved') {
        return <ApprovalPendingMessage user={user} />;
    }

    if (!user.is_verified) {
        return <AccountNotVerifiedMessage />;
    }

    if (user.college_details && !user.college_details.is_active) {
        return <CollegeInactiveMessage user={user} />;
    }

    return children;
};

export default ProtectedRoute;
