/**
 * RoK screenshot OCR — server-side via Gemini 2.0 Flash.
 *
 * The previous Tesseract.js + regex pipeline produced ~50% accuracy on
 * the engraved Russian client font and required an ever-growing pile of
 * recovery heuristics (period-eaten, В→8, ч→4, etc). Gemini handles all
 * five RoK screen types (profile / kill data / details / resources /
 * speedups) in one call and returns a typed JSON object.
 *
 * Cost: free tier covers 1500 req/day on gemini-2.0-flash, well above
 * realistic migration-form volume.
 *
 * Privacy: API key lives only on rok-api; the browser only POSTs the
 * already-public Vercel Blob URL.
 */

import { API_URL } from "@/lib/api";

export interface ParsedRokScreen {
  power: string | null;
  killPoints: string | null;
  vipLevel: string | null;
  t1Kills: string | null;
  t2Kills: string | null;
  t3Kills: string | null;
  t4Kills: string | null;
  t5Kills: string | null;
  deaths: string | null;
  maxValorPoints: string | null;
  food: string | null;
  wood: string | null;
  stone: string | null;
  gold: string | null;
  speedupsConstruction: string | null;
  speedupsResearch: string | null;
  speedupsTraining: string | null;
  speedupsHealing: string | null;
  speedupsUniversal: string | null;
}

/**
 * Ask the API to OCR an already-uploaded blob. The server fetches the
 * image and sends it to Gemini; we just receive the structured result.
 */
export async function parseUploadedScreen(
  blobUrl: string,
): Promise<ParsedRokScreen> {
  const t0 = performance.now();
  const res = await fetch(`${API_URL}/api/ocr/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blobUrl }),
  });
  const elapsed = Math.round(performance.now() - t0);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    /* eslint-disable no-console */
    console.warn(
      `[OCR] /api/ocr/parse failed in ${elapsed}ms`,
      res.status,
      err,
    );
    /* eslint-enable no-console */
    throw new Error(err?.error ?? `ocr_failed_${res.status}`);
  }

  const body = (await res.json()) as { ok: boolean; data: ParsedRokScreen };
  /* eslint-disable no-console */
  console.groupCollapsed(`[OCR] parsed via Gemini in ${elapsed}ms`);
  console.log(body.data);
  console.groupEnd();
  /* eslint-enable no-console */
  return body.data;
}
