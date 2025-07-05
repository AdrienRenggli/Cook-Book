// js/add.js
let imageFiles = [];
let love = 5;
let difficulty = 5;

// Add rating functionality to the page
function createStarRating(id, maxRating) {
    const container = document.getElementById(id);
    container.innerHTML = ''; // Clear existing stars

    for (let i = 1; i <= maxRating; i++) {
        const star = document.createElement('i');
        star.className = (id === "rating") ? 'fa fa-heart' : 'fa fa-star';
        star.setAttribute('data-value', i);
        star.addEventListener('click', function() {
            setRating(id, i);
            highlightStars(id, i);
            resetStars(id);
        });
        container.appendChild(star);
    }
}

function setRating(id, rating) {
    const stars = document.querySelectorAll(`#${id} .${(id === "rating" ? 'fa-heart' : 'fa-star')}`);
    stars.forEach(star => {
        if (parseInt(star.getAttribute('data-value')) <= rating) {
            star.classList.add('fa-solid');
            star.classList.remove('fa-regular');
        } else {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
        }
    });

    if (id === "rating") {
        love = rating; // Store rating value for the recipe
    } else if (id === "difficulty") {
        difficulty = rating; // Store difficulty value for the recipe
    }
}

function highlightStars(id, rating) {
    const stars = document.querySelectorAll(`#${id} .${(id === "rating" ? 'fa-heart' : 'fa-star')}`);
    stars.forEach(star => {
        if (parseInt(star.getAttribute('data-value')) <= rating) {
            star.classList.add('fa-solid');
            star.classList.remove('fa-regular');
        } else {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
        }
    });
}

function resetStars(id) {
    const stars = document.querySelectorAll(`#${id} .${(id === "rating" ? 'fa-heart' : 'fa-star')}`);
    stars.forEach(star => {
        if (!star.classList.contains('fa-solid')) {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createStarRating("rating", 5);
    createStarRating("difficulty", 5);
});

function addIngredient() {
    const li = document.createElement("li");
    li.innerHTML = `
        <input placeholder="Nom de l'ingrédient" />
        <input type="number" placeholder="Quantité" min="0" />
        <input placeholder="Unité (g, ml, etc.) '.' pour unité" />
        <input type="number" placeholder="Prix" min="0" />
    `;
    document.getElementById("ingredient-list").appendChild(li);
    li.querySelectorAll("input").forEach(i => i.addEventListener("input", updatePrice));
}

function round(number) {
    return Math.round(number / 0.05) * 0.05;
}

function updatePrice() {
    const items = document.querySelectorAll("#ingredient-list li");
    let total = 0;
    const guests = parseInt(document.getElementById("guests").value || "1");
    items.forEach(li => {
        const price = parseFloat(li.children[3].value || 0);
        const quantity = parseFloat(li.children[1].value || 1);
        total += price;
    });
    if (guests > 0) {
        total = (total / guests);
    }
    document.getElementById("price").textContent = `${round(total).toFixed(2)} CHF / pers.`;
}

document.getElementById("guests").addEventListener("input", updatePrice);

document.getElementById("ingredient-list").addEventListener("input", updatePrice);

// Drag and Drop Image Upload
const imageSection = document.querySelector(".images");
const dropArea = document.createElement("div");
dropArea.className = "drop-area";
dropArea.innerHTML = "<p>Glissez-déposez les images ici ou cliquez pour en ajouter</p>";
const input = document.createElement("input");
input.type = "file";
input.accept = "image/*";
input.multiple = true;
dropArea.appendChild(input);
dropArea.addEventListener("click", () => input.click());
imageSection.appendChild(dropArea);

['dragenter', 'dragover'].forEach(e => dropArea.addEventListener(e, ev => {
    ev.preventDefault();
    dropArea.classList.add("highlight");
}));
['dragleave', 'drop'].forEach(e => dropArea.addEventListener(e, ev => {
    ev.preventDefault();
    dropArea.classList.remove("highlight");
}));

dropArea.addEventListener("drop", handleFiles);
input.addEventListener("change", () => handleFiles({ dataTransfer: { files: input.files } }));

function handleFiles(e) {
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => {
            imageFiles.push({
                name: `${document.getElementById('recipe-title').value.replace(/\s+/g, '_')}_${imageFiles.length + 1}.jpg`,
                data: reader.result.split(',')[1] // remove metadata prefix
            });
            updateImagePreviews();
        };
        reader.readAsDataURL(file);
    });
}

function showImagePreview(src, index) {
    const container = document.createElement("div");
    container.className = "image-container";

    const img = document.createElement("img");
    img.src = src;
    img.className = "thumb";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-image";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Supprimer cette image";
    removeBtn.onclick = () => {
        imageFiles.splice(index, 1);
        container.remove();
        updateImagePreviews();
    };

    container.appendChild(img);
    container.appendChild(removeBtn);
    imageSection.appendChild(container);
}

function updateImagePreviews() {
    // Clear current previews
    document.querySelectorAll(".image-container").forEach(c => c.remove());

    // Re-render all images
    imageFiles.forEach((imgFile, index) => {
        const base64 = `data:image/jpeg;base64,${imgFile.data}`;
        showImagePreview(base64, index);
    });
}

function buildRecipe() {
    const guests = parseInt(document.getElementById('guests').value) || 1;
    const ingredients = Array.from(document.querySelectorAll("#ingredient-list li")).map(li => {
        const quantity = parseFloat(li.children[1].value || 0);
        const price = round(parseFloat(li.children[3].value || 0) / guests).toFixed(2);
        return {
            name: li.children[0].value,
            quantity: quantity.toFixed(2),
            unit: li.children[2].value,
            price: round(price),
        };
    });

    const totalPrice = ingredients.reduce((acc, i) => acc + (i.price || 0), 0);

    return {
        id: document.getElementById('recipe-title').value.replace(/\s+/g, '_'),
        title: document.getElementById('recipe-title').value,
        rating: love,
        difficulty: difficulty,
        prepTime: parseInt(document.getElementById('prep-time').value),
        cookTime: parseInt(document.getElementById('cook-time').value),
        rest: document.getElementById('rest').checked,
        tags: document.getElementById('tags').value.split(',').map(t => {
            const trimmedTag = t.trim();
            return trimmedTag.charAt(0).toUpperCase() + trimmedTag.slice(1);
        }).filter(t => t),
        guests: guests,
        ingredients: ingredients,
        instructions: document.getElementById('instructions').value,
        tips: document.getElementById('tips').value,
        cook: document.getElementById('cook').value,
        url: document.getElementById('url').value,
        images: imageFiles.map(f => `resources/${f.name}`) // défini lors du drag-drop, voir imageHandler
    };
}

async function exportRecipe() {
    const ingredients = Array.from(document.querySelectorAll("#ingredient-list li")).map(li => {
        return {
            name: li.children[0].value,
            quantity: parseFloat(li.children[1].value || 0),
            unit: li.children[2].value,
            price: parseFloat(li.children[3].value || 0),
        };
    });

    const recipe = buildRecipe();

    const zip = new JSZip();

    // Add the JSON file
    const recipeFilename = `${recipe.id}.json`;
    zip.file(recipeFilename, JSON.stringify(recipe, null, 2));

    // Add image files (base64 -> binary)
    imageFiles.forEach(file => {
        zip.file(`resources/${file.name}`, file.data, { base64: true });
    });

    // Generate and download the zip
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `${recipe.id}.zip`;
    a.click();
}
