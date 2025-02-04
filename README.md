# SpaceLearn

SpaceLearn is a mobile learning platform that helps students manage their studies with AI-powered assistance, note-taking, and assignment tracking.

## Features

- 📚 Subject-based learning spaces
- 🤖 AI-powered learning assistant
- 📝 Note-taking and organization
- ✅ Assignment tracking and management
- 📊 Progress tracking
- 👤 User profiles and statistics

## Tech Stack

- React Native with Expo
- Supabase for backend and authentication
- Custom AI integration (DeepSpeak API)
- React Navigation for routing
- AsyncStorage for local storage

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

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

3. Create a `.env` file in the root directory with your API keys:
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

## Project Structure

```
SpaceLearn/
├── .expo/               # Expo configuration
├── assets/             # Static assets
├── components/         # Reusable UI components
├── screens/            # App screens
├── navigation/         # Navigation setup
├── services/          # API and backend services
├── context/           # Global state management
├── utils/             # Utility functions
├── styles/            # Global styles
└── App.js             # Main app entry point
```

## Components

- `ChatBubble`: Displays chat messages in the AI learning space
- `NoteCard`: Displays note previews
- `AssignmentCard`: Displays assignment information with status

## Screens

- `HomeScreen`: Dashboard with recent notes and assignments
- `SubjectScreen`: List of subjects with progress
- `SpaceScreen`: AI-powered learning space
- `NotesScreen`: Note management
- `AssignmentScreen`: Assignment tracking
- `ProfileScreen`: User profile and settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to the Expo team for the amazing framework
- Supabase for the backend infrastructure
- All contributors who help improve the app 