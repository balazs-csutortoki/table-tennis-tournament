import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TournamentPage from './pages/TournamentPage';
import SettingsPage from './pages/SettingsPage';
import RegistrationPage from './pages/RegistrationPage';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<SettingsPage />} />
        <Route path="/tournament" element={<TournamentPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Routes>
    </SettingsProvider>
  );
};

export default App;