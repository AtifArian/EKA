import React, { useState, useEffect } from 'react';
import { checkTodayMood, createMoodEntry } from '../services/api';

const MOODS = [
  { level: 1, emoji: '😢', label: 'Very Sad' },
  { level: 2, emoji: '😟', label: 'Sad' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Happy' },
  { level: 5, emoji: '😄', label: 'Very Happy' }
];

function MoodTracker() {
  const [showTracker, setShowTracker] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [hasEntry, setHasEntry] = useState(false);

  useEffect(() => {
    checkTodaysMood();
  }, []);

  const checkTodaysMood = async () => {
    try {
      const response = await checkTodayMood();
      if (response.has_entry) {
        setHasEntry(true);
        setSelectedMood(response.mood.mood_level);
      } else {
        setTimeout(() => setShowTracker(true), 2000);
      }
    } catch (error) {
      console.error('Error checking mood:', error);
    }
  };

  const handleMoodSelect = async (level) => {
    setSelectedMood(level);
    try {
      await createMoodEntry({ mood_level: level });
      setHasEntry(true);
      setTimeout(() => setShowTracker(false), 1500);
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save mood entry');
    }
  };

  const handleEditMood = () => {
    setShowTracker(true);
  };

  if (!showTracker && !hasEntry) return null;

  if (hasEntry && !showTracker) {
    return (
      <div style={{
        position: 'fixed', bottom: '20px', left: '20px', background: 'white',
        padding: '1rem 1.5rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 999
      }}>
        <span>Today's mood: {MOODS.find(m => m.level === selectedMood)?.emoji}</span>
        <button onClick={handleEditMood} style={{
          background: 'linear-gradient(135deg, #7F7FD5, #86A8E7)', color: 'white',
          border: 'none', padding: '0.5rem 1rem', borderRadius: '10px',
          cursor: 'pointer', fontSize: '0.9rem'
        }}>Edit</button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="mood-tracker">
        <button onClick={() => setShowTracker(false)} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'transparent',
          border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999'
        }}>×</button>
        
        <h2>How are you feeling today?</h2>
        
        <div className="mood-options">
          {MOODS.map(mood => (
            <div key={mood.level} onClick={() => handleMoodSelect(mood.level)} style={{ textAlign: 'center' }}>
              <div className={`mood-emoji ${selectedMood === mood.level ? 'selected' : ''}`} title={mood.label}>
                {mood.emoji}
              </div>
              <span className="mood-label">{mood.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MoodTracker;
