import {
    DELAY,
    Dimension,
    DIMENSIONS,
    DIV_JEU,
    MORT,
    Size,
    STYLE_JEU,
    VIVANT,
    TEMPLATES
} from "./constantes.ts";

/**
 * Represents the simulation of Conway's Game of Life.
 *
 * This class handles the initialization, evolution, and user interaction
 * for the simulation grid. It includes methods for setting up the grid,
 * updating cell states, and controlling the simulation timing.
 */
export class Simulation {
    /**
     * The HTML element representing the grid (plateau).
     * @type {HTMLDivElement}
     * @private
     */
    private readonly plateau: HTMLDivElement;

    private isRunning: boolean = false;

    /**
     * A 2D array representing the state of each cell in the grid.
     * Each cell is either alive (true) or dead (false).
     * @type {boolean[][]}
     * @private
     */
    private tabCellules: boolean[][] = [];

    /**
     * The current dimension of the grid.
     * @type {Dimension}
     * @private
     */
    private dimension: Dimension = DIMENSIONS[1];

    /**
     * The interval ID for the evolution steps, used to control the simulation timing.
     * @type {NodeJS.Timeout | null}
     * @private
     */
    private tempo: number | null = null;

    /**
     * The current step number in the evolution of the simulation.
     * @type {number}
     * @private
     */
    private step: number = 1;

    /**
     * The delay in milliseconds between each evolution step.
     * @type {number}
     * @private
     */
    private delay: number = DELAY;


    /**
     * Creates an instance of the Simulation class.
     *
     * This constructor initializes the simulation by setting up the grid dimensions,
     * applying the initial styles, and starting the first evolution step.
     * It also sets up the event listeners for user interactions.
     *
     * @param {HTMLDivElement} racine - The root HTML element where the simulation grid will be rendered.
     * @param {Size} [dimension=15] - The initial size of the grid. Defaults to 15 if not provided.
     */
    constructor(racine: HTMLDivElement, dimension: Size = 15) {
        const sheet = document.createElement('style')
        document.head.appendChild(sheet);
        sheet.innerHTML = STYLE_JEU;
        racine.innerHTML = DIV_JEU;
        this.plateau = racine.querySelector("div#plateau")!;
        this.setDimension(dimension);
        this.evolution();
        this.initListeners();
    }

    /**
     * Sets the grid dimension and updates the grid accordingly.
     *
     * This method finds the dimension object that matches the provided size,
     * updates the current dimension, and then calls the method to change the grid dimension.
     *
     * @param {Size} dimension - The new size of the grid.
     */
    private setDimension(dimension: Size) {
        this.dimension = DIMENSIONS.find(x => x.size === dimension)!;
        this.changeDimension();
    }

    /**
     * Updates the grid dimension and initializes the grid.
     *
     * This method updates the input field to reflect the new grid size,
     * then reinitializes the grid with the new dimensions.
     */
    private changeDimension() {
        console.log('changeNombreCellules, nouveau nombre : ', this.dimension.name);
        const taille = document.querySelector("#level") as HTMLInputElement;
        taille.value = String(this.dimension.size);
        this.initPlateau();
    }

    /**
     * Initializes the grid with cells and creates buttons for each cell.
     *
     * This method first clears any existing children elements from the grid (plateau),
     * then initializes the cell states and creates a button for each cell in the grid.
     * Each button represents a cell and is appended to the corresponding row (divLigne).
     */
    private initPlateau() {
        console.log('Nombre de cellules : ', this.dimension.size);
        const children = Array.from(this.plateau.children);
        for (let elt of children) {
            this.plateau.removeChild(elt);
        }
        this.initCellules();
        for (let i = 0; i < this.dimension.size; i++) {
            let divLigne = document.createElement("div");
            divLigne.setAttribute('class', "ligne");
            this.creerBoutonsLigne(divLigne, i)
            this.plateau.append(divLigne);
        }
    }

    /**
     * Initializes the cell states for the grid.
     *
     * This method creates a 2D array representing the grid, with each cell initialized to the dead state.
     * The grid includes a border of dead cells around the actual grid to simplify neighbor calculations.
     */
    private initCellules() {
        this.tabCellules = [];
        console.log("Init cellules ...");
        for (let ligne = 0; ligne < this.dimension.size + 2; ligne++) {
            let tab = [];
            for (let col = 0; col < this.dimension.size + 2; col++) {
                tab.push(MORT);
            }
            this.tabCellules.push(tab);
        }
    }

