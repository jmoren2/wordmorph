import WordMorph from "@/components/WordMorph";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

export default async function WordMorphPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin"); // Redirect to login if not authenticated
  }

  return( <WordMorph user={session.user} />);
}