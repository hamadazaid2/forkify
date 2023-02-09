'use strict';

import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE, KEY } from "./config";
// import { getJSON, sendJSON } from "./hepler";
import { AJAX } from "./hepler";
import recipeView from "./views/recipeView";


export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
};

const createRecipeObject = function (recipe) {
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }), // If the key is exist the code will applied if not then there is no key attribute never
    };
}

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

        let { recipe } = data.data;
        // Make recipe object
        state.recipe = createRecipeObject(data.data.recipe);
        // state.recipe = {
        //     id: recipe.id,
        //     title: recipe.title,
        //     publisher: recipe.publisher,
        //     sourceUrl: recipe.source_url,
        //     image: recipe.image_url,
        //     servings: recipe.servings,
        //     cookingTime: recipe.cooking_time,
        //     ingredients: recipe.ingredients
        // }

        if (state.bookmarks.some(bookmark => bookmark.id === id)) // some return true or false 
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;

    } catch (error) {
        throw error;
    }
}


export const loadSearchResults = async function (query) {
    try {
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

        state.search.query = query;
        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            }
        });
        state.search.page = 1;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage; // 0
    const end = page * state.search.resultsPerPage; // 9

    return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
    // The idea of servings that let assume that the recipe is for 4 people (servings) and in ingredients they will need quantity 2 cup of milk, so for 8 people we need a quantity (8*2) /4 so the formula is { newQt = (oldQt * newServings ) / oldServings }
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (newServings * ing.quantity) / state.recipe.servings;
    });

    state.recipe.servings = newServings;
}

const persistBookamrks = function () {
    // Save bookmarks to LocalStorage
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmark

    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookamrks();
}

export const deleteBookmark = function (id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookamrks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}
init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
}
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {

        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                // عشان ميصيرش ايرور لو كانت طول المصفوفة اقل من 3
                if (ingArr.length !== 3)
                    throw new Error(
                        'Wrong ingredient fromat! Please use the correct format :)'
                    );

                const [quantity, unit, description] = ingArr;

                return { quantity: quantity ? +quantity : null, unit, description };
            });



        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };



        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data.data.recipe);
        addBookmark(state.recipe);


    } catch (error) {
        throw error;
    }

}