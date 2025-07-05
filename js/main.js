// js/main.js

/**
 * @file This file manages the display, filtering, and interaction for the recipe list page.
 * It handles loading recipes from ZIP files, rendering recipe cards, and applying various filters.
 */

// Import necessary module (assuming recipeData.js provides `recipeFiles` array)
import { recipeFiles } from './recipeData.js';

// --- Global Variables ---

/**
 * @type {Array<Object>} Stores all loaded recipe data, including the parsed recipe JSON and the JSZip instance.
 * Each object in the array has the structure: `{ recipe: Object, zip: JSZip }`.
 */
let recipes = [];

/**
 * @type {HTMLElement} Reference to the DOM element where recipe cards will be displayed.
 */
const recipeList = document.getElementById("recipe-list");

// --- Filter State Variables ---
/**
 * @type {string} Stores the current search term entered by the user.
 */
let currentSearchTerm = "";

/**
 * @type {Set<string>} Stores the currently active tags selected by the user for filtering.
 */
const activeTags = new Set();

/**
 * @type {number} Maximum allowed total preparation and cooking time for recipes. Defaults to infinity.
 */
let maxTime = Infinity;

/**
 * @type {number} Maximum allowed price per person for recipes. Defaults to infinity.
 */
let maxPrice = Infinity;

/**
 * @type {number} Maximum allowed difficulty level for recipes. Defaults to 5 (max difficulty).
 */
let maxDifficulty = 5;

/**
 * @type {number} Minimum allowed rating (love hearts) for recipes. Defaults to 0 (min rating).
 */
let minRating = 0;

// --- DOM Element References (Inputs and Controls) ---
const searchInput = document.getElementById("search");
const maxTimeInput = document.getElementById("max-time");
const maxPriceInput = document.getElementById("max-price");
const minRatingInput = document.getElementById("min-rating");
const maxDifficultyInput = document.getElementById("max-difficulty");
const filterToggle = document.getElementById("filter-toggle");


// --- Utility Functions ---

/**
 * Calculates the total price per person for a given recipe.
 * Rounds the price to the nearest 0.05.
 * @param {Object} recipe - The recipe object.
 * @returns {number} The rounded total price per person.
 */
function calculatePricePerPerson(recipe) {
    let price = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0);
    // Round to the nearest 0.05 (e.g., for currency like CHF)
    return Math.round(price / 0.05) * 0.05;
}

/**
 * Generates HTML string for a specified number of Font Awesome icons (hearts or stars).
 * @param {string} iconClass - The base Font Awesome icon class (e.g., 'fa-heart', 'fa-star').
 * @param {number} count - The number of 'solid' icons to display (filled).
 * @param {number} total - The total number of icons to display (e.g., 5).
 * @returns {string} HTML string containing the icons.
 */
function generateRatingIcons(iconClass, count, total = 5) {
    let iconsHtml = '';
    for (let i = 0; i < total; i++) {
        const typeClass = i < count ? 'fa-solid' : 'fa-regular';
        iconsHtml += `<i class="${typeClass} ${iconClass}" style="margin-right: 2px;"></i>`;
    }
    return iconsHtml;
}

/**
 * Creates a DOM element with specified tag, class, and attributes.
 * @param {string} tagName - The tag name of the element to create (e.g., 'div', 'button').
 * @param {string} [className=''] - The class name(s) to add to the element.
 * @param {Object} [attributes={}] - An object of attribute key-value pairs to set on the element.
 * @returns {HTMLElement} The created HTML element.
 */
function createElement(tagName, className = '', attributes = {}) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

// --- Recipe Card Rendering ---

/**
 * Creates an HTML card element for a given recipe.
 * It dynamically fetches and displays the first image from the recipe's ZIP file.
 * @param {Object} recipe - The recipe object containing details.
 * @param {JSZip} zip - The JSZip instance for the recipe's ZIP file.
 * @returns {Promise<HTMLElement>} A promise that resolves to the created recipe card HTML element.
 */
