# Teen Dashboard - Complete Feature Documentation

## 🎯 Overview
The Teen Dashboard is a comprehensive health platform designed for adolescents, addressing three critical healthcare challenges:
1. **Chronic Disease Prevention** - Early symptom tracking and lifestyle monitoring
2. **Cognitive Disorder Detection** - Mental health and cognitive performance tracking
3. **Health Literacy** - Education, myth-busting, and AI-powered medical guidance

---

## 📁 File Structure

```
app/teen/
├── dashboard/page.tsx          # Main dashboard with mission overview
├── health-tracking/page.tsx    # Symptom logging (DB connected ✓)
├── brain-health/page.tsx       # Mood & cognitive tracking (DB connected ✓)
├── nutrition/page.tsx          # Food scanner + nutritionist bot (APIs connected ✓)
├── medication/page.tsx         # Medication reminders & adherence
├── academy/page.tsx            # Learning modules + RAG chatbot (API connected ✓)
├── cognitive-games/page.tsx    # 3 interactive brain games
├── messaging/page.tsx          # Socket.IO real-time chat (Connected ✓)
├── profile/page.tsx            # Settings & preferences
└── layout.tsx                  # Teen-specific layout with sidebar

components/layout/
└── teen-sidebar.tsx            # Custom navigation (8 menu items)

models/
├── Symptom.ts                  # MongoDB schema for symptoms
└── MoodEntry.ts                # MongoDB schema for mood tracking

app/api/health/
├── symptoms/route.ts           # REST API (GET, POST, DELETE)
└── moods/route.ts              # REST API (GET, POST, DELETE)
```

---

## 🔌 Backend Integration Status

### ✅ Connected Services

| Service | Port | Status | Integration |
|---------|------|--------|-------------|
| **Food Classifier** | 8000 | ✅ Connected | Food scanning with nutrition data |
| **Nutritionist Bot** | 9000 | ✅ Connected | Groq-powered AI nutritionist |
| **RAG Medical Chatbot** | 5000 | ✅ Connected | Evidence-based medical Q&A |
| **Socket.IO Chat** | 8081 | ✅ Connected | Real-time messaging |
| **MongoDB Atlas** | - | ✅ Connected | Symptoms & moods persistence |

### API Endpoints

#### Symptoms API
```typescript
GET  /api/health/symptoms?userId={email}&days=30&limit=50
POST /api/health/symptoms
     Body: { userId, type, severity (1-5), notes }
DELETE /api/health/symptoms?id={symptomId}
```

#### Moods API
```typescript
GET  /api/health/moods?userId={email}&days=7&limit=50
POST /api/health/moods
     Body: { userId, mood (1-5), notes }
DELETE /api/health/moods?id={moodId}
```

#### Food Classification
```typescript
POST http://localhost:8000/api/food
     FormData: { image: File, portion_g: 200, k: 3 }
```

#### Nutritionist Chat
```typescript
POST http://localhost:9000/api/nutrition/recipes
     Body: { query: string, conversationHistory: [] }
```

#### RAG Medical Chat
```typescript
POST http://localhost:5000/api/chat
     Body: { message: string, context: 'adolescent_health_education' }
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) → Purple (#A855F7) → Emerald (#10B981)
- **Health Tracking**: Red (#EF4444) → Orange (#F97316)
- **Brain Health**: Purple (#A855F7) → Pink (#EC4899) → Blue (#3B82F6)
- **Nutrition**: Green (#10B981) → Emerald (#059669)
- **Medication**: Purple (#A855F7) → Pink (#EC4899)

### Typography
- **Headings**: Bold, 2xl-4xl, drop-shadow
- **Body**: 0.875rem (14px), gray-700
- **Labels**: 0.75rem (12px), gray-600

### Components
- **Gradient Backgrounds**: 40% opacity overlays
- **Cards**: White/40 with backdrop-blur-sm
- **Buttons**: Gradient with rounded-xl (12px)
- **Icons**: Lucide React, 20-24px

---

## 📊 Features Breakdown

### 1. Health Tracking (`/teen/health-tracking`)
**Goal**: Chronic disease prevention through early symptom detection

**Features**:
- ✅ Real-time symptom logging (7 types: headache, fatigue, abdominal pain, nausea, dizziness, muscle pain, other)
- ✅ Severity scale (1-5 with visual indicators)
- ✅ Optional notes for context
- ✅ Historical view with timestamps
- ✅ Database persistence via MongoDB
- ✅ Quick health stats (heart rate, temperature, sleep, hydration)
- 📊 AI insights (pattern detection - simulated)
- 🔄 Auto-refresh after CRUD operations

**Database Schema**:
```typescript
{
  userId: string (indexed)
  type: enum [headache, fatigue, abdominal_pain, nausea, dizziness, muscle_pain, other]
  severity: number (1-5)
  notes: string
  date: Date (indexed)
  timestamps: true
}
```

**Usage**:
```typescript
// Add symptom
await fetch('/api/health/symptoms', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.email,
    type: 'headache',
    severity: 4,
    notes: 'After lunch, stress-related'
  })
})

