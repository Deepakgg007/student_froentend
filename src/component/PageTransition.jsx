import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Start loading transition
        setIsLoading(true);

        // Small delay to show smooth transition
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <>
            {/* Loading overlay */}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: isLoading ? 1 : 0
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>Loading...</p>
                    </div>
                </div>
            )}

            {/* Page content with fade transition */}
            <div style={{
                opacity: isLoading ? 0.5 : 1,
                transition: 'opacity 0.3s ease-in-out'
            }}>
                {children}
            </div>
        </>
    );
};

export default PageTransition;
