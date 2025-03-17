import React from 'react';
import { AuthProvider } from './AuthContext'; // Adjusted the import path
import RootLayoutNav from './app/RootLayoutNav';

const App = () => {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
};

export default App;
