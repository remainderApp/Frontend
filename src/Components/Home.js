import React, { useRef, useState,useEffect } from 'react'
import TopNav from './TopNav'
import Card from 'react-bootstrap/Card';
import { Button, Carousel, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './Home.css'; // Import the CSS file
import AnalogClock from './AnalogClock';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import axios from 'axios';
import Notifications from './Notifications';
import CountdownTimer from './CountdownTimer';
import ActiveReminderPopup from './ActiveReminderPopup';

function Home() {
    const [showSetRemainder,setShowSetRemainder] = useState(false);
    const [showAllRemainders,setShowAllRemainders] = useState(false);
    const [showMenu,setShowMenu] = useState(false);
    const [selectedIcon,setSelectedIcon] = useState("");
    const [title, setTitle] = useState("");
    const [alaramtime,setAlaramTime] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState(""); // Store transcribed text
  const recognitionRef = useRef(null); // Store recognition instance
  const userId = localStorage.getItem("userId");
  const [userRemainders,setUserRemainders]= useState([]);
  const [remainderData,setRemainderData]= useState({
    title:selectedIcon,
    setTime: alaramtime,
    fromDate,
    toDate,
    transcribedText,
    userId:userId
  })
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRemainderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const reminderData = {
        title: selectedIcon, // Ensure title is set correctly
        setTime: remainderData.setTime,
        fromDate: remainderData.fromDate,
        toDate: remainderData.toDate,
        transcribedText: remainderData.transcribedText,
        userId:userId
      };
  
      const response = await fetch('https://backend-isbt.onrender.com/addRemainder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Reminder set successfully!');
        setRemainderData({
          title: selectedIcon, // Retain selected icon
          setTime: "",
          fromDate: "",
          toDate: "",
          transcribedText: "",
          
        });
        
        // Force refresh of components by triggering state change
        setShowSetRemainder(false);
        
        // Trigger a refresh of the reminder list
        const event = new CustomEvent('reminderAdded');
        window.dispatchEvent(event);
        
        // Close the modal
        setTimeout(() => {
          window.location.reload(); // This is a quick solution to refresh all components
        }, 500);
      } else {
        alert('Error: ' + (data.error || 'Failed to set reminder.'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };
  


 // 🎙️ Start/Stop Recording
 const toggleRecording = () => {
  if (recording) {
    stopRecording();
  } else {
    startRecording();
  }
};

const startRecording = () => {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Speech Recognition is not supported in this browser. Please use Google Chrome.");
    return;
  }

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new window.SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    setRemainderData((prevData) => ({ ...prevData, transcribedText: text }));
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopRecording();
  };

  recognition.onend = () => {
    setRecording(false);
  };

  recognitionRef.current = recognition;
  recognition.start();
  setRecording(true);
};

const stopRecording = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    setRecording(false);
  }
};

// 🔊 Text-to-Speech
const playText = () => {
  if (!remainderData.transcribedText) return;

  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(remainderData.transcribedText);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 0.5;
  window.speechSynthesis.speak(speech);
};

