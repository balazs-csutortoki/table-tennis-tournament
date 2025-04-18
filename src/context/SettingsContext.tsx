import React, { createContext, useContext, useState, useEffect } from 'react';

interface Category {
    name: string;
    isDistinct: boolean;
}

interface Contestant {
    name: string;
    category: string;
}

interface SettingsContextType {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    tableCount: number;
    setTableCount: React.Dispatch<React.SetStateAction<number>>;
    contestants: Contestant[];
    setContestants: React.Dispatch<React.SetStateAction<Contestant[]>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load initial state from localStorage
    const [categories, setCategories] = useState<Category[]>(() => {
        const savedCategories = localStorage.getItem('categories');
        return savedCategories ? JSON.parse(savedCategories) : [
            { name: 'Férfi', isDistinct: false },
            { name: 'Női', isDistinct: false },
            { name: 'Fiatalok', isDistinct: true },
        ];
    });

    const [tableCount, setTableCount] = useState<number>(() => {
        const savedTableCount = localStorage.getItem('tableCount');
        return savedTableCount ? JSON.parse(savedTableCount) : 2; // Default to 2 tables
    });

    const [contestants, setContestants] = useState<Contestant[]>(() => {
        const savedContestants = localStorage.getItem('contestants');
        return savedContestants ? JSON.parse(savedContestants) : [];
    });

    // Save categories to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    // Save tableCount to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('tableCount', JSON.stringify(tableCount));
    }, [tableCount]);

    // Save contestants to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('contestants', JSON.stringify(contestants));
    }, [contestants]);

    return (
        <SettingsContext.Provider
            value={{
                categories,
                setCategories,
                tableCount,
                setTableCount,
                contestants,
                setContestants,
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