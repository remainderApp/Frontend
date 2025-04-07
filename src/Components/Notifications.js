import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(true);
  const [speaking, setSpeaking] = useState({});
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Check for upcoming reminders every minute
  useEffect(() => {
    const checkUpcomingReminders = async () => {
      try {
        const res = await axios.get(`http://localhost:9866/getAllReminders/${userId}`);
        const allReminders = res.data;
        
        // Find reminders coming up in the next 15 minutes
        const now = new Date();
        const upcoming = allReminders.filter(reminder => {
          const reminderTime = reminder.setTime.split(':');
          const reminderDate = new Date();
          reminderDate.setHours(parseInt(reminderTime[0]));
          reminderDate.setMinutes(parseInt(reminderTime[1]));
          
          // Check if reminder is within the next 15 minutes
          const timeDiff = (reminderDate.getTime() - now.getTime()) / (1000 * 60);
          return timeDiff > 0 && timeDiff <= 15; // Within next 15 minutes
        });
        
        if (upcoming.length > 0) {
          setNotifications(upcoming);
          setShow(true);
          
          // Initialize speaking state for each notification
          const speakingState = {};
          upcoming.forEach(notification => {
            speakingState[notification._id] = false;
          });
          setSpeaking(speakingState);
          
          // Request permission for browser notifications
          if (Notification.permission !== "granted") {
            Notification.requestPermission();
          }
          
          // Show browser notification
          if (Notification.permission === "granted") {
            upcoming.forEach(reminder => {
              new Notification(`Reminder: ${reminder.title}`, {
                body: reminder.transcribedText || "Your scheduled reminder is coming up soon!",
                icon: './Images/logo.png'
              });
            });
          }
        }
      } catch (error) {
        console.error("Error checking reminders:", error);
      }
    };
    
    // Check immediately on component mount
    checkUpcomingReminders();
    
    // Set interval to check every minute
    const intervalId = setInterval(checkUpcomingReminders, 60000);
    
    return () => {
      clearInterval(intervalId);
      // Cancel any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [userId]);
  
  // Get badge color based on reminder type
  const getBadgeColor = (title) => {
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
  
  // Function to speak reminder text
  const speakNotificationText = (text, id, title) => {
    if (!('speechSynthesis' in window)) {
      console.log('Text-to-speech not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Update speaking state
    setSpeaking(prev => ({ ...prev, [id]: true }));
    
    // Create speech utterance
    const reminderIntro = `Upcoming ${title} reminder: `;
    const speech = new SpeechSynthesisUtterance(reminderIntro + text);
    
    // Configure speech parameters
    speech.lang = 'en-US';
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    
    // Handle speech events
    speech.onend = () => setSpeaking(prev => ({ ...prev, [id]: false }));
    speech.onerror = () => setSpeaking(prev => ({ ...prev, [id]: false }));
    
    // Speak the text
    window.speechSynthesis.speak(speech);
  };
  
  // Stop speaking
  const stopSpeaking = (id) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(prev => ({ ...prev, [id]: false }));
    }
  };
  
  return (
    <ToastContainer position="top-end" className="p-3">
      {notifications.map((notification, index) => (
        <Toast 
          key={index} 
          onClose={() => setShow(false)} 
          show={show} 
          delay={10000} 
          autohide
          bg="light"
          className="border-start border-4 border-info"
        >
          <Toast.Header>
            <img src="./Images/logo.png" className="rounded me-2" style={{ width: '20px' }} alt="" />
            <strong className="me-auto">
              <Badge bg={getBadgeColor(notification.title)}>{notification.title}</Badge>
            </strong>
            <small>{notification.setTime}</small>
          </Toast.Header>
          <Toast.Body>
            <p>{notification.transcribedText || "Reminder coming up soon!"}</p>
            <div className="d-flex gap-2">
              {notification.transcribedText && (
                speaking[notification._id] ? (
                  <Button 
                    size="sm" 
                    variant="outline-danger"
                    onClick={() => stopSpeaking(notification._id)}
                  >
                    <i className="fas fa-stop me-1"></i> Stop
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline-secondary"
                    onClick={() => speakNotificationText(
                      notification.transcribedText, 
                      notification._id,
                      notification.title
                    )}
                  >
                    <i className="fas fa-volume-up me-1"></i> Listen
                  </Button>
                )
              )}
              <Button 
                size="sm" 
                variant="outline-info"
                onClick={() => navigate('/notifications')}
              >
                View All
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}

export default Notifications;