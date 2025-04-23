import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContestantRegistration from '../components/ContestantRegistration';
import './RegistrationPage.css';
import { useTranslation } from 'react-i18next';

const RegistrationPage: React.FC = () => {
    const [canStartTournament, setCanStartTournament] = useState(false);
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('register.pageTitle')}</h1>
            <ContestantRegistration onCanStartTournamentChange={setCanStartTournament} />
            <br />
            <Link to="/tournament">
                <button className={`start-tournament-button ${!canStartTournament ? 'disabled' : ''}`} disabled={!canStartTournament} >{t('register.startTournament')}</button>
            </Link>
        </div>
    );
};

export default RegistrationPage;