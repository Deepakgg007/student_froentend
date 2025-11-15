import React, { useState, useEffect } from 'react';

/**
 * Timer Component for Certification Exams
 * Displays countdown timer with persistent state across page refreshes
 * Handles time expiration and warning alerts
 *
 * @param {number} initialMinutes - Duration in minutes
 * @param {function} onTimeExpired - Callback when time runs out
 * @param {boolean} isActive - Whether timer should be running
 */
const Timer = ({ initialMinutes, onTimeExpired, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Check if we have a saved time in localStorage
    try {
      const savedTime = localStorage.getItem('examTimeLeft');
      const savedTimestamp = localStorage.getItem('examTimeTimestamp');

      if (savedTime && savedTimestamp) {
        const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
        const remaining = Math.max(0, parseInt(savedTime) - elapsed);

        // If more than the initial duration has passed, reset
        if (remaining > initialMinutes * 60) {
          return initialMinutes * 60;
        }

        return remaining;
      }
    } catch (e) {
      console.error('Error reading exam time from localStorage:', e);
    }

    return initialMinutes * 60; // Convert to seconds
  });

  const [isWarning, setIsWarning] = useState(false);

  // Save initial time to localStorage on mount
  useEffect(() => {
    try {
      localStorage.setItem('examTimeLeft', timeLeft.toString());
      localStorage.setItem('examTimeTimestamp', Date.now().toString());
    } catch (e) {
      console.error('Error saving exam time to localStorage:', e);
    }
  }, []);

  // Handle timer countdown and persistence
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;

        // Save to localStorage every second
        try {
          localStorage.setItem('examTimeLeft', newTime.toString());
          localStorage.setItem('examTimeTimestamp', Date.now().toString());
        } catch (e) {
          console.error('Error saving exam time:', e);
        }

        if (newTime <= 1) {
          clearInterval(interval);
          try {
            localStorage.removeItem('examTimeLeft');
            localStorage.removeItem('examTimeTimestamp');
          } catch (e) {
            console.error('Error clearing exam time:', e);
          }
          onTimeExpired();
          return 0;
        }

        // Trigger warning when 5 minutes or less remain
        if (newTime <= 300 && newTime > 299) {
          setIsWarning(true);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Determine color based on time remaining
  const getTimerColor = () => {
    if (timeLeft <= 60) return '#dc3545'; // Red - Critical
    if (isWarning) return '#ff6b6b'; // Light red - Warning
    return '#28a745'; // Green - Normal
  };

  const getTimerBgColor = () => {
    if (timeLeft <= 60) return '#ffe5e5';
    if (isWarning) return '#fff3cd';
    return '#e8f5e9';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: getTimerBgColor(),
        borderRadius: '6px',
        border: `1px solid ${getTimerColor()}`,
        transition: 'all 0.3s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: getTimerColor(),
          fontFamily: 'monospace',
          minWidth: '50px',
          textAlign: 'center'
        }}
      >
        {formattedTime}
      </div>
      {isWarning && (
        <div style={{ fontSize: '12px', color: getTimerColor(), fontWeight: '600' }}>
          ⚠️
        </div>
      )}
    </div>
  );
};

export default Timer;
