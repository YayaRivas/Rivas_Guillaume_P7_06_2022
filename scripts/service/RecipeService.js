import Recipe from "../model/Recipe.js";

export default class RecipeService {
    constructor() {
        this.recipes = [];
        this.originalRecipes = [];
    }

    /* Récupération data fetch: tableau recette -> tableau instance recette  */
    async fetchData() {
        return fetch("data/recipes.json")  // Promise résolue: serveur répond
            .then((response) => {          // Promise résolue: data chargée  
                return response.json();
            })
            .then(({ recipes }) => {       // Promise résolue: retourne data
                // Recipes ->  [{..}, {..},] 50 objets recette
                // map -> 50 instances de class Recipe
                this.recipes = recipes.map((objRecipe) => {
                    const recipesInst = new Recipe(objRecipe);
                    return recipesInst;
                });
                this.originalRecipes = [...this.recipes];
            })
    }

    // Retourne liste ingrédients du tableau recette
    // Si recherche filtre -> filte ingrédients qui match avec saisie
    getIngredientsList(filteredRecipes, exclusionList, saisie) {

        // Transformation array d'objet recette -> array de liste d'ingrédients
        // map sur filteredRecipes si existe, sinon sur tableau recettes non modifié
        let listIngredients = (filteredRecipes || this.recipes).map((objRecette) => {
            return objRecette.ingredients.map((objIngredient) => {
                return objIngredient.ingredient.toLowerCase()
            });
        });

        // Array d'array liste -> array string liste, supprime 1 imbrication    
        listIngredients = listIngredients.flat();

        // Obj Set -> supprime doublons, spread [... set] conversion set -> array
        listIngredients = [... new Set(listIngredients)];

        // Si saisie filtre: filtrer liste fonction saisie
        if (saisie) {
            listIngredients = this.filterListByCapture(listIngredients, saisie)
        }

        // Formatage liste
        listIngredients = this.formateList(listIngredients);

        // Supression des noms tags de la liste via liste d'exclusion
        if (exclusionList) {
            exclusionList.forEach((el) => {
                // Si l'élément existe, le retirer de la liste
                if (listIngredients.indexOf(el) !== -1) {
                    listIngredients.splice(listIngredients.indexOf(el), 1);
                }
            })
        }
        return listIngredients
    }

    // Retourne liste appareils du tableau recette
    getAppareilsList(filteredRecipes, exclusionList, saisie) {

        // Transformation array d'objet recette -> array de liste d'appareils
        let listAppareils = (filteredRecipes || this.recipes).map((el) => {
            return el.appliance.toLowerCase()
        })

        // Obj Set -> supprime doublons, spread [... set] conversion set -> array
        listAppareils = [... new Set(listAppareils)];

        // Si saisie: filtrer liste fonction saisie
        if (saisie) {
            listAppareils = this.filterListByCapture(listAppareils, saisie)
        }

        // Formatage liste
        listAppareils = this.formateList(listAppareils)

        // Liste exclusion tags
        if (exclusionList) {
            exclusionList.forEach((el) => {
                // Si l'élément existe, le retirer de la liste
                if (listAppareils.indexOf(el) !== -1) {
                    listAppareils.splice(listAppareils.indexOf(el), 1);
                }
            })
        }
        return listAppareils
    }

    // Retourne liste ustensiles du tableau recette
    getUstensilList(filteredRecipes, exclusionList, saisie) {

        // Transformation array d'objet recette -> array de liste d'appareils
        let listUstensils = (filteredRecipes || this.recipes).map((el) => {
            return el.ustensils.map((el) => {
                return el.toLowerCase();
            })
        })

        // Supprime 1 imbrication  
        listUstensils = listUstensils.flat();

        // Obj Set -> supprime doublons, spread [... set] conversion set -> array
        listUstensils = [... new Set(listUstensils)];

        // Si saisie: filtrer liste fonction saisie
        if (saisie) {
            listUstensils = this.filterListByCapture(listUstensils, saisie)
        }

        // Formatage liste
        listUstensils = this.formateList(listUstensils);

        // Liste exclusion tags
        if (exclusionList) {
            exclusionList.forEach((el) => {
                // Si l'élément existe, le retirer de la liste
                if (listUstensils.indexOf(el) !== -1) {
                    listUstensils.splice(listUstensils.indexOf(el), 1);
                }
            })
        }
        return listUstensils
    }

