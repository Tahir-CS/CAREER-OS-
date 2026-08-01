import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <div className="border-4 border-black bg-destructive p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] text-center max-w-xl w-full">
          <h1 className="text-8xl font-black uppercase text-white tracking-tighter mb-4">404</h1>
          <p className="text-2xl font-bold uppercase text-white mb-8">
            System Failure: Page Not Found
          </p>
          <a href="/" className="inline-block brutalist-button h-14 leading-[52px] px-8 bg-black text-white dark:bg-white dark:text-black text-lg uppercase tracking-widest hover:bg-secondary">
            Return to Base
          </a>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
