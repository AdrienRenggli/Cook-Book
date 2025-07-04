/* js/recipe.js */
let guestCount = 1;
let baseIngredients = [];

function getRecipeIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function fetchRecipeData(id) {
    const response = await fetch(`./resources/${id}.zip`);
    if (!response.ok) {
        throw new Error("Recette introuvable");
    }
    const zip = await JSZip.loadAsync(await response.blob());

    // Extract JSON data
    const jsonFile = zip.file(`${id}.json`);
    const jsonData = await jsonFile.async("text");
    const recipeData = JSON.parse(jsonData);

    // Extract images and create Object URLs
    const imageUrls = {};
    for (const imagePath of recipeData.images) {
        const imageFile = zip.file(`${imagePath}`);
        if (imageFile) {
            const blob = await imageFile.async("blob");
            imageUrls[imagePath] = URL.createObjectURL(blob);
        }
    }

    recipeData.imageBlobs = imageUrls;
    return recipeData;
}

let currentImageIndex = 0;
let images = [];

function displayImages(imageUrls) {
    images = imageUrls;
    currentImageIndex = 0;
    updateCarouselImage();

    // Get the carousel buttons
    const prevButton = document.querySelector(".carousel-btn.left");
    const nextButton = document.querySelector(".carousel-btn.right");

    // Hide buttons if there's only one image
    if (images.length <= 1) {
        prevButton.style.display = "none";
        nextButton.style.display = "none";
    } else {
        prevButton.style.display = "block";
        nextButton.style.display = "block";
    }
}

function updateCarouselImage() {
    const img = document.getElementById("carousel-image");
    if (images.length > 0) {
        img.src = images[currentImageIndex];
    }
}

function prevImage() {
    if (images.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateCarouselImage();
    }
}

function nextImage() {
    if (images.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateCarouselImage();
    }
}

let touchStartX = 0;

const carousel = document.getElementById("image-carousel");
carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

carousel.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;
    if (delta > 50) prevImage();
    else if (delta < -50) nextImage();
});

function updateIngredients() {
    const ul = document.getElementById("ingredient-list");
    ul.innerHTML = "";
    let totalPrice = 0;
    baseIngredients.forEach(ing => {
        const quantity = ing.quantity * guestCount;
        const price = ing.price * guestCount;
        totalPrice += price;

        const li = document.createElement("li");
        if (ing.unit === "" && ing.quantity === 1) {
            li.textContent = `${ing.name}`;
        } else if (ing.unit === ".") {
            let ingredientName = ing.name;
            if (quantity > 1) {
                const nameWords = ingredientName.split(" ");
                nameWords[0] = nameWords[0] + 's';
                ingredientName = nameWords.join(" ");
            }
            li.textContent = `${quantity} ${ingredientName}`;
        } else {
            let prefix = "de ";
            const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
            if (vowels.includes(ing.name[0].toLowerCase())) {
                prefix = "d'";
            }
            li.textContent = `${quantity} ${ing.unit} ${prefix}${ing.name}`;
        }
        ul.appendChild(li);
    });
    totalPrice = Math.round(totalPrice / 0.05) * 0.05
    document.getElementById("price").textContent = `${totalPrice.toFixed(2)}`;
    document.getElementById("guest-count").textContent = guestCount;
}

function changeGuests(delta) {
    guestCount = Math.max(1, guestCount + delta);
    updateIngredients();
}

function renderParagraph(text) {
    return text
        .split('\n')
        .filter(line => line.trim() !== "")
        .map(line => `<p>${line.trim()}</p>`)
        .join('');
}

window.onload = async () => {
    const id = getRecipeIdFromURL();
    let data;

    try {
        data = await fetchRecipeData(id);
    } catch (err) {
        alert(err.message);
        return;
    }

    if (!data) {
        alert("Recette introuvable.");
        return;
    }

    const getHearts = (count) => {
        let hearts = '';
        for (let i = 0; i < 5; i++) {
            if (i < count)
                hearts += '<i class="fa-solid fa-heart" style="margin-right: 2px;"></i>';
            else
                hearts += '<i class="fa-regular fa-heart" style="margin-right: 2px;"></i>';
        }
        return hearts;
    }

    const getDifficulty = (count) => {
        let difficulty = '';
        for (let i = 0; i < 5; i++) {
            if (i < count)
                difficulty += '<i class="fa-solid fa-star" style="margin-right: 2px;"></i>';
            else
                difficulty += '<i class="fa-regular fa-star" style="margin-right: 2px;"></i>';
        }
        return difficulty;
    }

    document.getElementById("recipe-title").textContent = data.title;
    document.getElementById("rating").innerHTML = getHearts(data.rating);
    document.getElementById("difficulty").innerHTML = getDifficulty(data.difficulty);
    document.getElementById("prep-time").textContent = data.prepTime;
    document.getElementById("cook-time").textContent = data.cookTime;
    document.getElementById("instructions").innerHTML = renderParagraph(data.instructions);
    document.getElementById("tips").innerHTML = renderParagraph(data.tips);
    document.getElementById("cook").innerHTML = `
        Recette proposée par <a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.cook}</a>`;

    baseIngredients = data.ingredients;
    console.log("Ingredients loaded:", data.ingredients);
    // Pass the actual Object URLs to displayImages
    displayImages(Object.values(data.imageBlobs));
    updateIngredients();
};