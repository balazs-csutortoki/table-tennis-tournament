import React from 'react';
import './ConfirmationModal.css'; // Import the CSS file for styling

interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
                <p className="confirmation-modal-message">{message}</p>
                <div className="confirmation-modal-buttons">
                    <button className="confirmation-modal-button confirm-button" onClick={onConfirm}>
                        Igen
                    </button>
                    <button className="confirmation-modal-button cancel-button" onClick={onCancel}>
                        Mégse
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;