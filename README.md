# Pictlonis

## Description du projet

**Pictlonis** est une application mobile de type "Pictionary" ou "Draw Something", où les utilisateurs peuvent se connecter, participer à des parties multijoueurs et deviner des dessins en temps réel. Chaque joueur dessine un objet ou une idée, et les autres doivent deviner ce qui est dessiné. L'application inclut une zone de dessin interactive et une zone de chat, toutes deux mises à jour en temps réel pour tous les participants. 

Le jeu est conçu pour fonctionner sur Android et iOS, et utilise Firebase pour gérer l'authentification des utilisateurs et la synchronisation des données en temps réel.

## Prérequis

- MacOs : https://code.visualstudio.com/docs/setup/mac
- Windows : https://code.visualstudio.com/docs/setup/windows
- Linux : https://code.visualstudio.com/docs/setup/linux
- Installer l'application Expo sur votre smartphone

## Pour lancer le back :

1. Ouvrez votre projet dans VSCode :
    ```bash
    code .
    ```
   (Assurez-vous d'avoir lancé Docker Desktop)

2. Ouvrez le projet dans un container :
    - Utilisez `Ctrl + Shift + P` et sélectionnez `Dev Containers: Reopen in container`
    - Cela va créer tous les containers nécessaires pour le projet

### Pour installer toutes les dépendances :

1. Installez les dépendances :
    ```bash
    npm install
    ```

2. Démarrez le projet :
    ```bash
    npm start expo start --tunnel
    ```

3. Ouvrez l'application Expo Go sur votre smartphone et scannez le QR code.

## Fonctionnalités principales

- **Authentification** : Les utilisateurs doivent se connecter via un login et un mot de passe pour pouvoir accéder au jeu.
- **Multijoueur** : Plusieurs participants peuvent rejoindre une partie et jouer chacun depuis leur terminal.
- **Dessin en temps réel** : La zone de dessin est partagée en temps réel entre tous les terminaux connectés.
- **Chat en temps réel** : Les utilisateurs peuvent échanger des messages via une zone de chat également synchronisée en temps réel.

## Technologies utilisées

- Firebase : Pour l'authentification et la synchronisation des données en temps réel.
- Expo : Pour simplifier le développement multiplateforme (iOS et Android).
- Docker : Pour configurer un environnement de développement cohérent.

