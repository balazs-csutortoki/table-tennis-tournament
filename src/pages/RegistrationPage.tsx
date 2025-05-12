import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContestantRegistration from '../components/ContestantRegistration';
import './RegistrationPage.css';
import { useTranslation } from 'react-i18next';

const RegistrationPage: React.FC = () => {
    const [canStartTournament, setCanStartTournament] = useState(false);
    const { t } = useTranslation();

    const handleStartTournament = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the page
    };

    return (
        <div>

            <ContestantRegistration onCanStartTournamentChange={setCanStartTournament} />
            <br />
            <Link to="/tournament">
                <button className={`start-tournament-button ${!canStartTournament ? 'disabled' : ''}`} disabled={!canStartTournament} onClick={handleStartTournament} >{t('register.startTournament')}</button>
            </Link>
        </div>
    );
};

export default RegistrationPage;