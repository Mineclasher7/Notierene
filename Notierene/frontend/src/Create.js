import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backend } from './backend';

const CreateRoom = () => {
    const [checkbox1, setCheckbox1] = useState(false);
    const [checkbox2, setCheckbox2] = useState(false);
    const navigate = useNavigate();

    const handleChange = (checkboxNumber) => {
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
            const response = await axios.post(`${backend}/createRoom`, {
                type: "solo"
            });
            if (response.status === 201) {
                console.log('Creation successful');
                const uid = response.data.page_uid;
                // Replace 'NotePage' with the actual name of your component
                navigate(`/note/${uid}`);
            }
        } catch (error) {
            console.log('Error:', error.response ? error.response.data : error);
        }
    };

    return (
        <div>
            <h1>CREATE</h1>
            <div>
                <label>
                    <input type="checkbox" checked={checkbox1} onChange={() => handleChange(1)} />
                    Team
                </label>
                <label>
                    <input type="checkbox" checked={checkbox2} onChange={() => handleChange(2)} />
                    Solo
                </label>
                <button onClick={create}>Submit</button>
            </div>
        </div>
    );
};

export default CreateRoom;
