/**
 * ProctorSidebar - Integrated camera feed for exam sidebar
 * Shows camera feed and detection status alongside questions
 */

import { useRef, useEffect } from 'react';

const ProctorSidebar = ({
  proctorVideoElement,    // The actual video DOM element from ProctorMonitor
  proctorCanvasElement,   // The actual canvas DOM element from ProctorMonitor
  cameraActive,
  isInitialized,
  detectionStatus,
  faceCount,
  violationCount
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Clone the video stream to this component's video element
  useEffect(() => {
    if (!proctorVideoElement || !containerRef.current) return;

    // Get the stream from the source video element
    const sourceStream = proctorVideoElement.srcObject;
    if (!sourceStream || !sourceStream.active) {
      console.log('No active stream yet');
      return;
    }

    // Clone the stream for this video element
    const clonedStream = sourceStream.clone();
    streamRef.current = clonedStream;

    if (videoRef.current) {
      videoRef.current.srcObject = clonedStream;
      videoRef.current.play().catch(console.error);
    }

    return () => {
      // Stop the cloned stream when unmounting
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [proctorVideoElement]);

  // Sync canvas from ProctorMonitor
  useEffect(() => {
    if (!proctorCanvasElement || !canvasRef.current) return;

    const sourceCanvas = proctorCanvasElement;
    const destCanvas = canvasRef.current;
    const destCtx = destCanvas.getContext('2d');

    let animationFrameId;

    const syncCanvas = () => {
      if (sourceCanvas && destCanvas && cameraActive) {
        destCanvas.width = sourceCanvas.width;
        destCanvas.height = sourceCanvas.height;
        destCtx.drawImage(sourceCanvas, 0, 0);
      }
      if (cameraActive) {
        animationFrameId = requestAnimationFrame(syncCanvas);
      }
    };

    syncCanvas();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [proctorCanvasElement, cameraActive]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={styles.headerIcon}>
            <path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
          AI Proctoring
        </div>
        <div style={{
          ...styles.statusDot,
          backgroundColor: cameraActive && isInitialized ? '#10b981' : '#f59e0b',
        }} />
      </div>

      {/* Camera Feed */}
      <div style={styles.videoContainer} ref={containerRef}>
        {!cameraActive ? (
          <div style={styles.loadingState}>
            {isInitialized ? (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={styles.loadingIcon}>
                  <path
                    d="M12 2V6M12 18V22M6 12H2M22 12H18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span style={styles.loadingText}>Starting camera...</span>
              </>
            ) : (
              <>
                <div style={styles.spinner}></div>
                <span style={styles.loadingText}>Loading AI models...</span>
              </>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              style={styles.video}
              playsInline
              muted
              autoPlay
            />
            <canvas
              ref={canvasRef}
              style={styles.canvas}
            />
          </>
        )}
      </div>

      {/* Status */}
      <div style={styles.statusBar}>
        <div style={styles.statusLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={styles.statusIcon}>
            <path
              d={cameraActive && isInitialized
                ? "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                : "M12 2V6M12 18V22M6 12H2M22 12H18"
              }
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={styles.statusText}>{detectionStatus}</span>
        </div>
        {isInitialized && (
          <span style={styles.faceBadge}>{faceCount} face{faceCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Violation Counter */}
      {violationCount > 0 && (
        <div style={styles.violationBar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={styles.warningIcon}>
            <path
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span style={styles.violationText}>Violations: {violationCount}/5</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  header: {
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
  },
  headerIcon: {
    flexShrink: 0,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '160px',
    backgroundColor: '#0f172a',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: 'scaleX(-1)',
    pointerEvents: 'none',
  },
  loadingState: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#94a3b8',
  },
  loadingIcon: {
    color: '#64748b',
  },
  loadingText: {
    fontSize: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #334155',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  statusBar: {
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusIcon: {
    flexShrink: 0,
    color: '#10b981',
  },
  statusText: {
    fontSize: '12px',
    color: '#475569',
  },
  faceBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  violationBar: {
    padding: '10px 16px',
    backgroundColor: '#fef3c7',
    borderBottom: '1px solid #fde68a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  warningIcon: {
    color: '#f59e0b',
    flexShrink: 0,
  },
  violationText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#92400e',
  },
};

export default ProctorSidebar;
