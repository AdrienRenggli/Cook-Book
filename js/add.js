// js/add.js

/**
 * @file This file handles the client-side logic for adding and managing recipe data,
 * including star ratings, ingredient management, image uploads, and recipe export.
 */

// --- Global Variables ---
/**
 * @type {Array<Object>} Stores information about uploaded image files (name and base64 data).
 */
let imageFiles = [];

/**
 * @type {number} Stores the current "love" (recipe rating) value. Default is 5.
 */
let love = 5;

/**
 * @type {number} Stores the current "difficulty" rating value. Default is 5.
 */
let difficulty = 5;

// --- Utility Functions ---

/**
 * Rounds a number to the nearest 0.05.
 * @param {number} number - The number to round.
 * @returns {number} The rounded number.
 */
function roundToNearestFiveCents(number) {
    return Math.round(number / 0.05) * 0.05;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string.
 * @returns {string} The string with its first letter capitalized, or an empty string if input is invalid.
 */
function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
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

// --- Star Rating Functionality ---

/**
 * Determines the appropriate icon class (heart or star) based on the rating ID.
 * @param {string} id - The ID of the rating container ('rating' or 'difficulty').
 * @returns {string} The base icon class ('fa-heart' or 'fa-star').
 */
function getRatingIconClass(id) {
    return id === "rating" ? 'fa-heart' : 'fa-star';
}

/**
 * Highlights stars based on a given rating value.
 * @param {string} id - The ID of the star rating container.
 * @param {number} ratingValue - The rating value to highlight up to.
 */
function updateStarHighlighting(id, ratingValue) {
    const iconClass = getRatingIconClass(id);
    const stars = document.querySelectorAll(`#${id} .${iconClass}`);
    stars.forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        if (starValue <= ratingValue) {
            star.classList.add('fa-solid');
            star.classList.remove('fa-regular');
        } else {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
        }
    });
}

/**
 * Sets the rating for a specific star rating system (love or difficulty).
 * Updates the global `love` or `difficulty` variable and visually updates the stars.
 * @param {string} id - The ID of the star rating container ('rating' or 'difficulty').
 * @param {number} rating - The selected rating value.
 */
function setAndDisplayRating(id, rating) {
    updateStarHighlighting(id, rating); // Update visual state first

    if (id === "rating") {
        love = rating; // Store rating value for the recipe
    } else if (id === "difficulty") {
        difficulty = rating; // Store difficulty value for the recipe
    }
}

/**
 * Initializes a star rating system within a specified container.
 * @param {string} id - The ID of the HTML element that will contain the stars.
 * @param {number} maxRating - The maximum number of stars (e.g., 5).
 */
function createStarRating(id, maxRating) {
    const container = document.getElementById(id);
    if (!container) {
        console.error(`Star rating container with ID '${id}' not found.`);
        return;
    }
    container.innerHTML = ''; // Clear existing stars

    const iconClass = getRatingIconClass(id);

    for (let i = 1; i <= maxRating; i++) {
        const star = createElement('i', iconClass, { 'data-value': i });
        star.addEventListener('click', () => setAndDisplayRating(id, i));
        container.appendChild(star);
    }
    // Initialize with default value
    setAndDisplayRating(id, (id === "rating" ? love : difficulty));
}

// --- Ingredient Management ---

/**
 * Adds a new ingredient input row to the ingredient list.
 */
function addIngredient() {
    const li = createElement("li");
    li.innerHTML = `
        <input placeholder="Nom de l'ingrédient" />
        <input type="number" placeholder="Quantité" min="0" />
        <input placeholder="Unité (g, ml, etc.) '.' pour unité" />
        <input type="number" placeholder="Prix" min="0" />
    `;
    const ingredientList = document.getElementById("ingredient-list");
    if (ingredientList) {
        ingredientList.appendChild(li);
        // Attach event listener to each new input for immediate price updates
        li.querySelectorAll("input").forEach(inputElement => inputElement.addEventListener("input", updateTotalPriceDisplay));
    } else {
        console.error("Ingredient list container not found.");
    }
}

/**
 * Updates the displayed total price per person based on current ingredients and guests.
 */
function updateTotalPriceDisplay() {
    const items = document.querySelectorAll("#ingredient-list li");
    let totalCost = 0;
    const guestsInput = document.getElementById("guests");
    const guests = parseInt(guestsInput ? guestsInput.value : "1") || 1; // Default to 1 if not found or invalid

    items.forEach(li => {
        // Access children by index, assuming fixed structure
        const priceInput = li.children[3];
        const quantityInput = li.children[1];

        const price = parseFloat(priceInput ? priceInput.value : "0") || 0;
        // Quantity isn't directly used for total price, but included for completeness if logic changes
        // const quantity = parseFloat(quantityInput ? quantityInput.value : "1") || 1;

        totalCost += price;
    });

    const pricePerGuest = guests > 0 ? totalCost / guests : 0;
    const priceDisplayElement = document.getElementById("price");
    if (priceDisplayElement) {
        priceDisplayElement.textContent = `${roundToNearestFiveCents(pricePerGuest).toFixed(2)} CHF / pers.`;
    }
}

