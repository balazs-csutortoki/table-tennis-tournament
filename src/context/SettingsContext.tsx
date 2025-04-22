import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateGUID } from '../utils';

interface Category {
    id: string;
    name: string;
    isDistinct: boolean;
}

interface Contestant {
    id: string;
    name: string;
    category: string;
    points: number;
}

interface Match {
    id: string;
    player1: string; // Contestant ID
    player2: string; // Contestant ID
    category: string; // Category name
}

interface SettingsContextType {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    tableCount: number;
    setTableCount: React.Dispatch<React.SetStateAction<number>>;
    contestants: Contestant[];
    setContestants: React.Dispatch<React.SetStateAction<Contestant[]>>;
    matches: Match[];
    setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>(() => {
        const savedCategories = localStorage.getItem('categories');
        return savedCategories
            ? JSON.parse(savedCategories)
            : [
                { id: generateGUID(), name: 'Férfi', isDistinct: false },
                { id: generateGUID(), name: 'Női', isDistinct: false },
                { id: generateGUID(), name: 'Fiatalok', isDistinct: true },
            ];
    });

    const [tableCount, setTableCount] = useState<number>(() => {
        const savedTableCount = localStorage.getItem('tableCount');
        return savedTableCount ? JSON.parse(savedTableCount) : 2;
    });

    const [contestants, setContestants] = useState<Contestant[]>(() => {
        const savedContestants = localStorage.getItem('contestants');
        return savedContestants ? JSON.parse(savedContestants) : [];
    });

    const [matches, setMatches] = useState<Match[]>(() => {
        const savedMatches = localStorage.getItem('scheduledMatches');
        return savedMatches ? JSON.parse(savedMatches) : [];
    });

    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('tableCount', JSON.stringify(tableCount));
    }, [tableCount]);

    useEffect(() => {
        localStorage.setItem('contestants', JSON.stringify(contestants));
    }, [contestants]);

    useEffect(() => {
        localStorage.setItem('scheduledMatches', JSON.stringify(matches));
    }, [matches]);

    return (
        <SettingsContext.Provider
            value={{
                categories,
                setCategories,
                tableCount,
                setTableCount,
                contestants,
                setContestants,
                matches,
                setMatches,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};