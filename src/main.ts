import "./style.css";
import { Editeur } from "./editeur";
import { Simulation } from "./conway";

document.addEventListener("DOMContentLoaded", () => {
    let racine = document.getElementById("racine") as HTMLDivElement;
    if (!racine) {
        racine = document.createElement("div");
        racine.id = "racine";
        document.body.appendChild(racine);
    }

    // Créez un conteneur pour l'éditeur...
    const editeurContainer = document.createElement("div");
    editeurContainer.id = "editeur";
    racine.appendChild(editeurContainer);

    // ...et un autre pour la simulation
    const simulationContainer = document.createElement("div");
    simulationContainer.id = "simulation";
    racine.appendChild(simulationContainer);

    // Initialisez l'éditeur dans son conteneur
    // @ts-ignore
    const editeur = new Editeur(editeurContainer);
    console.log("✅ Éditeur initialisé avec succès et articles affichés !");

    // Créez l'instance de Simulation dans son conteneur
    const simulation = new Simulation(simulationContainer, 15);
    // Pour pouvoir l'utiliser dans la console (et ainsi éviter TS6133), exposez-la globalement
    (window as any).simulation = simulation;
});
