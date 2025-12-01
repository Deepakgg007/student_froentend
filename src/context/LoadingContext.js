import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');

    const startLoading = useCallback((message = 'Loading...') => {
        setLoadingMessage(message);
        setIsGlobalLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setIsGlobalLoading(false);
    }, []);

    const value = {
        isGlobalLoading,
        loadingMessage,
        startLoading,
        stopLoading,
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within LoadingProvider');
    }
    return context;
};
