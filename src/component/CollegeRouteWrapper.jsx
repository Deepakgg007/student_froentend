import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

/**
 * Wrapper component that ensures all routes include the college slug
 * Redirects users to /:collegeSlug/... URLs based on their logged-in college
 */
const CollegeRouteWrapper = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkAndRedirect();
    }, [location.pathname]);

    const createSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const checkAndRedirect = async () => {
        try {
            // Skip redirect for public routes
            const publicPaths = ['/', '/login', '/signup', '/forgetpass', '/about', '/team', '/contact', '/team-single', '/instructor', '/search-page', '/search-none'];
            if (publicPaths.includes(location.pathname)) {
                return;
            }

            const token = localStorage.getItem("student_access_token") || localStorage.getItem("token");

            if (!token) {
                // Not logged in, allow access without redirect
                return;
            }

            // Get user data to find their college
            const response = await api.get("/auth/me");
            const userData = response.data.data || response.data.user || response.data;


            if (userData && userData.college_details && userData.college_details.name) {
                // Create slug from college name
                const slug = createSlug(userData.college_details.name);

                // Check if current URL has the college slug
                const pathParts = location.pathname.split('/').filter(p => p);

                // If first part is not the college slug, redirect
                if (pathParts.length === 0 || pathParts[0] !== slug) {
                    const newPath = `/${slug}${location.pathname}`;
                    navigate(newPath, { replace: true });
                }
            }
        } catch (error) {
            console.error('❌ Error checking college route:', error);
        }
    };

    return children;
};

export default CollegeRouteWrapper;
