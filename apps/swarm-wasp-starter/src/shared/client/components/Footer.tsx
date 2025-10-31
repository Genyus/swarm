import React from "react";
import githubIcon from "../../../assets/github.svg";
import swarmIcon from "../../../assets/swarm.svg";

export function Footer() {
  return (
    <div className="border-t bg-background/50 px-6 py-6">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-2 md:hidden">
        {/* Logo & Social */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={swarmIcon} alt="Swarm" className="size-4" />
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()}{" "}
              {import.meta.env.REACT_APP_NAME || "Swarm Wasp Starter"}
            </span>
          </div>
          <a
            href="https://github.com/genyus/swarm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <img src={githubIcon} alt="Github" className="size-4 dark:invert" />
          </a>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-center md:justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <a
                href="https://wasp-lang.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground transition-colors hover:text-primary"
              >
                Wasp
              </a>{" "}
              development, turbo-charged{" "}
              <span className="text-primary">🚀</span>
            </h2>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            {import.meta.env.REACT_APP_NAME || "Swarm Wasp Starter"}
          </p>
          <span className="text-muted-foreground">|</span>
          <a
            href="https://github.com/genyus/swarm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <img src={githubIcon} alt="Github" className="size-4 dark:invert" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;
