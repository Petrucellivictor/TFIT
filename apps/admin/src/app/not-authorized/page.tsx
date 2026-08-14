import { SignOutButton } from "@clerk/nextjs";

export default function NotAuthorizedPage() {
  return (
    <div className="centered-page">
      <span className="state-icon" aria-hidden="true">
        🔒
      </span>
      <h1 className="page-title" style={{ margin: 0 }}>
        Acesso restrito
      </h1>
      <p className="page-subtitle" style={{ margin: 0 }}>
        Sua conta não tem permissão para acessar o painel administrativo da TFIT.
      </p>
      <SignOutButton>
        <button type="button" className="btn btn-secondary">
          Entrar com outra conta
        </button>
      </SignOutButton>
    </div>
  );
}
