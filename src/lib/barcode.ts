/**
 * Live barcode scanner. Prefers the native BarcodeDetector API
 * (Chrome on Android, Safari iOS 17+); falls back to @zxing/browser.
 */

export type ScanStop = () => void;

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement | ImageBitmap) => Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike;
  }
}

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'];

async function getCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });
}

async function startNative(video: HTMLVideoElement, onCode: (code: string) => void): Promise<ScanStop> {
  const detector = new window.BarcodeDetector!({ formats: FORMATS });
  const stream = await getCameraStream();
  video.srcObject = stream;
  await video.play();

  let active = true;
  const tick = async () => {
    if (!active) return;
    try {
      const codes = await detector.detect(video);
      const first = codes[0]?.rawValue;
      if (first) {
        active = false;
        onCode(first);
        return;
      }
    } catch {
      // ignore single-frame errors
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return () => {
    active = false;
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  };
}

async function startZxing(video: HTMLVideoElement, onCode: (code: string) => void): Promise<ScanStop> {
  const { BrowserMultiFormatReader } = await import('@zxing/browser');
  const reader = new BrowserMultiFormatReader();
  let active = true;
  const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
    if (!active || !result) return;
    active = false;
    onCode(result.getText());
    controls.stop();
  });
  return () => {
    active = false;
    try {
      controls.stop();
    } catch {
      /* noop */
    }
  };
}

export async function startBarcodeScan(video: HTMLVideoElement, onCode: (code: string) => void): Promise<ScanStop> {
  if (typeof window !== 'undefined' && window.BarcodeDetector) {
    try {
      return await startNative(video, onCode);
    } catch {
      // fall through to zxing
    }
  }
  return startZxing(video, onCode);
}
