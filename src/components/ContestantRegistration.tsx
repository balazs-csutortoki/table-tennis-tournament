import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { generateGUID } from '../utils'; // Import the GUID generator
import './ContestantRegistration.css'; // Import the CSS file
import ConfirmationModal from './ConfirmationModal';

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
    // List of random first names
    const randomNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank'];

    // State for contestant name and category
    const [contestantName, setContestantName] = useState(
        `${randomNames[Math.floor(Math.random() * randomNames.length)]} ${Math.floor(Math.random() * 90 + 10)}`
    );
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null); // Use GUID for editing

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
                group.push({ id: 'dummy', name: 'Dummy', category: categoryName });
            }

            // Create a round-robin schedule
            for (let i = 0; i < group.length - 1; i++) {
                const round: typeof matches = [];
                for (let j = 0; j < group.length / 2; j++) {
                    const player1 = group[j];
                    const player2 = group[group.length - 1 - j];
                    if (player1 && player2 && player1.id !== 'dummy' && player2.id !== 'dummy') { // Ignore dummy matches
                        if (player1.category !== player2.category) {
                            categoryName = 'Mixed Categories';
                        } else
                            categoryName = player1.category;
                        round.push({
                            id: generateGUID(),
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

        // Insert distinct matches after every (nonDistinctContestants.length / 2) non-distinct matches
        const mergedMatches: typeof matches = [];
        const insertInterval = Math.ceil(nonDistinctContestants.length / 2);
        let distinctIndex = 0;

        for (let i = 0; i < nonDistinctMatches.length; i++) {
            mergedMatches.push(nonDistinctMatches[i]);

            // Insert a distinct match after every `insertInterval` non-distinct matches
            if ((i + 1) % insertInterval === 0 && distinctIndex < distinctMatches.length) {
                mergedMatches.push(distinctMatches[distinctIndex]);
                distinctIndex++;
            }
        }

        // Add any remaining distinct matches
        while (distinctIndex < distinctMatches.length) {
            mergedMatches.push(distinctMatches[distinctIndex]);
            distinctIndex++;
        }

        setMatches(mergedMatches);
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
                setContestants([...contestants, { id: generateGUID(), name: contestantName, category }]);
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

    const groupedContestants = contestants.reduce((groups: Record<string, typeof contestants>, contestant) => {
        if (!groups[contestant.category]) {
            groups[contestant.category] = [];
        }
        groups[contestant.category].push(contestant);
        return groups;
    }, {});

    const canStartTournament = () => {
        let hasValidCategory = false;

        for (const category of categories) {
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
    useEffect(() => {
        scheduleMatches();
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
                                    <th>Műveletek</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(groupedContestants[cat.name] || []).map((contestant) => (
                                    <tr key={contestant.id}>
                                        <td>{contestant.name}</td>
                                        <td>
                                            <button
                                                className="contestant-list-button contestant-list-edit-button"
                                                onClick={() => handleEdit(contestant.id)}
                                            >
                                                Szerkesztés
                                            </button>
                                            <button
                                                className="contestant-list-button contestant-list-delete-button"
                                                onClick={() => handleDelete/*Confirm*/(contestant.id)}
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

            {/* List of Matches 
            <h3 className="match-list-title">Ütemezett Mérkőzések</h3>
            <ul className="match-list">
                {matches.map((match) => (
                    <li key={match.id} className="match-list-item">
                        {contestants.find((c) => c.id === match.player1)?.name} vs{' '}
                        {contestants.find((c) => c.id === match.player2)?.name} ({match.category})
                    </li>
                ))}
            </ul>*/}

            {isModalOpen && (
                <ConfirmationModal
                    message={modalMessage}
                    onConfirm={modalAction}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ContestantRegistration;