/**
 * Tesseract-backed OCR for RoK screenshots. The worker is created lazily
 * on first call and reused for the lifetime of the page — initialization
 * downloads the eng.traineddata blob (~30 MB) and the WASM core, so we
 * pay that cost once instead of per-image.
 *
 * Public surface is intentionally tiny: pass a Blob, get back the text.
 * Callers run the result through parse-rok.ts to extract structured
 * fields.
 */

import type { Worker } from "tesseract.js";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    // Tesseract.js is ~3MB of JS + WASM + traineddata — load lazily so
    // it never enters the initial bundle. The dynamic import also keeps
    // it out of the SSR pass entirely.
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      // Load Russian + English so the parser works for the RoK ru-RU
      // client (most of our applicants) AND the English client. Each
      // traineddata file is ~5–10 MB compressed and pulled from the
      // tessdata-fast CDN; cached after first load.
      const worker = await createWorker(["rus", "eng"], undefined, {
        logger: () => {},
      });
      await worker.setParameters({
        tessedit_pageseg_mode: "6" as unknown as never, // PSM_SINGLE_BLOCK
      });
      return worker;
    })();
  }
  return workerPromise;
}

export async function extractText(image: Blob | string): Promise<string> {
  const worker = await getWorker();
  const t0 = performance.now();
  const result = await worker.recognize(image);
  const text = result.data.text;
  const elapsed = Math.round(performance.now() - t0);
  // Group log so it's collapsible in DevTools. Full raw text first so the
  // user can copy-paste it back when reporting bad parses.
  /* eslint-disable no-console */
  console.groupCollapsed(
    `[OCR] extracted ${text.length} chars in ${elapsed}ms`,
  );
  console.log("--- RAW TEXT ---");
  console.log(text);
  console.log("--- END RAW ---");
  console.groupEnd();
  /* eslint-enable no-console */
  return text;
}

/**
 * Extract from many images in parallel-but-bounded fashion. Tesseract.js
 * is single-worker so true parallelism doesn't help; we just await
 * sequentially and let the caller decide whether to await the batch or
 * race it with the rest of the upload pipeline.
 */
export async function extractMany(images: Blob[]): Promise<string[]> {
  const out: string[] = [];
  for (const img of images) {
    try {
      out.push(await extractText(img));
    } catch (err) {
      console.warn("[ocr] extract failed", err);
      out.push("");
    }
  }
  return out;
}
