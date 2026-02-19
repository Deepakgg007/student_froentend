/**
 * ExamTerminated - Shown when max violations exceeded
 */

const ExamTerminated = ({ violations, onReturn }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10003,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Termination Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ color: '#ef4444' }}>
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 12px',
        }}>
          Exam Terminated
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          margin: '0 0 24px',
          lineHeight: '1.6',
        }}>
          Your exam has been terminated due to multiple proctoring violations.
          The exam session has been invalidated.
        </p>

        {/* Violations Summary */}
        {violations && violations.length > 0 && (
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#475569',
              marginBottom: '12px',
            }}>
              Violations Recorded:
            </div>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
            }}>
              {violations.map((v, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < violations.length - 1 ? '1px solid #e2e8f0' : 'none',
                  }}
                >
                  <span style={{
                    fontSize: '13px',
                    color: '#ef4444',
                  }}>
                    {v.message}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                  }}>
                    {v.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Return Button */}
        <button
          onClick={onReturn}
          style={{
            padding: '14px 32px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Return to Dashboard
        </button>

        {/* Info Message */}
        <p style={{
          fontSize: '12px',
          color: '#94a3b8',
          margin: '16px 0 0',
        }}>
          If you believe this is an error, please contact your administrator.
        </p>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ExamTerminated;
