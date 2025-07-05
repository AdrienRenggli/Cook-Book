// js/recipe.js

/**
 * @file This file handles the dynamic display of a single recipe, including loading data from a ZIP file,
 * managing image carousels, and adjusting ingredient quantities based on guest count.
 */

// --- Global State Variables ---

/**
 * @type {number} The current number of guests for which ingredients are calculated.
 * This value can be adjusted by the user.
 */
let guestCount = 1;

/**
 * @type {number} The original number of guests specified in the loaded recipe data.
 * Used as a reference for scaling ingredient quantities.
 */
let recipeOriginalGuests = 1;

/**
 * @type {Array<Object>} Stores the base (unscaled) ingredient list from the loaded recipe.
 */
let baseIngredients = [];

/**
 * @type {number} The current index of the image being displayed in the carousel.
 */
let currentImageIndex = 0;

/**
 * @type {Array<string>} Stores the Object URLs for the recipe's images, used by the carousel.
 */
let imageUrls = [];

/**
 * @type {Blob | null} Stores the raw ZIP file blob once fetched, so it can be downloaded.
 */
let recipeZipBlob = null; // New global variable to store the ZIP blob

// --- Utility Functions ---

/**
 * Retrieves the recipe ID from the URL query parameters.
 * @returns {string | null} The recipe ID if found, otherwise null.
 */
function getRecipeIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
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
 * Converts a multi-line string into HTML paragraphs.
 * Each non-empty line becomes a separate `<p>` tag.
 * @param {string} text - The input text string.
 * @returns {string} HTML string with text wrapped in `<p>` tags.
 */
function renderTextAsParagraphs(text) {
    if (!text) return '';
    return text
        .split('\n')
        .filter(line => line.trim() !== "")
        .map(line => `<p>${line.trim()}</p>`)
        .join('');
}

/**
 * Rounds a number to the nearest 0.05 (useful for currency or specific quantities).
 * @param {number} number - The number to round.
 * @returns {number} The rounded number.
 */
function roundToNearestFiveCents(number) {
    return Math.round(number / 0.05) * 0.05;
}

// --- Data Fetching and Processing ---

/**
 * Fetches recipe data from a specified ZIP file, extracts JSON and image blobs.
 * @param {string} id - The ID of the recipe (which corresponds to the ZIP file name).
 * @returns {Promise<Object>} A promise that resolves to the recipe data object,
 * with an added `imageBlobs` property containing Object URLs.
 * @throws {Error} If the recipe ZIP file is not found or cannot be processed.
 */
async function fetchRecipeData(id) {
    // Ensure JSZip is available
    if (typeof JSZip === 'undefined') {
        throw new Error("JSZip library is not loaded. Cannot fetch recipe data.");
    }

    const response = await fetch(`./resources/${id}.zip`);
    if (!response.ok) {
        throw new Error(`Recette introuvable: ${id}.zip (Status: ${response.status})`);
    }

    // Store the raw ZIP blob for potential download later
    recipeZipBlob = await response.blob();
    const zip = await JSZip.loadAsync(recipeZipBlob); // Load from the stored blob

    // Extract JSON data
    const jsonFile = zip.file(`${id}.json`);
    if (!jsonFile) {
        throw new Error(`Fichier JSON '${id}.json' introuvable dans le ZIP.`);
    }
    const jsonData = await jsonFile.async("text");
    const recipeData = JSON.parse(jsonData);

    // Extract images and create Object URLs
    const imageObjectUrls = {};
    for (const imagePath of recipeData.images || []) { // Ensure images array exists
        const imageFile = zip.file(imagePath); // Path might be "resources/image.jpg"
        if (imageFile) {
            const blob = await imageFile.async("blob");
            imageObjectUrls[imagePath] = URL.createObjectURL(blob);
        } else {
            console.warn(`Image file not found in zip at path: ${imagePath}`);
        }
    }

    recipeData.imageBlobs = Object.values(imageObjectUrls); // Store only the URLs for convenience
    return recipeData;
}

