import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        signOut();
    });

    const signOut = async () => {
        try {
            sessionStorage.removeItem('jwtToken');
            // Redirect to the home page or any other desired page
            navigate('/');
        } catch (error) {
            // Handle any errors that occur during the sign-out process
            console.log('Error:', error.response ? error.response.data : error);
        }
    };

    return <div></div>;
};

export default SignOut;
