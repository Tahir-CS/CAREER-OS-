import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";

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
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-12">
        <div className="apple-card p-12 text-center max-w-lg w-full">
          <h1 className="text-7xl font-extrabold tracking-tight text-[#0071e3] mb-3">404</h1>
          <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-foreground mb-3">
            Page Not Found
          </h2>
          <p className="text-base text-[#86868b] mb-8 leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
          <a href="/" className="inline-block">
            <Button className="apple-button h-12 px-8 text-base font-semibold">
              Return Home
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
