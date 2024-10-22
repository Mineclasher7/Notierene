'use client';

import React, { useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../../../config';
import { useRouter } from 'next/navigation';

const SignOut = () => {
    const router = useRouter();
    useEffect(() => {
        signOut();
    }, []);

    const signOut = async () => {
        try {     
            sessionStorage.removeItem('jwtToken');
            router.push('/');
        } catch (error) {
            // Handle any errors that occur during the sign-out process
            console.log('Error signing out', error);
        }
    };

    return <div>Signed Out</div>;
};

export default SignOut;
