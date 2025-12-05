import { useState } from 'react';
import Swal from 'sweetalert2';

const DocumentContent = ({ content, onComplete, onNext, onPrev, isDarkMode = false }) => {
    const [isCompleting, setIsCompleting] = useState(false);

    // ✅ Manual completion with button
    const handleMarkComplete = async () => {
        setIsCompleting(true);
        try {
            await onComplete();
            // Show success toast message (side notification)
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Document Completed!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            // Don't reload - let parent component handle state update
            setIsCompleting(false);
        } catch (err) {
            console.error('❌ DocumentContent: Failed to mark complete:', err);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to mark document complete',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            setIsCompleting(false);
        }
    };

    if (!content) {
        return <p style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>No document available</p>;
    }


    const getAbsoluteUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        if (typeof url === 'object' && url.url) return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${url.url}`;
        return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${url}`;
    };

    // Prioritize fields: document > document_url > file
    const docUrl = content.document ? getAbsoluteUrl(content.document) :
                   content.document_url ? getAbsoluteUrl(content.document_url) :
                   content.file ? getAbsoluteUrl(content.file) : null;

    const docType = docUrl ? docUrl.split('.').pop().toLowerCase() : 'unknown';

    return (
        <div className="document-content">
            <h3 className="mb-4" style={{ color: isDarkMode ? '#ffffff' : '#212529' }}>{content.title}</h3>
            {content.description && <p className="mb-4" style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>{content.description}</p>}

            {docUrl ? (
                <div className="text-center card p-5" style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    backgroundColor: isDarkMode ? 'transparent' : '#ffffff',
                    border: isDarkMode ? '1px solid #444' : '1px solid #dee2e6',
                    boxShadow: isDarkMode ? 'none' : '0 .125rem .25rem rgba(0,0,0,.075)'
                }}>
                    <div className="mb-4">
                        <i className="icofont-file-document" style={{ fontSize: '80px', color: '#2196F3' }}></i>
                    </div>
                    <h5 className="mb-3" style={{ color: isDarkMode ? '#ffffff' : '#212529' }}>{content.title}</h5>
                    <div className="mb-4">
                        <span className="badge" style={{
                            fontSize: '14px',
                            padding: '8px 16px',
                            backgroundColor: '#0d6efd',
                            color: 'white'
                        }}>
                            {docType.toUpperCase()} Document
                        </span>
                    </div>
                    <div className="d-flex gap-3 justify-content-center">
                        <a href={docUrl} download className="btn btn-lg" style={{
                            backgroundColor: '#0d6efd',
                            color: 'white',
                            border: 'none'
                        }}>
                            <i className="icofont-download me-2"></i> Download File
                        </a>
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg" style={{
                            backgroundColor: 'transparent',
                            color: isDarkMode ? '#6ec1e4' : '#0d6efd',
                            border: isDarkMode ? '1px solid #6ec1e4' : '1px solid #0d6efd'
                        }}>
                            <i className="icofont-external-link me-2"></i> Open in New Tab
                        </a>
                    </div>

                </div>
            ) : (
                <div className="alert" style={{
                    backgroundColor: isDarkMode ? 'transparent' : '#d1ecf1',
                    borderColor: isDarkMode ? '#444' : '#bee5eb',
                    color: isDarkMode ? '#6ec1e4' : '#0c5460'
                }}>
                    No document file available.
                </div>
            )}

            {content.notes && (
                <div className="notes mt-4">
                    <h5 style={{ color: isDarkMode ? '#ffffff' : '#212529' }}>Notes</h5>
                    <div className="p-3 rounded" style={{
                        backgroundColor: isDarkMode ? 'transparent' : '#f8f9fa',
                        border: isDarkMode ? '1px solid #444' : 'none'
                    }}>
                        <p style={{ whiteSpace: 'pre-wrap', color: isDarkMode ? '#e0e0e0' : '#495057' }}>{content.notes}</p>
                    </div>
                </div>
            )}

            {/* Mark as Complete Button */}
            <div className="mt-4 text-center">
                {!content.is_completed ? (
                    <button
                        className="btn btn-lg"
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none'
                        }}
                        onClick={handleMarkComplete}
                        disabled={isCompleting}
                    >
                        {isCompleting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Marking Complete...
                            </>
                        ) : (
                            <>
                                <i className="icofont-check-circled me-2"></i>
                                Mark as Complete
                            </>
                        )}
                    </button>
                ) : (
                    <div className="alert" style={{
                        backgroundColor: isDarkMode ? 'transparent' : '#d4edda',
                        borderColor: isDarkMode ? '#4caf50' : '#c3e6cb',
                        color: isDarkMode ? '#4caf50' : '#155724'
                    }}>
                        <i className="icofont-check-circled me-2"></i>
                        <strong>Completed!</strong> You have finished this document.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentContent;