export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 40 }}>
      <h1>TFIT API</h1>
      <p>This is the App Fit backend. It has no end-user UI — clients are the mobile app and (later) the admin panel.</p>
      <p>
        Health check: <code>/api/health</code>
      </p>
    </main>
  );
}
