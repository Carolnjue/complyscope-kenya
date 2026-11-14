import { LANDING_HTML } from '@/lib/landing-html';
import LandingDemo from '@/components/LandingDemo';

export default function Home() {
  return (
    <>
      <div id="view-home" dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
      <LandingDemo />
    </>
  );
}
