import RecipeService from "../service/RecipeService.js";
import RecipeFactory from "../factories/RecipeFactory.js";

/*** Déclarations globales ***/
let filteredRecipes = [];
let originalRecipes = [];

// Saisie recherche globale valide ou pas
let validSearch = "";

let selectedTags = {
   ingredientList: [],
   appareilList: [],
   ustensilList: []
};

// Instance globale de class RecipeService
const recipeService = new RecipeService();

/* Récupère tableau recipe via fetch */
async function init() {

   /************
   *************     FETCH     *******************
   *************/

   /* Récupération data + ajout propriété recipeService: array 50 instances recette */
   await recipeService.fetchData();

   // Initialisation tableaux recettes
   filteredRecipes = [...recipeService.recipes];
   originalRecipes = [...recipeService.recipes];

   // Initialisation affichage des 50 recettes
   recipesDisplay(recipeService.filterByArrayTag());
}
init();


/************
*************     FILTRES     *******************
*************/

/*** Click sur menu dropDown -> ouvre / ferme ***/
const boutonFilter = document.querySelectorAll(".openDropdown");

/* Listener sur 3 filtres: 1er clic: ouvre dropDown, 2eme clic: ferme. Génère la liste en fonction du filtre cliqué */
boutonFilter.forEach((el) => {
   el.addEventListener("click", (event) => {
      // Si <input> filtre cliqué contient class appear
      if (!event.target.nextElementSibling.classList.contains("appear")) {
         /* Crée liste ingrédients en fonction du tableau recette filtré et du tag */
         if (event.target.id === "searchIngredient") {
            createFilterList("#ingredientList", recipeService.getIngredientsList(filteredRecipes, selectedTags.ingredientList));
         }
         else if (event.target.id === "searchAppareil") {
            createFilterList("#appareilList", recipeService.getAppareilsList(filteredRecipes, selectedTags.appareilList));
         }
         else if (event.target.id === "searchUstensil") {
            createFilterList("#ustensilList", recipeService.getUstensilList(filteredRecipes, selectedTags.ustensilList));
         }

         // Ouvre le filtre cliqué, el.target = <input> cliqué
         openDropDown(event.target);

      } else {
         closeDropDown(event.target);
      }
   })
})


/*** Saisie champ recherche filtre ***/
const inputFilter = document.querySelectorAll(".inputFilter");

// Si saisie dans champ de recherche filtre: régénération liste de filtres fonction saisie
inputFilter.forEach((el) => {
   el.addEventListener("change", (event) => {
      const saisie = event.target.value.toLowerCase();
      if (event.target.id === "searchIngredient") {
         createFilterList("#ingredientList", recipeService.getIngredientsList(filteredRecipes, selectedTags.ingredientList, saisie));
      } else if (event.target.id === "searchAppareil") {
         createFilterList("#appareilList", recipeService.getAppareilsList(filteredRecipes, selectedTags.appareilList, saisie));
      } else if (event.target.id === "searchUstensil") {
         createFilterList("#ustensilList", recipeService.getUstensilList(filteredRecipes, selectedTags.ustensilList, saisie));
      }
   })
})

// Crée la liste du filtre et pose un listener click sur chaque élément de la liste
function createFilterList(nodeFilter, filterList) {
   const nodeFilterUl = document.querySelector(nodeFilter);

   // Supression des listes existantes
   nodeFilterUl.innerHTML = null;

   // Si filterList vide
   if (filterList.length === 0) {
      nodeFilterUl.innerHTML = `<span class="noFilter"> Aucun filtre disponible </span>`;

   } else {
      // Ajout des nouvelles listes
      filterList.forEach((el) => {
         const list = document.createElement("li");
         list.classList.add("itemLiFilter");
         list.innerHTML = el;
         nodeFilterUl.appendChild(list);
         // addEventListener sur chaque élément liste créee
         list.addEventListener("click", (event) => onSelectTag(event));
      })
   }
}


/************
 *************     TAG     *******************
 *************/