    /**
     * Handles the cell click event.
     *
     * This method is triggered when a cell button is clicked. It logs the cell's coordinates
     * and toggles the cell's state between alive and dead.
     *
     * @param {number} ligne - The row index of the cell.
     * @param {number} col - The column index of the cell.
     */
    private traitementCellule(ligne: number, col: number) {
        console.log("Cellule cliquée:", ligne, col, "isRunning:", this.isRunning);
        if (!this.isRunning) {  // On autorise la modification uniquement quand la simulation est arrêtée
            // Le bouton représente la cellule logique [ligne, col] qui est stockée à [ligne+1][col+1] dans tabCellules
            this.tabCellules[ligne + 1][col + 1] = !this.tabCellules[ligne + 1][col + 1];
            console.log("Nouvel état:", this.tabCellules[ligne + 1][col + 1]);
            this.majEtatCellule(ligne, col);
        } else {
            console.log("Simulation en cours, modification interdite.");
        }
    }


    /**
     * Creates a button element for a specific cell in the grid.
     *
     * This method creates an HTML input element representing a cell button,
     * sets its attributes, and attaches a click event listener to handle cell state changes.
     *
     * @param {number} ligne - The row index of the cell.
     * @param {number} col - The column index of the cell.
     * @returns {HTMLInputElement} The created button element for the cell.
     */
    private creerBouton(ligne: number, col: number): HTMLInputElement {
        let taille = this.dimension.label;
        let bouton: HTMLInputElement = document.createElement("input") as HTMLInputElement;
        bouton.setAttribute('type', "button");
        bouton.setAttribute('id', ligne + "X" + col);
        bouton.setAttribute('class', "mort bouton-" + taille);

        // Clic pour changer l'état de la cellule
        bouton.addEventListener('click', () => {
            this.traitementCellule(ligne, col);
        });

        // Bonus : Affichage de l'état de la cellule au survol
        bouton.addEventListener('mouseenter', () => {
            const etat = this.tabCellules[ligne + 1][col + 1] ? "VIVANT 🟥" : "MORT ⚪";
            bouton.title = `État : ${etat}`;  // Affiche un tooltip
        });

        return bouton;
    }

    /**
     * Creates buttons for each cell in a specific row of the grid.
     *
     * This method iterates through each column in the specified row,
     * creates a button for each cell, and appends it to the provided row element.
     *
     * @param {HTMLDivElement} divLigne - The HTML element representing the row.
     * @param {number} ligne - The row index for which buttons are created.
     */
    private creerBoutonsLigne(divLigne: HTMLDivElement, ligne: number) {
        for (let col = 0; col < this.dimension.size; col++) {
            let bouton: HTMLInputElement = this.creerBouton(ligne, col);
            divLigne.appendChild(bouton);
        }
    }

    /**
     * Updates the visual state of a specific cell in the grid.
     *
     * This method retrieves the HTML element corresponding to the cell at the given row and column,
     * and updates its CSS class based on the cell's current state (alive or dead).
     *
     * @param {number} ligne - The row index of the cell.
     * @param {number} col - The column index of the cell.
     */
    private majEtatCellule(ligne: number, col: number) {
        const taille = this.dimension.label;
        // Les boutons ont des id construits comme "0X0", "0X1", etc.
        const element = document.getElementById(`${ligne}X${col}`) as HTMLInputElement;
        if (!element) {
            console.error(`Bouton ${ligne}X${col} non trouvé.`);
            return;
        }
        if (this.tabCellules[ligne + 1][col + 1] === VIVANT) {
            element.className = `vivant bouton-${taille}`;
        } else {
            element.className = `mort bouton-${taille}`;
        }
    }

    /**
     * Randomly updates the state of each cell in the grid and updates their visual representation.
     *
     * This method iterates through each cell in the grid, randomly sets its state to either alive or dead,
     * and then updates the visual state of the cell accordingly.
     * It also logs a message indicating the state after the evolution.
     */
    private evolution() {
        console.log("evolution...");
        for (let i = 0; i < this.dimension.size; i++) {
            for (let j = 0; j < this.dimension.size; j++) {
                let nb = Math.floor(Math.random() * 10000);
                // Affecte l'état dans le tableau interne à l'indice [i+1][j+1]
                this.tabCellules[i+1][j+1] = nb % 2 === 0 ? VIVANT : MORT;
                // Met à jour l'affichage pour le bouton (i, j)
                this.majEtatCellule(i, j);
            }
        }
        afficherMessage('état après évolution');
    }

