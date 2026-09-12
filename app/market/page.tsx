import { Suspense } from "react";
import Market from "@/components/pages/MarketBoard";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Market />
    </Suspense>
  );
}
