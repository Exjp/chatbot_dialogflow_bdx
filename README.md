# Chatbot pour l'Université de Bordeaux
L’université de Bordeaux souhaite la création d’agents conversationnels (que l’on appellera chatbots) qui puissent renseigner, conseiller et aider les utilisateurs des sites de l’Université de Bordeaux. Concernant notre projet, notre chatbot devra assister l’étudiant qui souhaiterait suivre une formation supérieure délivrée par l’Université de Bordeaux. A l’issue d’une conversation dans laquelle l’étudiant partagera par exemple les matières vers lesquelles il souhaiterait se diriger, le chatbot enverra dans la fenêtre de conversation un ou des liens vers la ou les formations qui sont le plus en adéquation avec les souhaits formulés par l’étudiant.
# Notre prototype
## Les fonctionnalités de notre prototype
Notre prototype permet d'avoir une conversation scriptée à l'heure actuelle. Nous avons besoin que la base de données soit plus complète qu'elle ne l'est à l'heure actuelle afin de pouvoir trouver une formation en adéquation avec les informations données par l'étudiant. C'est pour cela que nous avons seulement configuré les intents pour ne réagir qu'à certaines matières spécifiques.  
Voici des exemples d'échange qui fonctionnent avec notre prototype:  
* Premier exemple
  1. Bonjour
  2. Je souhaite faire de l'informatique
  3. Non
  4. Non
  5. DUT/Master/Licence
  6. Oui  
       
* Deuxième exemple
  1. Je souhaite faire de l'informatique
  2. Oui des mathématiques
  3. Non
  4. Non
  5. DUT/Master/Licence
  6. Oui

## Accéder au chatbot
Notre chatbot est accessible de deux façons différentes:
* En ligne, il faut se rendre sur la page web suivante: https://chatbot-bdx-dialogflow1.glitch.me/
* En local, il faut se rendre à la racine du projet et lancer le commande `node start`, puis aller à l'adresse http://localhost:8080/ depuis un navigateur web.\
Il faut au préalable manuellement réaliser plusieurs choses:
  * Ajouter la variable d'environnement pour l'authentification de l'API: 
    * Sous linux: `export GOOGLE_APPLICATION_CREDENTIALS="Formation-Bdx.json"` (pour la session bash en cours)
    * Sous Windows: `set GOOGLE_APPLICATION_CREDENTIALS="Formation-Bdx.json"`
  * installer les paquets necessaires avec `npm install`
  * installer neo4j 
    * Lien du telechargement : https://neo4j.com/download-thanks/?edition=community&release=3.5.4&flavour=unix&_ga=2.188450088.108321094.1554901243-1402727375.1549037801&_gac=1.48810324.1552058447.CjwKCAiAwojkBRBbEiwAeRcJZD_09pkXxULkbw3CVK3yWrY9Wh-EsgtthqUQ4qPr2piEq9gOTZR88RoC5MMQAvD_BwE
    * Suivre les instruction d'installation
    * Aller dans le répertoire /home/neo4j-community-3.5.3/bin et lancer la commande `sudo ./neo4j start`.
    * Aller sur `localhost:7474/` et se connecter `login : neo4j password : neo4j` puis changer le password  `new password : chatbot`.
    Attention, si le nouveau mot de passe n'est pas `chatbot` il faudra modifier dans le code le mot de passe d'accès à la basse de données.
    * Un script peut être créer pour automatiser le processus, seul point bloquant, le changement de mot de passe.
### Auteurs
Nicolas Desclaux, Nicolas Deguillaume, Nathan Lesne, Jacques Pourtier
