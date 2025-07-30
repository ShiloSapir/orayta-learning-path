diff --git a/src/App.tsx b/src/App.tsx
index 5f0fe97624205db0a78c44f8faa390adc0463267..8ceb275cd887e6097efc02c4c2a44d49a06a3cae 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,41 +1,43 @@
 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { ThemeProvider } from "@/components/ThemeProvider";
 import { ErrorBoundary } from "@/components/ErrorBoundary";
 import { AppProvider } from "@/context/AppContext";
 import { AuthProvider } from "@/hooks/useAuth";
 import Index from "./pages/Index";
 import Auth from "./pages/Auth";
+import Admin from "./pages/Admin";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <ErrorBoundary>
     <QueryClientProvider client={queryClient}>
       <ThemeProvider defaultTheme="light" storageKey="orayata-theme">
         <AuthProvider>
           <AppProvider>
             <TooltipProvider>
               <Toaster />
               <Sonner />
               <BrowserRouter>
                 <Routes>
                   <Route path="/" element={<Index />} />
                   <Route path="/auth" element={<Auth />} />
+                  <Route path="/admin" element={<Admin />} />
                   {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                   <Route path="*" element={<NotFound />} />
                 </Routes>
               </BrowserRouter>
             </TooltipProvider>
           </AppProvider>
         </AuthProvider>
       </ThemeProvider>
     </QueryClientProvider>
   </ErrorBoundary>
 );
 
 export default App;