// --- Image Upload and Preview Functionality ---

/**
 * Handles files dropped or selected via the file input.
 * Processes image files by converting them to base64 and updating previews.
 * @param {DragEvent | Event} e - The event object (DragEvent for drop, Event for change).
 */
function handleImageFiles(e) {
    const files = Array.from(e.dataTransfer ? e.dataTransfer.files : e.target.files);

    files.forEach(file => {
        if (!file.type.startsWith("image/")) {
            console.warn(`Skipping non-image file: ${file.name}`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const recipeTitle = document.getElementById('recipe-title')?.value.replace(/\s+/g, '_') || 'untitled_recipe';
            imageFiles.push({
                name: `${recipeTitle}_${Date.now()}_${imageFiles.length + 1}.jpg`, // Unique name to prevent conflicts
                data: event.target.result.split(',')[1] // Extract base64 data
            });
            updateImagePreviews();
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Displays a single image preview with a remove button.
 * @param {string} src - The base64 data URL of the image.
 * @param {number} index - The index of the image in the `imageFiles` array.
 */
function showImagePreview(src, index) {
    const container = createElement("div", "image-container");
    const img = createElement("img", "thumb", { src: src });
    const removeBtn = createElement("button", "remove-image", { title: "Supprimer cette image" });
    removeBtn.innerHTML = "&times;";

    removeBtn.onclick = () => {
        imageFiles.splice(index, 1); // Remove from array
        container.remove(); // Remove from DOM
        updateImagePreviews(); // Re-render to update indices if needed
    };

    container.appendChild(img);
    container.appendChild(removeBtn);
    document.querySelector(".images")?.appendChild(container); // Append to the image section
}

/**
 * Clears existing image previews and re-renders all images from `imageFiles`.
 */
function updateImagePreviews() {
    // Clear current previews
    document.querySelectorAll(".image-container").forEach(c => c.remove());

    // Re-render all images
    imageFiles.forEach((imgFile, index) => {
        const base64 = `data:image/jpeg;base64,${imgFile.data}`;
        showImagePreview(base64, index);
    });
}

/**
 * Sets up the drag-and-drop area for image uploads.
 */
function setupImageDropArea() {
    const imageSection = document.querySelector(".images");
    if (!imageSection) {
        console.error("Image section container not found.");
        return;
    }

    const dropArea = createElement("div", "drop-area");
    dropArea.innerHTML = "<p>Glissez-déposez les images ici ou cliquez pour en ajouter</p>";

    const input = createElement("input", '', { type: "file", accept: "image/*", multiple: true });
    dropArea.appendChild(input);

    dropArea.addEventListener("click", () => input.click());

    ['dragenter', 'dragover'].forEach(eventName => dropArea.addEventListener(eventName, (ev) => {
        ev.preventDefault();
        dropArea.classList.add("highlight");
    }));

    ['dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, (ev) => {
        ev.preventDefault();
        dropArea.classList.remove("highlight");
    }));

    dropArea.addEventListener("drop", handleImageFiles);
    input.addEventListener("change", handleImageFiles);

    imageSection.appendChild(dropArea);
}

// --- Recipe Import and Edit

/**
 * Handles the dropping or selection of a ZIP archive.
 * Extracts recipe data and images from the archive and populates the form.
 * @param {DragEvent | Event} e - The event object (DragEvent for drop, Event for change).
 */
async function handleRecipeArchive(e) {
    const files = Array.from(e.dataTransfer ? e.dataTransfer.files : e.target.files);
    const zipFile = files.find(file => file.name.endsWith('.zip'));

    if (!zipFile) {
        alert("Veuillez fournir une archive .zip de recette valide.");
        return;
    }

    if (typeof JSZip === 'undefined') {
        console.error("JSZip library is not loaded. Cannot import recipe.");
        alert("JSZip library is required for importing recipes. Please ensure it's linked.");
        return;
    }

    try {
        const zip = await JSZip.loadAsync(zipFile);
        let recipeData = null;
        imageFiles = []; // Clear existing images

        // Find the JSON recipe file
        zip.forEach((relativePath, zipEntry) => {
            if (relativePath.endsWith('.json') && !zipEntry.dir) {
                recipeData = zipEntry;
            }
        });

        if (!recipeData) {
            alert("Pas de recette JSON trouvé dans l'archive.");
            return;
        }

        // Load and parse the JSON data
        const recipeJsonString = await recipeData.async("string");
        const recipe = JSON.parse(recipeJsonString);

        // Populate the form with recipe data
        populateFormWithRecipe(recipe);

        // Load images from the 'resources' folder in the zip
        const resourceFolder = zip.folder("resources");
        if (resourceFolder) {
            const imagePromises = [];
            resourceFolder.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir && zipEntry.name.startsWith("resources/") && (zipEntry.name.endsWith('.jpg') || zipEntry.name.endsWith('.jpeg') || zipEntry.name.endsWith('.png') || zipEntry.name.endsWith('.gif'))) {
                    imagePromises.push(
                        zipEntry.async("base64").then(data => {
                            imageFiles.push({
                                name: zipEntry.name.split('/').pop(), // Get just the filename
                                data: data
                            });
                        })
                    );
                }
            });
            await Promise.all(imagePromises);
        }
        updateImagePreviews(); // Display the loaded images
        updateTotalPriceDisplay(); // Recalculate price based on loaded ingredients

        alert("Recette chargée avec succès !");

    } catch (error) {
        console.error("Error loading recipe archive:", error);
        alert("Erreur lors du chargement de l'archive de la rectte. Veuillez vous assurer qu'il s'agit d'une archive valide.");
    }
}

