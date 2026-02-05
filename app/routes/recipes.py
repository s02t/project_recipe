from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import httpx
from firebase_admin import firestore
from app.firebase_config import get_firestore_client
from app.routes.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1"

class SaveRecipeRequest(BaseModel):
    meal_id: str
    meal_name: str
    meal_thumb: str
    category: Optional[str] = None
    area: Optional[str] = None
    instructions: str
    ingredients: List[dict]

@router.get("/ingredients")
async def get_all_ingredients():
    """Fetch all available ingredients from MealDB API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{MEALDB_BASE_URL}/list.php?i=list")
            response.raise_for_status()
            data = response.json()
            
            if data and 'meals' in data:
                ingredients = [meal['strIngredient'] for meal in data['meals'] if meal['strIngredient']]
                return {"success": True, "ingredients": sorted(ingredients)}
            return {"success": False, "ingredients": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching ingredients: {str(e)}")

@router.get("/search")
async def search_by_ingredient(ingredient: str):
    """Search recipes by main ingredient"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{MEALDB_BASE_URL}/filter.php?i={ingredient}")
            response.raise_for_status()
            data = response.json()
            
            if data and data.get('meals'):
                return {"success": True, "meals": data['meals']}
            return {"success": False, "meals": [], "message": "No recipes found for this ingredient"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching recipes: {str(e)}")

@router.get("/detail/{meal_id}")
async def get_recipe_detail(meal_id: str):
    """Get detailed recipe information by meal ID"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{MEALDB_BASE_URL}/lookup.php?i={meal_id}")
            response.raise_for_status()
            data = response.json()
            
            if data and data.get('meals'):
                meal = data['meals'][0]
                
                # Extract ingredients and measures
                ingredients = []
                for i in range(1, 21):
                    ingredient = meal.get(f'strIngredient{i}')
                    measure = meal.get(f'strMeasure{i}')
                    if ingredient and ingredient.strip():
                        ingredients.append({
                            "ingredient": ingredient.strip(),
                            "measure": measure.strip() if measure else ""
                        })
                
                recipe = {
                    "idMeal": meal['idMeal'],
                    "strMeal": meal['strMeal'],
                    "strCategory": meal.get('strCategory'),
                    "strArea": meal.get('strArea'),
                    "strInstructions": meal['strInstructions'],
                    "strMealThumb": meal['strMealThumb'],
                    "strYoutube": meal.get('strYoutube'),
                    "ingredients": ingredients
                }
                
                return {"success": True, "recipe": recipe}
            return {"success": False, "message": "Recipe not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recipe details: {str(e)}")

@router.post("/save")
async def save_recipe(recipe: SaveRecipeRequest, current_user: dict = Depends(get_current_user)):
    """Save a recipe to user's collection in Firestore"""
    try:
        db = get_firestore_client()
        
        # Create recipe document
        recipe_data = {
            "meal_id": recipe.meal_id,
            "meal_name": recipe.meal_name,
            "meal_thumb": recipe.meal_thumb,
            "category": recipe.category,
            "area": recipe.area,
            "instructions": recipe.instructions,
            "ingredients": recipe.ingredients,
            "user_id": current_user['uid'],
            "saved_at": datetime.utcnow().isoformat()
        }
        
        # Save to Firestore under user's collection
        doc_ref = db.collection('users').document(current_user['uid']).collection('saved_recipes').document(recipe.meal_id)
        doc_ref.set(recipe_data)
        
        return {"success": True, "message": "Recipe saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving recipe: {str(e)}")

@router.get("/saved")
async def get_saved_recipes(current_user: dict = Depends(get_current_user)):
    """Get all saved recipes for the current user"""
    try:
        db = get_firestore_client()
        
        # Fetch saved recipes
        recipes_ref = db.collection('users').document(current_user['uid']).collection('saved_recipes')
        recipes = recipes_ref.order_by('saved_at', direction=firestore.Query.DESCENDING).stream()
        
        saved_recipes = []
        for recipe in recipes:
            recipe_data = recipe.to_dict()
            saved_recipes.append(recipe_data)
        
        return {"success": True, "recipes": saved_recipes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching saved recipes: {str(e)}")

@router.delete("/saved/{meal_id}")
async def delete_saved_recipe(meal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a saved recipe"""
    try:
        db = get_firestore_client()
        
        doc_ref = db.collection('users').document(current_user['uid']).collection('saved_recipes').document(meal_id)
        doc_ref.delete()
        
        return {"success": True, "message": "Recipe deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting recipe: {str(e)}")
