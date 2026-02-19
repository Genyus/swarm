import { Outlet } from "react-router";
import { useThemeProvider } from "../hooks/useTheme";
import "../Main.css";
import Footer from "./Footer";
import Header from "./Header";
import { Toaster, TooltipProvider } from "./ui";

export default function Layout() {
  const ThemeProvider = useThemeProvider();

  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
