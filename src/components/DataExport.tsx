import React from 'react';

const DataExport: React.FC = () => {
    const exportData = () => {
        const data = {
            // Add your tournament data structure here
            settings: {}, // Tournament settings
            contestants: [], // List of contestants
            matches: [], // Scheduled matches
            rankings: [] // Final rankings
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tournament_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h2>Adatok exportálása</h2>
            <button onClick={exportData}>Exportálás JSON fájlba</button>
        </div>
    );
};

export default DataExport;