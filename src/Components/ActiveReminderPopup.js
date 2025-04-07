import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import axios from 'axios';

function ActiveReminderPopup() {
  const [show, setShow] = useState(false);
  const [activeReminder, setActiveReminder] = useState(null);
  const userId = localStorage.getItem("userId");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check for active reminders (reminders whose time has just hit)
  useEffect(() => {
    const checkActiveReminders = async () => {
      try {
        if (!userId) return;
        
        const res = await axios.get(`http://localhost:9866/getAllReminders/${userId}`);
        const allReminders = res.data;
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        
        // Find a reminder that is happening right now (within the last minute)
        const activeReminders = allReminders.filter(reminder => {
          // Convert reminder date strings to Date objects
          const reminderFromDate = new Date(reminder.fromDate);
          const reminderToDate = new Date(reminder.toDate);
          const today = new Date();
          
          // Check if today is within the reminder date range
          const isWithinDateRange = 
            today >= reminderFromDate && 
            today <= reminderToDate;
            
          // Check if the time matches the current time
          return isWithinDateRange && reminder.setTime === currentTimeStr;
        });
        
        if (activeReminders.length > 0) {
          console.log("Active reminder found:", activeReminders[0]);
          setActiveReminder(activeReminders[0]);
          setShow(true);
          
          // Play sound alert
          playNotificationSound();
          
          // Automatically read out the reminder text
          if (activeReminders[0].transcribedText) {
            setTimeout(() => {
              speakReminderText(activeReminders[0].transcribedText, activeReminders[0].title);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error checking active reminders:", error);
      }
    };
    
    const playNotificationSound = () => {
      try {
        const audio = new Audio();
        // Try to use a default system notification sound if available
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPO7tCSLwgZXsn52abhHxFH0PTbjzEFCnTi/cqAKggSktXsvJEdCxF31O/FfigIn+DytncaCRiQ6/nKbh0OHZ3e9a5nHRUkrdD0sF4cHC2yyfizWRsbKLnH/rJOGRpMvMLztkwVG1G8wfO3RBMcXsGx77+FFxx1v6jmxoMQIpvJpN/MeAglq8upzMp2BTbEqsuebRkhntOqspxhGlSx0rmTdFBUccYAAE1hK2O8AABIaT1drwAAQnJJWqMAADV+X0+ZAAAnlmhNlgAAGruBQpgAABC/mThiAABwiJpaZwAAVKKLSXIAADyzmkFsAAAmxKk4ZgAAC86/LFcAAJLTqDdbAAAZ3rows0cAAHXigShkQQAAW+yYHHBCAABC+acSdj4AACYFtglxOgAAChCsEWw3AAAQDqAQcS8AAA==';
        audio.play().catch(err => {
          console.log('Audio play error, trying fallback:', err);
          // Fallback to beep sound if the above doesn't work
          const fallbackAudio = new Audio();
          fallbackAudio.src = 'data:audio/wav;base64,UklGRl9vT19FUlJPUl9XSEVOX1BMQVlJTkdfQVVESU9QbGF5IGF1ZGlvIGluIEhUTUw1';
          fallbackAudio.play().catch(error => console.log('Fallback audio play error:', error));
        });
      } catch (err) {
        console.log('Error playing notification sound:', err);
      }
    };
    
    // Check every 15 seconds for better responsiveness
    const intervalId = setInterval(checkActiveReminders, 15000);
    checkActiveReminders(); // Also check immediately on mount
    
    return () => {
      clearInterval(intervalId);
      // Cancel any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [userId]);
  
  // Function to speak reminder text
  const speakReminderText = (text, title) => {
    if (!('speechSynthesis' in window)) {
      console.log('Text-to-speech not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const reminderIntro = `Your ${title} reminder: `;
    const speech = new SpeechSynthesisUtterance(reminderIntro + text);
    
    // Configure speech parameters
    speech.lang = 'en-US';
    speech.rate = 1; // Normal speed
    speech.pitch = 1; // Normal pitch
    speech.volume = 1; // Full volume
    
    // Add events to track speech status
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    
    // Speak the text
    window.speechSynthesis.speak(speech);
  };
  
  // Get badge color based on reminder type
  const getBadgeColor = (title) => {
    if (!title) return "secondary";
    switch(title) {
      case "Medicine":
        return "danger";
      case "Business":
        return "primary";
      case "Office Meeting":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Handle modal close - stop speaking
  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setShow(false);
  };

  if (!activeReminder) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      className="reminder-popup"
    >
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>
          <i className="fas fa-bell me-2"></i> 
          Reminder Alert!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <div className="mb-3">
          <Badge bg={getBadgeColor(activeReminder.title)} className="fs-5 px-3 py-2">
            {activeReminder.title}
          </Badge>
        </div>
        <h4 className="mb-3">It's time for your scheduled reminder!</h4>
        <p className="fs-5">{activeReminder.transcribedText || "No details provided"}</p>
        <div className="text-muted mt-2">
          Scheduled for: {new Date(activeReminder.fromDate).toLocaleDateString()} at {activeReminder.setTime}
        </div>
        
        {activeReminder.transcribedText && (
          <div className="mt-3">
            <Button
              variant="outline-info"
              onClick={() => speakReminderText(activeReminder.transcribedText, activeReminder.title)}
              disabled={isSpeaking}
              className="me-2"
            >
              <i className="fas fa-volume-up me-2"></i>
              {isSpeaking ? 'Speaking...' : 'Read Aloud'}
            </Button>
            {isSpeaking && (
              <Button 
                variant="outline-danger"
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                size="sm"
              >
                Stop
              </Button>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Dismiss
        </Button>
        <Button variant="primary" onClick={() => {
          handleClose();
          // Add 5 minutes to current time for "snooze" effect
          setTimeout(() => setShow(true), 5 * 60 * 1000);
        }}>
          Remind me in 5 minutes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ActiveReminderPopup;