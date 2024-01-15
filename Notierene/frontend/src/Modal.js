import React from 'react';

const Modal = ({open, onClose}) => {
    if (!open) return null;
    return (
        <div onClick={onClose} className='overlay'>
            <div onClick={(e) => {e.stopPropagation()}} className='modalContainer'>
                <div>
                <p>what is goody</p>
                </div>
            </div>
        </div>
    );
}



export default Modal;