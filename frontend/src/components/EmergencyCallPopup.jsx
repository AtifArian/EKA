import React, { useEffect, useState } from 'react';
import { listThreads, getThreadMessages, markThreadRead } from '../services/api';
import { useNavigate } from 'react-router-dom';

function EmergencyCallPopup({ user }) {
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState(null); // { sessionId, threadId, from, messageId }

  useEffect(() => {
    if (!user || user.is_doctor) return; // Only patients receive emergency calls

    let timer;

    const poll = async () => {
      try {
        const threads = await listThreads();

        // Track threads where last_message is already an EMERGENCY_CALL so fallback
        // doesn't scan older EMERGENCY_CALL messages (which can cause re-popups).
        const threadsWithLastEmergency = new Set();
        
        // Prefer fast detection using last_message + unread_count
        for (const t of threads) {
          const lm = t.last_message;
          if (lm && typeof lm.content === 'string' && lm.content.startsWith('EMERGENCY_CALL:')) {
            threadsWithLastEmergency.add(t.id);
            
            const createdAt = lm.created_at ? new Date(lm.created_at).getTime() : 0;
            const now = Date.now();
            const isRecent = now - createdAt <= 24 * 60 * 60 * 1000; // Extended to 24 hours
            const seenKey = `${t.id}:${lm.id}`;
            const seenMap = JSON.parse(localStorage.getItem('eka_emergency_seen') || '{}');
            const senderId = lm.sender_id || lm.sender?.id;
            const isFromOthers = senderId !== (user?.id);
            const wasDeclined = isRecentlyDeclined(t.id, lm.id);
            
            // For emergency calls, ignore "read" status - only check if accepted/declined
            const checksPassed = isFromOthers && isRecent && !seenMap[seenKey] && !wasDeclined;
            
            if (checksPassed) {
              const sessionId = lm.content.replace('EMERGENCY_CALL:', '').trim();
              setIncoming({ sessionId, threadId: t.id, from: lm.sender, messageId: lm.id });
              return; // show first match immediately
            }
          }
        }

        // Fallback: scan messages in each thread
        for (const t of threads) {
          // If last_message is an EMERGENCY_CALL, we've already evaluated the newest call
          // for this thread; don't scan older EMERGENCY_CALL messages.
          if (threadsWithLastEmergency.has(t.id)) continue;

          const msgs = await getThreadMessages(t.id);
          if (!msgs || msgs.length === 0) continue;
          for (let i = msgs.length - 1; i >= 0; i--) {
            const m = msgs[i];
            if (typeof m.content === 'string' && m.content.startsWith('EMERGENCY_CALL:')) {
              const createdAt = m.created_at ? new Date(m.created_at).getTime() : 0;
              const now = Date.now();
              const isRecent = now - createdAt <= 24 * 60 * 60 * 1000; // 24 hours
              const seenKey = `${t.id}:${m.id}`;
              const seenMap = JSON.parse(localStorage.getItem('eka_emergency_seen') || '{}');
              const senderId = m.sender_id || m.sender?.id;
              const wasDeclined = isRecentlyDeclined(t.id, m.id);
              // Ignore is_read status for emergency calls
              if (isRecent && !seenMap[seenKey] && !wasDeclined && senderId !== (user?.id)) {
                const sessionId = m.content.replace('EMERGENCY_CALL:', '').trim();
                setIncoming({ sessionId, threadId: t.id, from: m.sender, messageId: m.id });
                return;
              }

              // We found the newest EMERGENCY_CALL in this thread; don't scan older ones.
              break;
            }
          }
        }
      } catch (e) {
        // Avoid noisy logs; polling will retry on next interval.
      }
    };

    poll();
    timer = setInterval(poll, 5000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  const handleAccept = async () => {
    try {
      if (incoming.threadId) await markThreadRead(incoming.threadId);
      recordSeen(incoming.threadId, incoming.messageId);
    } catch (e) {}
    navigate(`/video-call/${incoming.sessionId}`);
    setIncoming(null);
  };

  const handleDecline = async () => {
    // Don't mark as read or permanently seen - just dismiss temporarily
    // Store declined timestamp so we don't re-show immediately
    recordDeclined(incoming.threadId, incoming.messageId);
    setIncoming(null);
  };

  function recordSeen(threadId, messageId) {
    try {
      const seenMap = JSON.parse(localStorage.getItem('eka_emergency_seen') || '{}');
      seenMap[`${threadId}:${messageId}`] = true;
      localStorage.setItem('eka_emergency_seen', JSON.stringify(seenMap));
    } catch {}
  }

  function recordDeclined(threadId, messageId) {
    try {
      const declinedMap = JSON.parse(localStorage.getItem('eka_emergency_declined') || '{}');
      declinedMap[`${threadId}:${messageId}`] = Date.now(); // Store timestamp
      localStorage.setItem('eka_emergency_declined', JSON.stringify(declinedMap));
    } catch {}
  }

  function isRecentlyDeclined(threadId, messageId) {
    try {
      const declinedMap = JSON.parse(localStorage.getItem('eka_emergency_declined') || '{}');
      const declinedKey = `${threadId}:${messageId}`;
      const declinedTime = declinedMap[declinedKey];
      if (!declinedTime) return false;
      // Suppress for 2 hours after clicking "Later"
      const twoHours = 2 * 60 * 60 * 1000;
      return (Date.now() - declinedTime) < twoHours;
    } catch {
      return false;
    }
  }



  return (
    <>
      {incoming && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <h3 style={{
              marginTop: 0, marginBottom: '0.5rem', color: '#1f2937',
              fontSize: '1.25rem', textAlign: 'center'
            }}>📞 Emergency Call Request</h3>
            <p style={{ color: '#555', marginBottom: '1.25rem', textAlign: 'center' }}>
              Your doctor is requesting an urgent video session.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAccept}
                className="submit-btn"
                style={{ flex: 1, background: '#4CAF50' }}
              >
                Join Call
              </button>
              <button
                onClick={handleDecline}
                className="submit-btn"
                style={{ background: '#999' }}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EmergencyCallPopup;