// --- Image Carousel Functionality ---

/**
 * Initializes the image carousel with the provided image URLs.
 * Sets the initial image and controls visibility of navigation buttons.
 * @param {Array<string>} urls - An array of Object URLs for the images to display.
 */
function setupImageCarousel(urls) {
    imageUrls = urls;
    currentImageIndex = 0;
    updateCarouselImage();

    const prevButton = document.querySelector(".carousel-btn.left");
    const nextButton = document.querySelector(".carousel-btn.right");

    if (imageUrls.length <= 1) {
        if (prevButton) prevButton.style.display = "none";
        if (nextButton) nextButton.style.display = "none";
    } else {
        if (prevButton) prevButton.style.display = "block";
        if (nextButton) nextButton.style.display = "block";
    }

    // Add touch event listeners for swipe gestures
    const carouselElement = document.getElementById("image-carousel");
    if (carouselElement) {
        let touchStartX = 0;
        carouselElement.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselElement.addEventListener("touchend", (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const delta = touchEndX - touchStartX;
            if (delta > 50) prevImage(); // Swipe right for previous
            else if (delta < -50) nextImage(); // Swipe left for next
        });
    } else {
        console.warn("Image carousel element not found.");
    }
}

/**
 * Updates the source of the carousel image to the current `currentImageIndex`.
 */
function updateCarouselImage() {
    const imgElement = document.getElementById("carousel-image");
    if (imgElement && imageUrls.length > 0) {
        imgElement.src = imageUrls[currentImageIndex];
    } else if (imgElement) {
        imgElement.src = 'path/to/default/image.jpg'; // Fallback if no images
    }
}

/**
 * Navigates the image carousel to the previous image.
 */
function prevImage() {
    if (imageUrls.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
        updateCarouselImage();
    }
}

/**
 * Navigates the image carousel to the next image.
 */
function nextImage() {
    if (imageUrls.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
        updateCarouselImage();
    }
}


// --- Ingredient and Guest Management ---

/**
 * Updates the displayed ingredient list and total price based on the current `guestCount`.
 * Ingredient quantities are scaled proportionally from `baseIngredients`.
 */
function updateDisplayedIngredients() {
    const ingredientListElement = document.getElementById("ingredient-list");
    if (!ingredientListElement) {
        console.error("Ingredient list element not found.");
        return;
    }
    ingredientListElement.innerHTML = ""; // Clear existing list

    let totalCalculatedPrice = 0;

    baseIngredients.forEach(ing => {
        // Calculate scaled quantity
        const scaledQuantity = ing.unit !== "" ? (ing.quantity / recipeOriginalGuests) * guestCount : ing.quantity;
        // Round scaled quantity to nearest 0.5 (for common cooking measures)
        const displayQuantity = roundToNearestFiveCents(scaledQuantity * 2) / 2;

        const calculatedPrice = ing.unit !== "" ? ing.price * guestCount : ing.price; // Price scaling directly with guest count
        totalCalculatedPrice += calculatedPrice;

        const li = document.createElement("li");
        let ingredientText = '';

        if (ing.unit === "") {
            // Special case for single unit items without a unit (e.g., "1 oignon")
            ingredientText = `${ing.name}`;
        } else if (ing.unit === ".") {
            // Special unit for count-based items (e.g., "2 œufs")
            let ingredientName = ing.name;
            if (displayQuantity > 1 && !ingredientName.endsWith('s')) { // Simple pluralization
                ingredientName += 's';
            }
            ingredientText = `${displayQuantity} ${ingredientName}`;
        } else {
            // Standard quantity and unit (e.g., "100 g de farine")
            let prefix = "de ";
            const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
            if (vowels.includes(ing.name[0]?.toLowerCase())) { // Check for first letter vowel
                prefix = "d'";
            }
            const unit = (ing.unit === "gousse" && displayQuantity > 1) ? ing.unit + 's' : ing.unit;

            ingredientText = `${displayQuantity} ${unit} ${prefix}${ing.name}`;
        }
        li.textContent = ingredientText;
        ingredientListElement.appendChild(li);
    });

    // Update total price display
    const priceElement = document.getElementById("price");
    if (priceElement) {
        priceElement.textContent = `${roundToNearestFiveCents(totalCalculatedPrice).toFixed(2)}`;
    }

    // Update guest count display
    const guestCountElement = document.getElementById("guest-count");
    if (guestCountElement) {
        guestCountElement.textContent = guestCount;
    }
}

