import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar.js';
import Home from './Home.js';
import SignUp from './SignUp.js';
import Login from './Login.js';
import SignOut from './SignOut.js';
import CreateRoom from './Create.js';
import Note from './Note.js';
import NoteHome from './NoteHome.js';
import NotFound from './NotFound.js';
import './App.css';

function jwtInterceptor() {
    axios.interceptors.request.use((config) => {
        const jwtToken = sessionStorage.getItem('jwtToken');
        if (jwtToken) {
            config.headers.Authorization = `Bearer ${jwtToken}`;
        }
        return config;
    });
}

const Router =
    process.env.NODE_ENV === 'production' || process.env.ELECTRON_ENV === 'renderer'
        ? HashRouter
        : BrowserRouter;

function App() {
    jwtInterceptor();
    return (
        <div className="App">
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signout" element={<SignOut />} />
                    <Route path="/create" element={<CreateRoom />} />
                    <Route path="/note/:UUID" element={<Note />} />
                    <Route path="/note" element={<NoteHome />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
