# FamilyHealth - Plateforme de Santé Familiale

##  Table des matières
- [Choix du Framework](#choix-du-framework)
- [Fonctionnalités Développées](#fonctionnalités-développées)
- [Étapes de Lancement du Projet](#étapes-de-lancement-du-projet)
- [Architecture Technique](#architecture-technique)

---

##  Choix du Framework

### Frontend : Next.js 16 (React)
**Raisons du choix :**
- **Performance optimale** : Turbopack pour des temps de compilation ultra-rapides
- **Server-Side Rendering (SSR)** : Améliore le SEO et le temps de chargement initial
- **App Router** : Organisation modulaire avec layouts partagés et routes groupées
- **TypeScript** : Typage fort pour réduire les erreurs et améliorer la maintenabilité
- **Écosystème riche** : Radix UI pour des composants accessibles, TailwindCSS pour le styling

### Backend : Architecture Microservices
**3 services indépendants :**

1. **FastAPI (Port 8000)** - Classification d'aliments
   - Performance exceptionnelle avec Python async
   - Documentation automatique avec Swagger/OpenAPI
   - Validation des données avec Pydantic
   - Idéal pour le machine learning (TensorFlow/Keras)

2. **Flask (Port 5000)** - RAG Médical avec LangChain
   - Simplicité et flexibilité
   - Intégration facile avec LangChain et FAISS
   - Support du streaming pour les réponses LLM
   - Base vectorielle pour la recherche sémantique

3. **Flask (Port 9000)** - Chatbot Nutritionniste
   - Service léger et dédié
   - Intégration avec l'API Groq (Llama 3.1)
   - Isolation des fonctionnalités nutritionnelles

4. **Analyse Émotionnelle (Intégrée au Frontend)**
   - Classification des émotions via dessins d'enfants
   - Modèle de deep learning pour détecter 7 émotions
   - API Next.js pour upload, analyse et téléchargement
   - Nettoyage automatique des fichiers temporaires

**Avantages de l'architecture :**
- Scalabilité indépendante de chaque service
- Maintenance facilitée
- Possibilité de déployer les services séparément
- Résilience : une panne n'affecte pas les autres services

---

##  Fonctionnalités Développées

### 1.  Analyse Nutritionnelle
- **Classification d'images alimentaires**
  - Upload et reconnaissance automatique de 101 catégories d'aliments
  - Calcul nutritionnel détaillé (calories, protéines, glucides, lipides)
  - Estimation de portions personnalisables
  - Modèle ML basé sur EfficientNetB0

- **Chatbot Nutritionniste IA**
  - Conseils personnalisés basés sur l'alimentation
  - Génération de plans de repas équilibrés
  - Recommandations adaptées aux enfants
  - Historique des conversations

### 2.  Santé Mentale
- **Chatbot Médical RAG**
  - Réponses contextuelles basées sur une base de connaissances médicales
  - Recherche sémantique dans les documents médicaux (FAISS + HuggingFace)
  - Modèle Llama 3.1 via Groq pour des réponses précises
  - Support multilingue (français)
  - Historique et suivi des conversations

- **Analyse Émotionnelle par Dessin**
  - Upload de dessins d'enfants pour analyse émotionnelle
  - Classification automatique en 7 catégories d'émotions :
    - HAPPY (Heureux)
    - SAD (Triste)
    - ANGRY (En colère)
    - FEAR (Peur)
    - SURPRISE (Surprise)
    - DISGUST (Dégoût)
    - CALM (Calme)
  - Visualisation des résultats avec scores de confiance
  - Téléchargement des images annotées
  - Modèle CNN entraîné sur des dessins d'enfants

### 3. Interface Utilisateur
- **Authentification avec MongoDB**
  - Pages de connexion et inscription sécurisées
  - Système de rôles : Mère et Médecin
  - Stockage persistant dans MongoDB Atlas
  - Hachage sécurisé des mots de passe (bcryptjs)
  - Gestion des sessions utilisateur avec localStorage
  - Contexte d'authentification global React
  - Validation des identifiants côté serveur
  - Messages d'erreur personnalisés

- **Dashboard Intuitif**
  - Vue d'ensemble de la santé familiale
  - Navigation par catégories (Nutrition, Santé Mentale, Rapports)
  - Responsive design pour mobile et desktop
  - Thème moderne avec Radix UI

- **Interface Admin**
  - Gestion des patients
  - Analyse des messages
  - Statistiques et analytics
  - Configuration des paramètres

- **Dashboard Médecin**
  - Interface dédiée aux professionnels de santé
  - Messagerie avec les patients
  - Liste des conversations avec badges de notifications
  - Fonction de recherche de patients
  - Historique complet des échanges
  - Déconnexion sécurisée

### 4.  Rapports et Suivi
- Génération de rapports de santé
- Historique des consultations
- Suivi de l'évolution nutritionnelle

---

##  Étapes de Lancement du Projet

### Prérequis
- **Python 3.10** (IMPORTANT : Version 3.10 requise pour compatibilité avec le modèle émotionnel)
  - Python 3.11+ peut causer des problèmes avec certaines dépendances TensorFlow
  - Vérifier la version : `python --version`
- **Node.js 18+** et npm
- **Git** pour le clonage du repository
- **MongoDB Atlas** (compte gratuit suffisant)
  - Base de données cloud pour l'authentification
  - Connexion via URI fournie dans `.env.local`

### Installation Complète

#### 1. Cloner le Projet
```bash
git clone https://github.com/kard4318/Projet_Web_Objectif3
cd embs/v0-mother-health-app-main
```

#### 2. Configuration du Backend

##### 2.1 Vérifier et Installer Python 3.10
**IMPORTANT : Python 3.10 est requis pour la compatibilité TensorFlow**

```bash
# Vérifier la version de Python
python --version

# Si vous avez Python 3.11+, installer Python 3.10 :
# Windows : Télécharger depuis https://www.python.org/downloads/release/python-3100/
# Linux : sudo apt install python3.10
# macOS : brew install python@3.10
```

##### 2.2 Créer l'Environnement Virtuel avec Python 3.10
```bash
# Windows PowerShell (avec Python 3.10)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Ou si Python 3.10 n'est pas la version par défaut :
python3.10 -m venv .venv
.venv\Scripts\Activate.ps1

# Linux/macOS
python3.10 -m venv .venv
source .venv/bin/activate
```

##### 2.3 Mettre à jour pip
```bash
# Mettre à jour pip avant l'installation
python -m pip install --upgrade pip
```

##### 2.4 Installer les Dépendances Backend (Dans l'ordre)
```bash
# 1. Dépendances de base
pip install -r backend/requirments/requirements.txt
pip install -r backend/requirments/requirements-base.txt

# 2. Dépendances LangChain (RAG médical)
pip install -r backend/requirments/requirements-langchain.txt

# 3. Dépendances Machine Learning (TensorFlow, Classification alimentaire)
pip install -r backend/requirments/requirements-ml.txt

# 4. Dépendances Analyse Émotionnelle
pip install -r backend/emotional_classification/model/requirements-LAPTOP-ROJQ4EUE.txt
```

**Note :** L'installation peut prendre 5-10 minutes selon votre connexion internet.

**Note :** L'installation peut prendre 5-10 minutes selon votre connexion internet.

##### 2.5 Configuration des Variables d'Environnement Backend
Les fichiers `.env` sont déjà configurés :
- `backend/Modele_rag/ATT58074.env` : Contient `GROQ_API_KEY`
- `backend/Nutritionist/.env` : Contient `MEFTEH` (clé Groq)

**Note :** Si vous déployez en production, remplacez les clés API par vos propres clés Groq.

#### 3. Configuration du Frontend

##### 3.1 Configuration MongoDB
Créer un fichier `.env.local` à la racine du projet :
```bash
MONGODB_URI=mongodb+srv://kardoussema:5wTvYJalgCwz8tUV@cluster0.8bnczjd.mongodb.net/etmaen
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important :**
- La base de données `etmaen` est utilisée pour stocker les utilisateurs
- En production, remplacez l'URI MongoDB par votre propre cluster
- Changez le `JWT_SECRET` pour une clé sécurisée aléatoire

##### 3.2 Installer les Dépendances Node.js
```bash
npm install
```

**Dépendances principales installées :**
- `mongoose` : ODM MongoDB pour Node.js
- `bcryptjs` : Hachage sécurisé des mots de passe
- Next.js, React, TypeScript
- Radix UI, TailwindCSS
- Recharts pour les graphiques

#### 4. Lancement de l'Application

##### 4.1 Démarrer le Backend (Terminal 1)
```bash
# S'assurer que le venv est activé
.venv\Scripts\Activate.ps1  # Windows
# source .venv/bin/activate  # Linux/macOS

# Lancer tous les services backend
python backend/launcher.py
```

**Menu du launcher :**
- Choisir l'option **4** pour démarrer tous les services
- Les 3 APIs seront lancées simultanément :
  - FastAPI (Food Classifier) : http://localhost:8000
  - Flask (Medical RAG) : http://localhost:5000
  - Flask (Nutritionist) : http://localhost:9000

##### 4.2 Démarrer le Frontend (Terminal 2)
```bash
npm run dev
```

Le frontend sera accessible sur : **http://localhost:3000**

#### 5. Accéder à l'Application

Ouvrir votre navigateur et accéder à :
```
http://localhost:3000
```

**Parcours utilisateur :**
1. Page de connexion (redirection automatique)
2. **Inscription** : Choisir le rôle (Mère ou Médecin)
   - Mère : Accès au dashboard familial
   - Médecin : Accès au dashboard médical
3. **Connexion** : Authentification sécurisée avec MongoDB
4. **Redirection automatique selon le rôle** :
   - Mères → `/home` (dashboard familial)
   - Médecins → `/dashboard` (interface messagerie)
5. Explorer les fonctionnalités :
   - `/nutrition` - Analyse nutritionnelle
   - `/mental-health` - Chatbot médical + Analyse émotionnelle
   - `/messaging` - Communication avec les médecins
   - `/reports` - Rapports de santé

---

##  Architecture Technique

### Structure du Projet
```
v0-mother-health-app-main/
├── app/                          # Frontend Next.js
│   ├── (auth)/                   # Routes d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Routes utilisateur (Mères)
│   │   ├── home/
│   │   ├── nutrition/
│   │   ├── mental-health/
│   │   ├── messaging/
│   │   └── reports/
│   ├── (doctor)/                 # Routes médecin
│   │   └── dashboard/           # Interface messagerie
│   ├── (admin)/                  # Routes admin
│   │   ├── analytics/
│   │   ├── patients/
│   │   ├── messages/
│   │   └── settings/
│   └── api/                      # API Routes Next.js
│       ├── auth/                # Authentification MongoDB
│       │   ├── login/
│       │   └── signup/
│       ├── test-db/             # Test connexion MongoDB
│       ├── emotion/             # Analyse émotionnelle
│       │   ├── upload/
│       │   ├── analyze/
│       │   └── download/
│       ├── nutrition/recipes/
│       ├── mental-health/chat/
│       └── health/
├── backend/
│   ├── backend/                  # FastAPI - Classification alimentaire
│   │   ├── app.py
│   │   ├── models/              # Modèles ML (EfficientNet)
│   │   ├── routers/             # Endpoints API
│   │   └── data/                # Labels et mappings
│   ├── Modele_rag/              # Flask - RAG Médical
│   │   ├── app.py
│   │   ├── vectorstore/         # Base FAISS
│   │   └── data/                # Documents médicaux
│   ├── Nutritionist/            # Flask - Chatbot Nutritionniste
│   │   └── Nutrutionist__backend.py
│   ├── requirments/             # Dépendances Python
│   └── launcher.py              # Script de lancement unifié
├── components/                   # Composants React réutilisables
│   ├── layout/
│   ├── mental-health/
│   │   ├── chatbot.tsx
│   │   └── emotion-analyzer.tsx # Analyseur d'émotions
│   ├── nutrition/
│   └── ui/                      # Composants Radix UI
├── lib/                         # Utilitaires et contextes
│   ├── auth-context.tsx         # Context d'authentification
│   ├── mongodb.ts               # Connexion MongoDB
│   └── utils.ts
├── models/
│   └── User.ts                  # Schéma Mongoose pour utilisateurs
└── public/
    └── uploads/                 # Dossier temporaire pour images
```

### Technologies Utilisées

**Frontend :**
- Next.js 16 (React 19)
- TypeScript

**Backend :**
- FastAPI (Python) + Uvicorn
- Flask (Python) + Werkzeug
- TensorFlow/Keras (ML)
- LangChain + FAISS (RAG)
- Groq API (Llama 3.1)

**Base de données :**
- MongoDB Atlas (Cloud)
- Mongoose ODM (schémas et validation)

**Authentification :**
- bcryptjs (hachage de mots de passe)
- React Context API (gestion d'état)
- localStorage (persistance de session)

**Modèles de Machine Learning :**
- EfficientNetB0 (classification alimentaire)
- CNN personnalisé (analyse émotionnelle via dessins)
- Embeddings HuggingFace (recherche sémantique RAG)

---

##  Notes Importantes

### Sécurité
- Les clés API sont dans des fichiers `.env` (exclus de Git via `.gitignore`)
- Ne jamais commiter les fichiers `.env` sur un repository public
- En production, utiliser des variables d'environnement sécurisées

### Performance
- Le premier démarrage du backend peut prendre 1-2 minutes (chargement des modèles ML)
- FAISS charge la base vectorielle au démarrage
- Next.js utilise Turbopack pour un hot-reload ultra-rapide

### Développement
- Hot-reload activé sur tous les services
- Les modifications sont automatiquement détectées
- Logs détaillés dans les terminaux

---

##  Dépannage

**Problème : Version Python incompatible**
```bash
# Vérifier la version de Python
python --version

# Si vous avez Python 3.11+, installez Python 3.10
# Windows : Télécharger depuis python.org
# Linux : sudo apt install python3.10
# macOS : brew install python@3.10

# Créer un environnement virtuel avec Python 3.10
python3.10 -m venv .venv
```

**Problème : Erreurs TensorFlow lors de l'installation**
```bash
# Désactiver l'environnement actuel
deactivate

# Supprimer l'ancien environnement
rm -rf .venv  # Linux/macOS
Remove-Item -Recurse -Force .venv  # Windows PowerShell

# Recréer avec Python 3.10
python3.10 -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
# source .venv/bin/activate  # Linux/macOS

# Réinstaller les dépendances
pip install --upgrade pip
pip install -r backend/requirments/requirements-ml.txt
```

**Problème : Modules Python manquants**
```bash
# Réinstaller toutes les dépendances
pip install -r backend/requirments/requirements.txt
pip install -r backend/requirments/requirements-base.txt
pip install -r backend/requirments/requirements-langchain.txt
pip install -r backend/requirments/requirements-ml.txt
```

**Problème : Port déjà utilisé**
```bash
# Windows : tuer le processus sur le port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

**Problème : Erreur GROQ_API_KEY**
- Vérifier que les fichiers `.env` existent dans `backend/Nutritionist/` et `backend/Modele_rag/`
- S'assurer que la clé API Groq est valide

**Problème : Erreur MongoDB Connection**
```bash
# Tester la connexion MongoDB
curl http://localhost:3000/api/test-db

# Vérifier le fichier .env.local à la racine
# S'assurer que MONGODB_URI est correctement défini
# Pas de @@ multiples, juste un seul @
# Format : mongodb+srv://username:password@cluster.mongodb.net/database_name
```

**Problème : Utilisateurs non sauvegardés dans MongoDB**
- Vérifier que le fichier `.env.local` existe à la racine du projet
- S'assurer que la base de données `etmaen` est spécifiée dans l'URI
- Redémarrer le serveur Next.js après modification du `.env.local`

**Problème : Erreur "next is not a function" (Mongoose)**
- Le modèle User utilise Mongoose 7+ (pas de callback `next` dans les hooks)
- Vérifier que le code utilise `async/await` sans paramètre `next`

**Problème : Logout ne fonctionne pas**
- Vider le cache du navigateur
- Vérifier que `router.refresh()` est appelé après `logout()`
- Forcer un rafraîchissement complet : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (macOS)

**Problème : Fichiers d'upload émotionnels non supprimés**
```bash
# Les fichiers dans public/uploads/ sont nettoyés automatiquement
# Si le dossier est trop volumineux, supprimer manuellement :
Remove-Item -Recurse -Force public/uploads/*  # Windows
rm -rf public/uploads/*  # Linux/macOS
```

