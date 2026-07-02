import { useEffect, useState } from "react";
import TrialApp from "./TrialApp";

/**
 * Renders the legacy react-router-dom SPA on the client only.
 * Avoids SSR errors from BrowserRouter (which needs `window`).
 */
export default function ClientOnly() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <TrialApp />;
}
