
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

// Ajoutez une interface pour les commentaires
export interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    users: {
        username: string;
    } | { username: string }[]; // Adapté à différentes structures possibles
}