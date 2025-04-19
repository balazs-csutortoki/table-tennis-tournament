import React, { useEffect, useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { generateGUID } from '../utils'; // Import the GUID generator
import MatchScheduling from './MatchScheduling';

interface ContestantRegistrationProps {
    onCanStartTournamentChange?: (canStart: boolean) => void;
}

const ContestantRegistration: React.FC<ContestantRegistrationProps> = ({ onCanStartTournamentChange }) => {
    const { categories, contestants, setContestants } = useSettingsContext();

    // List of random first names
    const randomNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank'];

    // State for contestant name and category
    const [contestantName, setContestantName] = useState(randomNames[Math.floor(Math.random() * randomNames.length)]);
    const [category, setCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null); // Use GUID for editing

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (contestantName && category) {
            // Check if the name is already registered across all categories
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

            // Reset the form with a new random name
            setContestantName(randomNames[Math.floor(Math.random() * randomNames.length)] + '-' + Math.floor(Math.random() * 100));
            // setCategory('');
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

    const handleDelete = (id: string) => {
        const updatedContestants = contestants.filter((contestant) => contestant.id !== id);
        setContestants(updatedContestants);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setContestantName(randomNames[Math.floor(Math.random() * randomNames.length)]);
        setCategory('');
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

    return (
        <div>
            <h2>Versenyzők Regisztrációja</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Versenyző neve"
                    value={contestantName}
                    onChange={(e) => setContestantName(e.target.value)}
                    required
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Kategória kiválasztása</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button type="submit">{editingId !== null ? 'Mentés' : 'Regisztrálás'}</button>
                {editingId !== null && (
                    <button type="button" onClick={handleCancelEdit}>
                        Mégse
                    </button>
                )}
            </form>
            <h3>Regisztrált Versenyzők</h3>
            {Object.keys(groupedContestants).map((category) => (
                <div key={category}>
                    <h4>{category}</h4>
                    <ul>
                        {groupedContestants[category].map((contestant) => (
                            <li key={contestant.id}>
                                {contestant.name}{' '}
                                <button onClick={() => handleEdit(contestant.id)}>Szerkesztés</button>
                                <button onClick={() => handleDelete(contestant.id)}>Törlés</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ContestantRegistration;