// Fetch symptoms
const response = await fetch(`/api/health/symptoms?userId=${email}&days=30`)
const { symptoms } = await response.json()
```

---

### 2. Brain Health (`/teen/brain-health`)
**Goal**: Cognitive disorder detection & mental health monitoring

**Features**:
- ✅ Daily mood check (5-level emoji system: 😢😕😐🙂😄)
- ✅ Weekly mood trend visualization
- ✅ Database persistence via MongoDB
- ✅ Cognitive performance scores (Memory 85, Attention 72, Speed 90, Logic 78)
- 🎮 Link to cognitive games
- 📝 Quick actions: journal, breathing exercises, art therapy
- 🆘 Crisis resources: 3114 (suicide prevention), Fil Santé Jeunes

**Database Schema**:
```typescript
{
  userId: string (indexed)
  mood: number (1-5)
  notes: string
  date: Date (indexed)
  timestamps: true
}
```

**Mood Levels**:
1. 😢 Très triste (gray)
2. 😕 Pas bien (orange)
3. 😐 Neutre (yellow)
4. 🙂 Bien (green)
5. 😄 Super ! (blue-purple)

**Usage**:
```typescript
// Save mood
await fetch('/api/health/moods', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.email,
    mood: 4,
    notes: 'Good day at school'
  })
})

// Fetch weekly moods
const response = await fetch(`/api/health/moods?userId=${email}&days=7`)
const { moods } = await response.json()
```

---

### 3. Nutrition (`/teen/nutrition`)
**Goal**: Prevent obesity, diabetes through healthy eating habits

**Features**:
- ✅ **Food Scanner**: Upload food photos → AI classification (port 8000)
  - Returns: best_label, topk predictions, nutrition_per_portion
  - Nutrition data: calories, protein, carbs, fat
  - Automatically adds meals to daily log
- ✅ **Daily Goals Tracking**: Calories (1450/2200), Protein (45/70g), Carbs (180/275g), Water (1.8/2.5L)
- ✅ **Nutritionist AI Chatbot**: 
  - Connected to Groq LLM (port 9000)
  - Conversation history support
  - Quick question buttons
  - Professional, paragraph-style responses
- 📊 Weekly progress stats (18/21 balanced meals, 32 fruit/veggie portions, 95% hydration)
- 💡 Diabetes prevention tips integrated

**Food Classifier Usage**:
```typescript
const formData = new FormData()
formData.append('image', file)
formData.append('portion_g', '200')
formData.append('k', '3')

const response = await fetch('http://localhost:8000/api/food', {
  method: 'POST',
  body: formData
})

const { best_label, topk, nutrition_per_portion } = await response.json()
// best_label: "chicken_sandwich"
// nutrition_per_portion: { calories: 450, protein_g: 32, ... }
```

**Nutritionist Bot Usage**:
```typescript
const response = await fetch('http://localhost:9000/api/nutrition/recipes', {
  method: 'POST',
  body: JSON.stringify({
    query: "Comment prendre du muscle en tant qu'ado ?",
    conversationHistory: [...previousMessages]
  })
})

