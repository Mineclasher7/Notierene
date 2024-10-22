'use client'
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backendURL } from '../../config';
import { redirect } from 'next/navigation';
const SignUpForm = () => {
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

    const signUp = async (e: any) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendURL}/signup`, {
                email: email,
                username: username,
                password: password
            });
            if (response.status === 201) {
                await sessionStorage.setItem('jwtToken', response.data.token);
                redirect('/create');
            }
        } catch (error) {
            console.log('Error creating account' )
        }
    };

    const hasErrors = (emailError !== '' && email !== '') || (passwordError !== '' && password !== '');

    return (
        <div className="flex justify-center items-center h-screen">
        <form onSubmit={signUp} className="space-y-4">
            <div>
                <label className="block">Email: </label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} onInput={validateEmail} onBlur={validateEmail} className="border rounded px-3 py-2 w-full text-black" />
                {emailError && email !== '' && <div className="text-red-500">{emailError}</div>}
            </div>
            <div>
                <label className="block">Username: </label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="border rounded px-3 py-2 w-full text-black" />
            </div>
            <div>
                <label className="block">Password: </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onInput={validatePassword} onBlur={validatePassword} className="border rounded px-3 py-2 w-full text-black" />
                {passwordError && password !== '' && <div className="text-red-500">{passwordError}</div>}
            </div>
            <div>
                <button type="submit" disabled={hasErrors || email === '' || password === '' || username === ''} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Sign Up
                </button>
            </div>
        </form>
    </div>
    );
};

export default SignUpForm;