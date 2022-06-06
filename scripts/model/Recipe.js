export default class Recipe {
    constructor(objetRecipe) {

        this.description = objetRecipe.description;
        this.id = objetRecipe.id;
        // Formatage de la propriété quantity écrite "quantity" ou "quantite"
        this.ingredients = objetRecipe.ingredients.map(function (el) {
            return {
                ingredient: el.ingredient,
                quantity: el.quantity || el.quantite,
                unit: el.unit
            }
        });
        this.name = objetRecipe.name;
        this.servings = objetRecipe.servings;
        this.time = objetRecipe.time;
        this.ustensils = objetRecipe.ustensils;
        /* si appliance = "Casserolle."" ou "Casserolle", alors appliance = "casserole", sinon appliance = appliance */
        this.appliance = (objetRecipe.appliance === "Casserolle."
            || objetRecipe.appliance === "Casserolle") ? "casserole" : objetRecipe.appliance;
    }
}