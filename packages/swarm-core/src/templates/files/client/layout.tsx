import { Outlet } from "react-router-dom";
import { twMerge } from "tailwind-merge";

interface {{ComponentName}}LayoutProps {
  className?: string;
}

export const {{ComponentName}}Layout = ({ className, ...props }: {{ComponentName}}LayoutProps) => {
  return (
    <div className={twMerge("min-h-screen", className)}>
      {/* Add layout header/navigation here */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      {/* Add layout footer here */}
    </div>
  );
};
