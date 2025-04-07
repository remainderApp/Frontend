import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnalogClock from './AnalogClock';

function TopNav() {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  // get user Details by Id
  const getUserDetails = async () => {
    const response = await fetch(`http://localhost:9866/user/${userId}`);
    const data = await response.json();
    setUser(data);
  };

  // Get upcoming notifications count
  const checkNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:9866/getAllReminders/${userId}`);
      const allReminders = res.data;
      
      // Find reminders coming up today and in the future
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const upcoming = allReminders.filter(reminder => {
        const reminderDate = new Date(reminder.fromDate);
        return reminderDate >= today;
      });
      
      setNotificationCount(upcoming.length);
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  useEffect(() => {
    getUserDetails();
    checkNotifications();
    
    // Refresh notification count every minute
    const intervalId = setInterval(checkNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [userId]);

  return (
    <div>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/home">
            <img style={{width:"100px",height:"10vh"}} src='./Images/logo.png' alt="Logo" />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Button 
              variant="outline-info" 
              className="me-3 position-relative"
              onClick={() => navigate('/notifications')}
            >
              Notifications
              {notificationCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            <Navbar.Text>
              Signed in as: <a href="#login">{user.name}</a>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default TopNav;