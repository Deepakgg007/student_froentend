import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

/**
 * Custom hook to check user approval status
 * Returns user data with approval status and loading state
 */
export const useUserApproval = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApproved, setIsApproved] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState(null);
    const token = localStorage.getItem('student_access_token');

    const fetchUserStatus = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return { user: null, isApproved: false, isVerified: false, approvalStatus: null };
        }

        try {
            const response = await api.get('/auth/profile/');
            const userData = response.data.data || response.data;

            setUser(userData);
            setIsVerified(userData.is_verified || false);
            setApprovalStatus(userData.approval_status);

            // User is approved if: verified AND (approval_status is 'approved' OR user is superuser/staff)
            const approved = userData.is_verified &&
                           (userData.approval_status === 'approved' ||
                            userData.is_superuser ||
                            userData.is_staff);

            setIsApproved(approved);
            setLoading(false);

            return { user: userData, isApproved: approved, isVerified: userData.is_verified, approvalStatus: userData.approval_status };
        } catch (error) {
            console.error('Failed to fetch user status:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('student_access_token');
                localStorage.removeItem('student_refresh_token');
                localStorage.removeItem('student_user');
            }
            setLoading(false);
            return { user: null, isApproved: false, isVerified: false, approvalStatus: null };
        }
    }, [token]);

    useEffect(() => {
        fetchUserStatus();
    }, [fetchUserStatus]);

    return { user, loading, isApproved, isVerified, approvalStatus, refreshUserStatus: fetchUserStatus };
};

/**
 * Show approval pending alert
 */
export const showApprovalPendingAlert = (user) => {
    Swal.fire({
        icon: 'warning',
        title: 'Account Approval Pending',
        html: `
            <div style="text-align: left;">
                <p>Your account is currently under review by <strong>${user?.college_details?.name || user?.college_name || 'your college'}</strong>.</p>
                <p>You will be able to access this feature once your account has been approved by the administrator.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <strong>Status:</strong> <span style="color: #f39c12;">Pending Review</span>
                </div>
            </div>
        `,
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Got it',
        allowOutsideClick: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

/**
 * Show not verified alert
 */
export const showNotVerifiedAlert = (user) => {
    Swal.fire({
        icon: 'warning',
        title: 'Account Not Verified',
        html: `
            <div style="text-align: left;">
                <p>Your account needs to be verified before you can access this feature.</p>
                <p>Please verify your email address to continue.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <strong>Email:</strong> ${user?.email || 'N/A'}
                </div>
            </div>
        `,
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Got it',
        allowOutsideClick: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

/**
 * Show account rejected alert
 */
export const showAccountRejectedAlert = (user) => {
    Swal.fire({
        icon: 'error',
        title: 'Account Rejected',
        html: `
            <div style="text-align: left;">
                <p>Your account approval request has been rejected.</p>
                ${user?.rejection_reason ? `<p><strong>Reason:</strong> ${user.rejection_reason}</p>` : ''}
                <p>Please contact your college administrator for more information.</p>
            </div>
        `,
        confirmButtonColor: '#e74a3b',
        confirmButtonText: 'Got it',
        allowOutsideClick: false,
        customClass: {
            popup: 'swal-custom-popup'
        }
    });
};

/**
 * Check if user can access protected features
 * Shows appropriate alert if not approved
 * @returns {boolean} - True if user can access, false otherwise
 */
export const useCanAccessProtected = () => {
    const { user, loading, isApproved, isVerified, approvalStatus, refreshUserStatus } = useUserApproval();

    const checkAccess = useCallback(() => {
        if (loading) return false;

        // Not logged in
        if (!user) {
            return false;
        }

        // Not verified
        if (!isVerified) {
            showNotVerifiedAlert(user);
            return false;
        }

        // Rejected
        if (approvalStatus === 'rejected') {
            showAccountRejectedAlert(user);
            return false;
        }

        // Pending
        if (approvalStatus !== 'approved') {
            showApprovalPendingAlert(user);
            return false;
        }

        // Approved
        return true;
    }, [user, loading, isVerified, approvalStatus]);

    return { checkAccess, user, loading, isApproved, isVerified, approvalStatus, refreshUserStatus };
};

export default useUserApproval;
