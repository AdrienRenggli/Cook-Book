# Journal d'un Chef


## Application de Gestion de Recettes Personnelles
"Journal d'un Chef" est une application web conviviale conçue pour vous aider à organiser, explorer et gérer vos recettes préférées. Que vous soyez un cuisinier amateur ou un chef expérimenté, cette application vous permet de centraliser vos créations culinaires, de planifier vos repas et de simplifier vos courses.


## Fonctionnalités
- **Navigation Intuitive :** Parcourez une collection de recettes avec des filtres avancés (recherche par nom, ingrédient, type ; filtrage par temps de préparation/cuisson, prix par personne, note et difficulté).
- **Ajout et Édition de Recettes :**
    - Créez de nouvelles recettes avec un formulaire détaillé incluant le titre, la note, la difficulté, les temps de préparation et de cuisson, le nombre de personnes, les tags, les ingrédients (avec quantité, unité et prix), les instructions, les conseils du chef et les images.
    - Importez des recettes existantes via des fichiers ZIP pour les modifier facilement.
- **Exportation de Recettes :** Téléchargez n'importe quelle recette sous forme d'archive ZIP contenant le fichier JSON de la recette et toutes ses images associées, facilitant le partage ou la sauvegarde.
- **Adaptation des Ingrédients :** Ajustez dynamiquement les quantités d'ingrédients en fonction du nombre de personnes souhaité pour la recette.
- **Carrousel d'Images :** Visualisez les recettes avec un carrousel d'images interactif, supportant également les gestes de balayage sur les appareils tactiles.
- **Liste de Courses Intégrée :**
    - Gérez une liste de courses dédiée où vous pouvez ajouter, supprimer et cocher des articles.
    - Ajoutez tous les ingrédients d'une recette (ajustés au nombre de personnes) à votre liste de courses en un seul clic, évitant les oublis.
- **Design Adaptatif :** L'application est conçue pour être réactive et offrir une expérience optimale sur les ordinateurs de bureau, les tablettes et les téléphones mobiles.
- **Masquage Conditionnel :** La section "Conseils du chef" est automatiquement masquée si elle est vide pour une présentation plus propre.


## Technologies Utilisées
- HTML5: Structure de base des pages web.
- CSS3: Styles et mise en page, avec un accent sur une esthétique chaleureuse et conviviale.
- JavaScript (ES6+): Logique interactive côté client, gestion des données, filtres, carousels et interactions avec le stockage local.
- JSZip: Bibliothèque JavaScript pour la création et la lecture de fichiers ZIP (utilisée pour l'import/export de recettes).
- Font Awesome: Icônes vectorielles pour une interface utilisateur améliorée.


## Installation et Démarrage
- Pour exécuter cette application en local, suivez ces étapes simples :
    1. Clonez le dépôt Git :
        ```bash
        git clone https://github.com/AdrienRenggli/Cook-Book.git
        ```

    2. Naviguez vers le répertoire du projet :
        ```bash
        cd Cook-Book
        ```

    3. Ouvrez ```index.html``` :

        Ouvrez simplement le fichier index.html dans votre navigateur web préféré. Aucune configuration de serveur n'est nécessaire car l'application est entièrement côté client.
- Pour utiliser la version web, visitez https://adrienrenggli.github.io/Cook-Book/.


## Utilisation
### Page d'Accueil (```index.html```)
- **Recherche et Filtres :** Utilisez la barre de recherche et les boutons de filtre pour affiner la liste des recettes affichées.
- **Ajouter une Nouvelle Recette :** Cliquez sur la carte "Créer ou éditer une recette" pour accéder au formulaire d'ajout.
- **Importer une Recette :** Glissez-déposez un fichier .zip de recette sur la zone dédiée pour le charger et l'ajouter à votre collection locale.
- **Liste de Courses :** Cliquez sur l'icône de la liste de courses en haut à droite pour gérer vos articles.

### Page de Recette (```recipe.html```)
- **Détails de la Recette :** Visualisez toutes les informations détaillées de la recette.
- **Ajustement des Personnes :** Utilisez les boutons + et - pour ajuster le nombre de personnes, et les quantités d'ingrédients seront automatiquement mises à jour.
- **Carrousel d'Images :** Naviguez entre les images de la recette à l'aide des flèches ou des gestes de balayage.
- **Télécharger la Recette :** Cliquez sur le bouton pour télécharger la recette complète sous forme de fichier ZIP.
- **Ajouter à la Liste de Courses :** Cliquez sur le bouton pour ajouter tous les ingrédients actuellement affichés (selon le nombre de personnes sélectionné) à votre liste de courses.
- **Retour :** Utilisez le bouton "Retour aux recettes" pour revenir à la page d'accueil.

### Page d'Ajout/Édition de Recette (```add.html```)
- Remplissez les champs pour créer une nouvelle recette.
- Utilisez la zone de glisser-déposer pour ajouter des images.
- Cliquez sur "Télécharger la recette" pour exporter votre recette sous forme de fichier ZIP.
- Utilisez la section "Importer une recette archivée" pour charger un fichier ZIP de recette et le modifier.

### Page de Liste de Courses (```grocery-list.html```)
- **Ajouter un Article :** Tapez un article dans le champ de saisie et cliquez sur "Ajouter" ou appuyez sur Entrée.
- **Cocher/Décocher :** Cliquez sur la case à cocher à côté d'un article pour le marquer comme acheté ou non.
- **Supprimer un Article :** Cliquez sur l'icône X pour supprimer un article de la liste.
- **Effacer Tout :** Cliquez sur le bouton "Effacer tout" pour vider la liste.


## Contribution
Les contributions sont les bienvenues ! Si vous souhaitez améliorer cette application ou fournir de nouvelles recettes, n'hésitez pas à :
1. Forker le dépôt.
2. Créer une nouvelle branche (```git checkout -b feature/nouvelle-fonctionnalite```).
3. Effectuer vos modifications et commiter (```git commit -m 'Ajout de nouvelle fonctionnalité'```).
4. Pousser vers la branche (```git push origin feature/nouvelle-fonctionnalite```).
5. Ouvrir une Pull Request.

- **Idées pour de futures améliorations :** J'ai pensé à ajouter un minuteur pour la cuisson ou un convertisseur d'unités/quantités. Cependant, je ne suis pas encore sûr de la meilleure façon de les intégrer de manière significative dans l'application. Vos suggestions sont les bienvenues !

Si vous n'êtes pas à l'aise avec l'utilisation de git, vous pouvez également nous faire parevenir l'archive zip de votre recette par [email](mailto:journaldunchef@gmail.com) et nous l'ajouterons à l'application.


## Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.


## Remerciements
Un grand merci aux contributeurs et aux designers :
- **Codé par :**
    - [Adrien Renggli](https://github.com/AdrienRenggli)
- **Design par :**
    - [Adrien Renggli](https://github.com/AdrienRenggli)
    - [Dylan Callahan](https://github.com/cldylan)
    - Vicky Chappuis
    - Une 4e personne souhaitant rerster anonyme.

