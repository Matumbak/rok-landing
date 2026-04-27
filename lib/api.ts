/**
 * Landing-side API client. Only public read endpoints.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiRequirement = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  order: number;
  active: boolean;
};

export type ApiMediaItem = {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  videoId: string;
  order: number;
  active: boolean;
};

export type DkpColumnType = "number" | "percent" | "string";

export type DkpColumn = {
  /** Stable identifier used as the API sort key. */
  key: string;
  /** Display label shown in the table header. */
  label: string;
  type: DkpColumnType;
  sortable: boolean;
  order: number;
  /** True for the four built-in fields (rank/governorId/nickname/alliance). */
  native: boolean;
};

/**
 * Each row is a flat record keyed by column.key. Native fields are typed;
 * everything else is `string | number | null` because columns vary per scan.
 */
export type ApiDkpRow = {
  id: string;
  rank: number;
  governorId: string;
  nickname: string;
  alliance: string;
} & Record<string, string | number | null | undefined>;

export type DkpListResponse = {
  columns: DkpColumn[];
  items: ApiDkpRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: { alliances: string[] };
  scan: {
    id: string;
    filename: string;
    uploadedAt: string;
    rowCount: number;
  } | null;
};

export type DkpQuery = {
  search?: string;
  alliance?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

async function get<T>(
  path: string,
  init: RequestInit = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchRequirements(): Promise<ApiRequirement[]> {
  const data = await get<{ items: ApiRequirement[] }>("/api/requirements", {
    next: { revalidate: 60 },
  });
  return data?.items ?? [];
}

export async function fetchMedia(): Promise<ApiMediaItem[]> {
  const data = await get<{ items: ApiMediaItem[] }>("/api/media", {
    next: { revalidate: 60 },
  });
  return data?.items ?? [];
}

export async function fetchDkp(query: DkpQuery = {}): Promise<DkpListResponse> {
  const qs = new URLSearchParams();
  if (query.search) qs.set("search", query.search);
  if (query.alliance) qs.set("alliance", query.alliance);
  if (query.sortBy) qs.set("sortBy", query.sortBy);
  if (query.sortOrder) qs.set("sortOrder", query.sortOrder);
  if (query.page) qs.set("page", String(query.page));
  if (query.pageSize) qs.set("pageSize", String(query.pageSize));
  const path = `/api/dkp${qs.toString() ? `?${qs.toString()}` : ""}`;
  const data = await get<DkpListResponse>(path, { cache: "no-store" });
  return (
    data ?? {
      columns: [],
      items: [],
      page: 1,
      pageSize: query.pageSize ?? 10,
      total: 0,
      totalPages: 1,
      filters: { alliances: [] },
      scan: null,
    }
  );
}
