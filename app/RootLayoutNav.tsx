import React from 'react';
import { useAuth } from '../AuthContext';

const RootLayoutNav = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome, {user.name}!
      {/* Other components */}
    </div>
  );
};

export default RootLayoutNav;
