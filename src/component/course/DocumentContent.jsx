import { useState } from 'react';
import Swal from 'sweetalert2';

const DocumentContent = ({ content, onComplete, onNext, onPrev }) => {
    const [isCompleting, setIsCompleting] = useState(false);

    // ✅ Manual completion with button
    const handleMarkComplete = async () => {
        setIsCompleting(true);
        try {
            await onComplete();
            // Show success toast message (side notification)
            await Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Document Completed!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            // Reload page to update sidebar
            window.location.reload();
        } catch (err) {
            console.error('Failed to mark complete:', err);
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
        return <p>No document available</p>;
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
            <h3 className="mb-4">{content.title}</h3>
            {content.description && <p className="text-muted mb-4">{content.description}</p>}

            {docUrl ? (
                <div className="text-center card p-5 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="mb-4">
                        <i className="icofont-file-document" style={{ fontSize: '80px', color: '#2196F3' }}></i>
                    </div>
                    <h5 className="mb-3">{content.title}</h5>
                    <div className="mb-4">
                        <span className="badge bg-primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                            {docType.toUpperCase()} Document
                        </span>
                    </div>
                    <div className="d-flex gap-3 justify-content-center">
                        <a href={docUrl} download className="btn btn-primary btn-lg">
                            <i className="icofont-download me-2"></i> Download File
                        </a>
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-lg">
                            <i className="icofont-external-link me-2"></i> Open in New Tab
                        </a>
                    </div>
                   
                </div>
            ) : (
                <div className="alert alert-info">
                    No document file available.
                </div>
            )}

            {content.notes && (
                <div className="notes mt-4">
                    <h5>Notes</h5>
                    <div className="p-3 bg-light rounded">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{content.notes}</p>
                    </div>
                </div>
            )}

            {/* Mark as Complete Button */}
            <div className="mt-4 text-center">
                {!content.is_completed ? (
                    <button 
                        className="btn btn-success btn-lg"
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
                    <div className="alert alert-success">
                        <i className="icofont-check-circled me-2"></i>
                        <strong>Completed!</strong> You have finished this document.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentContent;