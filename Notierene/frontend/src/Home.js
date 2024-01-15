import React, {useState} from 'react';
import Modal from './Modal.js'

const Home = () => {
    const [openModal, setOpenModal] = useState(false)
    return (
        <div>
            <h1>Notieren</h1>
            <img src="."/>
            <p>Welcome to the Notieren website. Making notes for superior learning.</p>
            <button onClick={() => setOpenModal(true)} >Modal</button>
            <Modal open={openModal} onClose={() => setOpenModal(false)} />
        </div>
    );
};

export default Home;