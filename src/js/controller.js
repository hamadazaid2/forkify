import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import paginationView from './views/paginationView.js';


import 'core-js/stable'; // This is for polyfilling async/wait
import 'regenerator-runtime/runtime' // وهذا هنا مخصص لملء كل شيء آخر.
import { async } from 'regenerator-runtime';



const recipeContainer = document.querySelector('.recipe');


const controlRecipes = async function () {
  try {

    const id = window.location.hash.slice(1); // slice to delete #
    if (!id) return; // page loaded without any id
    // recipeView.renderSpinner(); // This for if id is not found
    recipeView.renderSpinner(); // This is until rendering the recipe 

    // 0) Update results view to mark selected search result

    // if i use this, then every time i click to choose a recipe all rendered results will rendered again
    // resultsView.render(model.getSearchResultsPage())

    // So i use this
    resultsView.update(model.getSearchResultsPage())

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks)

    // 2) Loading (Fetching) Recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    // 3) Rendering Recipe
    recipeView.render(model.state.recipe);

  } catch (error) {
    recipeView.renderError(error);
    console.log(error);
  }
}
controlRecipes();

//////////////////////

const controlSearchResults = async function () {
  try {
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initail pagination buttons
    paginationView.render(model.state.search);

  } catch (error) {
    console.log('Something went wrong');
    console.log(error);
  }
}
controlSearchResults();


const controlPagination = function (goToPage) {

  console.log('Go to page: ', goToPage);

  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  console.log('control servings');
  // 1) Update the recipe servings (in state)

  model.updateServings(newServings);

  // 2) Update the recipe view 
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);


  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {

  try {

    // Render spinner
    addRecipeView.renderSpinner();


    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);


    // Render recipe
    recipeView.render(model.state.recipe);


    // Display Success message 
    addRecipeView.renderMessage();

    // Render bookmark view
    // We didn't use update because we want to add new recipe to bookmark  list not update.
    bookmarksView.render(model.state.bookmarks);

    // Change ID in url
    // pushState allow us to change url without reload the page
    window.history.pushState(null, '', `#${model.state.recipe.id}`) // par: state, title, url || state and title is not important

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);


  } catch (error) {
    console.error(error);
    addRecipeView.renderError(error.message);
  }

}

const welcomeing = function () {
  console.log('Welcome the forkify app :)');
}


const init = function () {
  // Here we use Subscriber publisher design pattern
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  welcomeing();
};
init();