/********* Ajout tag *********/
function onSelectTag(event) {
   const nodeSectionTag = document.querySelector(".sectionTags");
   const tagName = event.target.textContent;
   const nodeContListUl = event.target.parentElement;

   /****** Clic sur liste ******/
   // Sélectionne <input> 
   closeDropDown(nodeContListUl.previousElementSibling);

   /*** Création du tag ***/
   const tagNode = document.createElement("button");
   tagNode.innerHTML = `${tagName}<img src="assets/icons/croix.svg" alt="" />`;
   tagNode.classList.add("btnTag");
   // Ajout data type de tag + couleur tag
   if (nodeContListUl.id === "ingredientList") {
      tagNode.classList.add("colorIngredient");
      tagNode.setAttribute("data-id", "ingredientList")
   } else if (nodeContListUl.id === "appareilList") {
      tagNode.classList.add("colorAppareil");
      tagNode.setAttribute("data-id", "appareilList")
   } else if (nodeContListUl.id === "ustensilList") {
      tagNode.classList.add("colorUstensil");
      tagNode.setAttribute("data-id", "ustensilList")
   }
   // Génération Tag
   nodeSectionTag.appendChild(tagNode);
   // Ajout listener sur tag crée avec suppression tag si clic
   tagNode.addEventListener("click", (event) => onRemoveTag(event));

   // Ajout du nom du Tag à la liste des Tags sélectionnés 
   selectedTags[nodeContListUl.id].push(tagName);

   // Filtre tableau recette avec le nom du tag
   filteredRecipes = recipeService.filterByTag(event.target.parentElement.id, event.target.textContent, filteredRecipes);

   // Affichage recettes filtrées
   recipesDisplay(filteredRecipes);
}


/********* Suppression tag *********/
// Supprime un tag, filtre le tableau filteredRecipes avec tags restants
function onRemoveTag(event) {

   /* Supression nom tag de la liste du filtre + suppression Tag */
   // idTag -> tag ingredient ou appareil
   const idTag = event.target.dataset.id;

   // Récupération index du nom du tag 
   const indexTag = selectedTags[idTag].indexOf(event.target.textContent);

   // Suppression nom Tag de selectedTags
   selectedTags[idTag].splice(indexTag, 1);

   // Supression tag
   event.target.remove();

   /* Pour chaque tag restant, filteredRecipes est filtré une nouvelle fois */
   filteredRecipes = recipeService.filterByArrayTag(selectedTags);

   // Si saisie valide dans mainSearch: filtrer filteredRecipes   
   if (validSearch) {
      filteredRecipes = recipeService.mainSearch(validSearch, filteredRecipes);
   }

   // Affichage recette filtrées
   recipesDisplay(filteredRecipes);
}


/************
*************     Affichage des recettes     *******************
*************/

function recipesDisplay(arrayRecipe) {

   // Supression des recettes préexistantes
   nodeSectionRecette.innerHTML = null;

   // Affichage html des recettes filtrées par recherche globale (et Tag)
   arrayRecipe.forEach((el) => {
      const recipeFactory = new RecipeFactory(el);
      nodeSectionRecette.appendChild(recipeFactory.createRecipeCards());
   })
}


/************
*************     Recherche principale     *******************
*************/

const nodeSearch = document.querySelector("#mainSearch");
let nodeSectionRecette = document.querySelector(".sectionRecettes");

