# AI Proctoring System - Installation Guide

## Overview
This adds AI-powered cheat detection to the certification exam using:
- **MediaPipe Face Detection** - For face monitoring
- **TensorFlow.js COCO-SSD** - For object detection (mobile phones)

## Installation Steps

### 1. Install Required Packages

Run the following command in your project root:

```bash
npm install @tensorflow-models/face-detection @tensorflow-models/coco-ssd @tensorflow/tfjs-backend-webgl
```

Or with yarn:

```bash
yarn add @tensorflow-models/face-detection @tensorflow-models/coco-ssd @tensorflow/tfjs-backend-webgl
```

### 2. Files Created

The following files have been created/modified:

| File | Description |
|------|-------------|
| `src/component/certification/ProctorMonitor.jsx` | Main proctoring component with AI detection |
| `src/component/certification/ExamTerminated.jsx` | Screen shown when exam is terminated |
| `src/component/certification/CertificationExam.jsx` | Updated to integrate proctoring |

### 3. Features

#### Face Detection
- ✅ Detects if no face is present for more than 3 seconds
- ✅ Detects if more than one face is present
- ✅ Runs continuously using requestAnimationFrame
- ✅ Shows green box for primary face, red for additional faces

#### Object Detection
- ✅ Detects mobile phones (class: "cell phone")
- ✅ Confidence threshold: 0.6 (60%)
- ✅ Runs every 1 second (optimized for performance)
- ✅ Shows red bounding box around detected phones

#### Violation System
- ✅ Red warning banner appears on violations
- ✅ Auto-hides after 3 seconds
- ✅ Maintains violation counter
- ✅ After 5 violations → Exam Terminated screen

### 4. Usage

The proctoring is enabled by default. You can control it via props:

```jsx
<CertificationExam
  certificationId={certificationId}
  certificationTitle={certification.title}
  duration={certification.duration}
  onComplete={handleExamComplete}
  enableProctoring={true}  // Set to false to disable
/>
```

### 5. UI Components

#### Camera Widget (Bottom Right)
```
┌─────────────────┐
│ Proctoring Active ●│
├─────────────────┤
│                 │
│   [Camera]      │
│   [Feed]        │
│                 │
├─────────────────┤
│ ✓ AI monitoring │
└─────────────────┘
```

#### Warning Banner (Top - appears on violations)
```
┌────────────────────────────────────────────────────────────┐
│ ⚠ No face detected                    Violations: 2/5      │
└────────────────────────────────────────────────────────────┘
```

### 6. Browser Requirements

| Feature | Requirement |
|---------|-------------|
| Camera Access | HTTPS or localhost |
| WebGL | For TensorFlow.js acceleration |
| Browser | Chrome 90+, Firefox 88+, Safari 14+ |

### 7. Configuration

You can modify settings in `ProctorMonitor.jsx`:

```javascript
const CONFIG = {
  NO_FACE_THRESHOLD: 3000,              // 3 seconds
  OBJECT_DETECTION_INTERVAL: 1000,      // 1 second
  PHONE_CONFIDENCE_THRESHOLD: 0.6,      // 60%
  MAX_VIOLATIONS: 5,                    // Max violations allowed
  WARNING_AUTO_HIDE: 3000,              // 3 seconds
};
```

### 8. Troubleshooting

#### Camera not starting
- Ensure you're on HTTPS or localhost
- Check browser camera permissions
- Verify no other app is using the camera

#### AI models not loading
- Check console for CDN errors
- Ensure @tensorflow packages are installed
- Try clearing browser cache

#### Performance issues
- Object detection already runs at 1-second intervals
- Face detection uses optimized MediaPipe models
- Camera widget is small (200x150px) for efficiency

### 9. GDPR/Privacy Note

This system:
- Processes video entirely in the browser (client-side)
- Does NOT send video to any server
- Does NOT record or store video
- Only uses frames for real-time AI inference

### 10. Testing Checklist

- [ ] Camera starts on page load
- [ ] Face detected (green box appears)
- [ ] Warning shows when face is absent for 3+ seconds
- [ ] Warning shows when multiple faces detected
- [ ] Warning shows when cell phone detected
- [ ] Violation counter increments correctly
- [ ] Exam terminates after 5 violations
- [ ] Camera stops when exam ends/terminates
