# 💬 Guide de démarrage - Messagerie

## ⚡ Solution rapide

### Étape 1 : Démarrer le backend chat
Ouvrez un nouveau terminal PowerShell et exécutez :

```powershell
cd C:\Users\MSI\Desktop\projet_web\embs\v0-mother-health-app-main\backend\chat-app-backend
npm run dev
```

Vous devriez voir :
```
Server running on port 8081
✅ MongoDB connected successfully
```

### Étape 2 : Vérifier que le serveur est actif
```powershell
netstat -ano | findstr :8081
```

Si vous voyez une ligne avec `:8081`, le serveur fonctionne ! ✅

---

## 🔧 Ce qui a été corrigé

### Problème initial
- **Symptôme** : "No contacts found" dans la messagerie
- **Cause** : Les utilisateurs adolescents n'existaient pas dans la base de données du chat backend

### Solution implémentée

1. ✅ **Nouveau endpoint** `/api/auth/auto-login`
   - Crée automatiquement l'utilisateur dans le chat backend s'il n'existe pas
   - Se connecte directement si l'utilisateur existe déjà
   - Supporte les rôles : `mother`, `doctor`, `adolescent`

2. ✅ **Mise à jour des messageries**
   - Messagerie teen : utilise `auto-login` avec rôle `adolescent`
   - Messagerie mère/docteur : utilise `auto-login` avec rôle approprié
   - Plus besoin de mot de passe stocké

3. ✅ **Synchronisation automatique**
   - Dès qu'un utilisateur ouvre la messagerie, il est créé dans le chat backend
   - Son statut en ligne est automatiquement mis à jour
   - La liste de contacts se charge automatiquement

---

## 📋 Test complet

### 1. Connectez-vous en tant qu'adolescent
- Email : `kard@test.com` (ou votre compte test)
- Allez dans **Messagerie**

### 2. Vérifiez les logs dans le terminal chat
Vous devriez voir :
```
Auto-login request: { name: 'Kard', email: 'kard@test.com', role: 'adolescent' }
User not found, creating new user...
New user created: 67xxxxxxxxxxxxx
```

### 3. Ouvrez la messagerie en tant que docteur/mère
- Connectez-vous avec un compte doctor ou mother
- Allez dans Messaging
- Vous devriez voir l'adolescent dans la liste des contacts

---

## 🎯 Architecture de la messagerie

```
┌─────────────────┐
│  Next.js (3000) │
│   - Teen Page   │
│   - Mother Page │
│   - Doctor Page │
└────────┬────────┘
         │
         │ Auto-login API
         ▼
┌─────────────────────────┐
│ Chat Backend (8081)     │
│  - Auto-create users    │
│  - Socket.IO server     │
│  - MongoDB chat DB      │
└─────────────────────────┘
```

### Flux d'auto-login

1. **User ouvre la messagerie** → Frontend détecte l'utilisateur connecté
2. **Frontend appelle** `/api/auth/auto-login` avec `{name, email, role}`
3. **Backend vérifie** si l'utilisateur existe dans la DB chat
4. **Si non existe** → Crée l'utilisateur avec mot de passe par défaut
5. **Si existe** → Utilise l'utilisateur existant
6. **Génère token JWT** → Stocke dans cookie
7. **Frontend se connecte** à Socket.IO avec le userId
8. **Récupère la liste** des autres utilisateurs via `/api/users`

---

## 🐛 Dépannage

### Aucun contact ne s'affiche
```bash
# Vérifier que le port 8081 est actif
netstat -ano | findstr :8081

# Si rien, démarrer le serveur
cd backend/chat-app-backend
npm run dev
```

### Erreur "Cannot connect to chat server"
1. Vérifier MongoDB : `MONGODB_URI` dans `backend/chat-app-backend/.env`
2. Vérifier CORS : `CLIENT_URL=http://localhost:3000`
3. Redémarrer le serveur chat

### Les messages ne s'envoient pas
1. Vérifier la console browser (F12)
2. Chercher les erreurs Socket.IO
3. Vérifier que le cookie JWT est présent

### "User already exists" mais pas de contacts
Supprimez l'utilisateur et relancez :
```javascript
// Dans MongoDB Compass ou mongosh
db.users.deleteOne({ email: "kard@test.com" })
```

---

## ✨ Avantages de l'auto-login

✅ **Pas besoin de signup manuel** - Les utilisateurs sont créés automatiquement
✅ **Synchronisation auto** - Les utilisateurs Next.js sont dupliqués dans le chat backend
✅ **Pas de mot de passe requis** - Utilise les sessions Next.js existantes
✅ **Support multi-rôles** - Mother, Doctor, Adolescent
✅ **Gestion du statut** - En ligne/Hors ligne automatique

---

## 🔐 Sécurité

- Le mot de passe par défaut est `chat123` (uniquement pour dev)
- En production, utilisez un système de tokens JWT partagés
- Les cookies sont sécurisés avec `httpOnly` et `sameSite`
- Les mots de passe sont hashés avec bcrypt (10 rounds)
