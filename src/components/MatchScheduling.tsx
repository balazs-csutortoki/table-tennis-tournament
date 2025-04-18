import React, { useState } from 'react';
import { Match, Contestant } from '../types';

const MatchScheduling: React.FC = () => {
    const [ongoingMatches, setOngoingMatches] = useState<Match[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
    const [winners, setWinners] = useState<{ [matchId: string]: Contestant | null }>({});

    const handleWinnerSelection = (matchId: string, contestant: Contestant) => {
        setWinners(prevWinners => ({
            ...prevWinners,
            [matchId]: contestant,
        }));
    };

    return (
        <div>
            <h2>Folyamatban lévő mérkőzések</h2>
            <ul>
                {ongoingMatches.map(match => (
                    <li key={match.id}>
                        {match.contestants.map(contestant => (
                            <span key={contestant.id}>{contestant.name} </span>
                        ))}
                        <select onChange={(e) => handleWinnerSelection(match.id, match.contestants.find(c => c.id === e.target.value)!)}>
                            <option value="">Válassz győztest</option>
                            {match.contestants.map((contestant: { id: React.Key | readonly string[]; name: string; }) => (
                                <option key={String(contestant.id)} value={String(contestant.id)}>{contestant.name}</option>
                            ))}
                        </select>
                    </li>
                ))}
            </ul>

            <h2>Következő mérkőzések</h2>
            <ul>
                {upcomingMatches.map(match => (
                    <li key={match.id}>
                        {match.contestants.map(contestant => (
                            <span key={contestant.id}>{contestant.name} </span>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MatchScheduling;