import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';


// Mock Database (Replace with actual DB calls later)
let cocktails = [
    { id: 1, title: 'Mojito', ingredients: ['Rum', 'Mint', 'Lime', 'Sugar', 'Soda'], likes: 10, dislikes: 2 },
    { id: 2, title: 'Margarita', ingredients: ['Tequila', 'Lime', 'Triple Sec'], likes: 15, dislikes: 1 },
];

// GET all cocktails
export const GET = async () => {
    return json(cocktails);
};

// POST a new cocktail
export const POST = async ({ request }: RequestEvent) => {
    const newCocktail = await request.json();
    newCocktail.id = cocktails.length + 1;
    newCocktail.likes = 0;
    newCocktail.dislikes = 0;
    cocktails.push(newCocktail);
    return json(newCocktail, { status: 201 });
};
