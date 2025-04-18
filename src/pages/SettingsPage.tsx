import React from 'react';
import { Link } from 'react-router-dom';
import { useSettingsContext } from '../context/SettingsContext';

const SettingsPage: React.FC = () => {
    const { categories, setCategories, tableCount, setTableCount, setContestants } = useSettingsContext();

    const handleAddCategory = () => {
        setCategories([...categories, { name: '', isDistinct: false }]);
    };

    const handleRemoveCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const handleCategoryChange = (index: number, key: keyof typeof categories[0], value: string | boolean) => {
        const updatedCategories = [...categories];
        updatedCategories[index] = {
            ...updatedCategories[index],
            [key]: value,
        };
        setCategories(updatedCategories);
    };

    const handleReset = () => {
        // Clear localStorage
        localStorage.clear();

        // Reset state in SettingsContext
        setCategories([
            { name: 'Férfi', isDistinct: false },
            { name: 'Női', isDistinct: false },
            { name: 'Fiatalok', isDistinct: true },
        ]);
        setTableCount(2); // Default to 2 tables
        setContestants([]); // Clear all contestants
    };

    return (
        <div>
            <h1>Beállítások</h1>

            {/* Number of Tables */}
            <div>
                <h2>Asztalok száma</h2>
                <input
                    type="number"
                    min="1"
                    value={tableCount}
                    onChange={(e) => setTableCount(Number(e.target.value))}
                />
            </div>

            {/* Categories */}
            <h2>Kategóriák</h2>
            <ul>
                {categories.map((category, index) => (
                    <li key={index}>
                        <input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                            placeholder="Kategória neve"
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={category.isDistinct}
                                onChange={(e) => handleCategoryChange(index, 'isDistinct', e.target.checked)}
                            />
                            Különálló kategória
                        </label>
                        <button onClick={() => handleRemoveCategory(index)}>Törlés</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleAddCategory}>Új kategória hozzáadása</button>
            <br />
            <Link to="/registration">
                <button>Versenyzők regisztrációja</button>
            </Link>
            <br />
            <button onClick={handleReset} style={{ marginTop: '20px', color: 'red' }}>
                Alaphelyzet
            </button>
        </div>
    );
};

export default SettingsPage;