/**
 * ProctorMonitor - AI-Based Cheat Detection Component
 *
 * Features:
 * - Face Detection using MediaPipe Face Detection
 * - Object Detection using TensorFlow.js COCO-SSD
 * - Webcam monitoring with violation tracking
 * - Auto-termination after 5 violations
 *
 * No backend required - runs entirely in the browser
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';

// Configuration
const CONFIG = {
  NO_FACE_THRESHOLD: 5000,    // 5 seconds without face
  OBJECT_DETECTION_INTERVAL: 1000, // Run every 1 second
  PHONE_CONFIDENCE_THRESHOLD: 0.6,
  MAX_VIOLATIONS: 10,
  WARNING_AUTO_HIDE: 3000,    // Hide warning after 3 seconds
};

const ProctorMonitor = ({
  isActive = true,
  onViolationExceeded,
  onViolationCountChange,
  isEnabled = true,
  isWidget = false,        // If true, render as sidebar widget (no warning banners)
  showWidget = false,      // If true, show widget AND warning banners
}) => {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const objectModelRef = useRef(null);
  const animationFrameRef = useRef(null);
  const objectDetectionIntervalRef = useRef(null);
  const isDetectingRef = useRef(false);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [warning, setWarning] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState([]);
  const [faceCount, setFaceCount] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState('Initializing...');
  const [videoError, setVideoError] = useState(null);
  const [cameraInitializationReady, setCameraInitializationReady] = useState(false);

  // Tracking variables
  const noFaceStartTimeRef = useRef(null);
  const lastViolationTimeRef = useRef({});
  const warningTimeoutRef = useRef(null);

  /**
   * Show warning message with auto-hide
   */
  const showWarning = useCallback((message, type = 'warning') => {
    setWarning({ message, type });

    // Clear existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Auto-hide after 3 seconds
    warningTimeoutRef.current = setTimeout(() => {
      setWarning(null);
    }, CONFIG.WARNING_AUTO_HIDE);
  }, []);

  /**
   * Record a violation
   */
  const recordViolation = useCallback((type, message) => {
    const now = Date.now();
    const lastTime = lastViolationTimeRef.current[type] || 0;

    // Debounce: Don't count same violation type within 2 seconds
    if (now - lastTime < 2000) {
      showWarning(message, 'warning');
      return;
    }

    lastViolationTimeRef.current[type] = now;

    setViolations(prev => {
      const newViolations = [...prev, {
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
      }];
      const newCount = newViolations.length;

      if (onViolationCountChange) {
        onViolationCountChange(newCount);
      }

      // Check if exceeded max violations
      if (newCount >= CONFIG.MAX_VIOLATIONS) {
        if (onViolationExceeded) {
          onViolationExceeded(newViolations);
        }
      }

      return newViolations;
    });

    setViolationCount(prev => prev + 1);
    showWarning(message, 'danger');
  }, [showWarning, onViolationCountChange, onViolationExceeded]);

  /**
   * Initialize TensorFlow.js models
   */
  const initializeModels = useCallback(async () => {
    try {
      setError(null);
      setDetectionStatus('Loading AI models...');

      // Wait for TensorFlow.js to be ready
      await tf.ready();

      // Initialize Face Detection
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: 'tfjs',
        modelUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/face-detection@0.4/build/model/',
        maxFaces: 5,
      };
      faceDetectorRef.current = await faceDetection.createDetector(model, detectorConfig);

      setDetectionStatus('Loading object detection...');

      // Initialize Object Detection (COCO-SSD)
      objectModelRef.current = await cocoSsd.load({
        base: 'lite_mobilenet_v2', // Lightweight model for better performance
      });

      setIsInitialized(true);
      setDetectionStatus('AI Ready');
      return true;
    } catch (err) {
      setError('Failed to initialize proctoring system. Please refresh and try again.');
      setDetectionStatus('Initialization failed');
      return false;
    }
  }, []);

  /**
   * Start webcam
   */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setVideoError(null);
      setDetectionStatus('Accessing camera...');

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = 'Your browser does not support camera access. Please use Chrome, Firefox, or Edge.';
        setError(msg);
        setVideoError(msg);
        return false;
      }

      // Check if we're on HTTPS or localhost
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const msg = 'Camera access requires HTTPS. Please contact support.';
        setError(msg);
        setVideoError(msg);
        return false;
      }

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Set the stream to video element
      if (videoRef.current) {
        // Clear any previous error
        setVideoError(null);

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraActive(true);
            setDetectionStatus('Camera active');
          }).catch(err => {
            setVideoError('Failed to play camera: ' + err.message);
            setError('Failed to play camera. Please refresh.');
          });
        };
        // Add error handler for video element
        videoRef.current.onerror = (e) => {
          setVideoError('Video element error: ' + JSON.stringify(e));
        };
      } else {
        setError('Camera element not ready. Please refresh the page.');
        return false;
      }

      return true;
    } catch (err) {
      let errorMsg = 'Failed to access camera. ';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera access denied. Please allow camera permission in your browser settings and refresh.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found. Please connect a camera and refresh.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is already in use by another application. Please close other apps using the camera.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMsg = 'Camera does not support the required settings.';
      } else if (err.name === 'TypeError' || err.name === 'SecurityError') {
        errorMsg = 'Camera access blocked. Please ensure you are using HTTPS or localhost.';
      } else {
        errorMsg += `(${err.name}: ${err.message})`;
      }

      setError(errorMsg);
      setVideoError(errorMsg);
      setDetectionStatus('Camera failed');
      return false;
    }
  }, []);

  /**
   * Detect faces using MediaPipe Face Detection
   */
  const detectFaces = useCallback(async () => {
    if (!faceDetectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      return { faces: [] };
    }

    try {
      const faces = await faceDetectorRef.current.estimateFaces(videoRef.current);
      return { faces };
    } catch (err) {
      return { faces: [] };
    }
  }, []);

  /**
   * Detect objects using COCO-SSD
   */
  const detectObjects = useCallback(async () => {
    if (!objectModelRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      return [];
    }

    try {
      const predictions = await objectModelRef.current.detect(videoRef.current);
      return predictions;
    } catch (err) {
      return [];
    }
  }, []);

  /**
   * Process frame for face detection (runs continuously)
   */
  const processFrame = useCallback(async () => {
    // Prevent multiple detection loops
    if (isDetectingRef.current || !isActive || !cameraActive || !videoRef.current) {
      return;
    }

    isDetectingRef.current = true;

    try {
      // Run face detection on every frame
      const { faces } = await detectFaces();

      // Update face count state for UI
      setFaceCount(faces.length);

      // Face detection logic
      if (faces.length === 0) {
        // No face detected
        if (!noFaceStartTimeRef.current) {
          noFaceStartTimeRef.current = Date.now();
        } else {
          const elapsed = Date.now() - noFaceStartTimeRef.current;
          const remaining = Math.max(0, CONFIG.NO_FACE_THRESHOLD - elapsed);
          setDetectionStatus(`No face (${Math.ceil(remaining/1000)}s)`);

          if (elapsed >= CONFIG.NO_FACE_THRESHOLD) {
            recordViolation('no_face', 'No face detected');
            noFaceStartTimeRef.current = Date.now(); // Reset to avoid spamming
          }
        }
      } else if (faces.length === 1) {
        // Exactly one face - clear the no-face timer
        noFaceStartTimeRef.current = null;
        setDetectionStatus('Monitoring');
      } else if (faces.length > 1) {
        // Multiple faces detected
        noFaceStartTimeRef.current = null;
        setDetectionStatus(`Multiple faces: ${faces.length}`);
        recordViolation('multiple_faces', 'Multiple faces detected');
      }

      // Draw face boxes on canvas
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const videoWidth = videoRef.current.videoWidth || 640;
        const videoHeight = videoRef.current.videoHeight || 480;

        // Set canvas size to match video
        if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        faces.forEach((face, index) => {
          const { x, y, width, height } = face.box;
          ctx.strokeStyle = index === 0 ? '#00ff00' : '#ff0000';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // Draw face label background
          const label = index === 0 ? 'Face 1' : `Face ${index + 1}`;
          ctx.font = 'bold 14px Arial';
          const textWidth = ctx.measureText(label).width;
          ctx.fillStyle = index === 0 ? '#00ff00' : '#ff0000';
          ctx.fillRect(x, y - 22, textWidth + 10, 22);

          // Draw face label text
          ctx.fillStyle = '#000000';
          ctx.fillText(label, x + 5, y - 6);
        });
      }
    } catch (err) {
      // Silently handle frame processing errors
    } finally {
      isDetectingRef.current = false;
    }

    // Continue loop
    if (isActive && cameraActive) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isActive, cameraActive, detectFaces, recordViolation]);

  /**
   * Process object detection (runs every 1 second)
   */
  const processObjectDetection = useCallback(async () => {
    if (!isActive || !cameraActive || !videoRef.current) {
      return;
    }

    const predictions = await detectObjects();

    // Check for mobile phone
    const phoneDetection = predictions.find(
      (pred) =>
        pred.class === 'cell phone' && pred.score > CONFIG.PHONE_CONFIDENCE_THRESHOLD
    );

    if (phoneDetection) {
      setDetectionStatus('Phone detected!');
      recordViolation('cell_phone', 'Mobile phone detected');

      // Draw phone box
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const [x, y, width, height] = phoneDetection.bbox;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(
          `PHONE ${(phoneDetection.score * 100).toFixed(0)}%`,
          x,
          y - 8
        );
      }
    }

  }, [isActive, cameraActive, detectObjects, recordViolation]);

  /**
   * Initialize on mount - load models first
   */
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let mounted = true;

    const initialize = async () => {
      const modelsReady = await initializeModels();
      if (!mounted) return;
      if (modelsReady) {
        setCameraInitializationReady(true);
      }
    };

    initialize();

    return () => {
      mounted = false;
      // Cleanup
      cleanup();
    };
  }, [isEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Start camera when models are loaded and video ref is available
   */
  useEffect(() => {
    if (!isEnabled || !cameraInitializationReady) {
      return;
    }

    // Use a MutationObserver to wait for the video element to be added to DOM
    if (videoRef.current) {
      startCamera();
      setCameraInitializationReady(false); // Prevent re-triggering
    } else {
      // Poll for video ref availability
      const checkInterval = setInterval(() => {
        if (videoRef.current) {
          clearInterval(checkInterval);
          startCamera();
          setCameraInitializationReady(false);
        }
      }, 100);

      // Stop polling after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!videoRef.current) {
          setVideoError('Camera element failed to initialize. Please refresh the page.');
        }
      }, 5000);

      return () => clearInterval(checkInterval);
    }
  }, [isEnabled, cameraInitializationReady, startCamera]);

  /**
   * Start/stop detection based on isActive
   */
  useEffect(() => {
    if (isActive && isInitialized && cameraActive) {
      // Start face detection loop
      processFrame();

      // Start object detection interval
      objectDetectionIntervalRef.current = setInterval(
        processObjectDetection,
        CONFIG.OBJECT_DETECTION_INTERVAL
      );
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (objectDetectionIntervalRef.current) {
        clearInterval(objectDetectionIntervalRef.current);
      }
    };
  }, [isActive, isInitialized, cameraActive, processFrame, processObjectDetection]);

  /**
   * Cleanup function
   */
  const cleanup = () => {
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Clear interval
    if (objectDetectionIntervalRef.current) {
      clearInterval(objectDetectionIntervalRef.current);
    }

    // Clear timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    setCameraActive(false);
    isDetectingRef.current = false;
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return cleanup;
  }, []);

  if (!isEnabled) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={styles.errorIcon}>
            <path
              d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div style={styles.errorTitle}>Proctoring Error</div>
          <div style={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  // Helper to render the camera widget
  const renderCameraWidget = () => (
    <div style={styles.cameraWidget}>
      {/* Header */}
      <div style={styles.widgetHeader}>
        <span style={styles.widgetTitle}>AI Proctoring</span>
        <div style={{
          ...styles.statusDot,
          backgroundColor: cameraActive && isInitialized ? '#10b981' : '#f59e0b',
        }} />
      </div>

      {/* Video/Canvas Container */}
      <div style={styles.videoContainer}>
        {/* Always render video element (hidden when not active) */}
        <video
          ref={videoRef}
          style={{
            ...styles.video,
            visibility: cameraActive ? 'visible' : 'hidden',
            position: cameraActive ? 'relative' : 'absolute',
          }}
          playsInline
          muted
          autoPlay
          onCanPlay={() => {}}
          onPlaying={() => {
            setCameraActive(true);
          }}
          onError={() => {
            setVideoError('Video playback error');
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            ...styles.canvas,
            visibility: cameraActive ? 'visible' : 'hidden',
          }}
        />

        {/* Loading overlay when camera is not active */}
        {!cameraActive && (
          <div style={styles.loadingState}>
            {isInitialized ? (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={styles.loadingIcon}>
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={styles.loadingText}>Starting camera...</span>
                {videoError && (
                  <span style={styles.errorText}>{videoError}</span>
                )}
              </>
            ) : (
              <>
                <div style={styles.spinner}></div>
                <span style={styles.loadingText}>{detectionStatus}</span>
                {videoError && (
                  <span style={styles.errorText}>{videoError}</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span style={styles.statusText}>{detectionStatus}</span>
        {isInitialized && (
          <span style={styles.faceBadge}>{faceCount} face{faceCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Violation Counter */}
      {violationCount > 0 && (
        <div style={styles.violationBar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={styles.warningIconSmall}>
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={styles.violationTextSmall}>Violations: {violationCount}/5</span>
        </div>
      )}
    </div>
  );

  // Helper to render the warning banner
  const renderWarningBanner = () => {
    if (!warning) return null;
    return (
      <div style={{
        ...styles.warningBanner,
        backgroundColor: warning.type === 'danger' ? '#fee2e2' : '#fef3c7',
        borderColor: warning.type === 'danger' ? '#fecaca' : '#fde68a',
        color: warning.type === 'danger' ? '#991b1b' : '#92400e',
      }}>
        <div style={styles.warningContent}>
          {warning.type === 'danger' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.warningIcon}>
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.warningIcon}>
              <path
                d="M12 9V13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          <span style={styles.warningText}>{warning.message}</span>
        </div>
        <div style={styles.violationCounter}>
          Violations: {violationCount}/{CONFIG.MAX_VIOLATIONS}
        </div>
      </div>
    );
  };

  // If in widget mode, return just the widget (for backward compatibility)
  if (isWidget) {
    return renderCameraWidget();
  }

  // If showWidget is true, render both widget and warning banner
  if (showWidget) {
    return (
      <>
        {renderWarningBanner()}
        {renderCameraWidget()}
      </>
    );
  }

  // Default: just render warning banner
  return <>{renderWarningBanner()}</>;
};

// Styles
const styles = {
  warningBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10001,
    padding: '14px 20px',
    borderBottom: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    animation: 'slideDown 0.3s ease-out',
  },
  warningContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  warningIcon: {
    flexShrink: 0,
  },
  warningText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  violationCounter: {
    fontSize: '13px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  errorContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f5f7fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10002,
  },
  errorContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  errorIcon: {
    color: '#ef4444',
    marginBottom: '16px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#64748b',
  },
  cameraWidget: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  widgetHeader: {
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
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
    height: '180px',
    backgroundColor: '#0f172a',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
    // Ensure video is visible
    opacity: 1,
    display: 'block',
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
  errorText: {
    fontSize: '11px',
    color: '#ef4444',
    marginTop: '8px',
    textAlign: 'center',
    maxWidth: '220px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #334155',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  statusBar: {
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e2e8f0',
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  warningIconSmall: {
    color: '#f59e0b',
    flexShrink: 0,
  },
  violationTextSmall: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#92400e',
  },
};

export default ProctorMonitor;
