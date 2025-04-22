import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContestantRegistration from '../components/ContestantRegistration';
import './RegistrationPage.css';

const RegistrationPage: React.FC = () => {
    const [canStartTournament, setCanStartTournament] = useState(false);

    const handleStartTournament = (assignMatches: () => void) => {
        assignMatches(); // Trigger match assignment
    };

    return (
        <div>
            <h1>Registration Page</h1>
            <ContestantRegistration onCanStartTournamentChange={setCanStartTournament} />
            <br />
            <Link to="/tournament">
                <button className={`start-tournament-button ${!canStartTournament ? 'disabled' : ''}`} disabled={!canStartTournament} >Verseny kezdés</button>
            </Link>
        </div>
    );
};

export default RegistrationPage;