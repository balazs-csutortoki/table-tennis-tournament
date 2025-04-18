export interface Contestant {
    id: string;
    name: string;
    category: string;
    points: number;
}

export interface Match {
    id: string;
    contestants: Contestant[];
    winner?: Contestant;
    date: Date;
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