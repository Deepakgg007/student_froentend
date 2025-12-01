import React from 'react';
import { useLoading } from '../context/LoadingContext';
import '../assets/css/universal-loader.css';

const UniversalLoader = () => {
    const { isGlobalLoading, loadingMessage } = useLoading();

    if (!isGlobalLoading) return null;

    return (
        <div className="universal-loader-overlay">
            <div className="universal-loader-container">
                <div className="loader-content">
                    {/* Main spinner */}
                    <div className="loader-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-dot"></div>
                    </div>

                    {/* Loading message */}
                    {loadingMessage && (
                        <p className="loader-message">{loadingMessage}</p>
                    )}

                    {/* Loading progress indicator */}
                    <div className="loader-progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalLoader;
