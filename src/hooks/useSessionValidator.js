import { useEffect } from 'react';
import api from '../services/api';

/**
 * Hook to periodically validate user session
 * Checks if the current token is still active
 * Redirects to login if session is invalid
 *
 * Usage: useSessionValidator(interval) where interval is in milliseconds
 * Default interval: 30 seconds
 */
export const useSessionValidator = (interval = 30000) => {
  useEffect(() => {
    const token = localStorage.getItem('student_access_token');

    // Only validate if user is logged in
    if (!token) return;

    const validateSession = async () => {
      try {
        // Make a simple API call to validate session
        // Using profile endpoint which has IsActiveSession permission
        await api.get('/auth/profile/');
      } catch (error) {
        // Check if error is due to invalid session
        if (error.response?.status === 403) {
          const errorMessage = error.response?.data?.detail || '';
          if (errorMessage.includes('session is no longer valid') ||
              errorMessage.includes('logged in from another device')) {
            // Session is invalid, clear and redirect
            localStorage.clear();
            window.location.href = '/login?session_expired=true';
          }
        } else if (error.response?.status === 401) {
          // Unauthorized
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    };

    // Validate immediately on mount
    validateSession();

    // Set up periodic validation
    const intervalId = setInterval(validateSession, interval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [interval]);
};

export default useSessionValidator;