const { response: advice } = await response.json()
```

---

### 4. Health Academy (`/teen/academy`)
**Goal**: Combat health illiteracy & misinformation

**Features**:
- ✅ **3 Tabs**:
  1. **Learn**: 6 interactive modules (58 lessons total)
     - Diabetes Prevention (70% complete)
     - Mental Health (50%)
     - Balanced Nutrition (85%)
     - Hypertension & Heart (30%)
     - Reproductive Health (60%)
     - Cognitive Disorders (40%)
  2. **Myths & Facts**: Debunks 4 common health myths
     - Vaccines & autism
     - Sugar & hyperactivity
     - Depression misconceptions
     - Dietary fats
  3. **Ask AI**: Medical chatbot (RAG-powered, port 5000)
- ✅ **RAG Integration**: Evidence-based answers with source citations
- 🔍 Myth verification search bar
- 📈 Learning progress tracking (26/58 lessons, 8h 45min, 92% avg score)

**RAG Chatbot Usage**:
```typescript
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "C'est quoi le TDAH ?",
    context: 'adolescent_health_education'
  })
})

const { response: answer } = await response.json()
```

---

### 5. Cognitive Games (`/teen/cognitive-games`)
**Goal**: Early detection of cognitive disorders through gamification

**Features**:
- ✅ **4 Brain Games**:
  1. **Memory Match** (🃏): Find emoji pairs (8 cards, tracks moves)
  2. **Cible Rapide** (🎯): Click targets in 30s (attention span test)
  3. **Séquence** (⚡): Memorize color sequences (progressive difficulty)
  4. **Puzzle Logique** (🧩): Coming soon
- 📊 Score tracking: Memory 85/100, Attention 72/100, Speed 90/100, Logic 78/100
- 🎨 Interactive UI with animations
- 🔄 Auto-restart on completion

**Game Mechanics**:
```typescript
// Memory Match
- Grid: 4x4 (16 cards)
- Goal: Match 8 pairs
- Scoring: Based on moves count
- State: flipped cards, matched pairs

// Target Click
- Duration: 30 seconds
- Scoring: +10 points per target
- Dynamic target positioning

// Sequence
- Progressive difficulty (starts at level 1)
- Shows sequence, user reproduces
- Fails on incorrect input
```

---

### 6. Medication Tracking (`/teen/medication`)
**Goal**: Improve treatment adherence for chronic conditions

**Features**:
- 💊 Add/edit medications (name, dosage, frequency, time)
- 🔔 Reminder notifications (15 min before)
- ✅ Mark as taken/missed
- 📊 Adherence rate tracking (95%)
- 🔥 Streak counter (7 days)
- 📅 Weekly calendar view
- 📜 Complete history with status indicators
- ⚙️ Notification settings

**UI Components**:
- **Today Tab**: Pending & taken medications
- **List Tab**: All medications with edit/delete
- **History Tab**: Past 7 days with visual calendar

---

### 7. Messaging (`/teen/messaging`)
**Goal**: Secure communication with healthcare providers

**Features**:
- ✅ **Socket.IO Real-time Chat**: Connected to port 8081
- 👥 Contact list (doctors & mothers)
- 🟢 Online status indicators
- 💬 Real-time message delivery
- 🔍 Search contacts by name/email
- 📱 Modern chat UI (blue/purple gradients)
- 📞 Video/voice call buttons (UI ready)

**Socket.IO Events**:
```typescript
// Connect
const socket = io('http://localhost:8081', {
  query: { userId: chatUser._id }
})

// Events
socket.on('getOnlineUsers', (users: string[]) => { ... })
socket.on('newMessage', (message: Message) => { ... })

// Send message
await fetch('http://localhost:8081/api/messages/send/{receiverId}', {
  method: 'POST',
  body: JSON.stringify({ message: text })
})
```

---

### 8. Profile & Settings (`/teen/profile`)
**Goal**: Personalized experience & privacy control

**Features**:
- **4 Tabs**:
  1. **Profile**: Photo upload, personal info, health data
  2. **Notifications**: 5 toggle settings (medication, health tips, mood check-ins, reports, messages)
  3. **Privacy**: Data sharing, doctor access, online status, danger zone
  4. **Security**: Password change, 2FA setup, active sessions

**Settings Structure**:
```typescript
notifications: {
  medicationReminders: true,
  healthTips: true,
  moodCheckIns: true,
  weeklyReports: false,
  messageAlerts: true
}

