import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { installMockApi } from './mockApi.js';

export default function TrialApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    installMockApi();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
