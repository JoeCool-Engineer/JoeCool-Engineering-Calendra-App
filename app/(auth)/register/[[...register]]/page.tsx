import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <main className="flex flex-col items-center p-5 gap-10 animate-fade-in">
      <Image
        src="./logo.svg"
        width={150}
        height={150}
        alt="Calendra Logo"
        />
        
      {/* Add your registration form or Clerk components here */}
      <div className="mt-3">
        {/* Example: <SignUp /> */}
        <SignUp />
      </div>
    </main>
  );
}