// js/groceryList.js

/**
 * @file Manages the grocery list functionality, including adding, removing,
 * ticking items, and saving/loading the list from local storage.
 */

// --- DOM Element References ---
const newItemInput = document.getElementById('new-item-input');
const addItemButton = document.getElementById('add-item-button');
const groceryItemsList = document.getElementById('grocery-items');
const clearAllButton = document.getElementById('clear-all-button');

// --- Global Variable for Grocery List ---
/**
 * @type {Array<Object>} Stores grocery list items. Each object has `text: string` and `checked: boolean`.
 */
let groceryList = [];

// --- Utility Functions ---

/**
 * Saves the current grocery list to local storage.
 */
function saveGroceryList() {
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
}

/**
 * Loads the grocery list from local storage and renders it.
 */
function loadGroceryList() {
    const savedList = localStorage.getItem('groceryList');
    if (savedList) {
        groceryList = JSON.parse(savedList);
        renderGroceryList();
    }
}

/**
 * Renders all items in the `groceryList` array to the DOM.
 */
function renderGroceryList() {
    groceryItemsList.innerHTML = ''; // Clear existing list

    groceryList.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = item.checked ? 'checked' : '';
        li.setAttribute('data-index', index); // Store index for easy access

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked;
        checkbox.addEventListener('change', () => toggleItemChecked(index));

        const span = document.createElement('span');
        span.textContent = item.text;

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-item';
        removeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>'; // Font Awesome X icon
        removeButton.addEventListener('click', () => removeItem(index));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(removeButton);
        groceryItemsList.appendChild(li);
    });
}

// --- Grocery List Actions ---

/**
 * Adds a new item to the grocery list.
 */
function addItem() {
    const itemText = newItemInput.value.trim();
    if (itemText) {
        groceryList.push({ text: itemText, checked: false });
        newItemInput.value = ''; // Clear input
        saveGroceryList();
        renderGroceryList();
    }
}

/**
 * Toggles the 'checked' status of a grocery item.
 * @param {number} index - The index of the item to toggle.
 */
function toggleItemChecked(index) {
    if (groceryList[index]) {
        groceryList[index].checked = !groceryList[index].checked;
        saveGroceryList();
        renderGroceryList(); // Re-render to update class
    }
}

/**
 * Removes an item from the grocery list.
 * @param {number} index - The index of the item to remove.
 */
function removeItem(index) {
    if (groceryList[index]) {
        groceryList.splice(index, 1); // Remove 1 element at the specified index
        saveGroceryList();
        renderGroceryList();
    }
}

/**
 * Clears all items from the grocery list.
 */
function clearAllItems() {
    if (confirm("Êtes-vous sûr de vouloir effacer toute la liste de courses ?")) {
        groceryList = [];
        saveGroceryList();
        renderGroceryList();
    }
}

// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Load existing list on page load
    loadGroceryList();

    // Event listeners for adding items
    addItemButton.addEventListener('click', addItem);
    newItemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    });

    // Event listener for clearing all items
    clearAllButton.addEventListener('click', clearAllItems);
});