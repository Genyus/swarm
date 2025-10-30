import swarmIcon from "../../../assets/swarm.svg";
import { useTheme } from "../hooks/useTheme";
import { ThemeSwitcher } from "./ui";

export function Header() {
  const theme = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Left side - Swarm icon */}
      <div className="flex items-center gap-2">
        <img src={swarmIcon} alt="Swarm" className="size-10 dark:invert" />
      </div>

      {/* Right side - Theme switcher */}
      <ThemeSwitcher
        value={theme.themeSetting}
        onChange={theme.setTheme}
        defaultValue="system"
      />
    </header>
  );
}

export default Header;
