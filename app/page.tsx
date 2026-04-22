import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Pillars from '@/components/Pillars';
import HowItWorks from '@/components/HowItWorks';
import Formula from '@/components/Formula';
import Comparison from '@/components/Comparison';
import Guarantee from '@/components/Guarantee';
import FounderNote from '@/components/FounderNote';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Pillars />
        <HowItWorks />
        <Formula />
        <Comparison />
        <Guarantee />
        <FounderNote />
        <FAQ />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
