'use client'
import { useState } from 'react';
import axios from 'axios';
import { backendURL } from '../../config';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const router = useRouter();

    const validateEmail = () => {
        let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        setEmailError(emailRegex.test(email) ? '' : 'Please enter a valid email address!');
    };

    const validatePassword = () => {
        setPasswordError(password.length >= 8 ? '' : 'Password should be at least 8 characters long!');
    };

    const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent form submission

        try {
            const response = await axios.post(`${backendURL}/signin`, {
                email: email,
                password: password
            });
            
            if (response.status === 200) {
                sessionStorage.setItem('jwtToken', response.data.token);
                const sessionData = { email: email, token: response.data.token };
                router.push('/note'); // Redirect to the /note page
            }
        } catch (error) {
            console.log('Error: password failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={signIn} className="space-y-4">
                <div>
                    <label className="block">Email: </label>
                    <input id="email" type="email" name="email" required onChange={(e) => setEmail(e.target.value.trim())} onBlur={validateEmail} className="border rounded px-3 py-2 w-full text-black" />
                    {emailError && email !== '' && <div className="text-red-500">{emailError}</div>}
                </div>
                <div>
                    <label className="block">Password: </label>
                    <input id='password' type="password" name="password" value={password} required onChange={(e) => setPassword(e.target.value.trim())} onBlur={validatePassword} className="border rounded px-3 py-2 w-full text-black" />
                    {passwordError && password !== '' && <div className="text-red-500">{passwordError}</div>}
                </div>
                <div>
                    <button type="submit" disabled={emailError !== '' || passwordError !== '' || email === '' || password === ''} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">Sign In</button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
