'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../../config';
import { useRouter } from 'next/navigation';
import { jwtInterceptor } from '@/utils/axiosConfig';

const CreateRoom = () => {
    const [checkbox1, setCheckbox1] = useState(false);
    const [checkbox2, setCheckbox2] = useState(false);
    const router = useRouter();

    useEffect(() => {
        jwtInterceptor();
    }, []); // Empty dependency array ensures this runs only once

    const handleChange = (checkboxNumber: number) => {
        if (checkboxNumber === 1) {
            setCheckbox1(prev => !prev);
            setCheckbox2(false);
        } else if (checkboxNumber === 2) {
            setCheckbox2(prev => !prev);
            setCheckbox1(false);
        }
    };

    const create = async () => {
        console.log('Checkbox 1:', checkbox1);
        console.log('Checkbox 2:', checkbox2);
        try {
            const response = await axios.post(`${backendURL}/createRoom`, {
                type: checkbox1 ? "team" : "solo"
            });
            if (response.status === 201) {
                console.log('Creation successful');
                const uid = response.data.page_uid;
                router.push(`/note/${uid}`);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
            <h1 className="text-3xl font-bold mb-6 text-white">CREATE</h1>
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <label className="flex items-center mb-4">
                    <input type="checkbox" checked={checkbox1} onChange={() => handleChange(1)} className="form-checkbox h-5 w-5 text-blue-600" />
                    <span className="ml-2 text-gray-700">Team</span>
                </label>
                <label className="flex items-center mb-6">
                    <input type="checkbox" checked={checkbox2} onChange={() => handleChange(2)} className="form-checkbox h-5 w-5 text-blue-600" />
                    <span className="ml-2 text-gray-700">Solo</span>
                </label>
                <button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                    Submit
                </button>
            </div>
        </div>
    );
};

export default CreateRoom;
