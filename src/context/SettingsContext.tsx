import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateGUID } from '../utils';

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import hu from '../i18n/hu.json';
import { Contestant } from '../types';

interface Category {
    id: string;
    name: string;
    isDistinct: boolean;
}

interface Match {
    id: string;
    player1: string; // Contestant ID
    player2: string; // Contestant ID
    category: string; // Category ID
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



i18n.use(initReactI18next).init({
    resources: {
        hu: {
            translation: hu,
        },
    },
    lng: 'hu', // Set the default language to Hungarian
    fallbackLng: 'hu', // Fallback to Hungarian if the key is missing
    interpolation: {
        escapeValue: false, // React already escapes values
    },
});

export default i18n;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();

    const [categories, setCategories] = useState<Category[]>(() => {
        const savedCategories = localStorage.getItem('categories');
        return savedCategories
            ? JSON.parse(savedCategories)
            : [
                { id: generateGUID(), name: t('settings.defaultCategoryMale'), isDistinct: false },
                { id: generateGUID(), name: t('settings.defaultCategoryFemale'), isDistinct: false },
                { id: generateGUID(), name: t('settings.defaultCategoryYouth'), isDistinct: true },
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
                setMatches
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