async function createRecipeCard(recipe, zip) {
    const card = createElement("div", "recipe");
    const firstImageResource = recipe.images?.[0]; // Get the path to the first image
    let imageSrc = '';

    if (firstImageResource) {
        try {
            const imageFile = zip.file(firstImageResource);
            if (imageFile) {
                const imageData = await imageFile.async('uint8array');
                const imageBlob = new Blob([imageData], { type: 'image/jpeg' });
                imageSrc = URL.createObjectURL(imageBlob);
            } else {
                console.warn(`Image file not found in zip: ${firstImageResource}`);
            }
        } catch (error) {
            console.error(`Error loading image from zip for recipe ${recipe.id}:`, error);
        }
    }

    // Determine total time string
    const totalTime = recipe.prepTime + recipe.cookTime;
    const timeDisplay = `${totalTime}${recipe.rest ? " + repos" : ""}`;

    card.innerHTML = `
        <a href="recipe.html?id=${recipe.id}">
            <div class="image-wrapper">
                <img src="${imageSrc || 'path/to/default/image.jpg'}" alt="${recipe.title || 'Recipe Image'}" onerror="this.onerror=null;this.src='path/to/fallback/image.jpg';" />
            </div>
            <div class="content">
                <h3>${recipe.title}</h3>
                <p>
                    Note : ${generateRatingIcons('fa-heart', recipe.rating)}
                    <br>Difficulté : ${generateRatingIcons('fa-star', recipe.difficulty)}
                    <br>Temps : ${timeDisplay}
                    <br>Prix : ${calculatePricePerPerson(recipe).toFixed(2)} CHF / personne
                </p>
                <div class="tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </a>
    `;

    // Revoke object URL after image is loaded to free up memory (important for many images)
    // This needs to be handled carefully, as the image might not be fully rendered yet.
    // A more robust solution might involve Intersection Observer or external image loading library.
    // For now, we'll rely on the browser to eventually clean up, or a specific cleanup function.
    if (imageSrc) {
        // A small delay to allow image rendering, but not ideal for large scale
        // A better approach would be to listen for the image's 'load' event
        setTimeout(() => URL.revokeObjectURL(imageSrc), 5000);
    }

    return card;
}

/**
 * Clears existing recipe cards (except the "add new" card) and displays the provided recipe data.
 * @param {Array<Object>} data - An array of recipe data objects (`{ recipe: Object, zip: JSZip }`).
 */
function displayRecipes(data) {
    // Remove all dynamically added recipe cards, but keep the "add new recipe" card if it exists.
    recipeList.querySelectorAll(".recipe:not(.add-new)").forEach(card => card.remove());

    data.forEach(async (recipeData) => {
        const card = await createRecipeCard(recipeData.recipe, recipeData.zip);
        recipeList.appendChild(card);
    });
}

// --- Filtering Logic ---

/**
 * Applies all active filters (search, tags, time, price, rating, difficulty) to the `recipes` array
 * and then updates the displayed recipes.
 */
function filterAndDisplayRecipes() {
    let filteredRecipes = [...recipes]; // Start with all recipes

    // 1. Filter by search term
    const searchKeywords = currentSearchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean); // Ensure no empty strings
    if (searchKeywords.length > 0) {
        filteredRecipes = filteredRecipes.filter(({ recipe }) => {
            return searchKeywords.every(keyword => {
                return recipe.title.toLowerCase().includes(keyword) ||
                       recipe.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
                       recipe.ingredients.some(ing => ing.name.toLowerCase().includes(keyword));
            });
        });
    }

    // 2. Filter by numerical criteria (time, price, rating, difficulty)
    filteredRecipes = filteredRecipes.filter(({ recipe }) => {
        const totalRecipeTime = recipe.prepTime + recipe.cookTime;
        const recipePrice = calculatePricePerPerson(recipe);

        return totalRecipeTime <= maxTime &&
               recipePrice <= maxPrice &&
               recipe.rating >= minRating &&
               recipe.difficulty <= maxDifficulty;
    });

    // 3. Filter by active tags
    if (activeTags.size > 0) {
        filteredRecipes = filteredRecipes.filter(({ recipe }) =>
            Array.from(activeTags).every(activeTag => recipe.tags.includes(activeTag))
        );
    }

    displayRecipes(filteredRecipes);
    updateFilterToggleIcon(); // Update the filter reset icon
}

/**
 * Updates the appearance of the filter toggle button based on whether any filters are active.
 * Shows a 'clear filters' icon if filters are active, otherwise a standard 'filter' icon.
 */
