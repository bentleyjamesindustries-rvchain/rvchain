import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutBoard";

export const metadata: Metadata = {
  title: "About RV Chain",
  description:
    "RV Chain is a powersports parts board. Identify a part from a photo, then search or list it.",
};

export default function Page() {
  return <AboutPage />;
}
