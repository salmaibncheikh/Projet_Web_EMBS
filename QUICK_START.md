# 🚀 Guide de démarrage rapide

## Démarrage complet de l'application

### 1️⃣ Frontend (Next.js) - Port 3000
```bash
cd C:\Users\MSI\Desktop\projet_web\embs\v0-mother-health-app-main
npm run dev
```
✅ Accessible sur http://localhost:3000

---

### 2️⃣ Backend Services (Python + Node.js)
```bash
cd C:\Users\MSI\Desktop\projet_web\embs\v0-mother-health-app-main\backend
python launcher.py
```

**Choisissez l'option 5** pour démarrer TOUS les services :
- Port 8000 : Food Classifier (FastAPI)
- Port 5000 : Medical RAG Chatbot (Flask)
- Port 9000 : Nutritionist Chatbot (Flask)
- Port 8081 : Chat/Messaging Backend (Node.js + Socket.IO) ⭐

---

## ⚠️ Pour la messagerie (Mère/Docteur/Teen)

La messagerie **NÉCESSITE** le backend Socket.IO sur port 8081.

**Option A** : Démarrer tous les services avec launcher.py (option 5)

**Option B** : Démarrer uniquement le chat avec launcher.py (option 4)

**Option C** : Démarrer manuellement
```bash
cd backend/chat-app-backend
npm run dev
```

---

## 🧪 Vérification rapide

### Tester si tous les services fonctionnent :

**Frontend** : http://localhost:3000
**Food API** : http://localhost:8000/docs
**RAG Chatbot** : http://localhost:5000
**Nutritionist** : http://localhost:9000
**Chat Backend** : http://localhost:8081

### Vérifier les ports utilisés :
```bash
netstat -ano | findstr "3000 5000 8000 8081 9000"
```

---

## 📋 Configuration requise

### Variables d'environnement

**.env.local** (racine du projet)
```env
MONGODB_URI=mongodb+srv://...
```

**backend/chat-app-backend/.env**
```env
MONGODB_URI=mongodb+srv://...
PORT=8081
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:3000
```

**backend/Modele_rag/ATT58074.env**
```env
GROQ_API_KEY=your-groq-key
```

**backend/Nutritionist/ATT73789.env**
```env
MEFTEH=your-groq-key
```

---

## 🎯 Services par fonctionnalité

| Fonctionnalité | Backend requis | Port |
|----------------|----------------|------|
| Authentification | Next.js + MongoDB | 3000 |
| Suivi santé (Symptômes) | Next.js + MongoDB | 3000 |
| Santé mentale (Humeurs) | Next.js + MongoDB | 3000 |
| Scanner alimentaire | Food Classifier | 8000 |
| Nutritionniste IA | Nutritionist Bot | 9000 |
| Académie santé | RAG Chatbot | 5000 |
| **Messagerie** | **Chat Backend** | **8081** ⭐ |
| Médicaments | Next.js + MongoDB | 3000 |
| Profil | Next.js + MongoDB | 3000 |

---

## 🐛 Dépannage

### La messagerie ne fonctionne pas
1. Vérifier que le port 8081 est démarré :
   ```bash
   netstat -ano | findstr :8081
   ```
2. Si rien, relancer launcher.py option 4 ou 5
3. Vérifier les logs dans le terminal du launcher

### Erreur MongoDB
- Vérifier la connexion Internet
- Vérifier que MONGODB_URI est correct dans .env.local
- Vérifier l'adresse IP dans MongoDB Atlas (0.0.0.0/0 pour dev)

### Port déjà utilisé
```bash
# Trouver le processus
netstat -ano | findstr :PORT_NUMBER

# Tuer le processus (remplacer PID)
taskkill /PID <pid> /F
```

---

## 📝 Notes importantes

- **MongoDB** : Utilisé pour User, Symptom, MoodEntry, Medication, TeenProfile
- **Socket.IO** : Utilisé UNIQUEMENT pour la messagerie temps réel
- **Groq API** : Utilisé pour RAG chatbot (port 5000) et Nutritionist (port 9000)
- **EfficientNetB0** : Utilisé pour le scanner alimentaire (port 8000)

---

## 🎉 Démarrage complet en 2 commandes

**Terminal 1** (Frontend)
```bash
cd C:\Users\MSI\Desktop\projet_web\embs\v0-mother-health-app-main
npm run dev
```

**Terminal 2** (Tous les backends)
```bash
cd C:\Users\MSI\Desktop\projet_web\embs\v0-mother-health-app-main\backend
python launcher.py
# Choisir option 5
```

✅ L'application est maintenant complètement opérationnelle !
