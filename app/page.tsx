import Announcement from '@/components/Announcement';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Pillars from '@/components/Pillars';
import HowItWorks from '@/components/HowItWorks';
import Formula from '@/components/Formula';
import Comparison from '@/components/Comparison';
import Guarantee from '@/components/Guarantee';
import FounderNote from '@/components/FounderNote';
import FAQ from '@/components/FAQ';
import EmailCapture from '@/components/EmailCapture';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';

export default function HomePage() {
  return (
    <>
      <Announcement />
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
        <EmailCapture />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
