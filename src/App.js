import logo from './logo.svg';
import './App.css';
import Login from './Components/Login';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './Components/Home';
import NotificationHistory from './Components/NotificationHistory';
import React from 'react';

function App() {
  React.useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>}></Route>
        <Route path='/home' element={<Home/>}></Route>
        <Route path='/notifications' element={<NotificationHistory/>}></Route>
      </Routes>
      </BrowserRouter>
     
    </div>
  );
}

export default App;
