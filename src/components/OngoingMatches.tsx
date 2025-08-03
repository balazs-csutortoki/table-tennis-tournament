import React, { useState, useEffect } from 'react';
import './OngoingMatches.css'; // Add styles for the component
import Modal from './Modal'; // Assume a reusable Modal component exists
import { useSettingsContext } from '../context/SettingsContext';
import { Contestant, Match } from '../types';
import { useTranslation } from 'react-i18next';

const OngoingMatches: React.FC = () => {
    const { t } = useTranslation();
    const { tableCount, contestants, setContestants } = useSettingsContext();
    const [selectedFinishedMatch, setSelectedFinishedMatch] = useState<Match | null>(null);
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
    const [isFinishedMatchesTableCollapsed, setIsFinishedMatchesTableCollapsed] = useState(true); // State to toggle table visibility
    const toggleFinishedMatchesTable = () => {
        setIsFinishedMatchesTableCollapsed(!isFinishedMatchesTableCollapsed);
    };

    useEffect(() => {
        // localStorage.setItem('scheduledMatches', JSON.stringify(scheduledMatches));
        localStorage.setItem('ongoingMatches', JSON.stringify(ongoingMatches));
        localStorage.setItem('finishedMatches', JSON.stringify(finishedMatches));
    }, [/*scheduledMatches, */ongoingMatches, finishedMatches]);

    const getContestantName = (id: string) => {
        const contestant = contestants.find((c) => c.id === id);
        return contestant ? contestant.name : t('tournament.unknownContestant');
    };

    const assignMatchesToFreeTables = () => {
        // Fetch the latest ongoingMatches from localStorage
        const latestOngoingMatches = JSON.parse(localStorage.getItem('ongoingMatches') || '[]');
        const scheduledMatchesFromStorage = JSON.parse(localStorage.getItem('scheduledMatches') || '[]');
        const finishedMatchesFromStorage = JSON.parse(localStorage.getItem('finishedMatches') || '[]');
        const ongoingContestants = new Set(
            latestOngoingMatches.flatMap((match: Match) => [match.player1, match.player2])
        );

        const finishedMatchIds = new Set(finishedMatchesFromStorage.map((match: Match) => match.id));

        const freeTables = Array.from({ length: tableCount }, (_, i) => i + 1).filter(
            (tableNumber) => !latestOngoingMatches.some((match: Match) => match.tableNumber === tableNumber)
        );

        // filter the scheduled matches that have contestant with deleted or paused status
        const filteredScheduledMatches = scheduledMatchesFromStorage.filter((match: Match) => {
            const player1 = contestants.find((contestant) => contestant.id === match.player1);
            const player2 = contestants.find((contestant) => contestant.id === match.player2);
            return player1 && !player1.deleted && !player1.paused && player2 && !player2.deleted && !player2.paused;
        }
        );

        // filtered matches will be sorted by the sum of finished matches of the contestants
        filteredScheduledMatches.sort((a: Match, b: Match) => { 
           /* const player1A = contestants.find((contestant) => contestant.id === a.player1);
            const player2A = contestants.find((contestant) => contestant.id === a.player2);
            const player1B = contestants.find((contestant) => contestant.id === b.player1);
            const player2B = contestants.find((contestant) => contestant.id === b.player2);
            */
            const finishedMatchesA = finishedMatchesFromStorage.filter(
                (match: Match) =>
                    match.player1 === a.player1 || match.player2 === a.player1 ||
                    match.player1 === a.player2 || match.player2 === a.player2
            ).length;

            const finishedMatchesB = finishedMatchesFromStorage.filter(
                (match: Match) =>
                    match.player1 === b.player1 || match.player2 === b.player1 ||
                    match.player1 === b.player2 || match.player2 === b.player2
            ).length;

            return finishedMatchesA - finishedMatchesB;
        });

        let matchesToAssign = filteredScheduledMatches.filter(
            (match: Match) =>
                !ongoingContestants.has(match.player1) &&
                !ongoingContestants.has(match.player2) &&
                !finishedMatchIds.has(match.id) // Exclude matches already finished
        ).slice(0, freeTables.length);

        // Remove matches that use the same contestants, only keep the first one
        matchesToAssign = matchesToAssign.filter((match: Match, index: number, self: Match[]) => {
            const player1Used = self.slice(0, index).some((m) => m.player1 === match.player1 || m.player2 === match.player1);
            const player2Used = self.slice(0, index).some((m) => m.player1 === match.player2 || m.player2 === match.player2);
            return !player1Used && !player2Used;
        });

        const newOngoingMatches = matchesToAssign.map((match: Match, index: number) => ({
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
        const recentcontestants: Contestant[] = JSON.parse(localStorage.getItem('contestants') || '[]');

        const match = ongoingMatches.find((m) => m.tableNumber === tableNumber);
        let invalidMatch = false;
        // check if match contains contestant that no longer exists
        if (match) {
            const player1 = recentcontestants.find((contestant) => contestant.id === match.player1);
            const player2 = recentcontestants.find((contestant) => contestant.id === match.player2);
            if (!player1 || !player2) {
                invalidMatch = true;
            }
        }


        if (match) {
            // Update ongoingMatches state
            const updatedOngoingMatches = ongoingMatches.filter((m) => m.tableNumber !== tableNumber);
            setOngoingMatches(updatedOngoingMatches);

            // Update localStorage for ongoingMatches
            localStorage.setItem('ongoingMatches', JSON.stringify(updatedOngoingMatches));

            // Add the match to finishedMatches state
            if (invalidMatch) {
                assignMatchesToFreeTables();
                return;
            }


            const updatedFinishedMatches = [...finishedMatches, { ...match, winner }];
            setFinishedMatches(updatedFinishedMatches);
            localStorage.setItem('finishedMatches', JSON.stringify(updatedFinishedMatches));
            //Add 1 to the point of the winner contestant
            const updatedContestants = recentcontestants.map((contestant) =>
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
        //clear search query
        setSearchQuery('');
        setSelectedTable(tableNumber);
        setSelectedFinishedMatch(null);
        setIsModalOpen(true);
    };

    const changeMatch = (newMatch: Match) => {
        if (selectedTable !== null) {
            //the currently ongoing match will be added to the scheduled matches
            const currentMatch = ongoingMatches.find((match) => match.tableNumber === selectedTable);
            //only add to the scheduled matches if the match is not already in the scheduled matches
            const currentMatchAlreadyScheduled = scheduledMatches.find((match) => match.id === currentMatch?.id);
            if (currentMatch && !currentMatchAlreadyScheduled) {
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

    const changeWinner = (matchId: string, newWinnerId: string) => {
        const match = finishedMatches.find((m) => m.id === matchId);
        if (!match) return;

        const oldWinnerId = match.winner;

        // Update the match with the new winner
        const updatedFinishedMatches = finishedMatches.map((m) =>
            m.id === matchId ? { ...m, winner: newWinnerId } : m
        );
        setFinishedMatches(updatedFinishedMatches);
        localStorage.setItem('finishedMatches', JSON.stringify(updatedFinishedMatches));

        // Update points for the old and new winners
        if (oldWinnerId !== newWinnerId) {
            const updatedContestants = contestants.map((contestant) => {

                if (contestant.id === oldWinnerId) {
                    return { ...contestant, points: (contestant.points || 0) - 1 };
                }
                if (contestant.id === newWinnerId) {
                    return { ...contestant, points: (contestant.points || 0) + 1 };
                }
                return contestant;
            });

            setContestants(updatedContestants);
            localStorage.setItem('contestants', JSON.stringify(updatedContestants));
        }
    };

    useEffect(() => {
        assignMatchesToFreeTables(); // Automatically assign matches when the component is loaded
    }, []);

    return (
        <div className="ongoing-matches">
            <h2>{t('tournament.ongoingMatchesTitle')}</h2>
            <div className="tables">
                {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNumber) => {
                    const match = ongoingMatches.find((m) => m.tableNumber === tableNumber);
                    return (
                        <div key={tableNumber} className="table">
                            <h1>{tableNumber}. {t('tournament.table')}</h1>
                            {match ? (
                                <div>
                                    <p className="match-info">
                                        {getContestantName(match.player1)} vs {getContestantName(match.player2)} ({match.category})
                                    </p>
                                    <div className="winner-buttons">
                                        <button
                                            onClick={() => finishMatch(tableNumber, match.player1)}
                                        >
                                            {getContestantName(match.player1)} {/*t('tournament.winner')*/}
                                        </button>
                                        <button
                                            onClick={() => finishMatch(tableNumber, match.player2)}
                                        >
                                            {getContestantName(match.player2)} {/*t('tournament.winner')*/}
                                        </button>
                                    </div>
                                    <button
                                        className="change-match-button"
                                        onClick={() => openChangeMatchModal(tableNumber)}
                                    >
                                        {t('tournament.changeMatch')}
                                    </button>
                                </div>
                            ) : scheduledMatches.length > 0 ? (
                                <p>{t('tournament.noMatch')}</p>
                            ) : (
                                <p>{t('tournament.noMatch')}</p>
                            )}
                        </div>
                    );
                })}
            </div>



            {isModalOpen && selectedTable && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h3>{t('tournament.newMatchSelection')}</h3>
                    <input
                        type="text"
                        placeholder={t('tournament.searchPlaceholder')}
                        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                        className="search-input"
                    />
                    <div className="scrollable-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('tournament.player')} 1</th>
                                    <th>{t('tournament.player')} 2</th>
                                    <th>{t('tournament.categoryColumn')}</th>
                                    <th>{t('register.contestantActions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduledMatches
                                    .filter((match) => {
                                        // Exclude matches with contestants in ongoing matches

                                        const finishedMatchesformatchchange = JSON.parse(localStorage.getItem('finishedMatches') || '[]');
                                        const ongoingMatchesformatchchange = JSON.parse(localStorage.getItem('ongoingMatches') || '[]');
                                        // current ongoing match on the table
                                        const currentOngoingMatch: Match = ongoingMatchesformatchchange.find((m: Match) => m.tableNumber === selectedTable);
                                        // filter out the current ongoing match
                                        const filteredOngoingMatches = ongoingMatchesformatchchange.filter((m: Match) => m.tableNumber !== selectedTable);
                                        const allMatches = [...finishedMatchesformatchchange, ...ongoingMatchesformatchchange];
                                        //match is not in allmatches
                                        const isMatchInAllMatches: boolean = allMatches.some((m: Match) => m.id === match.id);

                                        const ongoingContestants = new Set(
                                            filteredOngoingMatches.flatMap((ongoingMatch: Match) => [ongoingMatch.player1, ongoingMatch.player2])
                                        );


                                        const isPlayer1InOngoing = ongoingContestants.has(match.player1);
                                        const isPlayer2InOngoing = ongoingContestants.has(match.player2);

                                        return (
                                            match.id !== currentOngoingMatch?.id &&
                                            !isMatchInAllMatches &&
                                            !isPlayer1InOngoing &&
                                            !isPlayer2InOngoing && (
                                                getContestantName(match.player1).toLowerCase().includes(searchQuery) ||
                                                getContestantName(match.player2).toLowerCase().includes(searchQuery))
                                        );
                                    })
                                    .map((match) => (
                                        <tr key={match.id}>
                                            <td>{getContestantName(match.player1)}</td>
                                            <td>{getContestantName(match.player2)}</td>
                                            <td>{match.category}</td>
                                            <td>
                                                <button
                                                    className="select-match-button"
                                                    onClick={() => changeMatch(match)}
                                                >
                                                    {t('tournament.select')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}

            {isModalOpen && selectedFinishedMatch && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <h3>{t('tournament.changeWinner')}</h3>
                    <p className="match-info">
                        {getContestantName(selectedFinishedMatch.player1)} vs {getContestantName(selectedFinishedMatch.player2)} ({selectedFinishedMatch.category})
                    </p>
                    <div className="winner-buttons">
                        <button
                            className="winner-button"
                            onClick={() => {
                                changeWinner(selectedFinishedMatch.id, selectedFinishedMatch.player1);
                                setIsModalOpen(false);
                            }}
                        >
                            {getContestantName(selectedFinishedMatch.player1)} {t('tournament.winner')}
                        </button>
                        <button
                            className="winner-button"
                            onClick={() => {
                                changeWinner(selectedFinishedMatch.id, selectedFinishedMatch.player2);
                                setIsModalOpen(false);
                            }}
                        >
                            {getContestantName(selectedFinishedMatch.player2)} {t('tournament.winner')}
                        </button>
                    </div>
                </Modal>
            )}

            <h3 className="match-list-title" onClick={toggleFinishedMatchesTable}>
                {t('tournament.finishedMatchesTitle')} ({finishedMatches.length})
                <button className="toggle-button">
                    {isFinishedMatchesTableCollapsed ? 'v' : '<'}
                </button>
            </h3>
            {isFinishedMatchesTableCollapsed && (
                <table>
                    <thead>
                        <tr>
                            <th>{t('tournament.player')} 1</th>
                            <th>{t('tournament.player')} 2</th>
                            <th>{t('tournament.categoryColumn')}</th>
                            <th>{t('tournament.tableColumn')}</th>
                            <th>{t('tournament.winnerColumn')}</th>
                            <th>{t('register.contestantActions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finishedMatches.map((match) => (
                            <tr key={match.id}>
                                <td>{getContestantName(match.player1)}</td>
                                <td>{getContestantName(match.player2)}</td>
                                <td>{match.category}</td>
                                <td>{match.tableNumber}</td>
                                <td>{getContestantName(match.winner || '')}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setSelectedFinishedMatch(match);
                                            setSelectedTable(0);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        {t('tournament.change')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OngoingMatches;