import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listThreads, createUserUserThread, postThreadMessage } from '../services/api';
import { getHighRiskPatients } from '../services/api';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function HighRiskAlert({ user, onChatNow }) {
  const navigate = useNavigate();
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);

  useEffect(() => {
    if (user && user.is_doctor) {
      checkHighRiskPatients();
      // Check every 5 minutes
      const interval = setInterval(checkHighRiskPatients, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkHighRiskPatients = async () => {
    try {
      const patients = await getHighRiskPatients();
      if (patients.length > 0) {
        setHighRiskPatients(patients);
        setShowAlert(true);
        setCurrentPatientIndex(0);
      }
    } catch (error) {
      console.error('Error checking high-risk patients:', error);
    }
  };

  const handleChatNow = () => {
    const patient = highRiskPatients[currentPatientIndex];
    setShowAlert(false);
    // Open in MyProfile inbox directly
    if (onChatNow) {
      onChatNow(patient);
    }
    navigate('/profile');
  };

  const handleCall = () => {
    const patient = highRiskPatients[currentPatientIndex];
    setShowAlert(false);
    // Create or reuse a chat thread and send an emergency-call message
    (async () => {
      try {
        const threads = await listThreads();
        let thread = threads.find(t => t.thread_type === 'user_user' && t.participants.some(p => p.id === patient.id));
        if (!thread) {
          thread = await createUserUserThread(patient.id);
        }
        const sessionId = `EM-${patient.id}-${Date.now()}`;
        await postThreadMessage(thread.id, `EMERGENCY_CALL:${sessionId}`);
        // Open the doctor's call window
        navigate(`/video-call/${sessionId}`);
      } catch (e) {
        // Fallback: go to inbox
        if (onChatNow) onChatNow(patient);
        navigate('/profile');
      }
    })();
  };

  const handleSendHelpTeam = () => {
    const patient = highRiskPatients[currentPatientIndex];
    if (window.confirm(`Send emergency help team to ${patient.full_name || patient.username}? This will notify emergency services.`)) {
      alert('Emergency help team has been notified and dispatched.');
      setShowAlert(false);
    }
  };

  const handleNext = () => {
    if (currentPatientIndex < highRiskPatients.length - 1) {
      setCurrentPatientIndex(currentPatientIndex + 1);
    } else {
      setShowAlert(false);
    }
  };

  const handleDismiss = () => {
    setShowAlert(false);
  };

  if (!showAlert || highRiskPatients.length === 0) return null;

  const patient = highRiskPatients[currentPatientIndex];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '2px solid rgba(255, 100, 100, 0.5)',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 8px 40px rgba(255, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Alert Badge */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)',
          animation: 'pulse 2s infinite'
        }}>
          🚨 HIGH RISK ALERT
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#999',
            padding: '0.25rem'
          }}
        >
          ×
        </button>

        {/* Patient Info */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Profile Picture */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #ff4444',
            margin: '0 auto 1rem',
            background: '#f0f0f0'
          }}>
            {patient.profile_picture ? (
              <img 
                src={getResolvedImageUrl(patient.profile_picture, 'user')}
                alt={patient.username}
                onError={(e) => handleImageError(e, 'user')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ff4444, #cc0000)',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                {patient.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#1f2937',
            fontSize: '1.5rem'
          }}>
            {patient.full_name || patient.username}
          </h2>
          
          <p style={{ 
            margin: '0 0 1rem 0', 
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            {patient.email}
          </p>

          {/* Risk Score */}
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '15px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(255, 0, 0, 0.3)'
          }}>
            Risk Score: {patient.risk_score}%
          </div>

          <p style={{
            marginTop: '1rem',
            color: '#4b5563',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}>
            This patient requires immediate attention. Please take appropriate action.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button
            onClick={handleChatNow}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            💬 Chat Now
          </button>

          <button
            onClick={handleCall}
            style={{
              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 15px rgba(86, 171, 47, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(86, 171, 47, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(86, 171, 47, 0.4)';
            }}
          >
            📞 Call Patient
          </button>

          <button
            onClick={handleSendHelpTeam}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
            }}
          >
            🚑 Send Help Team
          </button>
        </div>

        {/* Multiple patients indicator */}
        {highRiskPatients.length > 1 && (
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#6b7280',
              fontSize: '0.9rem'
            }}>
              {currentPatientIndex + 1} of {highRiskPatients.length} high-risk patients
            </p>
            <button
              onClick={handleNext}
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                color: '#1f2937',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                padding: '0.5rem 1.5rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              {currentPatientIndex < highRiskPatients.length - 1 ? 'Next Patient →' : 'Done'}
            </button>
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

export default HighRiskAlert;
