import { supabase } from "@/lib/supabaseClient";
import type { MarketCondition } from "@/lib/marketListings";

export type HeldDraft = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  fitment: string;
  location: string;
  imageUrl: string;
};

function pack(row: Omit<HeldDraft, "id" | "imageUrl">) {
  return [
    "agent-hold",
    `category: ${row.category}`,
    `fitment: ${row.fitment}`,
    `location: ${row.location}`,
    `condition: ${row.condition}`,
    "",
    row.description,
  ].join("\n");
}

function unpack(description: string, fallbackCategory: string): Pick<
  HeldDraft,
  "description" | "category" | "fitment" | "location" | "condition"
> {
  if (!description.startsWith("agent-hold")) {
    return {
      description,
      category: fallbackCategory,
      fitment: "",
      location: "Syracuse, NY",
      condition: "used",
    };
  }
  const lines = description.split("\n");
  const read = (key: string) => lines.find((line) => line.startsWith(`${key}: `))?.slice(key.length + 2) ?? "";
  const body = lines.slice(6).join("\n").trim();
  return {
    description: body,
    category: read("category") || fallbackCategory,
    fitment: read("fitment"),
    location: read("location") || "Syracuse, NY",
    condition: read("condition") || "used",
  };
}

export async function saveHeldDraft(
  userId: string,
  row: Omit<HeldDraft, "id">,
  email: string | null,
): Promise<{ id?: string; error?: string }> {
  const [city, state] = row.location.split(",").map((part) => part.trim());
  const condition: MarketCondition =
    row.condition === "new" || row.condition === "like-new" || row.condition === "for-parts" || row.condition === "fair"
      ? row.condition
      : "good";
  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({
      user_id: userId,
      kind: "parts",
      title: row.title,
      description: pack(row),
      price: row.price,
      condition,
      city: city || "Syracuse",
      state: (state || "NY").slice(0, 2).toUpperCase(),
      category: "agent-hold",
      images: row.imageUrl ? [row.imageUrl] : [],
      contact_email: email,
      featured: false,
      status: "deleted",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: String((data as { id: string }).id) };
}

export async function loadHeldDrafts(userId: string): Promise<HeldDraft[]> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("id,title,description,price,category,images")
    .eq("user_id", userId)
    .eq("status", "deleted")
    .eq("category", "agent-hold")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((row) => {
    const parsed = unpack(String(row.description ?? ""), String(row.category ?? ""));
    const images = Array.isArray(row.images) ? (row.images as string[]) : [];
    return {
      id: String(row.id),
      title: String(row.title ?? ""),
      description: parsed.description,
      price: Number(row.price ?? 0),
      condition: parsed.condition,
      category: parsed.category,
      fitment: parsed.fitment,
      location: parsed.location,
      imageUrl: images[0] ?? "",
    };
  });
}

export async function publishHeldDraft(
  userId: string,
  row: HeldDraft,
): Promise<{ error?: string }> {
  const [city, state] = row.location.split(",").map((part) => part.trim());
  const condition: MarketCondition =
    row.condition === "new" || row.condition === "like-new" || row.condition === "for-parts" || row.condition === "fair"
      ? row.condition
      : "good";
  const { error } = await supabase
    .from("marketplace_listings")
    .update({
      title: row.title,
      description: row.description,
      price: row.price,
      condition,
      city: city || "Syracuse",
      state: (state || "NY").slice(0, 2).toUpperCase(),
      category: row.category || "other",
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("user_id", userId);
  return error ? { error: error.message } : {};
}

export async function discardHeldDraft(userId: string, id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("marketplace_listings").delete().eq("id", id).eq("user_id", userId);
  return error ? { error: error.message } : {};
}
