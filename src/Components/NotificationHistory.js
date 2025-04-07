import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Row, Col, Card } from 'react-bootstrap';
import TopNav from './TopNav';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NotificationHistory() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await axios.get(`https://backend-isbt.onrender.com/getAllReminders/${userId}`);
        setReminders(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reminders:", error);
        setLoading(false);
      }
    };
    
    fetchReminders();
  }, [userId]);

  // Replace the existing reminder filtering code with this:

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  console.log("Today starts at:", todayStart);
  console.log("Tomorrow starts at:", tomorrowStart);

  // For debugging
  if (reminders.length > 0) {
    console.log("Sample reminder date:", new Date(reminders[0].fromDate));
  }

  const upcomingReminders = reminders.filter(reminder => {
    const reminderFromDate = new Date(reminder.fromDate);
    return reminderFromDate >= tomorrowStart;
  });

  const todayReminders = reminders.filter(reminder => {
    const reminderFromDate = new Date(reminder.fromDate);
    return reminderFromDate >= todayStart && reminderFromDate < tomorrowStart;
  });

  const pastReminders = reminders.filter(reminder => {
    const reminderToDate = new Date(reminder.toDate);
    return reminderToDate < todayStart;
  });

  console.log(`Found: ${upcomingReminders.length} upcoming, ${todayReminders.length} today, ${pastReminders.length} past`);

  const renderReminderTable = (reminderList, title, variant) => (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5" className={`bg-${variant} text-white`}>
        {title} <Badge bg="light" text="dark">{reminderList.length}</Badge>
      </Card.Header>
      <Card.Body>
        {reminderList.length > 0 ? (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Time</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {reminderList.map((reminder, index) => (
                <tr key={index}>
                  <td><Badge bg={getReminderBadgeColor(reminder.title)}>{reminder.title}</Badge></td>
                  <td>{reminder.setTime}</td>
                  <td>{new Date(reminder.fromDate).toLocaleDateString()}</td>
                  <td>{reminder.transcribedText || "No details"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center my-3">No {title.toLowerCase()} reminders</p>
        )}
      </Card.Body>
    </Card>
  );

  const getReminderBadgeColor = (title) => {
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

  return (
    <div className="notification-history">
      <TopNav />
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center mb-4">Reminder History</h1>
            <Button variant="secondary" onClick={() => navigate("/home")} className="mb-3">
              ← Back to Home
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center my-5">Loading reminder history...</div>
        ) : (
          <>
            {renderReminderTable(todayReminders, "Today's Reminders", "success")}
            {renderReminderTable(upcomingReminders, "Upcoming Reminders", "info")}
            {renderReminderTable(pastReminders, "Past Reminders", "secondary")}
          </>
        )}
      </Container>
    </div>
  );
}

export default NotificationHistory;
