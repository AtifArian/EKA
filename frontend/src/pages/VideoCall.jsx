import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function VideoCall({ user, setUser }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load Jitsi Meet External API script
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-08357ca3ce254d1aa26dcc15ea3a9774/external_api.js';
    script.async = true;
    script.onload = initializeJitsi;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, [user, navigate]);

  const initializeJitsi = () => {
    if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const roomName = `vpaas-magic-cookie-08357ca3ce254d1aa26dcc15ea3a9774/EKA-Session-${sessionId}`;
      
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user?.full_name || user?.username || 'User',
          email: user?.email || ''
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI("8x8.vc", options);

      // Event listeners
      jitsiApiRef.current.addListener('readyToClose', () => {
        navigate('/my-profile');
      });
    }
  };

  return (
    <div 
      ref={jitsiContainerRef}
      style={{ 
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100vh - 70px)',
        background: '#000',
        zIndex: 1
      }}
    />
  );
}

export default VideoCall;
