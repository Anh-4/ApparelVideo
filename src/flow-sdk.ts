/**
 * flow-sdk (adapter) — bản sinh VIDEO qua Google Veo (Google AI / Gemini API).
 * Giữ nguyên "hình dạng" API Flow.* để App.tsx import bare 'flow-sdk' chạy được:
 *   - Flow.media.select   → mở hộp chọn file ảnh, trả MediaResult {mediaId, base64, mimeType, name, type}
 *   - Flow.generate.video → gọi Veo sinh video từ prompt + (tùy chọn) ảnh sản phẩm tham chiếu
 *   - Flow.download       → tải file (video/ảnh) về máy
 *
 * Veo chạy BẤT ĐỒNG BỘ (long-running operation):
 *   1) POST {model}:predictLongRunning  → trả về operation.name
 *   2) GET  {operation.name}            → poll tới khi done === true
 *   3) Lấy video (uri file hoặc base64 inline) → tải bytes → base64 để nhúng <video src="data:...">
 *
 * API key: dùng CHUNG Google AI key với Gemini (aistudio.google.com/apikey).
 * Lấy từ localStorage["GEMINI_API_KEY"] (popup) hoặc VITE_GEMINI_API_KEY khi dev.
 *
 * ⚠️ Lưu ý cho Anh4:
 *  - Model id Veo có thể đổi theo thời gian — chỉnh trong VIDEO_MODELS bên dưới nếu API báo 404.
 *  - Veo image-to-video coi ảnh tham chiếu là KHUNG HÌNH ĐẦU (animate từ ảnh đó). Với ảnh sản phẩm
 *    phẳng, kết quả có thể là "animate tấm ảnh sản phẩm" chứ không tự mặc lên người mẫu. Muốn
 *    "người mẫu mặc sản phẩm" chuẩn hơn cần tính năng reference-images của Veo 3.1 (xem USE_IMAGE).
 *  - Veo thường chỉ nhận 1 ảnh init → hiện chỉ dùng ảnh ĐẦU TIÊN (mặt trước). Ảnh mặt sau tạm bỏ qua.
 *  - durationSeconds: tùy phiên bản Veo có thể bị giới hạn/làm tròn (vd Veo 3 hay cố định 8s).
 */

export interface VideoModel { id: string; label: string }

// Map modelDisplayName mà App.tsx truyền vào -> model id Veo.
// Veo 3 (veo-3.0-*) đã deprecated (tắt 30/06/2026) -> dùng Veo 3.1 (đang hoạt động trên Gemini API).
export const VIDEO_MODELS: VideoModel[] = [
  { id: 'veo-3.1-fast-generate-preview', label: 'Omni Flash' }, // nhanh/rẻ hơn
  { id: 'veo-3.1-generate-preview',      label: 'Omni Pro' },   // chất lượng cao hơn
];

const DEFAULT_MODEL_ID = 'veo-3.1-fast-generate-preview';
const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';

// Bật/tắt việc gửi ảnh sản phẩm làm ảnh init (image-to-video). Đặt false nếu chỉ muốn
// sinh từ text prompt (tránh trường hợp Veo chỉ "animate" tấm ảnh phẳng).
const USE_IMAGE = true;

// Khoảng cách giữa các lần poll + thời gian chờ tối đa.
const POLL_INTERVAL_MS = 8000;
const MAX_WAIT_MS = 6 * 60 * 1000;

export const KEY_STORAGE = 'GEMINI_API_KEY';

export interface MediaResult {
  mediaId: string;
  base64: string;
  mimeType: string;
  name: string;
  type: 'image' | 'video' | 'audio';
}

// Registry: ánh xạ mediaId -> dữ liệu media, để generate.video lấy lại ảnh tham chiếu.
const registry = new Map<string, { base64: string; mimeType: string }>();

const uid = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** displayName ('Omni Flash') -> model id Veo. Không khớp thì dùng model mặc định. */
function resolveModelId(displayName?: string): string {
  if (!displayName) return DEFAULT_MODEL_ID;
  const hit = VIDEO_MODELS.find((m) => m.label === displayName);
  return hit?.id ?? DEFAULT_MODEL_ID;
}

/** Lấy Google AI API key: ưu tiên key nhúng lúc dev -> key người dùng lưu ở localStorage (qua popup). */
function getApiKey(): string {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
  if (envKey && envKey.trim()) return envKey.trim();

  const key = (localStorage.getItem(KEY_STORAGE) || '').trim();
  if (!key) throw new Error('Chưa có Google AI API key — bấm "API Key" để nhập (lấy ở aistudio.google.com/apikey).');
  return key;
}

