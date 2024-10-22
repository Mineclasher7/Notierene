import React from 'react';

const Modal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ zIndex:  9999, position: 'fixed', top:  0, right:  0, bottom:  0, left:  0, backgroundColor: 'rgba(0,  0,  0,  0.5)' }}>
      <div onClick={(e) => { e.stopPropagation(); }} style={{ maxWidth: '600px', width: '100%', position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', boxShadow: '0px  0px  18px rgba(0,0,0,  0.75)' }}>
        <div>
          <p>What is Goody?</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
