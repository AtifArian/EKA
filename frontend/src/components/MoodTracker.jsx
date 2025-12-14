import React, { useState, useEffect } from 'react';
import { checkTodayMood, createMoodEntry } from '../services/api';

const MOODS = [
  { level: 1, emoji: '😢', label: 'Very Sad' },
  { level: 2, emoji: '😟', label: 'Sad' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Happy' },
  { level: 5, emoji: '😄', label: 'Very Happy' }
];

const FOLLOW_UP_QUESTIONS = [
  {
    question: "How is your energy level?",
    options: [
      { level: 1, emoji: '🔋', label: 'Drained' },
      { level: 2, emoji: '😴', label: 'Low' },
      { level: 3, emoji: '😊', label: 'Okay' },
      { level: 4, emoji: '💪', label: 'Good' },
      { level: 5, emoji: '⚡', label: 'Energized' }
    ]
  },
  {
    question: "How stressed do you feel?",
    options: [
      { level: 1, emoji: '😰', label: 'Very Stressed' },
      { level: 2, emoji: '😟', label: 'Stressed' },
      { level: 3, emoji: '😐', label: 'Manageable' },
      { level: 4, emoji: '😌', label: 'Calm' },
      { level: 5, emoji: '🧘', label: 'Relaxed' }
    ]
  },
  {
    question: "How are your social connections?",
    options: [
      { level: 1, emoji: '😞', label: 'Isolated' },
      { level: 2, emoji: '🙁', label: 'Lonely' },
      { level: 3, emoji: '😐', label: 'Okay' },
      { level: 4, emoji: '😊', label: 'Connected' },
      { level: 5, emoji: '🤗', label: 'Supported' }
    ]
  }
];

function MoodTracker() {
  const [showTracker, setShowTracker] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [hasEntry, setHasEntry] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = main mood, 1-3 = follow-up questions
  const [followUpAnswers, setFollowUpAnswers] = useState([]);

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
    // Move to first follow-up question
    setCurrentStep(1);
  };

  const handleFollowUpAnswer = (answer) => {
    const newAnswers = [...followUpAnswers, answer];
    setFollowUpAnswers(newAnswers);
    
    if (currentStep < FOLLOW_UP_QUESTIONS.length) {
      // Move to next question
      setCurrentStep(currentStep + 1);
    } else {
      // All questions answered, save to backend
      saveMoodEntry(newAnswers);
    }
  };

  const saveMoodEntry = async (answers) => {
    try {
      await createMoodEntry({ 
        mood_level: selectedMood,
        energy_level: answers[0],
        stress_level: answers[1],
        social_connection: answers[2]
      });
      setHasEntry(true);
      setTimeout(() => {
        setShowTracker(false);
        // Reset for next time
        setCurrentStep(0);
        setFollowUpAnswers([]);
      }, 1500);
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save mood entry');
    }
  };

  const handleEditMood = () => {
    setShowTracker(true);
    setCurrentStep(0);
    setFollowUpAnswers([]);
  };

  if (!showTracker && !hasEntry) return null;

  if (hasEntry && !showTracker) {
    return (
      <div style={{
        position: 'fixed', bottom: '15px', left: '15px', 
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        padding: '0.6rem 1rem', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '0rem', zIndex: 999
      }}>
        <span style={{ color: '#1f2937', fontSize: '0.85rem' }}>Today's mood: {MOODS.find(m => m.level === selectedMood)?.emoji}</span>
        <button onClick={handleEditMood} style={{
          background: 'transparent',
          border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px',
          cursor: 'pointer', fontSize: '1rem'
        }}>🔄</button>
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
        <button onClick={() => {
          setShowTracker(false);
          setCurrentStep(0);
          setFollowUpAnswers([]);
        }} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'transparent',
          border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999'
        }}>×</button>
        
        {currentStep === 0 ? (
          // Main mood question
          <>
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
          </>
        ) : (
          // Follow-up questions
          <>
            <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              Question {currentStep} of {FOLLOW_UP_QUESTIONS.length}
            </div>
            <h2>{FOLLOW_UP_QUESTIONS[currentStep - 1].question}</h2>
            <div className="mood-options">
              {FOLLOW_UP_QUESTIONS[currentStep - 1].options.map(option => (
                <div key={option.level} onClick={() => handleFollowUpAnswer(option.level)} style={{ textAlign: 'center' }}>
                  <div className="mood-emoji" title={option.label}>
                    {option.emoji}
                  </div>
                  <span className="mood-label">{option.label}</span>
                </div>
              ))}
            </div>
            {currentStep > 1 && (
              <button 
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setFollowUpAnswers(followUpAnswers.slice(0, -1));
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ← Back
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MoodTracker;
