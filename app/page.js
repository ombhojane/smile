"use client"
import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import ButtonLead from "@/components/ButtonLead";
import { SessionProvider } from 'next-auth/react';

export default function Home() {
  return (
    <>
      <SessionProvider>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
      </main>
      <ButtonLead />
      </SessionProvider>
    </>
  );
}
