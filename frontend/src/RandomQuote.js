// RandomQuote.js
import React from 'react';

const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not how high you have climbed, but how you make a positive difference to the world. - Roy T. Bennett",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "Success is not in what you have, but who you are. - Bo Bennett",
    "The purpose of our lives is to be happy. - Dalai Lama"
];

const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
};

export default getRandomQuote;
