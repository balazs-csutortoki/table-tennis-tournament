import React, { useState, useEffect } from 'react';
import './OngoingMatches.css'; // Add styles for the component
import Modal from './Modal'; // Assume a reusable Modal component exists
import { useSettingsContext } from '../context/SettingsContext';

export interface Match {
    id: string;
    player1: string; // Contestant ID
    player2: string; // Contestant ID
    category: string;
    tableNumber?: number;
    winner?: string;
}

interface Contestant {
    id: string;
    name: string;
}

const OngoingMatches: React.FC = () => {
    const { tableCount, contestants, setContestants } = useSettingsContext();
    const [scheduledMatches, setScheduledMatches] = useState<Match[]>(() =>
        JSON.parse(localStorage.getItem('scheduledMatches') || '[]')
    );
    const [ongoingMatches, setOngoingMatches] = useState<Match[]>(() =>
        JSON.parse(localStorage.getItem('ongoingMatches') || '[]')
    );
    const [finishedMatches, setFinishedMatches] = useState<Match[]>(() =>
        JSON.parse(localStorage.getItem('finishedMatches') || '[]')
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        localStorage.setItem('scheduledMatches', JSON.stringify(scheduledMatches));
        localStorage.setItem('ongoingMatches', JSON.stringify(ongoingMatches));
        localStorage.setItem('finishedMatches', JSON.stringify(finishedMatches));
    }, [scheduledMatches, ongoingMatches, finishedMatches]);

    const getContestantName = (id: string) => {
        const contestant = contestants.find((c) => c.id === id);
        return contestant ? contestant.name : 'Unknown';
    };

    const assignMatchesToFreeTables = () => {
        // Fetch the latest ongoingMatches from localStorage
        const latestOngoingMatches = JSON.parse(localStorage.getItem('ongoingMatches') || '[]');

        const ongoingContestants = new Set(
            latestOngoingMatches.flatMap((match: Match) => [match.player1, match.player2])
        );

        const finishedMatchIds = new Set(finishedMatches.map((match) => match.id));

        const freeTables = Array.from({ length: tableCount }, (_, i) => i + 1).filter(
            (tableNumber) => !latestOngoingMatches.some((match: Match) => match.tableNumber === tableNumber)
        );

        let matchesToAssign = scheduledMatches.filter(
            (match) =>
                !ongoingContestants.has(match.player1) &&
                !ongoingContestants.has(match.player2) &&
                !finishedMatchIds.has(match.id) // Exclude matches already finished
        ).slice(0, freeTables.length);

        // Remove matches that use the same contestants, only keep the first one
        matchesToAssign = matchesToAssign.filter((match, index, self) => {
            const player1Used = self.slice(0, index).some((m) => m.player1 === match.player1 || m.player2 === match.player1);
            const player2Used = self.slice(0, index).some((m) => m.player1 === match.player2 || m.player2 === match.player2);
            return !player1Used && !player2Used;
        });

        const newOngoingMatches = matchesToAssign.map((match, index) => ({
            ...match,
            tableNumber: freeTables[index],
        }));

        // Update state and localStorage
        const updatedOngoingMatches = [...latestOngoingMatches, ...newOngoingMatches];
        setOngoingMatches(updatedOngoingMatches);
        localStorage.setItem('ongoingMatches', JSON.stringify(updatedOngoingMatches));
        //remove the new match from the scheduled matches
        //setScheduledMatches(scheduledMatches.filter((match) => !matchesToAssign.includes(match)));
    };

    const finishMatch = (tableNumber: number, winner: string) => {
        const match = ongoingMatches.find((m) => m.tableNumber === tableNumber);
        if (match) {
            // Update ongoingMatches state
            const updatedOngoingMatches = ongoingMatches.filter((m) => m.tableNumber !== tableNumber);
            setOngoingMatches(updatedOngoingMatches);

            // Update localStorage for ongoingMatches
            localStorage.setItem('ongoingMatches', JSON.stringify(updatedOngoingMatches));

            // Add the match to finishedMatches state
            const updatedFinishedMatches = [...finishedMatches, { ...match, winner }];
            setFinishedMatches(updatedFinishedMatches);

            // Update localStorage for finishedMatches
            localStorage.setItem('finishedMatches', JSON.stringify(updatedFinishedMatches));

            //Add 1 to the point of the winner contestant
            const updatedContestants = contestants.map((contestant) =>
                contestant.id === winner
                    ? { ...contestant, points: (contestant.points || 0) + 1 }
                    : contestant
            );
            // Update contestants state
            setContestants(updatedContestants);

            // Reassign matches to free tables
            assignMatchesToFreeTables();
        }
    };

    const openChangeMatchModal = (tableNumber: number) => {
        setSelectedTable(tableNumber);
        setIsModalOpen(true);
    };

    const changeMatch = (newMatch: Match) => {
        if (selectedTable !== null) {
            //the currently ongoing match will be added to the scheduled matches
            const currentMatch = ongoingMatches.find((match) => match.tableNumber === selectedTable);
            if (currentMatch) {
                setScheduledMatches((prev) => [...prev, currentMatch]);
            }


            setOngoingMatches((prev) =>
                prev.map((match) =>
                    match.tableNumber === selectedTable
                        ? { ...newMatch, tableNumber: selectedTable }
                        : match
                )
            );


            setScheduledMatches((prev) => prev.filter((match) => match.id !== newMatch.id));

            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        assignMatchesToFreeTables(); // Automatically assign matches when the component is loaded
    }, []);

    return (
        <div className="ongoing-matches">
            <h2>Ongoing Matches</h2>
            <div className="tables">
                {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNumber) => {
                    const match = ongoingMatches.find((m) => m.tableNumber === tableNumber);
                    return (
                        <div key={tableNumber} className="table">
                            <h3>Table {tableNumber}</h3>
                            {match ? (
                                <div>
                                    <p>
                                        {getContestantName(match.player1)} vs {getContestantName(match.player2)} ({match.category})
                                    </p>
                                    <div className="winner-buttons">
                                        <button
                                            onClick={() => finishMatch(tableNumber, match.player1)}
                                        >
                                            {getContestantName(match.player1)} Wins
                                        </button>
                                        <button
                                            onClick={() => finishMatch(tableNumber, match.player2)}
                                        >
                                            {getContestantName(match.player2)} Wins
                                        </button>
                                    </div>
                                    <button
                                        className="change-match-button"
                                        onClick={() => openChangeMatchModal(tableNumber)}
                                    >
                                        Change Match
                                    </button>
                                </div>
                            ) : scheduledMatches.length > 0 ? (
                                <p>No match available</p>
                            ) : (
                                <p>No match available</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h3>Select a New Match</h3>
                    <input
                        type="text"
                        placeholder="Search for a contestant"
                        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                        className="search-input"
                    />
                    <ul>
                        {scheduledMatches
                            .filter((match) =>
                                getContestantName(match.player1).toLowerCase().includes(searchQuery) ||
                                getContestantName(match.player2).toLowerCase().includes(searchQuery)
                            )
                            .map((match) => (
                                <li key={match.id}>
                                    {getContestantName(match.player1)} vs {getContestantName(match.player2)} ({match.category})
                                    <button onClick={() => changeMatch(match)}>Select</button>
                                </li>
                            ))}
                    </ul>
                </Modal>
            )}

            <h2>Finished Matches ({finishedMatches.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Player 1</th>
                        <th>Player 2</th>
                        <th>Category</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    {finishedMatches.map((match) => (
                        <tr key={match.id}>
                            <td>{getContestantName(match.player1)}</td>
                            <td>{getContestantName(match.player2)}</td>
                            <td>{match.category}</td>
                            <td>{getContestantName(match.winner || '')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OngoingMatches;