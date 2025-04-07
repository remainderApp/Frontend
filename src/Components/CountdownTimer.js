import React, { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import axios from 'axios';

function CountdownTimer() {
  const [nextReminder, setNextReminder] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});
  const userId = localStorage.getItem("userId");

  // Find the next upcoming reminder
  useEffect(() => {
    const findNextReminder = async () => {
      try {
        if (!userId) return;
        
        const res = await axios.get(`http://localhost:9866/getAllReminders/${userId}`);
        const allReminders = res.data;
        const now = new Date();
        
        console.log("Found reminders:", allReminders.length);
        
        // Filter and sort reminders to find the next one
        const upcomingReminders = allReminders
          .filter(reminder => {
            // Parse the reminder time to create a Date object for comparison
            const [hours, minutes] = reminder.setTime.split(':').map(Number);
            const reminderDate = new Date(reminder.fromDate);
            reminderDate.setHours(hours, minutes, 0, 0);
            
            console.log(`Reminder: ${reminder.title}, Time: ${reminder.setTime}, Date: ${reminderDate}`);
            console.log(`Is future? ${reminderDate > now}`);
            
            // Only include future reminders
            return reminderDate > now;
          })
          .sort((a, b) => {
            // Convert time strings to Date objects for comparison
            const [aHours, aMinutes] = a.setTime.split(':').map(Number);
            const aDate = new Date(a.fromDate);
            aDate.setHours(aHours, aMinutes, 0, 0);
            
            const [bHours, bMinutes] = b.setTime.split(':').map(Number);
            const bDate = new Date(b.fromDate);
            bDate.setHours(bHours, bMinutes, 0, 0);
            
            return aDate - bDate;
          });
        
        console.log("Upcoming reminders:", upcomingReminders.length);
        
        if (upcomingReminders.length > 0) {
          console.log("Next reminder:", upcomingReminders[0]);
          setNextReminder(upcomingReminders[0]);
        } else {
          setNextReminder(null);
        }
      } catch (error) {
        console.error("Error finding next reminder:", error);
      }
    };
    
    findNextReminder();
    
    // Update whenever a new reminder is added
    const handleReminderAdded = () => {
      findNextReminder();
    };
    
    window.addEventListener('reminderAdded', handleReminderAdded);
    
    // Update every 30 seconds for better responsiveness
    const intervalId = setInterval(findNextReminder, 30000);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('reminderAdded', handleReminderAdded);
    };
  }, [userId]);
  
  // Calculate and update the time remaining
  useEffect(() => {
    if (!nextReminder) {
      setTimeRemaining({});
      return;
    }
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [hours, minutes] = nextReminder.setTime.split(':').map(Number);
      const targetDate = new Date(nextReminder.fromDate);
      targetDate.setHours(hours, minutes, 0, 0);
      
      const difference = targetDate - now;
      
      if (difference <= 0) {
        // Time has passed
        return {};
      }
      
      // Calculate remaining days, hours, minutes, seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return {
        days,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds
      };
    };
    
    const timeInterval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    setTimeRemaining(calculateTimeRemaining());
    
    return () => clearInterval(timeInterval);
  }, [nextReminder]);
  
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
  
  if (!nextReminder) {
    return (
      <Card className="shadow-sm bg-light mb-4">
        <Card.Body className="text-center py-3">
          <p className="mb-0">No upcoming reminders scheduled.</p>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="shadow countdown-timer mb-4 border-start border-4 border-info">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          <span>Next Reminder</span>
          <Badge bg={getBadgeColor(nextReminder.title)} pill>
            {nextReminder.title}
          </Badge>
        </Card.Title>
        <div className="countdown-display text-center my-3">
          {timeRemaining.days > 0 && (
            <span className="countdown-unit">
              <span className="countdown-value">{timeRemaining.days}</span>
              <span className="countdown-label">days</span>
            </span>
          )}
          <span className="countdown-unit">
            <span className="countdown-value">{String(timeRemaining.hours || 0).padStart(2, '0')}</span>
            <span className="countdown-label">hrs</span>
          </span>
          <span className="countdown-unit">
            <span className="countdown-value">{String(timeRemaining.minutes || 0).padStart(2, '0')}</span>
            <span className="countdown-label">min</span>
          </span>
          <span className="countdown-unit">
            <span className="countdown-value">{String(timeRemaining.seconds || 0).padStart(2, '0')}</span>
            <span className="countdown-label">sec</span>
          </span>
        </div>
        <Card.Text className="text-center">
          <small className="text-muted">
            Scheduled for {new Date(nextReminder.fromDate).toLocaleDateString()} at {nextReminder.setTime}
          </small>
        </Card.Text>
        <Card.Text className="text-center">
          {nextReminder.transcribedText || "No details provided"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default CountdownTimer;