    /**
     * Initializes event listeners for various UI elements.
     *
     * This method sets up event listeners for the following elements:
     * - `level` input: Changes the dimension of the grid and triggers evolution.
     * - `range` input: Adjusts the delay for the evolution steps and updates the display label.
     * - `start` button: Starts the Conway's Game of Life simulation.
     * - `stop` button: Stops the Conway's Game of Life simulation.
     * - `reset` button: Resets the grid and restarts the simulation.
     * - `template` input: Loads a predefined template for the grid.
     */
    private initListeners() {
        const container = (this.plateau.parentElement as HTMLElement);
        if (!container) {
            console.error("Conteneur non trouvé pour attacher les écouteurs.");
            return;
        }

        const startButton = container.querySelector("#start") as HTMLButtonElement | null;
        const stopButton = container.querySelector("#stop") as HTMLButtonElement | null;
        const resetButton = container.querySelector("#reset") as HTMLButtonElement | null;
        const tailleSelect = container.querySelector("#level") as HTMLSelectElement | null;
        const vitesseRange = container.querySelector("#range") as HTMLInputElement | null;
        const vitesseLabel = container.querySelector("#label") as HTMLLabelElement | null;
        const templateSelect = container.querySelector("#template") as HTMLSelectElement | null;
        const delayInput = container.querySelector("#delay") as HTMLInputElement | null;
        const saveButton = container.querySelector("#save") as HTMLButtonElement | null;
        const loadButton = container.querySelector("#load") as HTMLButtonElement | null;

        // 🎯 Démarrer la simulation
        if (startButton) {
            startButton.addEventListener("click", () => {
                console.log("Bouton START cliqué");
                this.startSimulation();
            });
        } else {
            console.error("Bouton START non trouvé.");
        }

        // 🛑 Arrêter la simulation
        if (stopButton) {
            stopButton.addEventListener("click", () => {
                console.log("Bouton STOP cliqué");
                this.stopSimulation();
            });
        } else {
            console.error("Bouton STOP non trouvé.");
        }

        // 🔄 Réinitialiser la simulation
        if (resetButton) {
            resetButton.addEventListener("click", () => {
                console.log("Bouton RESET cliqué");
                this.resetSimulation();
            });
        } else {
            console.error("Bouton RESET non trouvé.");
        }

        // 📏 Changement de la taille de la grille
        if (tailleSelect) {
            tailleSelect.addEventListener("change", (event) => {
                const nouvelleTaille = parseInt((event.target as HTMLSelectElement).value) as Size;
                this.setDimension(nouvelleTaille);
                this.evolution();
                afficherMessage(`Grille ajustée à ${nouvelleTaille}x${nouvelleTaille} ✅`);
            });
        }

        // ⚡ Ajustement de la vitesse
        if (vitesseRange && vitesseLabel) {
            vitesseRange.addEventListener("input", (event) => {
                const vitesse = parseInt((event.target as HTMLInputElement).value);
                this.delay = 1000 - (vitesse * 10); // Plus la valeur est haute, plus c'est rapide
                vitesseLabel.textContent = `Vitesse : ${this.delay} ms`;
                afficherMessage(`Vitesse ajustée à ${this.delay} ms ⚡`);
            });
        }

        // 🗂️ Chargement d’un modèle prédéfini
        if (templateSelect) {
            templateSelect.addEventListener("change", (event) => {
                const index = parseInt((event.target as HTMLSelectElement).value);
                if (index >= 0) {
                    this.chargeTemplate(TEMPLATES[index]);
                } else {
                    this.resetSimulation(); // Choix "aléatoire" = réinitialisation
                }
            });
        }

        // ⏱️ Durée d'une étape
        if (delayInput) {
            delayInput.addEventListener("input", (event) => {
                const nouvelleVitesse = parseInt((event.target as HTMLInputElement).value);
                this.delay = nouvelleVitesse;
                afficherMessage(`Durée d'une étape : ${nouvelleVitesse} ms`);
            });
        } else {
            console.error("Curseur de durée d'étape non trouvé.");
        }

        // 💾 Sauvegarder la grille
        if (saveButton) {
            saveButton.addEventListener("click", () => {
                localStorage.setItem("savedGrid", JSON.stringify(this.tabCellules));
                afficherMessage("Grille sauvegardée 📥");
            });
        } else {
            console.error("Bouton SAVE non trouvé.");
        }

        // 📤 Charger la grille
        if (loadButton) {
            loadButton.addEventListener("click", () => {
                const savedGrid = localStorage.getItem("savedGrid");
                if (savedGrid) {
                    this.tabCellules = JSON.parse(savedGrid);
                    this.updatePlateau();
                    afficherMessage("Grille chargée 📤");
                } else {
                    afficherMessage("Aucune sauvegarde trouvée ❌");
                }
            });
        } else {
            console.error("Bouton LOAD non trouvé.");
        }
    }

    public startSimulation() {
        if (!this.tempo) {
            this.tempo = setInterval(() => this.evolutionConway(), this.delay);
            this.isRunning = true;
            afficherMessage("Simulation démarrée 🚀");
            const startButton = document.getElementById("start") as HTMLButtonElement;
            const stopButton = document.getElementById("stop") as HTMLButtonElement;
            startButton.disabled = true;
            stopButton.disabled = false;
        }
    }

