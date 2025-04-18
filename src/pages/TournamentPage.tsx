import React from 'react';
import ContestantRegistration from '../components/ContestantRegistration';
import MatchScheduling from '../components/MatchScheduling';
import Rankings from '../components/Rankings';

const TournamentPage: React.FC = () => {
    return (
        <div>
            <h1>Verseny Oldal</h1>
            <MatchScheduling />
            <Rankings />
            <ContestantRegistration />
        </div>
    );
};

export default TournamentPage;