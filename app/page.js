import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import ButtonLead from "@/components/ButtonLead";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
      </main>
      <ButtonLead />
    </>
  );
}