    private stopSimulation() {
        if (this.tempo) {
            clearInterval(this.tempo);
            this.tempo = null;
            this.isRunning = false;
            afficherMessage("Simulation arrêtée 🛑");
            const startButton = document.getElementById("start") as HTMLButtonElement;
            const stopButton = document.getElementById("stop") as HTMLButtonElement;
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    }

    private resetSimulation() {
        this.stopSimulation();
        this.initPlateau();
        afficherMessage("Simulation réinitialisée 🔄");

        const startButton = document.getElementById("start") as HTMLButtonElement;
        const stopButton = document.getElementById("stop") as HTMLButtonElement;
        startButton.disabled = false;
        stopButton.disabled = true;
    }

    /**
     * Executes one step of Conway's Game of Life evolution.
     *
     * This method creates a clone of the current state of all cells,
     * then iterates through each cell to determine the number of living neighbors.
     * Based on the number of living neighbors, it updates the state of each cell
     * according to the rules of Conway's Game of Life:
     * - A cell with exactly 3 living neighbors becomes alive.
     * - A cell with fewer than 2 or more than 3 living neighbors dies.
     * Finally, it updates the display and increments the evolution step counter.
     */
    private evolutionConway() {
        const clone = JSON.parse(JSON.stringify(this.tabCellules));
        let vivantes = 0, mortes = 0;

        for (let ligne = 1; ligne <= this.dimension.size; ligne++) {
            for (let col = 1; col <= this.dimension.size; col++) {
                const voisins = this.nbVoisinesVivantes(ligne, col, clone);

                if (voisins === 2) {
                    // État inchangé
                } else if (voisins === 3) {
                    this.tabCellules[ligne][col] = VIVANT;
                } else {
                    this.tabCellules[ligne][col] = MORT;
                }

                // Compter vivantes/mortes
                if (this.tabCellules[ligne][col] === VIVANT) {
                    vivantes++;
                } else {
                    mortes++;
                }

                this.majEtatCellule(ligne - 1, col - 1); // Correction des indices
            }
        }

        afficherMessage(`Étape ${this.step++} - Vivantes : ${vivantes} | Mortes : ${mortes}`);
    }

    /**
     * Sets the state of a specific cell in the grid.
     *
     * @param {number} ligne - The row index of the cell.
     * @param {number} col - The column index of the cell.
     * @param {boolean} etat - The new state of the cell (true for alive, false for dead).
     */
    private setEtatCellule(ligne: number, col: number, etat: boolean): void {
        // Mise à jour de l'état dans la grille logique
        this.tabCellules[ligne][col] = etat;

        // Mise à jour de l'état visuel
        this.majEtatCellule(ligne, col);
    }

    /**
     * Calculates the number of living neighbors for a specific cell.
     *
     * This method checks the eight neighboring cells around the specified cell
     * and counts how many of them are alive.
     *
     * @param {number} ligne - The row index of the cell.
     * @param {number} col - The column index of the cell.
     * @param {boolean[][]} tab - The grid of cells where each cell is either alive (true) or dead (false).
     * @returns {number} The number of living neighbors.
     */
    private nbVoisinesVivantes(ligne: number, col: number, tab: boolean[][]): number {
        let compte = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                if (tab[ligne + i][col + j] === VIVANT) compte++;
            }
        }
        return compte;
    }

    /**
     * Loads a predefined template for the grid.
     *
     * This method sets the grid's dimensions to match the template size if necessary,
     * then updates the state of each cell in the grid according to the template.
     *
     * @param {any[][]} template - A 2D array representing the template to be loaded,
     * where each element is the state of a cell (true for alive, false for dead).
     */
    private chargeTemplate(template: any[][]): void {
        const templateRows = template.length;
        const templateCols = template[0]?.length || 0;

        // Vérifie si la taille du modèle correspond à la grille actuelle
        if (templateRows > this.dimension.size || templateCols > this.dimension.size) {
            console.warn("Le modèle est trop grand pour la grille actuelle !");
            return;
        }

        // Réinitialise la grille avant de charger le modèle
        this.initCellules();

        // Application du modèle à la grille
        for (let ligne = 0; ligne < templateRows; ligne++) {
            for (let col = 0; col < templateCols; col++) {
                this.setEtatCellule(ligne + 1, col + 1, template[ligne][col]);
            }
        }

        afficherMessage("Modèle chargé avec succès 🚀");
    }

    private updatePlateau() {
        for (let ligne = 1; ligne <= this.dimension.size; ligne++) {
            for (let col = 1; col <= this.dimension.size; col++) {
                this.majEtatCellule(ligne - 1, col - 1);
            }
        }
    }
}

/**
 * Displays a message in the HTML element with the ID "affichage".
 *
 * This function updates the inner HTML of the element with the specified message.
 *
 * @param {string} message - The message to be displayed.
 */
export function afficherMessage(message: string) {
    let nodeAffichage = document.getElementById("affichage")!;
    nodeAffichage.innerHTML = message;
}
