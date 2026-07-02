import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JournalMatutino from "./journal-matutino";

export default async function JournalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });

  return <JournalMatutino userId={user.id} initialEntries={entries ?? []} />;
}
