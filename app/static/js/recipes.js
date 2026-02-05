// Recipe search and management

let allIngredients = [];
let currentRecipe = null;

// Load ingredients on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadIngredients();
    
    // Add enter key support for search
    document.getElementById('ingredientInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    });
});

async function loadIngredients() {
    try {
        const response = await fetch('/api/recipes/ingredients');
        const data = await response.json();
        
        if (data.success) {
            allIngredients = data.ingredients;
            populateDatalist();
        }
    } catch (error) {
        console.error('Error loading ingredients:', error);
    }
}

function populateDatalist() {
    const datalist = document.getElementById('ingredientsList');
    datalist.innerHTML = '';
    
    allIngredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient;
        datalist.appendChild(option);
    });
}

async function searchRecipes() {
    const ingredient = document.getElementById('ingredientInput').value.trim();
    
    if (!ingredient) {
        showToast('Please enter an ingredient', 'error');
        return;
    }
    
    // Show loading
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    
    try {
        const response = await fetch(`/api/recipes/search?ingredient=${encodeURIComponent(ingredient)}`);
        const data = await response.json();
        
        document.getElementById('loadingSpinner').style.display = 'none';
        
        if (data.success && data.meals && data.meals.length > 0) {
            displayRecipes(data.meals);
        } else {
            document.getElementById('noResults').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        showToast('Error searching recipes: ' + error.message, 'error');
    }
}

function displayRecipes(meals) {
    const grid = document.getElementById('recipesGrid');
    grid.innerHTML = '';
    
    meals.forEach((meal, index) => {
        const col = document.createElement('div');
        col.className = 'col';
        col.style.animationDelay = `${index * 0.1}s`;
        col.innerHTML = `
            <div class="card recipe-card shadow-sm" onclick="showRecipeDetail('${meal.idMeal}')">
                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}" loading="lazy">
                <div class="card-body">
                    <h5 class="card-title">${meal.strMeal}</h5>
                    <button class="btn btn-primary btn-sm w-100 mt-2">
                        <i class="bi bi-eye"></i> View Recipe
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
    
    document.getElementById('resultsSection').style.display = 'block';
    
    // Trigger animation
    setTimeout(() => {
        grid.classList.add('fade-in');
    }, 10);
}

async function showRecipeDetail(mealId) {
    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    const modalBody = document.getElementById('recipeModalBody');
    
    // Show loading in modal
    modalBody.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading recipe details...</p>
        </div>
    `;
    
    modal.show();
    
    try {
        const response = await fetch(`/api/recipes/detail/${mealId}`);
        const data = await response.json();
        
        if (data.success && data.recipe) {
            currentRecipe = data.recipe;
            displayRecipeDetail(data.recipe);
        } else {
            modalBody.innerHTML = '<div class="alert alert-danger">Error loading recipe details</div>';
        }
    } catch (error) {
        modalBody.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
}

function displayRecipeDetail(recipe) {
    const modalLabel = document.getElementById('recipeModalLabel');
    const modalBody = document.getElementById('recipeModalBody');
    
    modalLabel.textContent = recipe.strMeal;
    
    // Build ingredients list
    let ingredientsHTML = recipe.ingredients.map(item => `
        <div class="ingredient-item">
            <span class="ingredient-measure">${item.measure}</span> ${item.ingredient}
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <div class="recipe-detail">
            <img src="${recipe.strMealThumb}" class="img-fluid rounded mb-3" alt="${recipe.strMeal}">
            
            <div class="mb-3">
                ${recipe.strCategory ? `<span class="badge bg-primary me-2">${recipe.strCategory}</span>` : ''}
                ${recipe.strArea ? `<span class="badge bg-success">${recipe.strArea}</span>` : ''}
            </div>
            
            <h5><i class="bi bi-list-check"></i> Ingredients</h5>
            <div class="mb-4">
                ${ingredientsHTML}
            </div>
            
            <h5><i class="bi bi-book"></i> Instructions</h5>
            <div class="instructions-text mb-3">
                ${recipe.strInstructions}
            </div>
            
            ${recipe.strYoutube ? `
                <div class="mb-3">
                    <a href="${recipe.strYoutube}" target="_blank" class="btn btn-danger">
                        <i class="bi bi-youtube"></i> Watch Video Tutorial
                    </a>
                </div>
            ` : ''}
        </div>
    `;
}

async function saveCurrentRecipe() {
    if (!currentRecipe) {
        showToast('No recipe selected', 'error');
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        showToast('Please login to save recipes', 'error');
        handleAuth();
        return;
    }
    
    try {
        const saveRecipeBtn = document.getElementById('saveRecipeBtn');
        saveRecipeBtn.disabled = true;
        saveRecipeBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
        
        const response = await fetch('/api/recipes/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                meal_id: currentRecipe.idMeal,
                meal_name: currentRecipe.strMeal,
                meal_thumb: currentRecipe.strMealThumb,
                category: currentRecipe.strCategory,
                area: currentRecipe.strArea,
                instructions: currentRecipe.strInstructions,
                ingredients: currentRecipe.ingredients
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Recipe saved successfully!', 'success');
            saveRecipeBtn.innerHTML = '<i class="bi bi-check-circle"></i> Saved!';
            
            setTimeout(() => {
                saveRecipeBtn.disabled = false;
                saveRecipeBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i> Save Recipe';
            }, 2000);
        } else {
            throw new Error(data.detail || 'Error saving recipe');
        }
    } catch (error) {
        showToast('Error saving recipe: ' + error.message, 'error');
        saveRecipeBtn.disabled = false;
        saveRecipeBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i> Save Recipe';
    }
}