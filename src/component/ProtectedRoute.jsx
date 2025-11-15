import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

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

            .approval-icon.rejected {
                background: linear-gradient(135deg, #E63946 0%, #D62828 100%);
                color: white;
                box-shadow: 0 10px 25px rgba(230, 57, 70, 0.3);
            }

            .approval-icon.inactive {
                background: linear-gradient(135deg, #6C757D 0%, #5A6268 100%);
                color: white;
                box-shadow: 0 10px 25px rgba(108, 117, 125, 0.3);
            }

            .approval-card h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 15px;
                letter-spacing: -0.5px;
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
                text-align: left;
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
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 13px;
            }

            .status-badge.pending {
                background: #FFF3CD;
                color: #856404;
                border: 1px solid #FFEAA7;
            }

            .status-badge.rejected {
                background: #F8D7DA;
                color: #721C24;
                border: 1px solid #F5C6CB;
            }

            .approval-note {
                background: #E7F3FF;
                border-left: 4px solid #667eea;
                padding: 15px;
                border-radius: 8px;
                font-size: 14px;
                color: #003d82;
                line-height: 1.6;
                display: flex;
                gap: 10px;
                align-items: flex-start;
                margin: 0;
            }

            .approval-note i {
                font-size: 18px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            @media (max-width: 600px) {
                .approval-card {
                    padding: 30px 20px;
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
            <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '25px',
                textAlign: 'left'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <span style={{
                        fontWeight: 600,
                        color: '#667eea',
                        fontSize: '14px'
                    }}>College:</span>
                    <span style={{
                        color: '#2d3748',
                        fontSize: '14px'
                    }}>{user.college_details?.name || user.college_name}</span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0'
                }}>
                    <span style={{
                        fontWeight: 600,
                        color: '#667eea',
                        fontSize: '14px'
                    }}>Status:</span>
                    <span style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        fontSize: '13px',
                        background: '#FFF3CD',
                        color: '#856404',
                        border: '1px solid #FFEAA7'
                    }}>Awaiting Verification</span>
                </div>
            </div>
            <p style={{
                background: '#E7F3FF',
                borderLeft: '4px solid #667eea',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#003d82',
                lineHeight: '1.6',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                margin: '0'
            }}>
                <i className="icofont-info-circle" style={{
                    fontSize: '18px',
                    flexShrink: 0,
                    marginTop: '2px'
                }}></i>
                <span>Please contact your college administrator to verify your account. You will be notified once your account has been verified.</span>
            </p>
        </div>
    </div>
);

const AccountRejectedMessage = ({ user }) => (
    <div className="approval-section">
        <div className="container">
            <div className="approval-wrapper">
                <div className="approval-card">
                    <div className="approval-icon rejected">
                        <i className="icofont-close"></i>
                    </div>
                    <h2>Approval Request Rejected</h2>
                    <p className="approval-message">
                        Your account approval request has been rejected by your college administrator.
                    </p>
                    <div className="approval-details">
                        <div className="detail-item">
                            <span className="detail-label">College:</span>
                            <span className="detail-value">{user.college_details?.name || user.college_name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status-badge rejected">Rejected</span>
                        </div>
                        {user.rejection_reason && (
                            <div className="detail-item">
                                <span className="detail-label">Reason:</span>
                                <span className="detail-value">{user.rejection_reason}</span>
                            </div>
                        )}
                    </div>
                    <p className="approval-note">
                        <i className="icofont-info-circle"></i>
                        Please contact your college administrator for more information about the rejection and next steps.
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

            .approval-icon.rejected {
                background: linear-gradient(135deg, #E63946 0%, #D62828 100%);
                color: white;
                box-shadow: 0 10px 25px rgba(230, 57, 70, 0.3);
            }

            .approval-card h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 15px;
                letter-spacing: -0.5px;
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
                text-align: left;
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
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 13px;
            }

            .status-badge.rejected {
                background: #F8D7DA;
                color: #721C24;
                border: 1px solid #F5C6CB;
            }

            .approval-note {
                background: #FFE5E5;
                border-left: 4px solid #E63946;
                padding: 15px;
                border-radius: 8px;
                font-size: 14px;
                color: #721C24;
                line-height: 1.6;
                display: flex;
                gap: 10px;
                align-items: flex-start;
                margin: 0;
            }

            .approval-note i {
                font-size: 18px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            @media (max-width: 600px) {
                .approval-card {
                    padding: 30px 20px;
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

const CollegeInactiveMessage = ({ user }) => (
    <div className="approval-section">
        <div className="container">
            <div className="approval-wrapper">
                <div className="approval-card">
                    <div className="approval-icon inactive">
                        <i className="icofont-building"></i>
                    </div>
                    <h2>College Inactive</h2>
                    <p className="approval-message">
                        Your college is currently inactive on the platform.
                    </p>
                    <div className="approval-details">
                        <div className="detail-item">
                            <span className="detail-label">College:</span>
                            <span className="detail-value">{user.college_details?.name || user.college_name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status-badge inactive">Inactive</span>
                        </div>
                    </div>
                    <p className="approval-note">
                        <i className="icofont-info-circle"></i>
                        Please contact your college administrator or platform support to resolve this issue.
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

            .approval-icon.inactive {
                background: linear-gradient(135deg, #6C757D 0%, #5A6268 100%);
                color: white;
                box-shadow: 0 10px 25px rgba(108, 117, 125, 0.3);
            }

            .approval-card h2 {
                font-size: 28px;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 15px;
                letter-spacing: -0.5px;
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
                text-align: left;
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
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 13px;
            }

            .status-badge.inactive {
                background: #E2E3E5;
                color: #383D41;
                border: 1px solid #D6D8DB;
            }

            .approval-note {
                background: #E7E8EA;
                border-left: 4px solid #6C757D;
                padding: 15px;
                border-radius: 8px;
                font-size: 14px;
                color: #383D41;
                line-height: 1.6;
                display: flex;
                gap: 10px;
                align-items: flex-start;
                margin: 0;
            }

            .approval-note i {
                font-size: 18px;
                flex-shrink: 0;
                margin-top: 2px;
            }

            @media (max-width: 600px) {
                .approval-card {
                    padding: 30px 20px;
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

        // Refresh user data every 30 seconds to check for approval updates
        const refreshInterval = setInterval(() => {
            fetchUserData();
        }, 30000); // 30 seconds

        return () => clearInterval(refreshInterval);
    }, [token]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid #f0f0f0',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                    <p style={{
                        fontSize: '16px',
                        color: '#4a5568',
                        margin: '0',
                        fontWeight: '500'
                    }}>Loading...</p>
                </div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
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
        return <CollegeInactiveMessage user={user} />;
    }

    // Check approval status - this blocks access until approved
    if (user.approval_status === 'rejected') {
        return <AccountRejectedMessage user={user} />;
    }

    // If not approved and not rejected, they're pending
    if (user.approval_status !== 'approved') {
        return <ApprovalPendingMessage user={user} />;
    }

    // All checks passed - user is verified, college is active, and account is approved
    return children;
};

export default ProtectedRoute;
