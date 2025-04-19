import React from 'react';
import { Link } from 'react-router-dom';
import { useSettingsContext } from '../context/SettingsContext';
import { generateGUID } from '../utils'; // Import the GUID generator
import './SettingsPage.css'; // Import the CSS file

const SettingsPage: React.FC = () => {
    const { categories, setCategories, tableCount, setTableCount, setContestants } = useSettingsContext();

    const handleAddCategory = () => {
        setCategories([...categories, { id: generateGUID(), name: '', isDistinct: false }]);
    };

    const handleRemoveCategory = (id: string) => {
        setCategories(categories.filter((category) => category.id !== id));
    };

    const handleCategoryChange = (id: string, key: keyof typeof categories[0], value: string | boolean) => {
        const updatedCategories = categories.map((category) =>
            category.id === id ? { ...category, [key]: value } : category
        );
        setCategories(updatedCategories);
    };

    const handleReset = () => {
        localStorage.clear();
        setCategories([
            { id: generateGUID(), name: 'Férfi', isDistinct: false },
            { id: generateGUID(), name: 'Női', isDistinct: false },
            { id: generateGUID(), name: 'Fiatalok', isDistinct: true },
        ]);
        setTableCount(2);
        setContestants([]);
    };

    const incrementTableCount = () => {
        setTableCount((prev) => prev + 1);
    };

    const decrementTableCount = () => {
        setTableCount((prev) => (prev > 1 ? prev - 1 : 1));
    };

    return (
        <div className="settings-page">
            <h1 className="settings-title">Beállítások</h1>

            {/* Number of Tables */}
            <div className="settings-section">
                <h2 className="settings-subtitle">Asztalok száma</h2>
                <div className="number-selector">
                    <button onClick={decrementTableCount} className="number-selector-button">-</button>
                    <span className="number-selector-value">{tableCount}</span>
                    <button onClick={incrementTableCount} className="number-selector-button">+</button>
                </div>
            </div>

            {/* Categories */}
            <div className="settings-section">
                <h2 className="settings-subtitle">Kategóriák</h2>
                <ul className="settings-category-list">
                    {categories.map((category) => (
                        <li key={category.id} className="settings-category-item">
                            <input
                                type="text"
                                value={category.name}
                                onChange={(e) => handleCategoryChange(category.id, 'name', e.target.value)}
                                placeholder="Kategória neve"
                                className="settings-input"
                            />
                            <label className="settings-toggle-label">
                                <input
                                    type="checkbox"
                                    checked={category.isDistinct}
                                    onChange={(e) => handleCategoryChange(category.id, 'isDistinct', e.target.checked)}
                                    className="settings-toggle-checkbox"
                                />
                                <span className="settings-toggle-slider"></span>
                                Különálló kategória
                            </label>
                            <button onClick={() => handleRemoveCategory(category.id)} className="settings-button settings-remove-button">
                                Törlés
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleAddCategory} className="settings-button settings-add-button">
                    Új kategória hozzáadása
                </button>
            </div>

            {/* Navigation */}
            <div className="settings-section">
                <Link to="/registration">
                    <button className="settings-button settings-nav-button">Versenyzők regisztrációja</button>
                </Link>
            </div>

            {/* Footer */}
            <footer className="settings-footer">
                <button onClick={handleReset} className="settings-button settings-reset-button">
                    Alaphelyzet
                </button>
            </footer>
        </div>
    );
};

export default SettingsPage;