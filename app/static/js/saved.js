// Saved recipes page

let currentRecipeToDelete = null;

// Load saved recipes when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check auth state
    window.addEventListener('userAuthenticated', loadSavedRecipes);
    window.addEventListener('userSignedOut', showAuthRequired);
    
    // Check if user is already authenticated
    const user = window.firebaseAuth.currentUser;
    if (user) {
        loadSavedRecipes();
    } else {
        // Wait a bit for auth state to be determined
        setTimeout(() => {
            const user = window.firebaseAuth.currentUser;
            if (!user) {
                showAuthRequired();
            }
        }, 1000);
    }
});

function showAuthRequired() {
    document.getElementById('authRequiredMessage').style.display = 'block';
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('savedRecipesSection').style.display = 'none';
    document.getElementById('noSavedRecipes').style.display = 'none';
}

async function loadSavedRecipes() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        showAuthRequired();
        return;
    }
    
    // Show loading
    document.getElementById('authRequiredMessage').style.display = 'none';
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('savedRecipesSection').style.display = 'none';
    document.getElementById('noSavedRecipes').style.display = 'none';
    
    try {
        const response = await fetch('/api/recipes/saved', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        document.getElementById('loadingSpinner').style.display = 'none';
        
        if (response.ok && data.success) {
            if (data.recipes && data.recipes.length > 0) {
                displaySavedRecipes(data.recipes);
            } else {
                document.getElementById('noSavedRecipes').style.display = 'block';
            }
        } else {
            if (response.status === 401) {
                showAuthRequired();
            } else {
                showToast('Error loading recipes: ' + (data.detail || 'Unknown error'), 'error');
            }
        }
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        showToast('Error loading recipes: ' + error.message, 'error');
    }
}

function displaySavedRecipes(recipes) {
    const grid = document.getElementById('savedRecipesGrid');
    grid.innerHTML = '';
    
    recipes.forEach((recipe, index) => {
        const col = document.createElement('div');
        col.className = 'col';
        col.style.animationDelay = `${index * 0.1}s`;
        col.innerHTML = `
            <div class="card recipe-card shadow-sm" onclick="showSavedRecipeDetail('${recipe.meal_id}', ${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                <img src="${recipe.meal_thumb}" class="card-img-top" alt="${recipe.meal_name}" loading="lazy">
                <div class="card-body">
                    <h5 class="card-title">${recipe.meal_name}</h5>
                    <div class="mb-2">
                        ${recipe.category ? `<span class="badge bg-primary me-1">${recipe.category}</span>` : ''}
                        ${recipe.area ? `<span class="badge bg-success">${recipe.area}</span>` : ''}
                    </div>
                    <button class="btn btn-primary btn-sm w-100 mt-2">
                        <i class="bi bi-eye"></i> View Recipe
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
    
    document.getElementById('savedRecipesSection').style.display = 'block';
    
    // Trigger animation
    setTimeout(() => {
        grid.classList.add('fade-in');
    }, 10);
}

function showSavedRecipeDetail(mealId, recipeData) {
    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    const modalLabel = document.getElementById('recipeModalLabel');
    const modalBody = document.getElementById('recipeModalBody');
    
    currentRecipeToDelete = mealId;
    
    modalLabel.textContent = recipeData.meal_name;
    
    // Build ingredients list
    let ingredientsHTML = recipeData.ingredients.map(item => `
        <div class="ingredient-item">
            <span class="ingredient-measure">${item.measure}</span> ${item.ingredient}
        </div>
    `).join('');
    
    modalBody.innerHTML = `
        <div class="recipe-detail">
            <img src="${recipeData.meal_thumb}" class="img-fluid rounded mb-3" alt="${recipeData.meal_name}">
            
            <div class="mb-3">
                ${recipeData.category ? `<span class="badge bg-primary me-2">${recipeData.category}</span>` : ''}
                ${recipeData.area ? `<span class="badge bg-success">${recipeData.area}</span>` : ''}
            </div>
            
            <h5><i class="bi bi-list-check"></i> Ingredients</h5>
            <div class="mb-4">
                ${ingredientsHTML}
            </div>
            
            <h5><i class="bi bi-book"></i> Instructions</h5>
            <div class="instructions-text mb-3">
                ${recipeData.instructions}
            </div>
            
            <div class="text-muted small">
                <i class="bi bi-calendar"></i> Saved on ${new Date(recipeData.saved_at).toLocaleDateString()}
            </div>
        </div>
    `;
    
    modal.show();
}

async function deleteCurrentRecipe() {
    if (!currentRecipeToDelete) {
        return;
    }
    
    if (!confirm('Are you sure you want to delete this recipe?')) {
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        showToast('Please login to delete recipes', 'error');
        return;
    }
    
    try {
        const deleteBtn = document.getElementById('deleteRecipeBtn');
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
        
        const response = await fetch(`/api/recipes/saved/${currentRecipeToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Recipe deleted successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('recipeModal'));
            modal.hide();
            
            // Reload recipes
            loadSavedRecipes();
        } else {
            throw new Error(data.detail || 'Error deleting recipe');
        }
    } catch (error) {
        showToast('Error deleting recipe: ' + error.message, 'error');
        const deleteBtn = document.getElementById('deleteRecipeBtn');
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Delete';
    }
}