function updateFilterToggleIcon() {
    const isFilterActive = activeTags.size > 0 ||
                           maxTime < Infinity ||
                           maxPrice < Infinity ||
                           minRating > 0 ||
                           maxDifficulty < 5;

    if (isFilterActive) {
        filterToggle.classList.remove("fa-filter");
        filterToggle.classList.add("fa-filter-circle-xmark");
        filterToggle.title = "Effacer tous les filtres";
    } else {
        filterToggle.classList.remove("fa-filter-circle-xmark");
        filterToggle.classList.add("fa-filter");
        filterToggle.title = "Filtrer";
    }
}

/**
 * Resets all filter values (search term, active tags, time, price, rating, difficulty)
 * and updates the UI accordingly.
 */
function resetAllFilters() {
    currentSearchTerm = "";
    searchInput.value = ""; // Clear search input visually

    activeTags.clear();
    document.querySelectorAll(".filter.active").forEach(btn => btn.classList.remove("active"));

    maxTime = Infinity;
    maxTimeInput.value = "";

    maxPrice = Infinity;
    maxPriceInput.value = "";

    minRating = 0;
    minRatingInput.value = "";

    maxDifficulty = 5;
    maxDifficultyInput.value = "";

    filterAndDisplayRecipes(); // Re-apply filters with reset values
}

// --- Event Listeners Setup ---

/**
 * Attaches event listeners to the filter buttons (tags) and the main filter toggle.
 */
function setupFilterControls() {
    const filterButtons = document.querySelectorAll(".filter");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tag = button.textContent.trim(); // Ensure tag matches what's stored
            if (activeTags.has(tag)) {
                activeTags.delete(tag);
                button.classList.remove("active");
            } else {
                activeTags.add(tag);
                button.classList.add("active");
            }
            filterAndDisplayRecipes(); // Re-filter when tags change
        });
    });

    // Event listener for the "clear filters" toggle button
    filterToggle.addEventListener("click", resetAllFilters);
}

/**
 * Attaches input event listeners to the search and numerical filter inputs.
 */
function setupInputFilters() {
    searchInput.addEventListener("input", (e) => {
        currentSearchTerm = e.target.value; // No need for .toLowerCase() here; handle in filter logic
        filterAndDisplayRecipes();
    });

    maxTimeInput.addEventListener("input", (e) => {
        maxTime = parseFloat(e.target.value) || Infinity;
        filterAndDisplayRecipes();
    });

    maxPriceInput.addEventListener("input", (e) => {
        maxPrice = parseFloat(e.target.value) || Infinity;
        filterAndDisplayRecipes();
    });

    minRatingInput.addEventListener("input", (e) => {
        minRating = parseFloat(e.target.value) || 0;
        filterAndDisplayRecipes();
    });

    maxDifficultyInput.addEventListener("input", (e) => {
        maxDifficulty = parseFloat(e.target.value) || 5;
        filterAndDisplayRecipes();
    });
}

// --- Data Loading ---

/**
 * Fetches and loads all recipe data from their respective ZIP files.
 * Populates the global `recipes` array upon successful loading.
 */
async function loadAllRecipes() {
    // Ensure JSZip is loaded before attempting to use it
    if (typeof JSZip === 'undefined') {
        console.error("JSZip library is not loaded. Cannot load recipes.");
        alert("JSZip library is required to load recipes. Please ensure it's linked.");
        return;
    }

    const loadedRecipes = await Promise.all(recipeFiles.map(async fileName => {
        try {
            const response = await fetch(`./resources/${fileName}.zip`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for ${fileName}.zip`);
            }
            const blob = await response.blob();
            const zip = await JSZip.loadAsync(blob);

            const jsonFile = zip.file(`${fileName}.json`);
            if (!jsonFile) {
                throw new Error(`JSON file not found in zip: ${fileName}.json`);
            }
            const text = await jsonFile.async("text");
            const recipe = JSON.parse(text);

            return { recipe, zip };
        } catch (error) {
            console.error(`Error loading recipe ${fileName}:`, error);
            return null; // Return null for failed loads to filter out later
        }
    }));

    // Filter out any null results from failed loads
    recipes = loadedRecipes.filter(recipeData => recipeData !== null);
    filterAndDisplayRecipes(); // Display all recipes initially after loading
}


// --- Initialization ---

/**
 * Initializes the application once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set up all filter controls and input listeners
    setupFilterControls();
    setupInputFilters();

    // Load all recipe data
    loadAllRecipes();
});