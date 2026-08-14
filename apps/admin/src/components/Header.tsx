import { SignOutButton } from "@clerk/nextjs";

export function Header({ email }: { email: string }) {
  return (
    <header className="shell-header">
      <div className="brand">
        <span className="brand-dot" aria-hidden="true" />
        TFIT · Moderation Command Center
      </div>
      <div className="header-account">
        <span>{email}</span>
        <SignOutButton>
          <button type="button" className="sign-out-link">
            Sair
          </button>
        </SignOutButton>
      </div>
    </header>
  );
}
