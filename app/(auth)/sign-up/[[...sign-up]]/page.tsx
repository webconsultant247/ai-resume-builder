import { SignUp } from "@clerk/nextjs";
const SignUpPage = () => {
  return (
    <main className="flex h-screen items-center justify-center p-3">
      <SignUp />
    </main>
  );
};

export default SignUpPage;
