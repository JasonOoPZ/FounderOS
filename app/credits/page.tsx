import CreditsClient from "./credits-client";
import creditsData from "@/_data/credits.json";

export const metadata = {
  title: "Must Haves | Launch Perks",
  description: "The highest value startup credits every founder should claim first.",
};

export default function CreditsPage() {
  return <CreditsClient credits={creditsData} />;
}