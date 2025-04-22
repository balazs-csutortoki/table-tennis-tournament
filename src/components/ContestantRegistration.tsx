import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { generateGUID } from '../utils'; // Import the GUID generator
import './ContestantRegistration.css'; // Import the CSS file
import ConfirmationModal from './ConfirmationModal';
import { Contestant } from '../types';
import Modal from './Modal';
import { Match } from './OngoingMatches';

const noOp = () => {
    // No operation function
};

interface ContestantRegistrationProps {
    onCanStartTournamentChange?: (canStart: boolean) => void;
}

const ContestantRegistration: React.FC<ContestantRegistrationProps> = ({ onCanStartTournamentChange }) => {
    const { categories, contestants, setContestants, matches, setMatches } = useSettingsContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<() => void>(noOp);
    const [modalMessage, setModalMessage] = useState('');
    const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
    const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);
    // List of random first names
    const randomNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank'];

    // State for contestant name and category
    const [contestantName, setContestantName] = useState(
        `${randomNames[Math.floor(Math.random() * randomNames.length)]} ${Math.floor(Math.random() * 90 + 10)}`
    );
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null); // Use GUID for editing
    const [scheduledMatches, setScheduledMatches] = useState<Match[]>(() =>
        JSON.parse(localStorage.getItem('scheduledMatches') || '[]')
    );
    const [finishedMatches, setFinishedMatches] = useState<Match[]>(() =>
        JSON.parse(localStorage.getItem('finishedMatches') || '[]')
    );
    // Function to shuffle an array
    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Function to schedule matches
    const scheduleMatches = () => {
        // Step 1: Map existing match IDs to contestant pairs
        const matchIdMap = new Map<string, { player1: string; player2: string }>();
        matches.forEach((match) => {
            matchIdMap.set(match.id, { player1: match.player1, player2: match.player2 });
        });

        // Step 2: Generate new matches
        const newMatches: typeof matches = [];

        // Group contestants by distinct and non-distinct categories
        const distinctCategories = categories.filter((cat) => cat.isDistinct);
        const nonDistinctContestants = contestants.filter((c) =>
            categories.some((cat) => cat.name === c.category && !cat.isDistinct)
        );

        // Helper function to generate matches for a group of contestants
        const generateMatches = (group: typeof contestants, categoryName: string) => {
            const groupMatches: typeof matches = [];
            const totalContestants = group.length;

            // Add a dummy contestant if the number of contestants is odd
            if (totalContestants % 2 !== 0) {
                group.push({ id: 'dummy', name: 'Dummy', category: categoryName, points: 0 });
            }

            // Create a round-robin schedule
            for (let i = 0; i < group.length - 1; i++) {
                const round: typeof matches = [];
                for (let j = 0; j < group.length / 2; j++) {
                    const player1 = group[j];
                    const player2 = group[group.length - 1 - j];
                    if (player1 && player2 && player1.id !== 'dummy' && player2.id !== 'dummy') {
                        if (player1.category !== player2.category) {
                            categoryName = 'Mixed Categories';
                        } else {
                            categoryName = player1.category;
                        }
                        round.push({
                            id: '', // Placeholder for ID, will be reassigned later
                            player1: player1.id,
                            player2: player2.id,
                            category: categoryName,
                        });
                    }
                }
                // Rotate the contestants for the next round (except the first one)
                const last = group.pop();
                if (last) group.splice(1, 0, last);
                groupMatches.push(...round);
            }

            return groupMatches;
        };

        // Generate matches for distinct categories
        const distinctMatches: typeof matches = [];
        distinctCategories.forEach((category) => {
            const categoryContestants = contestants.filter((c) => c.category === category.name);
            distinctMatches.push(...generateMatches([...categoryContestants], category.name));
        });

        // Generate matches for non-distinct categories
        const nonDistinctMatches: typeof matches = [];
        if (nonDistinctContestants.length > 1) {
            nonDistinctMatches.push(...generateMatches([...nonDistinctContestants], 'Mixed Categories'));
        }

        // Combine distinct and non-distinct matches
        const mergedMatches = [...distinctMatches, ...nonDistinctMatches];

        // Step 3: Reassign original match IDs
        const updatedMatches = mergedMatches.map((match) => {
            // Check if the pair exists in the original match ID map
            const existingMatchId = Array.from(matchIdMap.entries()).find(
                ([, pair]) =>
                    (pair.player1 === match.player1 && pair.player2 === match.player2) ||
                    (pair.player1 === match.player2 && pair.player2 === match.player1)
            )?.[0];

            return {
                ...match,
                id: existingMatchId || generateGUID(), // Reuse the existing ID or generate a new one
            };
        });

        // Step 4: Update state and local storage
        setMatches(updatedMatches);
        localStorage.setItem('scheduledMatches', JSON.stringify(updatedMatches));
    };

    const openContestantModal = (contestantId: string) => {
        //fetch finished matches from local storage and update the state
        const finishedMatchesFromStorage = JSON.parse(localStorage.getItem('finishedMatches') || '[]');
        setFinishedMatches(finishedMatchesFromStorage);
        const scheduledMatchesFromStorage = JSON.parse(localStorage.getItem('scheduledMatches') || '[]');
        setScheduledMatches(scheduledMatchesFromStorage);
        const contestant = contestants.find((c) => c.id === contestantId);
        if (contestant) {
            setSelectedContestant(contestant);
            setIsContestantModalOpen(true);
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (contestantName && category) {
            const isDuplicate = contestants.some(
                (contestant) =>
                    contestant.name.toLowerCase() === contestantName.toLowerCase() &&
                    contestant.id !== editingId // Exclude the currently edited contestant
            );

            if (isDuplicate) {
                alert('Ez a név már regisztrálva van!');
                return;
            }

            if (editingId !== null) {
                // Update the contestant with the matching ID
                const updatedContestants = contestants.map((contestant) =>
                    contestant.id === editingId
                        ? { ...contestant, name: contestantName, category }
                        : contestant
                );
                setContestants(updatedContestants);
                setEditingId(null);
            } else {
                // Add a new contestant with a GUID
                setContestants([...contestants, { id: generateGUID(), name: contestantName, category, points: 0 }]);
            }

            // Reset the form with a new random name, but keep the last selected category
            setContestantName(`${randomNames[Math.floor(Math.random() * randomNames.length)]} ${Math.floor(Math.random() * 90 + 10)}`);
        }
    };

    const handleEdit = (id: string) => {
        const contestantToEdit = contestants.find((contestant) => contestant.id === id);
        if (contestantToEdit) {
            setEditingId(id);
            setContestantName(contestantToEdit.name);
            setCategory(contestantToEdit.category);
        }
    };

    const handleDeleteConfirm = (id: string) => {
        setModalMessage('Biztosan törölni szeretné ezt a versenyzőt?');
        setModalAction(() => () => {
            setContestants(contestants.filter((contestant) => contestant.id !== id));
            setIsModalOpen(false);
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const updatedContestants = contestants.filter((contestant) => contestant.id !== id);
        setContestants(updatedContestants);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setContestantName(`${randomNames[Math.floor(Math.random() * randomNames.length)]} ${Math.floor(Math.random() * 90 + 10)}`);
    };

    const getContestantName = (id: string): string => {
        const contestant = contestants.find((c) => c.id === id);
        return contestant ? contestant.name : 'Unknown';
    };

    const groupedContestants = contestants.reduce((groups: Record<string, typeof contestants>, contestant) => {
        if (!groups[contestant.category]) {
            groups[contestant.category] = [];
        }
        groups[contestant.category].push(contestant);
        return groups;
    }, {});

    const canStartTournament = () => {
        let hasValidCategory = false;

        // Combine all contestants from non-distinct categories into one group
        const nonDistinctContestants = contestants.filter((c) =>
            categories.some((cat) => cat.name === c.category && !cat.isDistinct)
        );

        // Check if the combined non-distinct group has enough contestants
        if (nonDistinctContestants.length > 0 && nonDistinctContestants.length < 2) {
            return false;
        }

        if (nonDistinctContestants.length >= 2) {
            hasValidCategory = true;
        }

        // Check distinct categories
        for (const category of categories.filter((cat) => cat.isDistinct)) {
            const count = groupedContestants[category.name]?.length || 0;

            if (count > 0 && count < 2) {
                return false;
            }

            if (count >= 2) {
                hasValidCategory = true;
            }
        }

        return hasValidCategory;
    };

    useEffect(() => {
        onCanStartTournamentChange?.(canStartTournament());
    }, [contestants, categories]);

    // Schedule matches whenever contestants are updated
    // Do not update if points are changed
    /* useEffect(() => {
         scheduleMatches();
     }, [contestants]);*/

    useEffect(() => {
        const contestantsForScheduling = contestants.map(({ id, category }) => ({ id, category }));
        const previousContestantsForScheduling = JSON.parse(localStorage.getItem('contestantsForScheduling') || '[]');

        // Only schedule matches if the contestants' categories or count have changed
        if (JSON.stringify(contestantsForScheduling) !== JSON.stringify(previousContestantsForScheduling)) {
            scheduleMatches();
            localStorage.setItem('contestantsForScheduling', JSON.stringify(contestantsForScheduling));
        }
    }, [contestants]);

    return (
        <div className="contestant-registration-page">
            <h2 className="contestant-registration-title">Versenyzők Regisztrációja</h2>
            <h3 className="contestant-registration-title">Ütemezett mérkőzések: {matches.length}</h3>
            <form className="contestant-registration-form" onSubmit={handleRegister}>
                <input
                    type="text"
                    className="contestant-registration-input"
                    placeholder="Versenyző neve"
                    value={contestantName}
                    onChange={(e) => setContestantName(e.target.value)}
                    required
                />
                <select
                    className="contestant-registration-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">Kategória kiválasztása</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button type="submit" className="contestant-registration-button contestant-registration-add-button">
                    {editingId !== null ? 'Mentés' : 'Regisztrálás'}
                </button>
                {editingId !== null && (
                    <button
                        type="button"
                        className="contestant-registration-button contestant-registration-cancel-button"
                        onClick={handleCancelEdit}
                    >
                        Mégse
                    </button>
                )}
            </form>

            {/* Multi-Column Table for Contestants */}
            <h3 className="contestant-list-title">Regisztrált Versenyzők</h3>
            <div className="contestant-table-container">
                {categories.map((cat) => (
                    <div key={cat.id} className="contestant-table-column">
                        <h4 className="contestant-table-category">{cat.name} ({groupedContestants[cat.name]?.length || 0})</h4>
                        <table className="contestant-table">
                            <thead>
                                <tr>
                                    <th>Név</th>
                                    <th>Pontok</th>
                                    <th>Műveletek</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(groupedContestants[cat.name] || [])
                                    .sort((a, b) => b.points - a.points) // Sort by points in descending order
                                    .map((contestant, index) => (
                                        <tr key={contestant.id}>
                                            <td style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}><span
                                                className="clickable-contestant-name"
                                                onClick={() => openContestantModal(contestant.id)}
                                            >
                                                {contestant.name}
                                            </span></td>
                                            <td>{contestant.points}</td>
                                            <td>
                                                <button
                                                    className="contestant-list-button contestant-list-edit-button"
                                                    onClick={() => handleEdit(contestant.id)}
                                                >
                                                    Szerkesztés
                                                </button>
                                                <button
                                                    className="contestant-list-button contestant-list-delete-button"
                                                    onClick={() => handleDeleteConfirm(contestant.id)}
                                                >
                                                    Törlés
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* List of Matches */}
            <h3 className="match-list-title">Ütemezett Mérkőzések</h3>
            <ul className="match-list">
                {matches.map((match) => (
                    <li key={match.id} className="match-list-item">
                        {contestants.find((c) => c.id === match.player1)?.name} vs{' '}
                        {contestants.find((c) => c.id === match.player2)?.name} ({match.category})
                    </li>
                ))}
            </ul>

            {isModalOpen && (
                <ConfirmationModal
                    message={modalMessage}
                    onConfirm={modalAction}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}

            {JSON.parse(localStorage.getItem('contestants') || '[]').length !== 0 && isContestantModalOpen && selectedContestant && (
                <Modal onClose={() => setIsContestantModalOpen(false)}>
                    <h3>Matches for {selectedContestant.name}</h3>
                    <h4>Finished Matches</h4>
                    <ul>
                        {finishedMatches
                            .filter(
                                (match: Match) =>
                                    match.player1 === selectedContestant.id ||
                                    match.player2 === selectedContestant.id
                            )
                            .map((match: Match) => {
                                const isWinner = match.winner === selectedContestant.id;
                                return (
                                    <li key={match.id}>
                                        {getContestantName(match.player1)} vs {getContestantName(match.player2)} -{' '}
                                        <span style={{ color: isWinner ? 'green' : 'red' }}>
                                            Winner: {getContestantName(match.winner || '')}
                                        </span>
                                    </li>
                                );
                            })}
                    </ul>
                    <h4>Pending Matches</h4>
                    <ul>
                        {scheduledMatches
                            .filter(
                                (match: Match) =>
                                    (match.player1 === selectedContestant.id ||
                                        match.player2 === selectedContestant.id) &&
                                    // Filter out matches that have already been played from the finishedMatches
                                    !finishedMatches.some(
                                        (finishedMatch: Match) =>
                                            (finishedMatch.id === match.id)
                                    )

                            )
                            .map((match: Match) => (
                                <li key={match.id}>
                                    {getContestantName(match.player1)} vs {getContestantName(match.player2)} ({match.category})
                                </li>
                            ))}
                    </ul>
                </Modal>
            )}
        </div>
    );
};

export default ContestantRegistration;