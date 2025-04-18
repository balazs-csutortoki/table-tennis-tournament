import React from 'react';
import { useEffect, useState } from 'react';
import { Contestant } from '../types';

const Rankings: React.FC = () => {
    const [rankings, setRankings] = useState<Contestant[]>([]);

    useEffect(() => {
        // Fetch rankings from an API or calculate them based on the contestants' data
        const fetchRankings = async () => {
            // Placeholder for fetching logic
            const fetchedRankings: Contestant[] = []; // Replace with actual fetching logic
            setRankings(fetchedRankings);
        };

        fetchRankings();
    }, []);

    return (
        <div>
            <h2>Játékosok Ranglistája</h2>
            <table>
                <thead>
                    <tr>
                        <th>Név</th>
                        <th>Pontok</th>
                        <th>Kategória</th>
                    </tr>
                </thead>
                <tbody>
                    {rankings.map((contestant) => (
                        <tr key={contestant.id}>
                            <td>{contestant.name}</td>
                            <td>{contestant.points}</td>
                            <td>{contestant.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Rankings;