import { OrayataApp } from "@/components/OrayataApp";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "../context/AppContext";

const Index = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <OrayataApp />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default Index;
