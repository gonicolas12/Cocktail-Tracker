export type Cocktail = {
    id: number;
    title: string;
    ingredients: string[];
    likes: number;
    dislikes: number;
    created_at?: string;
};

export type CocktailFormData = {
    title: string;
    ingredients: string; // Les ingredients seront entrés comme une chaîne séparée par des virgules
};