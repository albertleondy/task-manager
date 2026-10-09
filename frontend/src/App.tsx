import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/layout/AppLayout";
import LoadingSpinner from "@/components/ui/loading/LoadingSpinner";

// Lazy-loaded route pages
const TaskManager = lazy(() => import("@/pages/TaskManager"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-24">
                <LoadingSpinner size="lg" label="Loading page..." />
              </div>
            }
          >
            <Routes>
              {/* Main Task Manager Application */}
              <Route path="/" element={<TaskManager />} />
              <Route path="/boards" element={<Navigate to="/" replace />} />

              {/* Catch-all Not Found 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
