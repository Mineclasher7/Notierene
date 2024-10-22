import React from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  text?: string;
  imageSrc?: string;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, text, imageSrc }) => {
  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center z-50">
      <div className="bg-opacity-50 fixed top-0 right-0 bottom-0 left-0 bg-black"></div>
      <div className="max-w-screen-sm w-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-black">
        <div onClick={(e) => { e.stopPropagation(); }}>
          {text && <p>{text}</p>}
          {imageSrc && <img src={imageSrc} alt="Modal Image" className="max-w-full h-auto" />}
        </div>
      </div>
    </div>
  );
};

export default Modal;
