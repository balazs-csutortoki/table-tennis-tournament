export interface Contestant {
    id: string;
    name: string;
    category: string;
    points: number;
    deleted: boolean;
}
export interface Match {
    id: string;
    player1: string; // Contestant ID
    player2: string; // Contestant ID
    category: string;
    tableNumber?: number;
    winner?: string;
}
export interface Category {
    id: string;
    name: string;
    maxContestants: number;
}

export interface TournamentSettings {
    concurrentMatches: number;
    categories: Category[];
}