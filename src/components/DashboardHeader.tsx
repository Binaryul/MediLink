import type { ReactNode } from "react";

interface DashboardHeaderProps {
  className?: string;
  metaClassName?: string;
  greetingClassName?: string;
  idClassName?: string;
  logoutButtonClassName?: string;
  name: string;
  idLabel?: ReactNode;
  idValue?: ReactNode;
  onLogout: () => void;
  children?: ReactNode;
}

function DashboardHeader({
  className,
  metaClassName,
  greetingClassName,
  idClassName,
  logoutButtonClassName,
  name,
  idLabel = "ID:",
  idValue,
  onLogout,
  children,
}: DashboardHeaderProps) {
  return (
    <header className={className}>
      <div className={metaClassName}>
        <div className={greetingClassName}>Hello {name}</div>
        <div className={idClassName}>
          {idLabel} {idValue}
        </div>
      </div>
      {children}
      <button
        className={logoutButtonClassName}
        type="button"
        onClick={onLogout}
      >
        Log out
      </button>
    </header>
  );
}

export default DashboardHeader;
