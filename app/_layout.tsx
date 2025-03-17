import React from 'react';
import { AuthProvider } from '../AuthContext'; // Adjusted the import path
import RootLayoutNav from './RootLayoutNav';

const Layout = () => {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
};

export default Layout;
