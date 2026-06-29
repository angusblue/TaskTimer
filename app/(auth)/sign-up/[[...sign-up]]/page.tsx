import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Join EVMods</h1>
          <p className="text-white/40 text-sm">Start configuring your Tesla today</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
