import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoaded, setAuthLoaded] = useState(false);

    // Initialize auth state only once
    useEffect(() => {
        const token = localStorage.getItem('student_access_token') || localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setAuthLoaded(true);
    }, []);

    // Listen for storage changes (logout in another tab)
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('student_access_token') || localStorage.getItem('token');
            setIsAuthenticated(!!token);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setAuth = useCallback((isAuth) => {
        setIsAuthenticated(isAuth);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, authLoaded, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
