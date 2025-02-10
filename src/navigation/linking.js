export const linking = {
  prefixes: ['http://localhost:19006', 'https://your-production-domain.com'],
  config: {
    initialRouteName: 'Splash',
    screens: {
      Splash: '',
      Auth: 'auth',
      ForgotPassword: 'forgot-password',
      MainApp: {
        path: 'app',
        screens: {
          MainTabs: {
            path: '',
            screens: {
              Home: 'home',
              Subjects: 'subjects',
              Notes: 'notes',
              Assignments: 'assignments',
              Profile: 'profile',
            }
          },
          Subspace: 'subjects/:subjectId/spaces/:subspaceId',
          EditProfile: 'profile/edit',
          ChangePassword: 'profile/change-password',
        },
      },
    },
  },
  // Add these configurations for better web support
  getInitialURL() {
    return window.location.href;
  },
  subscribe(listener) {
    // Listen to pop events (back/forward navigation)
    window.addEventListener('popstate', () => listener(window.location.href));
    return () => {
      window.removeEventListener('popstate', () => listener(window.location.href));
    };
  },
}; 