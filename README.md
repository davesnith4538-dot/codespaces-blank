# 🕯️ Digital Legacy - Preserve Your Life for Generations

A compassionate app that captures your life patterns, memories, and personality while alive, so your family can connect with your digital presence after you're gone.

## Features

### 📱 Data Collection (While Alive)
- **Daily Habits**: Log routines, activities, and mood patterns
- **Memories**: Save important stories and life moments
- **Personality**: Document traits, values, and what makes you unique
- **Voice Data**: Record messages and stories (future feature)
- **Photos**: Attach visual memories

### 🤖 Digital Memorial (After Passing)
- **AI Personality**: Interact with an AI trained on their patterns
- **Memory Archive**: Browse all saved memories and stories
- **Generational Sharing**: Family members can connect and add to the legacy
- **Authentic Interactions**: Responses reflect their actual personality

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Styling**: CSS3 with gradients & animations

## Installation

```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install
cd client && npm install
```

## Running the App

**Development:**
```bash
# Terminal 1 - Start backend
npm start

# Terminal 2 - Start frontend
cd client && npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The app will be available at `http://localhost:5000`

## How It Works

### For the Living
1. **Register** with your name and email
2. **Collect Data**:
   - Log daily habits (morning walk, coffee preferences, etc.)
   - Save memories (stories, achievements, lessons learned)
   - Document personality (humor style, values, interests)
3. **When Ready**: Activate the digital memorial

### For the Family
1. **Visit the Memorial**: Access the digital presence
2. **Chat**: Ask questions and get AI responses based on their patterns
3. **Browse Memories**: Read their stories and life lessons
4. **Connect**: Feel their presence through preserved patterns

## Database Schema

- **users**: User profiles and deceased status
- **patterns**: Daily habits and activities
- **memories**: Stories, achievements, life lessons
- **recordings**: Voice data and transcripts
- **traits**: Personality characteristics

## API Endpoints

```
POST   /api/users                 - Create user
GET    /api/users/:id             - Get user profile
POST   /api/patterns              - Log daily habit
GET    /api/patterns/:userId      - Get user habits
POST   /api/memories              - Save memory
GET    /api/memories/:userId      - Get memories
POST   /api/traits                - Add personality trait
GET    /api/traits/:userId        - Get traits
POST   /api/chat                  - Chat with AI version
PUT    /api/users/:id/deceased    - Activate memorial
```

## Future Enhancements

- Voice synthesis (speak in their voice)
- Video recordings
- Family tree integration
- Share permissions and access control
- Export/backup functionality
- Machine learning personality model
- Multi-language support

## Privacy & Security

- All data is stored locally by default
- Can be encrypted for sensitive information
- Family access controls can be implemented
- No data sent to external services (except optional ML APIs)

## Philosophy

This tool recognizes that memories are precious and that digital legacies can bring comfort and connection across generations. By capturing authentic patterns and personality during someone's lifetime, we create a meaningful digital presence that keeps their spirit alive in the hearts and minds of their loved ones.

---

**Built with ❤️ to preserve what matters most.**
