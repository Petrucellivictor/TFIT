import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="centered-page">
      <div className="brand" style={{ fontSize: 15, marginBottom: 8 }}>
        <span className="brand-dot" aria-hidden="true" />
        TFIT · Moderation Command Center
      </div>
      <SignIn />
    </div>
  );
}
