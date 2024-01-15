import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
    const [jwtToken, setJwtToken] = useState(sessionStorage.getItem('jwtToken'));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setJwtToken(sessionStorage.getItem('jwtToken'));
        }, 1000); // Check every second

        return () => clearInterval(intervalId); // Clean up on unmount
    }, []);

    return (
        <nav className="navbar">
            <Link className="navbar-brand" to="/">Notieren</Link>
            <div>
                <ul className="navbar-nav">
                    {!jwtToken && (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/signup">Sign Up</Link>
                            </li>
                        </>
                    )}
                    {jwtToken && (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/create">Create</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/signout">Sign Out</Link>
                            </li>
                        </>
                    )}
                    <li className="nav-item">
                        <Link className="nav-link" to="#">Link 1</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link disabled" to="#">Disabled</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
