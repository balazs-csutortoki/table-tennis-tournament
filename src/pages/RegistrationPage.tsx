import React from 'react';
import { Link } from 'react-router-dom';
import ContestantRegistration from '../components/ContestantRegistration';

const RegistrationPage: React.FC = () => {
    return (
        <div>
            <h1>Versenyzők Regisztrációja</h1>
            <ContestantRegistration />
            <br />
            <Link to="/tournament">
                <button>Verseny kezdés</button>
            </Link>
        </div>
    );
};

export default RegistrationPage;