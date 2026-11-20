import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { AppChrome } from "@/components/layouts/app-chrome";
import { StoreProvider } from "@/store/provider";
import "./globals.css";
import "./operations.css";

const sans = localFont({
  src: [
    {
      path: "../../public/fonts/dm-sans-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/dm-sans-semibold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-safar-sans",
  display: "swap",
});
const serif = localFont({
  src: [
    {
      path: "../../public/fonts/dm-serif-display.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/dm-serif-display-italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-safar-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Safar Cabs — A beautiful beginning",
    template: "%s | Safar Cabs",
  },
  description:
    "Every journey deserves a beautiful beginning. Meet Safar Cabs, a more thoughtful way to go.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${serif.variable} light`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Suspense
          fallback={
            <div className="profile-loading page-width" role="status">
              Opening Safar…
            </div>
          }
        >
          <StoreProvider>
            <AppChrome>{children}</AppChrome>
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
