import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backend } from './backend';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const hasErrors = emailError !== '' || passwordError !== '';

    const validateEmail = useCallback(() => {
        let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        setEmailError(emailRegex.test(email) ? '' : 'Please enter a valid email address!');
    }, [email]);

    const validatePassword = useCallback(() => {
        setPasswordError(password.length >= 8 ? '' : 'Password should be at least 8 characters long!');
    }, [password]);

    useEffect(() => {
        validateEmail();
        validatePassword();
    }, [validateEmail, validatePassword]);

    const navigate = useNavigate()
    
    const signIn = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${backend}/signin`, {
                email: email,
                password: password
            });
            if (response.status === 200) {
                await sessionStorage.setItem('jwtToken', response.data.token);
                navigate('/note'); // Redirect to the /note page
            }
        } catch (error) {
            console.log('Error:', error.response ? error.response.data : error);
        }
    };

    return (
        <div>
            <form onSubmit={signIn}>
                <div>
                    <label>Email: </label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value.trim())} onBlur={validateEmail} />
                    {emailError && email !== '' && <div className="error">{emailError}</div>}
                </div>
                <div>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value.trim())} onBlur={validatePassword} />
                    {passwordError && password !== '' && <div className="error">{passwordError}</div>}
                </div>
                <div className="button">
                    <button className="submit" type="submit" disabled={hasErrors || email === '' || password === ''}>Sign In</button>
                </div>
            </form>
        </div>
    );
};

export default Login;