privacy: {
  shareHealthData: false,
  allowDoctorAccess: true,
  showOnlineStatus: true
}
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Backend services running (ports 5000, 8000, 8081, 9000)

### Environment Variables
```bash
# Next.js (.env.local)
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_API_URL=http://localhost:3000

# Python backends
MEFTEH=your_groq_api_key
MONGODB_URI=mongodb+srv://...
```

### Start All Services
```bash
# Terminal 1: Next.js frontend
npm run dev

# Terminal 2: Python backends (RAG, Food Classifier, Nutritionist)
cd backend
python launcher.py

# Terminal 3: Chat backend
cd backend/chat-app-backend
npm start

# All services should be running:
# ✓ http://localhost:3000  - Frontend
# ✓ http://localhost:5000  - RAG Chatbot
# ✓ http://localhost:8000  - Food Classifier
# ✓ http://localhost:8081  - Chat Backend
# ✓ http://localhost:9000  - Nutritionist Bot
```

---

## 🧪 Testing Checklist

### Health Tracking
- [ ] Log symptom with all fields
- [ ] Verify in MongoDB Atlas
- [ ] Check auto-refresh after add
- [ ] Test delete functionality
- [ ] Verify date formatting ("Il y a X jours")

### Brain Health
- [ ] Select mood (1-5)
- [ ] Verify save with loading animation
- [ ] Check weekly chart updates
- [ ] Test with 7 consecutive days
- [ ] Verify empty state message

### Nutrition
- [ ] Upload food image (JPG/PNG)
- [ ] Verify classification result
- [ ] Check nutrition data display
- [ ] Test nutritionist chatbot
- [ ] Verify conversation history

### Academy
- [ ] Ask RAG chatbot a medical question
- [ ] Verify response with sources
- [ ] Test loading states
- [ ] Check error handling (server offline)

### Messaging
- [ ] Send message to doctor
- [ ] Verify real-time delivery
- [ ] Check online status
- [ ] Test search functionality

---

## 📈 Future Enhancements

### Priority 1 (High Impact)
- [ ] Data visualization charts (symptoms/mood trends over time)
- [ ] AI pattern detection (correlation between symptoms, mood, nutrition)
- [ ] Push notifications for medication reminders
- [ ] Parental dashboard view with privacy controls

### Priority 2 (Features)
- [ ] Drawing emotion analysis integration
- [ ] Cognitive games score persistence
- [ ] Meal planning based on nutrition goals
- [ ] Weekly health reports generation

### Priority 3 (Polish)
- [ ] Offline support with service workers
- [ ] Multi-language support (FR/EN/AR)
- [ ] Dark mode theme
- [ ] Export health data (PDF/CSV)

---

## 🐛 Troubleshooting

### Food Scanner Not Working
```bash
# Check if port 8000 is running
curl http://localhost:8000/health

# Restart backend
cd backend
python launcher.py
```

### RAG Chatbot Connection Failed
```bash
# Check if port 5000 is running
curl http://localhost:5000/health

# Check API endpoint
cd backend/Modele_rag
python launcher.py
```

### Moods/Symptoms Not Saving
```bash
# Check MongoDB connection
# Verify MONGODB_URI in .env.local
# Check models are properly indexed
```

### Socket.IO Chat Disconnects
```bash
# Check chat backend
cd backend/chat-app-backend
npm start

# Verify port 8081 is available
netstat -ano | findstr :8081
```

---

## 📝 Contributing

### Code Style
- TypeScript for all new components
- Use functional components with hooks
- Follow existing naming conventions (`camelCase` for variables, `PascalCase` for components)
- Add loading states for all async operations
- Include error handling with user-friendly messages

### Commit Messages
```
feat(teen-nutrition): add food scanner integration
fix(brain-health): resolve mood save button state
docs(readme): update API endpoints
refactor(health-tracking): simplify symptom form
```

---

## 📄 License
© 2025 Family Health Platform. All rights reserved.

---

## 📞 Support
For technical issues or feature requests, contact the development team.

**Built with ❤️ for adolescent health**
