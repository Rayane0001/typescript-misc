import { ARTICLES, Article } from "./articles";

export class Editeur {
    private _racine: HTMLDivElement;
    private divArticles: HTMLDivElement;
    private _articles: Article[];
    private motifRecherche: string = ""; // Motif recherché
    private occurrences: { element: HTMLDivElement; start: number }[] = []; // Positions des occurrences
    private occurrenceIndex: number = -1; // Index actuel dans la recherche

    constructor(racine: HTMLDivElement) {
        this._racine = racine;
        this._articles = [];

        // 📜 Création du titre principal
        const titre = document.createElement("h1");
        titre.textContent = "📜 Articles de la Déclaration des Droits de l’Homme";
        this._racine.appendChild(titre);

        // 📄 Chargement des articles
        this.loadArticles();

        // 📄 Création et ajout des articles
        this.divArticles = this.ajouteLesArticles();
        this._racine.appendChild(this.divArticles);

        // 🎛️ Création et ajout du panneau de commandes
        this.makeCommandesPanel();

        // 🎨 Appliquer les styles
        this.modifStyleTitreArticles();
        this.modifStyleContenuArticles();
    }

    // 📄 Charge les articles depuis ARTICLES.ts
    private loadArticles(): void {
        this._articles = ARTICLES;
    }

    // 📝 Crée un élément HTML pour un article donné
    private makeArticle(article: Article): HTMLDivElement {
        const articleDiv = document.createElement("div");
        articleDiv.classList.add("article");

        const titreDiv = document.createElement("div");
        titreDiv.classList.add("titre");
        titreDiv.textContent = article.titre;

        const contenuDiv = document.createElement("div");
        contenuDiv.classList.add("contenu");
        contenuDiv.textContent = article.contenu;

        articleDiv.appendChild(titreDiv);
        articleDiv.appendChild(contenuDiv);

        return articleDiv;
    }

    // 📑 Ajoute tous les articles dans une div
    private ajouteLesArticles(): HTMLDivElement {
        const container = document.createElement("div");
        container.setAttribute("id", "articles");

        this._articles.forEach(article => {
            container.appendChild(this.makeArticle(article));
        });

        return container;
    }

    // 🎨 Modifie le style des titres d'articles
    private modifStyleTitreArticles(): void {
        const titres = document.querySelectorAll<HTMLDivElement>(".titre");
        titres.forEach(titre => {
            titre.style.fontWeight = "bold"; // Gras
            titre.style.marginBottom = "1rem"; // Espacement en bas
        });
    }

    // 🎨 Modifie le style des contenus d'articles
    private modifStyleContenuArticles(): void {
        const contenus = document.querySelectorAll<HTMLDivElement>(".contenu");
        contenus.forEach(contenu => {
            contenu.style.width = "400px";
            contenu.style.textAlign = "justify"; // Texte justifié
            contenu.style.marginBottom = "1rem";
        });
    }

    // 🎛️ Création du panneau de commandes
    private makeCommandesPanel(): void {
        const commandesDiv = document.createElement("div");
        commandesDiv.setAttribute("id", "commandes");

        // 🌈 Sélecteur de couleur
        const labelCouleur = document.createElement("label");
        labelCouleur.textContent = "🎨 Couleur du texte : ";
        labelCouleur.setAttribute("for", "choixCouleur");

        const inputCouleur = document.createElement("input");
        inputCouleur.setAttribute("type", "color");
        inputCouleur.setAttribute("id", "choixCouleur");
        inputCouleur.addEventListener("change", () => this.traitementCouleur(inputCouleur.value));

        // 🔍 Champ de recherche
        const inputRecherche = document.createElement("input");
        inputRecherche.setAttribute("type", "text");
        inputRecherche.setAttribute("id", "motifRecherche");
        inputRecherche.setAttribute("placeholder", "🔍 Motif à rechercher...");
        inputRecherche.addEventListener("input", () => this.initRecherche(inputRecherche.value));

        // ⏩ Bouton recherche avant
        const btnRechercheAvant = document.createElement("button");
        btnRechercheAvant.textContent = "🔍➡️ Recherche avant";
        btnRechercheAvant.addEventListener("click", () => this.recherche(true));

        // ⏪ Bouton recherche arrière
        const btnRechercheArriere = document.createElement("button");
        btnRechercheArriere.textContent = "🔍⬅️ Recherche arrière";
        btnRechercheArriere.addEventListener("click", () => this.recherche(false));

        // ❌ Bouton effacer
        const btnEffacer = document.createElement("button");
        btnEffacer.textContent = "❌ Effacer recherche";
        btnEffacer.addEventListener("click", () => this.effacerRecherche());

        // Ajout des éléments au panneau
        commandesDiv.appendChild(labelCouleur);
        commandesDiv.appendChild(inputCouleur);
        commandesDiv.appendChild(inputRecherche);
        commandesDiv.appendChild(btnRechercheAvant);
        commandesDiv.appendChild(btnRechercheArriere);
        commandesDiv.appendChild(btnEffacer);

        // Ajout au DOM
        this._racine.appendChild(commandesDiv);
    }

    // 🎨 Change la couleur du texte des articles
    private traitementCouleur(couleur: string): void {
        this.divArticles.style.color = couleur;
    }

    // 🔍 Initialise la recherche
    private initRecherche(motif: string): void {
        this.motifRecherche = motif;
        this.occurrences = [];
        this.occurrenceIndex = -1;

        if (motif.trim() === "") return;

        document.querySelectorAll<HTMLDivElement>(".contenu").forEach(contenu => {
            const texte = contenu.textContent || "";
            let startIndex = 0;

            while ((startIndex = texte.indexOf(motif, startIndex)) !== -1) {
                this.occurrences.push({ element: contenu, start: startIndex });
                startIndex += motif.length;
            }
        });

        console.log(`🔍 ${this.occurrences.length} occurrences trouvées`);
        this.recherche(true); // Mettre en avant la première occurrence
    }

    // 🔍 Navigue entre les occurrences trouvées
    private recherche(avant: boolean): void {
        if (this.occurrences.length === 0) return;

        document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));

        this.occurrenceIndex = avant ? this.occurrenceIndex + 1 : this.occurrenceIndex - 1;
        if (this.occurrenceIndex >= this.occurrences.length) this.occurrenceIndex = 0;
        if (this.occurrenceIndex < 0) this.occurrenceIndex = this.occurrences.length - 1;

        const { element, start } = this.occurrences[this.occurrenceIndex];
        this.highlightMotif(element, start);
    }

    // 🖍️ Met en avant le motif trouvé
    private highlightMotif(element: HTMLDivElement, start: number): void {
        const motif = this.motifRecherche;
        const texte = element.textContent || "";

        const avant = texte.substring(0, start);
        const milieu = `<span class="highlight">${texte.substring(start, start + motif.length)}</span>`;
        const apres = texte.substring(start + motif.length);

        element.innerHTML = avant + milieu + apres;
    }

    // ❌ Efface la mise en évidence
    private effacerRecherche(): void {
        document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
        this.motifRecherche = "";
        this.occurrences = [];
        this.occurrenceIndex = -1;
    }
}
