import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Hook to dynamically set favicon based on user's college logo
 * When logged in and viewing college-specific routes, shows college logo
 * Otherwise shows the default Z1 logo
 */
const useDynamicFavicon = () => {
    const location = useLocation();

    useEffect(() => {
        const updateFavicon = async () => {
            try {
                // Only try to fetch college logo if user is logged in and NOT on auth pages
                const token = localStorage.getItem("student_access_token") || localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("access_token");
                const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup') || location.pathname.includes('/forgetpass');

                if (!token || isAuthPage) {
                    setDefaultFavicon();
                    return;
                }

                try {
                    // Get user data to find their college logo
                    const response = await api.get("/auth/me", { timeout: 3000 });
                    const userData = response.data.data || response.data.user || response.data;

                    if (userData && userData.college_details && userData.college_details.logo) {
                        setFavicon(userData.college_details.logo);
                    } else {
                        setDefaultFavicon();
                    }
                } catch (apiError) {
                    // If API fails, just use default favicon
                    setDefaultFavicon();
                }
            } catch (error) {
                console.error('❌ Error in favicon hook:', error);
                setDefaultFavicon();
            }
        };

        // Debounce the favicon update to avoid excessive API calls
        const timeoutId = setTimeout(updateFavicon, 100);
        return () => clearTimeout(timeoutId);
    }, [location.pathname]);

    const setFavicon = (logoUrl) => {
        try {
            const link = document.querySelector("link[rel='icon']");
            if (link) {
                const absoluteUrl = logoUrl.startsWith('http') ? logoUrl : `/api${logoUrl}`;
                link.href = absoluteUrl;
            }
        } catch (error) {
            console.error('Error setting favicon:', error);
        }
    };

    const setDefaultFavicon = () => {
        try {
            const link = document.querySelector("link[rel='icon']");
            if (link) {
                link.href = "/favicon.png";
            }
        } catch (error) {
            console.error('Error setting default favicon:', error);
        }
    };
};

export default useDynamicFavicon;
