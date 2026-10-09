import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Home, ArrowLeft } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button/Button";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta
        title="404 - Page Not Found"
        description="The page you are looking for does not exist."
      />
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-12 text-center">
        {/* Visual 404 Icon / Badge */}
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 shadow-inner dark:bg-indigo-950/40">
          <Compass className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="absolute -bottom-2 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm dark:bg-indigo-500">
            404
          </span>
        </div>

        {/* Title and Description */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
          Page Not Found
        </h1>
        <p className="max-w-md text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-8">
          Sorry, we couldn&apos;t find the page you were looking for. It might have been moved, deleted, or does not exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            startIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="default"
              startIcon={<Home className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Back to Task Manager
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
