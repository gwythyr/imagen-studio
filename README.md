# Imagen Studio

A powerful AI-powered asset generation studio that runs entirely in your browser. Create images, get help with creative projects, and generate content using voice commands - all while keeping your data completely private.

## Getting Started

### What You Can Do

**🎨 Generate Professional Assets**
- Create logos, icons, illustrations, and marketing materials
- Generate social media content, banners, and promotional images
- Design concepts, mockups, and visual prototypes
- Produce artwork for presentations, websites, and print materials

**🎙️ Voice-Powered Creation**
- Speak your ideas naturally - no need to craft perfect prompts
- The AI automatically formulates optimal image generation prompts from your voice input
- Hands-free workflow perfect for creative brainstorming sessions
- Seamless voice-to-visual pipeline for rapid iteration

**💬 Smart Creative Assistant**
- Get expert advice on design concepts and visual strategy
- Refine ideas through natural conversation
- Explore different creative directions with AI guidance
- Professional-quality results without design expertise

### Quick Setup (2 minutes)

1. **Get Your API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key" (Google account required)
   - Copy the generated key

2. **Configure Imagen Studio**
   - Open the application
   - Click the ⚙️ settings icon in the top-right corner
   - Paste your API key in the "Google AI API Key" field
   - Click "Save Settings"

3. **Start Creating**
   - Click "New Session" to begin
   - Type or use voice input to describe what you want to create
   - Let the AI optimize your prompt and generate professional assets

### Privacy & Security

- **100% Local Storage**: All conversations and generated images stay in your browser
- **No Data Collection**: Nothing is sent to external servers except AI generation requests
- **Offline Capable**: Works without internet once loaded (except for AI calls)
- **Your API Key**: Stored securely in your browser only

### Voice Commands Examples

Try speaking naturally:
- "Create a minimalist logo for a coffee shop called Brew & Co"
- "I need a banner for a fitness app launch, make it energetic and modern"
- "Design a professional headshot background for video calls"
- "Generate a social media post image about sustainable living"

The AI will automatically enhance your request with optimal technical prompts for the best results.

---

## For Developers

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: SQL.js with absurd-sql for persistence
- **AI Integration**: Google Generative AI SDK
- **Storage**: Local browser SQLite with BLOB support

### Architecture

```
src/
├── types/           # TypeScript interfaces
├── lib/             # Database and API utilities
├── components/      # React components
├── utils/           # Helper functions
└── main.tsx         # Application entry point
```

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Key Patterns

- Store chat messages and images as BLOBs in SQLite
- Use crypto.randomUUID() for message/session IDs
- Direct Gemini API calls from browser
- Custom hooks with subscriptions for reactive SQLite data
- No try/catch blocks - let errors bubble up naturally

### Database Schema

SQLite with local persistence:
- **Sessions**: Chat session metadata and settings
- **Messages**: Individual messages with BLOB image support
- **Generated Assets**: Images stored as BLOBs with metadata

### Contributing

1. Follow existing architectural patterns
2. Maintain separation of concerns (no mapping in services)
3. Use defined TypeScript interfaces (no inline types)
4. Keep components focused on single responsibility
5. Test with `npm run dev` before submitting