// Get User Remaiinders
const getUserRemainders = async()=>{
  try {
     let res = await axios.get(`https://backend-isbt.onrender.com/getRemainder/${userId}/${selectedIcon}`);
     let data = res.data;
     setUserRemainders(data);
  } catch (error) {
    console.log(error);
  }
}
    
  return (
    <div>
      <Notifications />
      <ActiveReminderPopup />
      {/* Background Shapes */}
      <div className="background-shapes">
        {[...Array(15)].map((_, index) => (
          <div key={index} className={`shape shape-${index % 3}`} />
        ))}
      </div>
        <TopNav/>
        <Container className="mt-4">
        <CountdownTimer />
      </Container>
    
       <center>
       <Row className="mt-4 w-50" style={{fontWeight:"bold"}}>
       <Col >
         <img onClick={()=>{setShowMenu(true);setSelectedIcon("Medicine")}} onMouseOut={(e) => {
  e.target.style.boxShadow = "0px 0px 0px ";


}} onMouseMove={(e) => {
  e.target.style.boxShadow = "10px 10px 10px lightgray";
 
}} style={{width:"150px",margin:"10px"}} src='./Images/Medicine.avif'></img>
        </Col> 
        <Col>
        <img onClick={()=>{setShowMenu(true);setSelectedIcon("Business")}} onMouseOut={(e) => {
  e.target.style.boxShadow = "0px 0px 0px ";


}} onMouseMove={(e) => {
  e.target.style.boxShadow = "10px 10px 10px lightgray";
 
}} style={{width:"150px",margin:"10px"}}  src='./Images/Business.avif'></img>

        </Col> <Col>
        <img onClick={()=>{setShowMenu(true);setSelectedIcon("Office Meeting")}} onMouseOut={(e) => {
  e.target.style.boxShadow = "0px 0px 0px ";


}} onMouseMove={(e) => {
  e.target.style.boxShadow = "10px 10px 10px lightgray";
 
}} style={{width:"150px",margin:"10px"}}  src='./Images/meeting.jpg'></img>
        </Col>
       
       
      </Row>
       </center>
      
       <Carousel className="carousel-container" indicators={true} controls={true} fade interval={3000}>
      <Carousel.Item>
        <img className="d-block w-100"  src="./Images/meeting.webp" alt="First slide" />
        {/* <Carousel.Caption style={{color:"black",fontWeight:"bold"}}>
          <h3>Slide One</h3>
          <p>Beautiful, smooth, and automatic sliding carousel.</p>
        </Carousel.Caption> */}
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src="./Images/ban2.jpg" alt="Second slide" />
        {/* <Carousel.Caption>
          <h3>Slide Two</h3>
          <p>Bootstrap-based responsive carousel with auto-slide.</p>
        </Carousel.Caption> */}
      </Carousel.Item>

      <Carousel.Item>
        <img className="d-block w-100" src="./Images/ban3.jpg" alt="Third slide" />
        {/* <Carousel.Caption>
          <h3>Slide Three</h3>
          <p>Perfect for showcasing features or promotions.</p>
        </Carousel.Caption> */}
      </Carousel.Item>
    </Carousel>


       {/* Set Remainder Modal */}
       <Modal scrollable size='md' show={showSetRemainder} onHide={()=>{setShowSetRemainder(false)}}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontWeight:"bold"}}><img style={{ width: "50px", height: "7vh" }} src='./Images/logo.png'></img>Set Remainder for {selectedIcon}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <AnalogClock/>
            <Form
      style={{ backgroundColor: "whitesmoke", padding: "20px", borderRadius: "20px" }}
      onSubmit={handleSubmit}
    >
      <Form.Group className="mb-3">
        <Form.Label style={{ fontWeight: "bold" }}>Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={selectedIcon}
          placeholder="Enter reminder title"
          readOnly
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ fontWeight: "bold" }}>Set Time</Form.Label>
        <Form.Control
          type="time"
          name="setTime"
          value={remainderData.setTime}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ fontWeight: "bold" }}>From Date</Form.Label>
        <Form.Control
          type="date"
          name="fromDate"
          value={remainderData.fromDate}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ fontWeight: "bold" }}>To Date</Form.Label>
        <Form.Control
          type="date"
          name="toDate"
          value={remainderData.toDate}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label style={{ fontWeight: "bold" }}>Speak to Convert to Text</Form.Label>
        <div>
          <Button style={{ fontWeight: "bold", marginRight: "10px" }} variant={recording ? "danger" : "warning"} onClick={toggleRecording}>
            {recording ? <FiberManualRecordIcon /> : <KeyboardVoiceIcon />}
          </Button>
          <Button style={{ fontWeight: "bold" }} variant="secondary" onClick={playText}>
            <PlayArrowIcon />
          </Button>
        </div>
        <Form.Group className="mt-3">
          <Form.Label style={{ fontWeight: "bold" }}>Transcribed Text</Form.Label>
          <Form.Control
            as="textarea"
            name="transcribedText"
            value={remainderData.transcribedText}
            onChange={handleChange}
            placeholder="Your spoken words will appear here..."
            rows={3}
          />
        </Form.Group>
      </Form.Group>

      <Button style={{ fontWeight: "bold" }} variant="success" type="submit" className="w-100">
        Set Reminder
      </Button>
    </Form>
     
        </Modal.Body>
        <Modal.Footer>
          <Button style={{fontWeight:"bold"}} variant="danger" onClick={()=>{setShowSetRemainder(false)}}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* All Remainders Modal */}
      <Modal scrollable size='lg' show={showAllRemainders} onHide={()=>{setShowAllRemainders(false)}}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontWeight:"bold"}}><img style={{ width: "50px", height: "7vh" }} src='./Images/logo.png'></img>{selectedIcon} Remainders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <Table  style={{textAlign:"center"}} bordered hover responsive >
            <thead>
                <tr>
                    <th style={{fontWeight:"bold"}}>Title</th>
                    <th  style={{fontWeight:"bold"}}>Time</th>
                    <th  style={{fontWeight:"bold"}}>From Date</th>
                    <th  style={{fontWeight:"bold"}}>To Date</th>
                    <th  style={{fontWeight:"bold"}}>Audio</th>
                    <th  style={{fontWeight:"bold"}}>Action</th>
                </tr>
            </thead>
            <tbody>
  {
    userRemainders.map((item, index) => {
      return (
        <tr key={index}>
          <td style={{fontWeight:"bold"}}>{item.title}</td>
          <td>{new Date(`1970-01-01T${item.setTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
          <td>{new Date(item.fromDate).toLocaleDateString()}</td>
          <td>{new Date(item.toDate).toLocaleDateString()}</td>
          <td>{item.transcribedText}</td>
          <td>
            <Button 
              variant="link" 
              onClick={() => {
                // Function to speak the reminder text
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const speech = new SpeechSynthesisUtterance(item.transcribedText);
                  speech.lang = "en-US";
                  window.speechSynthesis.speak(speech);
                }
              }}
              disabled={!item.transcribedText}
              title={item.transcribedText ? "Read aloud" : "No text to read"}
              className="p-0 me-2"
            >
              <i className="fas fa-volume-up"></i>
            </Button>
            <VisibilityIcon/>
          </td>
        </tr>
      )
    })
  }
</tbody>
           </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{fontWeight:"bold"}} variant="danger" onClick={()=>{setShowAllRemainders(false)}}>
            Close
          </Button>
         
        </Modal.Footer>
      </Modal>

      <Modal show={showMenu} onHide={()=>{setShowMenu(false);setSelectedIcon("")}}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontWeight:"bold",fontFamily:"sans-serif"}}>{selectedIcon} Menu</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontWeight:"bold"}}>
        <Col>
          <Card onClick={()=>{
             setShowSetRemainder(true);
          }} onMouseOut={(e) => {
  e.target.style.boxShadow = "0px 0px 0px ";


}} onMouseMove={(e) => {
  e.target.style.boxShadow = "10px 10px 10px lightgray";
 
}}style={{margin:"10px",backgroundColor:"lightpink"}}>
            <Card.Body>Set Remainder</Card.Body>
          </Card>
        </Col>
        <Col>
          <Card onClick={()=>{
            setShowAllRemainders(true);
            getUserRemainders();
          }} onMouseOut={(e) => {
  e.target.style.boxShadow = "0px 0px 0px ";


}} onMouseMove={(e) => {
  e.target.style.boxShadow = "10px 10px 10px lightgray";
}}style={{margin:"10px",backgroundColor:"lightgreen"}}>
            <Card.Body>{selectedIcon} Remainders</Card.Body>
          </Card>
        </Col>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{fontWeight:"bold"}} variant="danger" onClick={()=>{setShowMenu(false);setSelectedIcon("")}}>
            Close
          </Button>
          
        </Modal.Footer>
      </Modal>



     
    </div>
  )
}

export default Home
