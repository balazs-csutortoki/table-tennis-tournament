import React, { useState } from 'react';

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
        <div>
            <h2>Tornabeállítások</h2>
            <div>
                <label>
                    Párhuzamos mérkőzések száma:
                    <input
                        type="number"
                        value={concurrentMatches}
                        onChange={handleConcurrentMatchesChange}
                        min="1"
                    />
                </label>
            </div>
            <div>
                <h3>Kategóriák</h3>
                <ul>
                    {categories.map((category, index) => (
                        <li key={index}>
                            {category}
                            <button onClick={() => handleRemoveCategory(index)}>Eltávolítás</button>
                        </li>
                    ))}
                </ul>
                <button onClick={handleAddCategory}>Kategória hozzáadása</button>
            </div>
        </div>
    );
};

export default Settings;