# SpaceLearn

SpaceLearn is an educational platform designed to help students learn through interactive AI-powered conversations and organized learning spaces.

## Current Features

### Authentication
- User registration with email/password
- Profile creation with optional details (username, full name, age, gender)
- Secure login/logout functionality
- Password reset capability

### Learning Spaces
- **Subjects**: Create and manage different subject areas
- **Subspaces**: Create topic-specific learning spaces within subjects
- **AI Conversations**: Interactive learning through AI-powered chat in each subspace
  - Code examples with syntax highlighting
  - Step-by-step explanations
  - Support for multiple programming languages (JavaScript, Python, Rust)
  - Mathematical and scientific concept breakdowns

### User Experience
- Clean, modern UI design
- Mobile-responsive layout
- Dark mode support
- Progress tracking with learning streaks
- Recent activity tracking

## Planned Features

### Notes System (Coming Soon)
- Create and organize notes within subspaces
- Rich text editing
- Code snippet support
- Image attachments
- Search and filter capabilities

### Assignments (Coming Soon)
- Create and track assignments
- Set due dates and priorities
- Progress tracking
- Completion status
- Assignment analytics

### Future Enhancements
- Study group collaboration
- File sharing capabilities
- Advanced analytics and progress tracking
- Customizable learning paths
- Integration with external learning resources
- Mobile app versions

## Technical Stack

- React Native / Expo
- Supabase for backend and authentication
- DeepSeek AI for intelligent responses
- Custom syntax highlighting
- Real-time data synchronization

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/SpaceLearn.git
```

2. Install dependencies
```bash
cd SpaceLearn
npm install
```

3. Set up environment variables
Create a .env file with the following:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_DEEPSEEK_API_URL=your_deepseek_api_url
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
```

4. Run the development server
```bash
npm start
```

## Contributing

We welcome contributions! Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or support, please reach out to [your contact information]. 