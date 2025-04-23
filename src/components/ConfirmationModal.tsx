import React from 'react';
import './ConfirmationModal.css'; // Import the CSS file for styling
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    const { t } = useTranslation();
    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
                <p className="confirmation-modal-message">{message}</p>
                <div className="confirmation-modal-buttons">
                    <button className="confirmation-modal-button confirm-button" onClick={onConfirm}>
                        {t('register.yes')}
                    </button>
                    <button className="confirmation-modal-button cancel-button" onClick={onCancel}>
                        {t('register.yes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;