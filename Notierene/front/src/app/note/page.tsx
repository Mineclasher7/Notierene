'use client';

import React, { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { backendURL } from '../../../config';
import { jwtInterceptor } from '@/utils/axiosConfig';

const NoteHome = () => {
    const router = useRouter();

    useEffect(() => {
        jwtInterceptor();  // Set up the JWT interceptor
        note();
    }, []); // The empty dependency array ensures this runs once when the component mounts

    const note = async () => {
        try {
            const response = await axios.get(`${backendURL}/api/note`);
            const uid = response.data.uid;
            // Replace 'NotePage' with the actual name of your component
            router.push(`/note/${uid}`);
        } catch (error) {
            console.log('Error encountered:', error);
        }
    };

    return (
        <div>
            {/* Your HTML template goes here */}
        </div>
    );
};

export default NoteHome;
