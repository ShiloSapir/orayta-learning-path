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
=======
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = () => {
  return (
    <ProtectedRoute>
      <OrayataApp />
    </ProtectedRoute>
  );
};

export default Index;
