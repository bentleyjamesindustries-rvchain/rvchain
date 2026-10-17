export type AgentDraft = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  fitment: string;
  location: string;
  imageDataUrl: string;
  createdAt: string;
};

const KEY = "rvchain_agent_queue_v1";

export function loadAgentQueue(): AgentDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? (JSON.parse(raw) as AgentDraft[]) : [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export function saveAgentQueue(rows: AgentDraft[]) {
  const slim = rows.map((row) => ({
    ...row,
    imageDataUrl: row.imageDataUrl.length > 400_000 ? "" : row.imageDataUrl,
  }));
  localStorage.setItem(KEY, JSON.stringify(slim));
}
