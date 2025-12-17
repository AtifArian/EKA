import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function VideoCall({ user, setUser }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Measure navbar height so the call starts just below it
    const measureNav = () => {
      const nav = document.querySelector('.navbar');
      if (nav) {
        const h = Math.ceil(nav.getBoundingClientRect().height);
        setNavHeight(h);
      } else {
        // Fallback to 80px if navbar not found
        setNavHeight(80);
      }
    };
    measureNav();
    window.addEventListener('resize', measureNav);

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
      window.removeEventListener('resize', measureNav);
    };
  }, [user, navigate]);

  const initializeJitsi = () => {
    if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const roomName = `vpaas-magic-cookie-08357ca3ce254d1aa26dcc15ea3a9774/EKA-Session-${sessionId}`;
      const API_BASE = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050';
      const profilePath = user?.profile_picture
        ? (user.profile_picture.startsWith('/') ? user.profile_picture : `/${user.profile_picture}`)
        : null;
      const avatarURL = profilePath ? `${API_BASE}${profilePath}` : undefined;
      
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user?.full_name || user?.username || 'User',
          email: user?.email || '',
          avatarURL
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

      // Ensure avatar is applied (for when camera is off)
      if (avatarURL) {
        try {
          jitsiApiRef.current.executeCommand('avatarUrl', avatarURL);
        } catch (e) {
          // ignore if command not available; userInfo avatarURL should still work
        }
      }

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
        top: `${navHeight}px`,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: `calc(100vh - ${navHeight}px)`,
        background: '#000',
        zIndex: 1
      }}
    />
  );
}

export default VideoCall;
