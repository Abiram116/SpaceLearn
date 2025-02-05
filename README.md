# SpaceLearn

SpaceLearn is a mobile learning platform that helps students manage their studies with AI-powered assistance, note-taking, and assignment tracking.

## Features

- 📚 Subject-based learning spaces with AI-powered tutoring
- 🤖 Personalized learning assistant
- 📝 Smart note-taking and organization
- ✅ Assignment tracking and management
- 📊 Progress tracking and learning analytics
- 👤 User profiles with learning streaks

## Project Structure

```
SpaceLearn/
├── src/                      # Source code directory
│   ├── api/                  # API integrations
│   │   ├── supabase/        # Supabase backend
│   │   └── deepSpeak/       # AI API integration
│   ├── components/          # Reusable components
│   │   ├── common/          # Basic UI components
│   │   ├── chat/           # Chat components
│   │   └── learning/       # Learning components
│   ├── screens/            # App screens
│   │   ├── auth/          # Authentication screens
│   │   ├── main/          # Main app screens
│   │   ├── learning/      # Learning screens
│   │   └── assignments/   # Assignment screens
│   ├── navigation/        # Navigation setup
│   ├── services/         # Business logic
│   ├── context/         # React Context
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   ├── styles/         # Global styles
│   └── assets/         # Static assets
├── config/             # Configuration
├── docs/              # Documentation
└── tests/             # Test files
```

## Tech Stack

- **Frontend Framework**: React Native with Expo
- **State Management**: React Context + Custom Hooks
- **Backend & Auth**: Supabase
- **AI Integration**: DeepSpeak API
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage
- **Styling**: Custom theming system

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- DeepSpeak API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spacelearn.git
cd spacelearn
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_DEEPSPEAK_API_URL=your_deepspeak_api_url
EXPO_PUBLIC_DEEPSPEAK_API_KEY=your_deepspeak_api_key
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Database Setup

1. Create a new Supabase project
2. Run the initialization SQL script from `supabase/init.sql`
3. Enable Row Level Security (RLS) policies

## Key Features Implementation

### Authentication
- Complete user authentication flow
- Password reset functionality
- Session management
- Protected routes

### Learning System
- AI-powered learning spaces
- Subject and topic organization
- Progress tracking
- Learning analytics

### User Profile
- Customizable user profiles
- Learning streaks
- Achievement system
- Preferences management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

- Follow the ESLint configuration
- Use TypeScript for type safety
- Follow component organization guidelines
- Write meaningful commit messages

## Testing

- Unit tests with Jest
- Integration tests with React Native Testing Library
- E2E tests with Detox

## Deployment

### iOS
1. Configure app.json
2. Build iOS bundle
3. Submit to App Store

### Android
1. Configure app.json
2. Build Android bundle
3. Submit to Play Store

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Expo team
- Supabase for the backend infrastructure
- DeepSpeak for AI capabilities
- All contributors 