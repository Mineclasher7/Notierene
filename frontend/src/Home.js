// Home.js
import React, { useState } from 'react';
import Modal from './Modal';
import getRandomQuote from './RandomQuote';

const Home = () => {
    const [openModal, setOpenModal] = useState(false);
    const [quote, setQuote] = useState('');

    const handleOpenModal = () => {
        setQuote(getRandomQuote());
        setOpenModal(true);
    };

    return (
        <div>
            <h1>Notieren</h1>
            <img src="." alt="Notieren" />
            <p>Welcome to the Notieren website. Making notes for superior learning.</p>
            <p>This is a project for making notes actually good.</p>
            <button onClick={handleOpenModal}>Inspirational Quote</button>
            <Modal open={openModal} onClose={() => setOpenModal(false)} text={quote} />
        </div>
    );
};

export default Home;
