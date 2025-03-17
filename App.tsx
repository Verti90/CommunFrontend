import React from 'react';
import { AuthProvider } from './AuthContext';
import RootLayoutNav from './app/RootLayoutNav';

const App = () => {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
};

export default App;
