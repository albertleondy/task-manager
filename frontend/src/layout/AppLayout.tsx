import React from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import AppHeader from "./AppHeader";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import ErrorPopupModal from "@/components/ui/modal/ErrorPopupModal";

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <ToastContainer />
        <ErrorPopupModal />
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || <Outlet />}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default AppLayout;
