import { Suspense } from 'react'
import Link from 'next/link';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
// import Pricing from "@/components/Pricing";
// import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
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
        
        {/* <FeaturesAccordion /> */}
        {/* <Pricing /> */}
        {/* <FAQ /> */}
        {/* <CTA /> */}
        {/* <ButtonLead />         */}
      </main>
      <Footer />
    </>
  );
}