/** Gắn key vào URL (xử lý cả khi URL đã có sẵn query string). */
function withKey(url: string, key: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}key=${encodeURIComponent(key)}`;
}

/** Mở hộp chọn file ảnh của hệ điều hành, đọc thành base64. */
function selectImageFile(): Promise<MediaResult> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('Không có file nào được chọn'));
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1] || '';
        const mediaId = uid();
        registry.set(mediaId, { base64, mimeType: file.type });
        resolve({ mediaId, base64, mimeType: file.type, name: file.name, type: 'image' });
      };
      reader.onerror = () => reject(reader.error || new Error('Lỗi đọc file'));
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

/** Đọc lỗi từ response Google AI (nếu có message JSON thì ưu tiên). */
async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const j = await res.json();
    return j?.error?.message || fallback;
  } catch {
    return fallback;
  }
}

/** Bắt đầu job sinh video -> trả về operation name. */
async function startVideoOp(opts: {
  prompt: string;
  model: string;
  key: string;
  aspectRatio?: string;
  durationSeconds?: number;
  initImage?: { base64: string; mimeType: string };
}): Promise<string> {
  const instance: any = { prompt: opts.prompt };
  if (opts.initImage) {
    instance.image = {
      bytesBase64Encoded: opts.initImage.base64,
      mimeType: opts.initImage.mimeType,
    };
  }

  const parameters: any = { personGeneration: 'allow_adult' };
  if (opts.aspectRatio) parameters.aspectRatio = opts.aspectRatio;
  if (opts.durationSeconds) parameters.durationSeconds = opts.durationSeconds;

  const res = await fetch(
    withKey(`${API_ROOT}/models/${opts.model}:predictLongRunning`, opts.key),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [instance], parameters }),
    }
  );

  if (!res.ok) throw new Error(await readError(res, `Veo lỗi ${res.status} khi khởi tạo video`));

  const data = await res.json();
  const name = data?.name;
  if (!name) throw new Error('Veo không trả về operation name. Kiểm tra model id / quyền truy cập Veo.');
  return name as string;
}

/** Poll operation tới khi done; trả về object response. */
async function pollVideoOp(name: string, key: string): Promise<any> {
  const started = Date.now();
  // op.name dạng "models/veo-.../operations/xxx" -> ghép thẳng vào API_ROOT.
  const url = `${API_ROOT}/${name}`;

  while (true) {
    if (Date.now() - started > MAX_WAIT_MS) {
      throw new Error('Veo quá thời gian chờ (>6 phút). Thử lại hoặc giảm độ phức tạp.');
    }
    await sleep(POLL_INTERVAL_MS);

    const res = await fetch(withKey(url, key));
    if (!res.ok) throw new Error(await readError(res, `Veo lỗi ${res.status} khi kiểm tra tiến trình`));

    const op = await res.json();
    if (op?.error) throw new Error(op.error.message || 'Veo báo lỗi trong quá trình sinh video.');
    if (op?.done) return op.response ?? {};
  }
}

/** Tìm video (uri file hoặc base64 inline) trong response, bất kể tên field khác nhau giữa các phiên bản. */
function extractVideo(resp: any): { uri?: string; base64?: string; mimeType: string } {
  const samples: any[] =
    resp?.generateVideoResponse?.generatedSamples ??
    resp?.generatedVideos ??
    resp?.videos ??
    resp?.predictions ??
    [];

  for (const s of samples) {
    const v = s?.video ?? s;
    const uri = v?.uri || v?.videoUri || s?.uri;
    const base64 = v?.bytesBase64Encoded || v?.videoBytes || s?.bytesBase64Encoded;
    const mimeType = v?.mimeType || 'video/mp4';
    if (uri) return { uri, mimeType };
    if (base64) return { base64, mimeType };
  }
  throw new Error('Veo hoàn tất nhưng không tìm thấy video trong kết quả (có thể bị chặn bởi bộ lọc an toàn).');
}

/** Tải bytes từ Files API URI của Veo -> base64. */
async function fetchUriAsBase64(uri: string, key: string): Promise<string> {
  const res = await fetch(withKey(uri, key));
  if (!res.ok) throw new Error(await readError(res, `Lỗi ${res.status} khi tải file video về.`));
  const blob = await res.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Lỗi đọc blob video'));
    reader.readAsDataURL(blob);
  });
  return dataUrl.split(',')[1] || '';
}

export const Flow = {
  media: {
    select: (_opts?: { filter?: string }): Promise<MediaResult> => selectImageFile(),
  },

  generate: {
    video: async (opts: {
      prompt: string;
      modelDisplayName?: string;
      aspectRatio?: string;
      durationSeconds?: number;
      referenceImageMediaIds?: string[];
    }): Promise<MediaResult> => {
      const key = getApiKey();
      const model = resolveModelId(opts.modelDisplayName);

      // Veo chỉ nhận 1 ảnh init -> dùng ảnh đầu tiên (mặt trước) nếu có và USE_IMAGE bật.
      let initImage: { base64: string; mimeType: string } | undefined;
      if (USE_IMAGE) {
        const firstId = opts.referenceImageMediaIds?.[0];
        const m = firstId ? registry.get(firstId) : undefined;
        if (m) initImage = { base64: m.base64, mimeType: m.mimeType };
      }

      const name = await startVideoOp({
        prompt: opts.prompt,
        model,
        key,
        aspectRatio: opts.aspectRatio,
        durationSeconds: opts.durationSeconds,
        initImage,
      });

      const resp = await pollVideoOp(name, key);
      const found = extractVideo(resp);
      const base64 = found.base64 ?? (await fetchUriAsBase64(found.uri!, key));

      const mediaId = uid();
      registry.set(mediaId, { base64, mimeType: found.mimeType });
      return { mediaId, base64, mimeType: found.mimeType, name: 'result', type: 'video' };
    },
  },

  download: async (opts: {
    base64: string;
    mimeType: string;
    filename: string;
  }): Promise<void> => {
    const a = document.createElement('a');
    a.href = `data:${opts.mimeType};base64,${opts.base64}`;
    a.download = opts.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
};

export default Flow;
