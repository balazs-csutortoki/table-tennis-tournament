import React from 'react';
import ContestantRegistration from '../components/ContestantRegistration';
import OngoingMatches from '../components/OngoingMatches';

const TournamentPage: React.FC = () => {
    return (
        <div>
            <OngoingMatches />
            <ContestantRegistration />
        </div>
    );
};

export default TournamentPage;