/* Listener sur recherche principale, si saisie valide -> affiche recettes filtrées, sinon message d'erreur ou retour aux recettes d'origine */
nodeSearch.addEventListener("input", (event) => {

   // Si au moins 3 lettres saisies -> recherche
   if (event.target.value.length > 2) {

      // Extraction valeur saisie
      validSearch = event.target.value;

      /* Modifie tableau filteredRecipes fonction saisie input */
      filteredRecipes = recipeService.mainSearch(event.target.value, filteredRecipes);
      // Si saisie inconnue
      if (filteredRecipes.length === 0) {

         // Reset tableau recette
         filteredRecipes = [...originalRecipes];

         // Filtrage du tableau avec tags si existent
         filteredRecipes = recipeService.filterByArrayTag(selectedTags);

         // Suppression des recettes affichées
         nodeSectionRecette.innerHTML = null;

         // Affichage aucune recette trouvée
         const errorMessage = document.createElement("span");
         errorMessage.textContent = "Aucune recette ne correspond à votre critère... vous pouvez chercher « tarte aux pommes », « poisson », etc.";
         nodeSectionRecette.appendChild(errorMessage);

      } else {

         // Si saisie valide -> affichage recettes
         recipesDisplay(filteredRecipes)
      }

   } else {

      // Si saisie < 3 lettre = pas de saisie
      validSearch = "";

      filteredRecipes = recipeService.filterByArrayTag(selectedTags);
      recipesDisplay(filteredRecipes);
   }
})



/************
*************     Ouverture / fermeture menu dropDown     *******************
*************/

// Fermer/ouvrir menu dropdown:
function openDropDown(filterInputNode) {
   // Appararition dropDown avec width 54%, rotation icone 
   filterInputNode.nextElementSibling.classList.add("appear");
   filterInputNode.parentElement.classList.add("widthFilter");
   filterInputNode.previousElementSibling.classList.add("rotate");

   // Modification <input type="button" vers "search" 
   filterInputNode.setAttribute("type", "search");
   filterInputNode.removeAttribute("value");
   // Changement nom placeholder fonction du filtre cliqué
   if (filterInputNode.id === "searchIngredient") {
      filterInputNode.setAttribute("placeholder", "Rechercher un ingredient");
   } else if (filterInputNode.id === "searchAppareil") {
      filterInputNode.setAttribute("placeholder", "Rechercher un appareil");
   } else if (filterInputNode.id === "searchUstensil") {
      filterInputNode.setAttribute("placeholder", "Rechercher un ustensile");
   }
}
function closeDropDown(filterInputNode) {
   // Disparition dropDown, width réduite, rotation icone 
   filterInputNode.nextElementSibling.classList.remove("appear");
   filterInputNode.parentElement.classList.remove("widthFilter")
   filterInputNode.previousElementSibling.classList.remove("rotate");

   // Modification <input type="search" vers "button" 
   filterInputNode.setAttribute("type", "button");
   filterInputNode.removeAttribute("placeholder");
   // Modification valeur <input> en fonction filtre cliqué
   if (filterInputNode.id === "searchIngredient") {
      filterInputNode.setAttribute("value", "Ingredients")
   } else if (filterInputNode.id === "searchAppareil") {
      filterInputNode.setAttribute("value", "Appareils")
   } else if (filterInputNode.id === "searchUstensil") {
      filterInputNode.setAttribute("value", "Ustensiles")
   }
}

/********  Fermeture menu dropDown si ouvert et clic en dehors ********/

const ingredientSearch = document.querySelector("#searchIngredient");
const appareilSearch = document.querySelector("#searchAppareil");
const ustensilSearch = document.querySelector("#searchUstensil");

window.addEventListener("click", (event) => {
   /* Si menu dropDown ouvert (widthFilter), si clic en dehors du menu ("ingredientList"), et si clic en dehors bouton filtre (searchIngredient) */
   if ((!(event.target.id === "ingredientList")
      && !(event.target.id === "searchIngredient"))
      && ingredientSearch.parentElement.classList.contains("widthFilter")) {
      closeDropDown(ingredientSearch);
   }
   if ((!(event.target.id === "appareilList")
      && !(event.target.id === "searchAppareil"))
      && appareilSearch.parentElement.classList.contains("widthFilter")) {
      closeDropDown(appareilSearch);
   }
   if ((!(event.target.id === "ustensilList")
      && !(event.target.id === "searchUstensil"))
      && ustensilSearch.parentElement.classList.contains("widthFilter")) {
      closeDropDown(ustensilSearch);
   }
})