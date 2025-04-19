import React, { useState } from 'react';
import './Settings.css'; // Import the CSS file

const Settings: React.FC = () => {
    const [concurrentMatches, setConcurrentMatches] = useState<number>(1);
    const [categories, setCategories] = useState<string[]>(['Kategória 1']);

    const handleAddCategory = () => {
        setCategories([...categories, `Kategória ${categories.length + 1}`]);
    };

    const handleRemoveCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const handleConcurrentMatchesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConcurrentMatches(Number(event.target.value));
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title">Tornabeállítások</h2>
            <div className="settings-section">
                <label className="settings-label">
                    Párhuzamos mérkőzések száma:
                    <input
                        type="number"
                        value={concurrentMatches}
                        onChange={handleConcurrentMatchesChange}
                        min="1"
                        className="settings-input"
                    />
                </label>
            </div>
            <div className="settings-section">
                <h3 className="settings-subtitle">Kategóriák</h3>
                <ul className="settings-category-list">
                    {categories.map((category, index) => (
                        <li key={index} className="settings-category-item">
                            {category}
                            <button
                                onClick={() => handleRemoveCategory(index)}
                                className="settings-button settings-remove-button"
                            >
                                Eltávolítás
                            </button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleAddCategory} className="settings-button settings-add-button">
                    Kategória hozzáadása
                </button>
            </div>
        </div>
    );
};

export default Settings;