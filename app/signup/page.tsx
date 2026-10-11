import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage({ searchParams }: { searchParams: { role?: string } }): JSX.Element {
  return <AuthForm mode="signup" initialRole={searchParams.role} />;
}
