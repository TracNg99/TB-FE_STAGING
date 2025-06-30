import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
} from '@tabler/icons-react';
import Link from 'next/link';

const footerLinks = [
  {
    title: 'About us',
    href: '/about',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
  {
    title: 'FAQ & Customer Support',
    href: '/faqs',
  },
  {
    title: 'Terms & Privacy',
    href: '/tos',
  },
];

const socialLinks = [
  {
    title: IconBrandFacebook,
    href: 'https://www.facebook.com',
  },
  {
    title: IconBrandInstagram,
    href: 'https://www.instagram.com',
  },
  {
    title: IconBrandTwitter,
    href: 'https://www.twitter.com',
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-base-black/25 mt-32">
      <div className="lg:max-w-pc mx-auto flex flex-col lg:flex-row justify-between px-4 py-8 gap-12">
        <div className="flex gap-6 flex-col lg:flex-row">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base-black/90 hover:text-orange-500 text-md"
            >
              {link.title}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-md text-base-black/90">
            © 2025 Travel Buddy LLC All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            {socialLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <link.title className="size-8 text-base-black/90 hover:text-orange-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
