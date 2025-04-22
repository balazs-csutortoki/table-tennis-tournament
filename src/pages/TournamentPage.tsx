import React from 'react';
import MatchScheduling from '../components/MatchScheduling';
import Rankings from '../components/Rankings';
import ContestantRegistration from '../components/ContestantRegistration';
import OngoingMatches from '../components/OngoingMatches';

const TournamentPage: React.FC = () => {
    return (
        <div>
            <h1>Verseny Oldal</h1>
            <OngoingMatches />


            <ContestantRegistration />
        </div>
    );
};

export default TournamentPage;