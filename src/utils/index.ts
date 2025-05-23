export const scheduleMatches = (contestants: string[], concurrentMatches: number): string[] => {
    const matches: string[] = [];
    for (let i = 0; i < contestants.length; i += 2) {
        if (matches.length < concurrentMatches) {
            matches.push(`${contestants[i]} vs ${contestants[i + 1]}`);
        }
    }
    return matches;
};

export const calculateRankings = (contestants: { name: string; points: number }[]): { name: string; points: number }[] => {
    return contestants.sort((a, b) => b.points - a.points);
};

export const generateGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};