/**
 * Populates the form fields with data from a given recipe object.
 * @param {Object} recipe - The recipe object to load into the form.
 */
function populateFormWithRecipe(recipe) {
    // Clear existing ingredients first
    const ingredientList = document.getElementById("ingredient-list");
    if (ingredientList) {
        ingredientList.innerHTML = '';
    }

    // Set simple text/number inputs
    document.getElementById('recipe-title').value = recipe.title || '';
    document.getElementById('prep-time').value = recipe.prepTime || '';
    document.getElementById('cook-time').value = recipe.cookTime || '';
    document.getElementById('guests').value = recipe.guests || '';
    document.getElementById('instructions').value = recipe.instructions || '';
    document.getElementById('tips').value = recipe.tips || '';
    document.getElementById('cook').value = recipe.cook || '';
    document.getElementById('url').value = recipe.url || '';

    // Set checkbox
    document.getElementById('rest').checked = recipe.rest || false;

    // Set ratings
    setAndDisplayRating("rating", recipe.rating || 5);
    setAndDisplayRating("difficulty", recipe.difficulty || 5);

    // Set tags
    document.getElementById('tags').value = recipe.tags ? recipe.tags.join(', ') : '';

    // Set ingredients
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
            const li = createElement("li");
            li.innerHTML = `
                <input placeholder="Nom de l'ingrédient" value="${ingredient.name || ''}" />
                <input type="number" placeholder="Quantité" min="0" value="${ingredient.quantity || ''}" />
                <input placeholder="Unité (g, ml, etc.) '.' pour unité" value="${ingredient.unit || ''}" />
                <input type="number" placeholder="Prix" min="0" value="${(ingredient.price * (recipe.guests || 1)) || ''}" />
            `;
            ingredientList.appendChild(li);
            li.querySelectorAll("input").forEach(inputElement => inputElement.addEventListener("input", updateTotalPriceDisplay));
        });
    }

    // Ensure at least one empty ingredient row if none were loaded
    if (ingredientList.children.length === 0) {
        addIngredient();
    }
}

/**
 * Sets up the drag-and-drop area for recipe archive uploads.
 */
function setupArchiveDropArea() {
    const footer = document.querySelector("footer.credits");
    if (!footer) {
        console.error("Footer element not found for archive drop area.");
        return;
    }

    const dropAreaContainer = createElement("div", "archive-drop-container");
    dropAreaContainer.innerHTML = "<h3>Importer une recette archivée</h3>";

    const dropArea = createElement("div", "drop-area archive-drop-area");
    dropArea.innerHTML = "<p>Glissez-déposez un fichier ZIP de recette ici ou cliquez pour le sélectionner</p>";

    const input = createElement("input", '', { type: "file", accept: ".zip", multiple: false });
    dropArea.appendChild(input);

    dropArea.addEventListener("click", () => input.click());

    ['dragenter', 'dragover'].forEach(eventName => dropArea.addEventListener(eventName, (ev) => {
        ev.preventDefault();
        dropArea.classList.add("highlight");
    }));

    ['dragleave', 'drop'].forEach(eventName => dropArea.addEventListener(eventName, (ev) => {
        ev.preventDefault();
        dropArea.classList.remove("highlight");
    }));

    dropArea.addEventListener("drop", handleRecipeArchive);
    input.addEventListener("change", handleRecipeArchive);

    // Insert the new drop area before the existing "Proposez votre recette" section
    const proposeRecipeHeading = footer.querySelector('h3'); // Find the first h3, which is "Proposez votre recette"
    if (proposeRecipeHeading) {
        dropAreaContainer.appendChild(dropArea);
        footer.insertBefore(dropAreaContainer, proposeRecipeHeading);
    } else {
        footer.appendChild(dropArea); // Fallback if heading not found
    }
}

