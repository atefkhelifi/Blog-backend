# Backend - MEAN Blog Collaborative Platform

## Description

Backend de la plateforme de blog collaboratif multi-auteurs, construit avec Node.js, Express, MongoDB Atlas et JWT.  
Gère l’authentification sécurisée, les rôles, la gestion des utilisateurs, des articles, et prépare l’intégration des commentaires en temps réel.

---

## Prérequis

- Node.js >= 18.x
- MongoDB Atlas (compte gratuit possible)
- npm (ou yarn)

---

## Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/atefkhelifi/Blog-backend
cd backend
```

2. Installer les dépendances :

```bash
npm install
```

1. Créer un fichier .env à la racine du dossier backend avec le contenu suivant (modifie les valeurs selon ton contexte) : :

```bash
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blog?retryWrites=true&w=majority
JWT_SECRET=chaine_ultra_secrete_pour_token
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
CLIENT_URL=http://localhost:4200
COOKIE_SECURE=false

```

## Lancer le serveur

```bash
npm run dev
```
