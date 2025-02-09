import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthActions = () => {
  const { signIn, signUp, signOut, resetPassword } = useAuth();
  return { signIn, signUp, signOut, resetPassword };
}; 