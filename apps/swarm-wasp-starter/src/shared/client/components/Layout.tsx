import { Toaster } from 'react-hot-toast';
import { Outlet } from "react-router-dom";
import { useTheme, useThemeProvider } from "../hooks/useTheme";
import '../Main.css';
import { TooltipProvider } from "./ui";

// TODO: Add things like a header and footer
// TooltipProvider and ThemeContext are already included.

export default function Layout() {
    const ThemeProvider = useThemeProvider()
    const t = useTheme()

    return <ThemeProvider>
        <TooltipProvider>
            <Toaster toastOptions={{
                className: 'bg-surface-800 text-surface-100 border',
            }}/>
            <Outlet/>
        </TooltipProvider>
    </ThemeProvider>
}