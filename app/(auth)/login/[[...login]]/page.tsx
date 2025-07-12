import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center p-5 gap-10 animate-fade-in">
      <Image
        src="./logo.svg"
        alt="Calendra Logo"
        width={150}
        height={150}
       />

      {/* Add your login form or Clerk components here */}
        <div className="mt-3">
            <SignIn/>
        </div>
    </main>
  );
}