import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backend } from './backend';

const NoteHome = () => {
    const navigate = useNavigate();

    useEffect(() => {
        note();
    });

    const note = async () => {
        try {
            const response = await axios.get(`${backend}/api/note`);
            const uid = response.data.uid;
            // Replace 'NotePage' with the actual name of your component
            navigate(`/note/${uid}`);
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
