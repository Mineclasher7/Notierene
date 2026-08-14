import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backend } from './backend';
import { useNavigate } from 'react-router-dom';
const SignUp = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = useCallback(() => {
        // Validate email field
        let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        setEmailError(emailRegex.test(email) ? '' : 'Please enter a valid email address!');
    }, [email]);

    const validatePassword = useCallback(() => {
        // Validate password field
        setPasswordError(password.length >= 8 ? '' : 'Password should be at least 8 characters long!');
    }, [password]);

    useEffect(() => {
        validateEmail();
        validatePassword();
    }, [validateEmail, validatePassword]);

    const navigate = useNavigate();

    const signUp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backend}/signup`, {
                email: email,
                username: username,
                password: password
            });
            if (response.status === 201) {
                await sessionStorage.setItem('jwtToken', response.data.token);
                navigate('/create');
            }
        } catch (error) {
            console.log('Error:', error.response ? error.response.data : error); // Access the specific error response from the server
        }
    };

    const hasErrors = (emailError !== '' && email !== '') || (passwordError !== '' && password !== '');

    return (
        <div>
            <form onSubmit={signUp}>
                <div>
                    <label>Email: </label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} onInput={validateEmail} onBlur={validateEmail} />
                    {emailError && email !== '' && <div className="error">{emailError}</div>}
                </div>
                <div>
                    <label>Username: </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onInput={validatePassword} onBlur={validatePassword} />
                    {passwordError && password !== '' && <div className="error">{passwordError}</div>}
                </div>
                <div className="button">
                    <button className="submit" type="submit" disabled={hasErrors || email === '' || password === '' || username === ''}>
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;