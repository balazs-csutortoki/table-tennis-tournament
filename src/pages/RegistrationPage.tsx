import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContestantRegistration from '../components/ContestantRegistration';

const RegistrationPage: React.FC = () => {
    const [canStartTournament, setCanStartTournament] = useState(false);

    return (
        <div>
            <h1>Versenyzők Regisztrációja</h1>
            <ContestantRegistration onCanStartTournamentChange={setCanStartTournament} />
            <br />
            <Link to="/tournament">
                <button disabled={!canStartTournament} >Verseny kezdés</button>
            </Link>
        </div>
    );
};

export default RegistrationPage;