/**
 * Changes the global `guestCount` by a specified delta and updates the ingredients display.
 * Ensures `guestCount` does not go below 1.
 * @param {number} delta - The amount to change the guest count by (e.g., 1 for increment, -1 for decrement).
 */
function changeGuests(delta) {
    guestCount = Math.max(1, guestCount + delta);
    updateDisplayedIngredients();
}

// --- Page Initialization ---

/**
 * Populates the recipe details on the page with the fetched data.
 * @param {Object} recipeData - The processed recipe data object.
 */
function renderRecipeDetails(recipeData) {
    // Store original guest count for scaling
    recipeOriginalGuests = recipeData.guests || 1;
    guestCount = recipeOriginalGuests; // Initialize current guest count to recipe's default

    // Set basic recipe information
    const setTextContent = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    const setInnerHTML = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    setTextContent("recipe-title", recipeData.title);
    setInnerHTML("rating", generateRatingIcons('fa-heart', recipeData.rating));
    setInnerHTML("difficulty", generateRatingIcons('fa-star', recipeData.difficulty));
    setTextContent("prep-time", recipeData.prepTime);
    setTextContent("cook-time", recipeData.cookTime);
    setTextContent("guest-count", guestCount); // Initial guest count display

    setInnerHTML("instructions", renderTextAsParagraphs(recipeData.instructions));
    setInnerHTML("tips", renderTextAsParagraphs(recipeData.tips));

    const cookElement = document.getElementById("cook");
    if (cookElement) {
        cookElement.innerHTML = `
            Recette proposée par <a href="${recipeData.url}" target="_blank" rel="noopener noreferrer">${recipeData.cook}</a>`;
    }

    // Store base ingredients and update the display
    baseIngredients = recipeData.ingredients || [];
    updateDisplayedIngredients();

    // Setup image carousel with the extracted Object URLs
    setupImageCarousel(recipeData.imageBlobs || []);
}


/**
 * Main function to execute when the window loads.
 * Fetches recipe data, handles errors, and renders the page.
 */
window.onload = async () => {
    const recipeId = getRecipeIdFromURL();
    if (!recipeId) {
        alert("Aucun identifiant de recette trouvé dans l'URL.");
        return;
    }

    try {
        const recipeData = await fetchRecipeData(recipeId);
        if (recipeData) {
            renderRecipeDetails(recipeData);
        } else {
            alert("Impossible de charger les données de la recette.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement de la recette:", error);
        alert(`Erreur: ${error.message || "Impossible de charger la recette."}`);
    }

    // Attach event listeners for carousel navigation buttons
    const prevCarouselBtn = document.querySelector(".carousel-btn.left");
    const nextCarouselBtn = document.querySelector(".carousel-btn.right");

    if (prevCarouselBtn) {
        prevCarouselBtn.addEventListener("click", prevImage);
    }
    if (nextCarouselBtn) {
        nextCarouselBtn.addEventListener("click", nextImage);
    }

    const downloadButton = document.getElementById("download-recipe-btn");
    if (downloadButton) {
        downloadButton.addEventListener("click", () => {
            if (recipeZipBlob) {
                const url = URL.createObjectURL(recipeZipBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${recipeId}.zip`; // Set the download file name
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up the URL object
            } else {
                alert("Le fichier de recette n'est pas encore disponible pour le téléchargement.");
            }
        });
    }
};