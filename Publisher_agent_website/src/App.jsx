import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import DownloadPage from './pages/DownloadPage';
import SecurityPage from './pages/SecurityPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PricingPage from './pages/PricingPage';
import ChangelogPage from './pages/ChangelogPage';
import DocsPage from './pages/DocsPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';

import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/api-reference" element={<DocsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />

      </Routes>
    </Router>
  );
}

export default App;
