import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useVoxtral } from "./components/VoxtralContext";
import { VoxtralProvider } from "./components/VoxtralProvider";
import { LandingPage } from "./components/LandingPage";
import { LoadingPage } from "./components/LoadingPage";
import { RunningPage } from "./components/RunningPage";
import { DocumentationPage } from "./components/DocumentationPage";
import { THEME } from "./constants";

const PAGE_BY_STATUS = {
  idle: LandingPage,
  loading: LoadingPage,
  error: LoadingPage,
  ready: RunningPage,
  recording: RunningPage,
} as const;

const AppContent = () => {
  const { status } = useVoxtral();
  const Page = PAGE_BY_STATUS[status];
  return <Page />;
};

const AppWithNavigation = () => {
  return (
    <div className="relative min-h-screen">
      {/* Navigation Header */}
      <div className="absolute top-4 right-4 z-50">
        <Link
          to="/documentation"
          className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: THEME.mistralOrange }}
        >
          API Docs
        </Link>
      </div>
      
      <AppContent />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <VoxtralProvider>
        <Routes>
          <Route path="/" element={<AppWithNavigation />} />
          <Route path="/documentation" element={<DocumentationPage />} />
        </Routes>
      </VoxtralProvider>
    </Router>
  );
};

export default App;
