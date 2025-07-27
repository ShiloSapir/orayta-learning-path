import { OrayataApp } from "@/components/OrayataApp";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = () => {
  return (
    <ProtectedRoute>
      <OrayataApp />
    </ProtectedRoute>
  );
};

export default Index;
