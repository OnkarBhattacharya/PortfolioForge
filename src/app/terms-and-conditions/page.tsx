
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Terms and Conditions</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            Welcome to PortfolioForge! These terms and conditions outline the rules and regulations for the use of PortfolioForge's Website, located at this domain.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use PortfolioForge if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2>Intellectual Property Rights</h2>
          <p>
            Other than the content you own, under these Terms, PortfolioForge and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
          </p>

          <h2>Restrictions</h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul>
            <li>publishing any Website material in any other media;</li>
            <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
            <li>publicly performing and/or showing any Website material;</li>
            <li>using this Website in any way that is or may be damaging to this Website;</li>
            <li>using this Website in any way that impacts user access to this Website;</li>
            <li>using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;</li>
            <li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;</li>
          </ul>

          <h2>Your Content</h2>
          <p>
            In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant PortfolioForge a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
          </p>
          <p>
            Your Content must be your own and must not be invading any third-party’s rights. PortfolioForge reserves the right to remove any of Your Content from this Website at any time without notice.
          </p>

          <h2>No warranties</h2>
          <p>
            This Website is provided “as is,” with all faults, and PortfolioForge express no representations or warranties, of any kind related to this Website or the materials contained on this Website.
          </p>
          
          <h2>Limitation of liability</h2>
          <p>
            In no event shall PortfolioForge, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.
          </p>

          <h2>Governing Law & Jurisdiction</h2>
          <p>
            These Terms will be governed by and interpreted in accordance with the laws of the State of our country, and you submit to the non-exclusive jurisdiction of the state and federal courts located in our country for the resolution of any disputes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
