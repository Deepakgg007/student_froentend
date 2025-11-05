import { useRef, useState } from 'react';
import Swal from 'sweetalert2';

const VideoContent = ({ content, onComplete, onNext, onPrev }) => {
    const videoRef = useRef(null);
    const [isCompleting, setIsCompleting] = useState(false);

    // Auto-complete when video ends
    const handleVideoEnd = async () => {
        if (content && !content.is_completed) {
            setIsCompleting(true);
            try {
                await onComplete();
                // Show success toast message (side notification)
                await Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Video Completed!',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
                // Reload page to update sidebar
                window.location.reload();
            } catch (err) {
                console.error('Failed to mark video complete:', err);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to mark video complete',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                setIsCompleting(false);
            }
        }
    };

    // Manual mark as complete
    const handleMarkComplete = async () => {
        setIsCompleting(true);
        try {
            await onComplete();
            // Show success toast message (side notification)
            await Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Video Completed!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
            // Reload page to update sidebar
            window.location.reload();
        } catch (err) {
            console.error('Failed to mark video complete:', err);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Failed to mark video complete',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            setIsCompleting(false);
        }
    };

    if (!content) {
        return <p>No video available</p>;
    }


    const getAbsoluteUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        // Handle nested file objects (e.g., { url: '...' })
        if (typeof url === 'object' && url.url) return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${url.url}`;
        return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${url}`;
    };

    // Prioritize fields: youtube_url > video_url > video_file
    const youtubeEmbed = content.youtube_url ? content.youtube_url.replace('watch?v=', 'embed/') : null;
    const videoSrc = content.video_url ? getAbsoluteUrl(content.video_url) :
                     content.video_file ? getAbsoluteUrl(content.video_file) : null;

    return (
        <div className="video-content">
            <h3 className="mb-4">{content.title}</h3>
            {content.description && <p className="text-muted mb-4">{content.description}</p>}

            {youtubeEmbed ? (
                <div className="ratio ratio-16x9 mb-4">
                    <iframe
                        src={youtubeEmbed}
                        title={content.title}
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                </div>
            ) : videoSrc ? (
                <div className="ratio ratio-16x9 mb-4">
                    <video 
                        ref={videoRef}
                        controls 
                        className="w-100"
                        onEnded={handleVideoEnd}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ) : (
                <div className="alert alert-info">
                    No video source available for this content.
                </div>
            )}

            {content.transcript && (
                <div className="transcript mt-4">
                    <h5>Transcript</h5>
                    <div className="p-3 bg-light rounded">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{content.transcript}</p>
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
                        <strong>Completed!</strong> You have finished this video.
                    </div>
                )}
                <p className="text-muted mt-2" style={{ fontSize: '14px' }}>
                    <i className="icofont-info-circle me-1"></i>
                    Video will also auto-complete when you finish watching
                </p>
            </div>
        </div>
    );
};

export default VideoContent;