/* js/main.js */
const recipeFiles = [
    "poulet_frit_coreen",
    // Add other recipe filenames here
];

const recipeList = document.getElementById("recipe-list");

function createRecipeCard(recipe) {
    const card = document.createElement("div");
    card.className = "recipe";

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

    let price = 0;
    recipe.ingredients.forEach(e => {
            price += e.price;
    });
    price = Math.round(price / 0.05) * 0.05;

    card.innerHTML = `
        <a href="recipe.html?id=${recipe.id}">
            <div class="image-wrapper"><img src="${recipe.images[0]}" alt="${recipe.name}" /></div>
            <div class="content">
                <h3>${recipe.title}</h3>
                <p>Note : ${getHearts(recipe.rating)}
                <br>Difficulté : ${getDifficulty(recipe.difficulty)}
                <br>Temps : ${recipe.prepTime + recipe.cookTime}${recipe.rest ? " + repos" : ""}
                <br>Prix : ${price.toFixed(2)} / personne</p>
                <div class="tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </a>
    `;
    return card;
}

function displayRecipes(data) {
    recipeList.querySelectorAll(".recipe:not(.add-new)").forEach(e => e.remove());
    data.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipeList.appendChild(card);
    });
}

let currentSearchTerm = "";
const activeTags = new Set();

const searchInput = document.getElementById("search");
const filterToggle = document.getElementById("filter-toggle");

function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tag = button.textContent;

            if (activeTags.has(tag)) {
                activeTags.delete(tag);
                button.classList.remove("active");
            } else {
                activeTags.add(tag);
                button.classList.add("active");
            }

            updateFilterIcon();
            filterAndDisplayRecipes();
        });
    });

    filterToggle.addEventListener("click", () => {
        if (activeTags.size > 0) {
            activeTags.clear();
            document.querySelectorAll(".filter.active").forEach(btn => btn.classList.remove("active"));
            updateFilterIcon();
            filterAndDisplayRecipes();
        }
    });
}

function filterAndDisplayRecipes() {
    // First filter by search
    let filtered = recipes.filter(r =>
        r.title.toLowerCase().includes(currentSearchTerm) ||
        r.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm))
    );

    // Then filter by tags if any active
    if (activeTags.size > 0) {
        filtered = filtered.filter(recipe =>
            Array.from(activeTags).every(tag => recipe.tags.includes(tag))
        );
    }

    displayRecipes(filtered);
}

searchInput.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value.toLowerCase();
    filterAndDisplayRecipes();
});

function updateFilterIcon() {
    if (activeTags.size > 0) {
        filterToggle.classList.remove("fa-filter");
        filterToggle.classList.add("fa-filter-circle-xmark");
        filterToggle.title = "Effacer tous les filtres";
    } else {
        filterToggle.classList.remove("fa-filter-circle-xmark");
        filterToggle.classList.add("fa-filter");
        filterToggle.title = "Filtrer";
    }
}

window.onload = () => {
    // Fetch all recipes from individual JSON files
    Promise.all(recipeFiles.map(fileName => fetch(`./resources/${fileName}.json`)
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error(`Error loading recipe ${fileName}:`, error);
            return null;
        })
    ))
    .then(recipesData => {
        // Filter out any null results in case some recipes failed to load
        recipesData = recipesData.filter(recipe => recipe !== null);
        recipes = recipesData;  // Store the fetched recipes
        displayRecipes(recipes);
    });
    setupFilters();
    updateFilterIcon();
}