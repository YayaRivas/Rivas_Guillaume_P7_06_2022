export default class RecipeFactory {
    constructor(objetRecipe) {
        this.objetRecipe = objetRecipe;
    }

    // retourne le html <article> à partir d'un objet recette
    createRecipeCards() {
        const articleRecipe = document.createElement("article");
        articleRecipe.innerHTML = `
        <div class="imgRecette"></div>
        <div class="legende">
            <div class="titre">
                <h2>${this.objetRecipe.name}</h2>
                <span><img src="assets/icons/clock.svg" alt="" />${this.objetRecipe.time} min</span>
            </div>
            <div class="description">
                <ul>
                    ${this.createLiIngredients()}
                </ul>
                <p>${this.objetRecipe.description}</p>
            </div>
        </div>`;
        return articleRecipe
    }

    /* retourne des listes <li> d'ingrédients à partir tableau ingrédients */
    createLiIngredients() {
        let newLiIngredient = "";
        /* boucle sur le tableau d'ingrédients et crée <li> avec propriétés quantity et unit si elles existent, retire le ":" si elles n'existent pas */
        for (let el of this.objetRecipe.ingredients) {
            newLiIngredient = newLiIngredient + `<li><span>${el.ingredient}${(el.quantity) ? ":" : ""}</span> ${el.quantity || ""} ${el.unit || ""}</li>`;
        }
        return newLiIngredient
    }
}