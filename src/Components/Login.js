import { useState } from "react";
import { Form, Button, Container, Card, FormLabel,Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import AnalogClock from "./AnalogClock";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  let navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(""); // Message state for feedback

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message

    try {
      const res = await axios.post("http://localhost:9866/signup", formData);
      setMessage(res.data.message); // Success message
      setFormData({ name: "", email: "", password: "" }); // Clear form
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
    }
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
  
    try {
      const res = await axios.post("http://localhost:9866/login", { email, password });
  
      // Store user _id in localStorage
      localStorage.setItem("userId", res.data.user._id);
  
      alert("Login successful!"); // Alert on success
      navigate("/home"); // Redirect to home
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };
  

  return (
    <div>
        <AnalogClock/>
    <Container className="d-flex justify-content-center align-items-center vh-100 position-relative" style={{ background: "#f8f9fa" }}>
      {[...Array(12)].map((_, index) => {
        const top = Math.random() * 90 + "vh";
        const left = Math.random() * 90 + "vw";
        const size = Math.random() * 50 + 20 + "px";
        const shapes = ["rounded-circle", "rounded-rectangle", "rounded-square"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const colors = ["bg-primary", "bg-info", "bg-warning", "bg-danger"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div
            key={index}
            className={`position-absolute ${color} ${shape} opacity-25`}
            style={{ top, left, width: size, height: size }}
          ></div>
        );
      })}
     <Card className="p-4 shadow-lg text-center" style={{ zIndex: 1, background: "#ffffffcc", width: "300px" }}>
  <h2 style={{ fontFamily: "serif" }} >
    <img style={{ width: "50px", height: "7vh" }} src='./Images/logo.png' alt="Logo" />
    Login
  </h2> <hr/>
  <Form onSubmit={handleSubmitLogin}>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label style={{ fontFamily: "serif", fontWeight: "bold" }}>Email</Form.Label>
        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label style={{ fontFamily: "serif", fontWeight: "bold" }}>Password</Form.Label>
        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      </Form.Group>

      {error && <p className="text-danger small">{error}</p>}

      <Button style={{ fontWeight: "bold" }} variant="success" type="submit" className="w-100">
        Login
      </Button>
    </Form>
  <p className="mt-3">
    Don't have an account? <Button variant="link" onClick={() => setShowSignup(true)}>Sign Up</Button>
  </p>
</Card>

      <Modal scrollable show={showSignup} onHide={() => setShowSignup(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontFamily:"serif"}}><img style={{ width: "50px", height: "7vh" }} src='./Images/logo.png'></img>Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "whitesmoke",
        padding: "20px",
        border: "1px solid black",
        borderRadius: "20px",
        textAlign: "center",
      }}
    >
      <h3>Sign Up</h3>
      {message && <p style={{ color: message.includes("success") ? "green" : "red" }}>{message}</p>}

      <Form.Group className="mb-3" controlId="signupName">
        <Form.Label style={{ fontFamily: "serif", fontWeight: "bold" }}>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="signupEmail">
        <Form.Label style={{ fontFamily: "serif", fontWeight: "bold" }}>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="signupPassword">
        <Form.Label style={{ fontFamily: "serif", fontWeight: "bold" }}>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Button style={{ fontWeight: "bold" }} variant="warning" type="submit" className="w-50">
        Sign Up
      </Button>
    </Form>
        </Modal.Body>
      </Modal>
    </Container>

    </div>
  )
}

export default Login