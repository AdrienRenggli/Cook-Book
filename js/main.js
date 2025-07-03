/* js/main.js */
const recipes = [
    {
        id: "poulet_frit_coreen",
        title: "Poulet Frit Coréen",
        image: "resources/poulet_frit_coreen_1.jpg",
        tags: ["Asiatique", "Carnivore", "Plat principal"],
        difficulty: 4,
        rating: 5,
        time: "55 min + repos",
        price: "4.25 CHF"
  },
  {
        id: "moelleux_chocolat",
        title: "Moelleux au Chocolat",
        image: "resources/moelleux_chocolat_1.jpg",
        tags: ["Dessert", "Végétarien"],
        difficulty: 3,
        rating: 4,
        time: "40 min",
        price: "2.50 CHF"
  },
  // More recipes...
];

const recipeList = document.getElementById("recipe-list");

function createRecipeCard(recipe) {
    const card = document.createElement("div");
    card.className = "recipe";

    const getHearts = (count) => {
        let hearts = '';
        for (let i = 0; i < 5; i++) {
            if (i < count)
                hearts += '<i class="fa-solid fa-heart" style="color: red; margin-right: 2px;"></i>';
            else 
                hearts += '<i class="fa-regular fa-heart" style="color: red; margin-right: 2px;"></i>';
        }
        return hearts;
    }

    const getUtensils = (count) => {
        let utensils = '';
        for (let i = 0; i < 5; i++) {
            if (i < count)
                utensils += '<i class="fa-solid fa-star" style="margin-right: 2px;"></i>';
            else 
                utensils += '<i class="fa-regular fa-star" style="margin-right: 2px;"></i>';
        }
        return utensils;
    }

    card.innerHTML = `
        <a href="recipe.html?id=${recipe.id}">
            <div class="image-wrapper"><img src="${recipe.image}" alt="${recipe.title}" /></div>
            <div class="content">
                <h3>${recipe.title}</h3>
                <p>Note : ${getHearts(recipe.rating)}
                <br>Difficulté : ${getUtensils(recipe.difficulty)}
                <br>Temps : ${recipe.time}
                <br>Prix : ${recipe.price} / personne</p>
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
    displayRecipes(recipes)
    setupFilters();
    updateFilterIcon()
}
