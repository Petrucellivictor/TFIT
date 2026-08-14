"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="centered-page">
      <span className="state-icon" aria-hidden="true">
        ⚠️
      </span>
      <h1 className="page-title" style={{ margin: 0 }}>
        Algo deu errado
      </h1>
      <p className="page-subtitle" style={{ margin: 0 }}>
        Não conseguimos carregar essa página agora.
        {error.digest ? ` (ref: ${error.digest})` : ""}
      </p>
      <button type="button" className="btn btn-primary" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
