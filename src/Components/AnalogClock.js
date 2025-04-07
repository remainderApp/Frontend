import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import "./Home.css"; // Custom styles

function AnalogClock() {
    const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get hour, minute, and second angles
  const seconds = time.getSeconds() * 6;
  const minutes = time.getMinutes() * 6 + seconds / 60;
  const hours = ((time.getHours() % 12) / 12) * 360 + minutes / 12;
  return (
    <div className="clock-container">
    <svg viewBox="0 0 100 100" className="clock">
      <circle cx="50" cy="50" r="45" className="clock-face" />
      <line x1="50" y1="50" x2="50" y2="20" className="hand hour-hand" style={{ transform: `rotate(${hours}deg)`, transformOrigin: "50% 50%" }} />
      <line x1="50" y1="50" x2="50" y2="15" className="hand minute-hand" style={{ transform: `rotate(${minutes}deg)`, transformOrigin: "50% 50%" }} />
      <line x1="50" y1="50" x2="50" y2="10" className="hand second-hand" style={{ transform: `rotate(${seconds}deg)`, transformOrigin: "50% 50%" }} />
      <circle cx="50" cy="50" r="2" className="clock-center" />
    </svg>
  </div>
  )
}

export default AnalogClock