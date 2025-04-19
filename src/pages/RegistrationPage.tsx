import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContestantRegistration from '../components/ContestantRegistration';
import './RegistrationPage.css';

const RegistrationPage: React.FC = () => {
    const [canStartTournament, setCanStartTournament] = useState(false);

    return (
        <div>
            <ContestantRegistration onCanStartTournamentChange={setCanStartTournament} />
            <br />
            <Link to="/tournament">
                <button className={`start-tournament-button ${!canStartTournament ? 'disabled' : ''}`} disabled={!canStartTournament} >Verseny kezdés</button>
            </Link>
        </div>
    );
};

export default RegistrationPage;