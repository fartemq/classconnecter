
import React, { Suspense } from "react";
import { Loader } from "./loader";

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children, 
  fallback = <div className="flex justify-center py-8"><Loader size="lg" /></div>
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};
