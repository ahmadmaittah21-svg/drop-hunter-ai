import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-display text-2xl font-semibold">Not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">This item doesn't exist, or it belongs to a different account.</p>
      <Link href="/dashboard"><Button>Back to Dashboard</Button></Link>
    </div>
  );
}
