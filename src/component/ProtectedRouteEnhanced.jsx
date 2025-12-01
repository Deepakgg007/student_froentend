import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useLoading } from '../context/LoadingContext';

// Keep all the message components from original ProtectedRoute
const ApprovalPendingMessage = ({ user }) => (
    <div className="approval-section">
        <div className="container">
            <div className="approval-wrapper">
                <div className="approval-card">
                    <div className="approval-icon pending">
                        <i className="icofont-clock"></i>
                    </div>
                    <h2>Account Approval Pending</h2>
                    <p className="approval-message">
                        Your account is currently under review by your college administrator.
                    </p>
                    <div className="approval-details">
                        <div className="detail-item">
                            <span className="detail-label">College:</span>
                            <span className="detail-value">{user.college_details?.name || user.college_name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{user.first_name} {user.last_name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status-badge pending">Pending Review</span>
                        </div>
                    </div>
                    <p className="approval-note">
                        <i className="icofont-info-circle"></i>
                        Please wait for your college administrator to review and approve your account. You will receive an email notification once your account is approved.
                    </p>
                </div>
            </div>
        </div>
        <style>{`
            .approval-section {
                background: linear-gradient(135deg, #FFF9F1 0%, #FFF4E6 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
            }

            .approval-wrapper {
                max-width: 550px;
                width: 100%;
            }

            .approval-card {
                background: white;
                border-radius: 20px;
                padding: 50px 40px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                text-align: center;
                animation: slideUp 0.6s ease-out;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .approval-icon {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 30px;
                font-size: 48px;
            }

            .approval-icon.pending {
                background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
                color: white;
                box-shadow: 0 10px 25px rgba(255, 165, 0, 0.3);
            }

            .approval-message {
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 30px;
                line-height: 1.6;
            }

            .approval-details {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .detail-item:last-child {
                border-bottom: none;
            }

            .detail-label {
                font-weight: 600;
                color: #667eea;
                font-size: 14px;
            }

            .detail-value {
                color: #2d3748;
                font-size: 14px;
            }

            .status-badge {
                background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }

            .approval-note {
                background: #e8f4f8;
                border-left: 4px solid #667eea;
                padding: 15px 20px;
                border-radius: 8px;
                font-size: 14px;
                color: #2d3748;
                text-align: left;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }

            .approval-note i {
                margin-top: 2px;
                min-width: 18px;
            }

            .approval-card h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 15px;
                letter-spacing: -0.5px;
            }

            @media (max-width: 768px) {
                .approval-card {
                    padding: 40px 30px;
                }

                .approval-card h2 {
                    font-size: 22px;
                }

                .approval-icon {
                    width: 80px;
                    height: 80px;
                    font-size: 40px;
                }

                .detail-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
            }
        `}</style>
    </div>
);

const AccountNotVerifiedMessage = ({ user }) => (
    <div style={{
        background: 'linear-gradient(135deg, #FFF9F1 0%, #FFF4E6 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
    }}>
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '50px 40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '550px',
            width: '100%',
            animation: 'slideUp 0.6s ease-out'
        }}>
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 30px',
                color: 'white',
                fontSize: '48px',
                boxShadow: '0 10px 25px rgba(255, 165, 0, 0.3)'
            }}>
                <i className="icofont-shield-alt"></i>
            </div>
            <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1a202c',
                marginBottom: '15px',
                letterSpacing: '-0.5px'
            }}>Account Not Verified</h2>
            <p style={{
                fontSize: '16px',
                color: '#4a5568',
                marginBottom: '30px',
                lineHeight: '1.6'
            }}>
                Your account is waiting for college verification.
            </p>
        </div>
    </div>
);

const ProtectedRouteEnhanced = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { startLoading, stopLoading } = useLoading();
    const token = localStorage.getItem('student_access_token');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            stopLoading();
            return;
        }

        // Start global loading
        startLoading('Verifying account...');

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
                stopLoading();
            }
        };

        fetchUserData();

        // Refresh user data every 30 seconds to check for approval updates
        const refreshInterval = setInterval(() => {
            fetchUserData();
        }, 30000); // 30 seconds

        return () => clearInterval(refreshInterval);
    }, [token, startLoading, stopLoading]);

    if (loading) {
        return null; // Global loader will be shown
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check email verification FIRST
    if (!user.is_verified) {
        return <AccountNotVerifiedMessage user={user} />;
    }

    // Check college active status
    if (user.college_details && !user.college_details.is_active) {
        return <ApprovalPendingMessage user={user} />;
    }

    // Check approval status - this blocks access until approved
    if (user.approval_status === 'rejected') {
        return <ApprovalPendingMessage user={user} />;
    }

    // If not approved and not rejected, they're pending
    if (user.approval_status !== 'approved') {
        return <ApprovalPendingMessage user={user} />;
    }

    // All checks passed - user is verified, college is active, and account is approved
    return children;
};

export default ProtectedRouteEnhanced;
