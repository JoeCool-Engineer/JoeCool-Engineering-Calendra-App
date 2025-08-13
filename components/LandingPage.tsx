'use client'
import { SignIn } from "@clerk/nextjs"
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes"

 // Mark this file as a Client Component

export default function LandingPage() {
    return (
        <main className="flex items-center p-10 gap-24 animate-fade-in max-md:flex-col">
            {/* Content of the landing page goes here */}
        <section className="flex flex-col items-center">
            {/* App Logo */}
            <img src="./logo.svg" alt="App Logo" width={300} height={300} /> 
            {/* Main Heading */}
            <h1 className="text-2xl font-black lg:text-3xl">
                Your time, perfectly planned
            </h1>
            {/* Subheading */}
            <p className="font-extralight">
                Join millions of professionals who trust us to manage their time effectively.
            </p>
            {/* Illustration below the text */}
            <img src='./planning.svg' alt="Planning Logo" width={500} height={500} />
        </section>

        {/* Clerk Sign-In Component with custom theme */}
        <div className='mt-3'>
            <SignIn
                routing="hash" // Keeps sign-in UI on the same page using hash-based routing
                appearance={{
                    baseTheme: neobrutalism, // Applies the neobrutalism theme style to the sign-in UI using Clerk's themes
                }}
            />
        </div>
        </main>
    )
}