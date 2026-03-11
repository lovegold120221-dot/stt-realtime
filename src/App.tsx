import { useVoxtral } from "./components/VoxtralContext";
import { VoxtralProvider } from "./components/VoxtralProvider";
import { LandingPage } from "./components/LandingPage";
import { LoadingPage } from "./components/LoadingPage";
import { RunningPage } from "./components/RunningPage";

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

const App = () => {
  return (
    <VoxtralProvider>
      <AppContent />
    </VoxtralProvider>
  );
};

export default App;
