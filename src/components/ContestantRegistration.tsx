import React, { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';

const ContestantRegistration: React.FC = () => {
    const { categories, contestants, setContestants } = useSettingsContext();
    const [contestantName, setContestantName] = useState('');
    const [category, setCategory] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (contestantName && category) {
            const isDuplicate = contestants.some(
                (contestant, index) =>
                    contestant.name.toLowerCase() === contestantName.toLowerCase() &&
                    index !== editingIndex
            );

            if (isDuplicate) {
                alert('Ez a név már regisztrálva van!');
                return;
            }

            if (editingIndex !== null) {
                const updatedContestants = [...contestants];
                updatedContestants[editingIndex] = { name: contestantName, category };
                setContestants(updatedContestants);
                setEditingIndex(null);
            } else {
                setContestants([...contestants, { name: contestantName, category }]);
            }

            setContestantName('');
            setCategory('');
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setContestantName(contestants[index].name);
        setCategory(contestants[index].category);
    };

    const handleDelete = (index: number) => {
        setContestants(contestants.filter((_, i) => i !== index));
    };

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
                        <option key={cat.name} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button type="submit">{editingIndex !== null ? 'Mentés' : 'Regisztrálás'}</button>
            </form>
            <h3>Regisztrált Versenyzők</h3>
            <ul>
                {contestants.map((contestant, index) => (
                    <li key={index}>
                        {contestant.name} - {contestant.category}{' '}
                        <button onClick={() => handleEdit(index)}>Szerkesztés</button>
                        <button onClick={() => handleDelete(index)}>Törlés</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContestantRegistration;