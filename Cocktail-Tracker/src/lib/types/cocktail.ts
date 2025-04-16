
export interface Cocktail {
    id: number;
    title: string;
    ingredients: string[];
    likes: number;
    dislikes: number;
    created_at?: string;
    created_by?: number;
    user_username?: string;
}

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    users: {
        username: string;
    } | { username: string }[]; // Adapté à différentes structures possibles
}

export type CocktailFormData = {
    title: string;
    ingredients: string; // Les ingredients seront entrés comme une chaîne séparée par des virgules
};