    // Formatage liste
    formateList(list) {
        // Ajoute une maj sur 1er caractère
        list = list.map((el) => {
            return el[0].toUpperCase() + el.slice(1)
        })
        // Retourne liste classée dans l'ordre alphabétique
        return list.sort((a, b) => {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0
        })
    }

    // Trie la liste en fonction de la saisie dans filtre
    filterListByCapture(listIngredients, saisieIngredient) {
        // Filtre l'array de string ingrédients en fct saisie
        return listIngredients = listIngredients.filter((el) => {
            return el.indexOf(saisieIngredient.toLowerCase()) > -1
        });
    }

    /* Filtre tableau de recettes en fonction d'un tableau de tags, si pas de tag, pas de modification de filteredRecipes */
    filterByArrayTag(selectedTags) {

        // Remise état origine tableau recette
        let filteredRecipes = [...this.originalRecipes];

        // Filtre tableau recette en fonction tableau de tags
        // Pour chaque tag, on filtre une nouvelle fois filteredRecipes
        for (let i in selectedTags) {
            selectedTags[i].forEach((tagName) => {
                filteredRecipes = this.filterByTag(i, tagName, filteredRecipes)
            })
        }
        return filteredRecipes
    }


    // Filtre le tableau recettes ils si contiennent le nom d'un tag
    filterByTag(filterType, tagName, filteredRecipes) {
        /* Si tableau d'objet ingrédients contient string tag -> retourne l'objet recette */
        if (filterType === "ingredientList") {
            filteredRecipes = filteredRecipes.filter((objRecipe) => {
                return objRecipe.ingredients.find((el) => {
                    return el.ingredient.toLowerCase() === tagName.toLowerCase();
                })
            })
            /* Si valeur de propriété appliance = string tag -> retourne objet recette */
        } else if (filterType === "appareilList") {
            filteredRecipes = filteredRecipes.filter((el) => {
                return el.appliance.toLowerCase() === tagName.toLowerCase();
            })
            /* Si le tableau ustensils contient string tag -> retourne objet recette */
        } else if (filterType === "ustensilList") {
            filteredRecipes = filteredRecipes.filter((el) => {
                return el.ustensils.find((el) => {
                    return el.toLowerCase() === tagName.toLowerCase();
                })
            })
        }
        return filteredRecipes;
    }


    // Retourne tableau recettes en fonction saisie recherche principale
    mainSearch(saisie, filteredRecipes) {
        const recipeFiltered = [];
        const saisieLow = saisie.toLowerCase();

        filteredRecipes.forEach((instRecipe) => {
            const nameLow = instRecipe.name.toLowerCase();
            const descriptionLow = instRecipe.description.toLowerCase();

            // Si saisie contenue dans nom recette, ajoute recette
            if (nameLow.includes(saisieLow)) {
                recipeFiltered.push(instRecipe)
            }
            // Ou si saisie contenue dans description recette, ajoute recette
            else if (descriptionLow.includes(saisieLow)) {
                recipeFiltered.push(instRecipe)
            }
            // Ou si saisie contenue dans liste d'ingrédients, ajoute recette
            else {
                instRecipe.ingredients.forEach((ingredients) => {
                    const ingredientLow = ingredients.ingredient.toLowerCase();
                    if (ingredientLow.includes(saisieLow)) {
                        recipeFiltered.push(instRecipe)
                    }
                })
            }
        })
        return recipeFiltered
    }
}