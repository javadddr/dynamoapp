
import { Footer, FooterBrand, FooterCopyright, FooterDivider, FooterLink, FooterLinkGroup } from "flowbite-react";
import logopic from "./assets/logo5.png"
import logopic2 from "./assets/logo512.png"

export default function FooterLogin() {
  return (
    <Footer container >
      <div className="w-full    mt-0 text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          <FooterBrand
            href="https://dynamofleet.com"
            src={logopic}
            alt="Flowbite Logoa"
          
          />
          <FooterLinkGroup>
          <FooterLink href="https://www.dynamofleet.com/contact">Contact</FooterLink>
            <FooterLink href="https://www.dynamofleet.com/legal-notice">Legal notice</FooterLink>
            <FooterLink href="https://www.dynamofleet.com/privacy-policy">Privacy Policy</FooterLink>
            <FooterLink href="https://www.dynamofleet.com/terms-of-service">Terms of service</FooterLink>

          </FooterLinkGroup>
        </div>

      </div>
    </Footer>
  );
}
