# SpaceLearn

SpaceLearn is an educational platform designed to help students learn through interactive AI-powered conversations and organized learning spaces. The platform uses Google's Gemini AI to provide intelligent, contextual learning assistance.


https://github.com/user-attachments/assets/d0a4f3d9-2b63-4c5d-ac33-b4d163898758


## Current Features

### Authentication
- User registration and login system
- Profile management
- Secure authentication using Supabase

### Learning Spaces
- Subject-based organization
- Topic-specific subspaces
- AI-powered learning assistance using Gemini AI
  - Interactive conversations for learning
  - Code examples with syntax highlighting
  - Step-by-step explanations
  - Support for multiple programming languages
  - Mathematical and scientific concept breakdowns

### Assignments
- Create and manage assignments
- Assignment tracking and progress monitoring
- Quiz-based assignments with results tracking
- Detailed assignment descriptions and titles
- Assignment results analysis

### User Interface
- Modern, responsive design
- Cross-platform support (iOS, Android)
- Intuitive navigation

## Technical Stack

- React Native / Expo for cross-platform development
- Supabase for backend services and authentication
- Google Gemini AI for intelligent learning assistance
- Webpack for web build configuration
- Context API for state management
- Modular component architecture

## Project Structure

```
src/
├── api/         # API integration and services
├── components/  # Reusable UI components
├── config/      # Configuration files
├── context/     # React Context providers
├── data/        # Data models and types
├── hooks/       # Custom React hooks
├── navigation/  # Navigation configuration
├── screens/     # Main application screens
├── services/    # Business logic services
├── styles/      # Global styles and themes
└── utils/       # Utility functions
```

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Abiram116/SpaceLearn.git
```

2. Install dependencies
```bash
cd SpaceLearn
npm install
```

3. Set up environment variables
Create a .env file with the following:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_gemini_api_key
```

4. Run the development server
```bash
npx expo start
```

## Development

- The project uses Expo for cross-platform development
- Web support is configured through webpack(which is not working currently)
- Supabase is used for backend services
- The application follows a modular architecture for better maintainability

## Contributing

We welcome contributions! Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or support, please reach out to sreeabirammandava@gmail.com. 