// --- Recipe Building and Export ---

/**
 * Builds a recipe object from the form input values.
 * @returns {Object} A comprehensive recipe object ready for export.
 */
function buildRecipeObject() {
    const getElementValue = (id, defaultValue = '') => document.getElementById(id)?.value || defaultValue;
    const getElementChecked = (id) => document.getElementById(id)?.checked || false;
    const getElementIntValue = (id, defaultValue = 0) => parseInt(getElementValue(id, defaultValue.toString())) || defaultValue;

    const guests = getElementIntValue('guests', 1);

    const ingredients = Array.from(document.querySelectorAll("#ingredient-list li")).map(li => {
        const nameInput = li.children[0];
        const quantityInput = li.children[1];
        const unitInput = li.children[2];
        const priceInput = li.children[3];

        const name = nameInput ? nameInput.value : '';
        const quantity = parseFloat(quantityInput ? quantityInput.value : '0') || 0;
        const unit = unitInput ? unitInput.value : '';
        const price = parseFloat(priceInput ? priceInput.value : '0') || 0;

        return {
            name: capitalizeFirstLetter(name),
            quantity: quantity,
            unit: unit,
            price: roundToNearestFiveCents(price / guests), // Price per person
        };
    });

    const tags = getElementValue('tags').split(',')
                                    .map(t => capitalizeFirstLetter(t.trim()))
                                    .filter(t => t); // Filter out empty tags

    const recipeTitle = getElementValue('recipe-title');

    return {
        id: recipeTitle.replace(/\s+/g, '_'), // Unique ID from title
        title: recipeTitle,
        rating: love,
        difficulty: difficulty,
        prepTime: getElementIntValue('prep-time'),
        cookTime: getElementIntValue('cook-time'),
        rest: getElementChecked('rest'),
        tags: tags,
        guests: guests,
        ingredients: ingredients,
        instructions: getElementValue('instructions'),
        tips: getElementValue('tips'),
        cook: getElementValue('cook'),
        url: getElementValue('url'),
        images: imageFiles.map(f => `resources/${f.name}`) // Paths for the zipped file structure
    };
}

/**
 * Exports the recipe data and associated images as a downloadable ZIP file.
 * Requires the JSZip library to be loaded.
 */
async function exportRecipe() {
    if (typeof JSZip === 'undefined') {
        console.error("JSZip library is not loaded. Cannot export recipe.");
        alert("JSZip library is required for exporting recipes. Please ensure it's linked.");
        return;
    }

    const recipe = buildRecipeObject();
    const zip = new JSZip();

    // Add the JSON file to the zip
    const recipeFilename = `${recipe.id}.json`;
    zip.file(recipeFilename, JSON.stringify(recipe, null, 2));

    // Add image files (base64 data) to a 'resources' folder within the zip
    imageFiles.forEach(file => {
        zip.file(`resources/${file.name}`, file.data, { base64: true });
    });

    try {
        // Generate and download the zip file
        const content = await zip.generateAsync({ type: "blob" });
        const downloadLink = createElement("a", '', {
            href: URL.createObjectURL(content),
            download: `${recipe.id}.zip`
        });
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href); // Clean up the object URL
    } catch (error) {
        console.error("Error generating or downloading zip file:", error);
        alert("Une erreur est survenue lors de l'exportation de la recette, Veuillez réessayer.");
    }
}

// --- Event Listeners and Initializations ---

// Modify the DOMContentLoaded event listener to include the new setup
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initializations ...

    // Initialize star ratings
    createStarRating("rating", 5);
    createStarRating("difficulty", 5);

    // Setup ingredient price updates
    const guestsInput = document.getElementById("guests");
    if (guestsInput) {
        guestsInput.addEventListener("input", updateTotalPriceDisplay);
    }
    const ingredientList = document.getElementById("ingredient-list");
    if (ingredientList) {
        ingredientList.addEventListener("input", updateTotalPriceDisplay); // Event delegation for ingredient inputs
    }

    // Set up the drag and drop area for images
    setupImageDropArea();

    // Set up the drag and drop area for archives
    setupArchiveDropArea();

    // Attach event listener for adding ingredients
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', addIngredient);
    }

    // Attach event listener for the export button
    const exportButton = document.getElementById('export-recipe-button');
    if (exportButton) {
        exportButton.addEventListener('click', exportRecipe);
    }

    // Call updateTotalPriceDisplay once at the start to ensure initial price is calculated
    updateTotalPriceDisplay();
});
