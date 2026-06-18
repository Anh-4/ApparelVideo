# 🎬 Video Sản Phẩm — Kozmoz Studio

App desktop tạo **video thời trang cinematic** (người mẫu mặc sản phẩm apparel) bằng **Google Veo** (Google AI API).
Upload ảnh sản phẩm (mặt trước/sau) → chọn phong cách + người mẫu + thời lượng → tạo **video đơn** hoặc **combo 4 phong cách**.

> Stack: React + TypeScript + Vite + TailwindCSS. Đóng gói desktop bằng **Electron "thin shell"**:
> file .exe portable chỉ là vỏ mỏng, mở lên **tải giao diện từ GitHub Pages** → luôn là bản mới nhất.

---

## 1. Mô hình hoạt động (quan trọng)

```
Anh4 sửa code ──push main──► GitHub Actions build & deploy ──► GitHub Pages
                                                                    │
                          File .exe portable (vỏ mỏng) ──mở app──► tải web mới nhất
                                                          (offline → fallback bản bundled)
```

- **Người dùng chỉ cần 1 file portable .exe**: nhấp đúp là chạy, **không cần cài**.
- Anh4 cập nhật → push lên `main` → **lần mở app kế tiếp người dùng tự có bản mới**, KHÔNG cần tải lại .exe.
- Không cần internet vẫn mở được (dùng bản giao diện đóng gói sẵn trong .exe lúc build).

## 2. Chạy thử trên máy dev

Cần **Node.js 18+**.

```bash
cd apparel-video
npm install
npm run electron:dev   # app desktop (vỏ Electron tải vite 127.0.0.1:5175), hot-reload
# hoặc:  npm run dev    # chỉ chạy web http://127.0.0.1:5175
```

## 3. API key Google AI (Veo)

App cần **Google AI API key** (lấy tại https://aistudio.google.com/apikey) — dùng chung cho Veo.

- App **tự hiện popup nhập key khi mở lần đầu**; key chỉ **lưu trên máy người dùng** (localStorage), chỉ gửi tới Google khi tạo video. Mỗi người tự nhập key của mình → an toàn khi chia sẻ.
- Nút **"API Key"** ở góc trên vùng xem trước để đổi key bất cứ lúc nào.

> ⚠️ Veo tốn phí theo từng video và chạy 1–3 phút/clip; combo = 4 job song song (nặng quota).

## 4. Build file .exe portable để chia sẻ

```bash
npm run dist:win
```

Ra file **`release/Video-San-Pham-x.x.x-portable.exe`** — gửi thẳng file này cho người khác.

> Chỉ cần build lại .exe khi sửa **phần vỏ Electron** (`electron/main.cjs`) — việc rất hiếm.
> Còn sửa giao diện/logic (thư mục `src/`) thì KHÔNG cần build lại .exe, chỉ push code (mục 5).

## 5. Cập nhật cho mọi người (chỉ cần push code)

```bash
git add -A
git commit -m "..."
git push origin main
```

GitHub Actions ([deploy-pages.yml](.github/workflows/deploy-pages.yml)) tự build và deploy lên GitHub Pages
(`https://anh-4.github.io/ApparelVideo/`). Người dùng mở app lần kế tiếp là thấy bản mới.

> Lần đầu: vào repo → **Settings → Pages → Source = GitHub Actions** (workflow đã bật sẵn `enablement: true`).

---

## Cấu trúc

```
apparel-video/
├── src/
│   ├── App.tsx                  # Giao diện chính (logic tạo video đơn / combo)
│   ├── flow-sdk.ts              # Adapter Veo: predictLongRunning → poll → tải video
│   ├── constants.ts             # STYLE_CONTEXTS / MODEL_CONTEXTS / STYLE_OPTIONS
│   ├── main.tsx · index.css     # Khởi động React + Tailwind
│   └── components/
│       ├── Sidebar.tsx · PreviewArea.tsx · OptionsPanel.tsx
│       ├── Primitives.tsx · GlobalStyles.tsx
│       └── ApiKeyModal.tsx      # Popup nhập/đổi API key
├── electron/main.cjs            # Vỏ Electron (thin shell) — tải web từ GitHub Pages
├── build/icon.svg|.ico|.png     # Icon app (sửa icon.svg rồi `npm run make-icon`)
├── .github/workflows/deploy-pages.yml
├── vite.config.ts · tailwind.config.js · tsconfig.json · package.json
```

> Đổi model Veo / cấu hình video: sửa `VIDEO_MODELS`, cờ `USE_IMAGE` trong [src/flow-sdk.ts](src/flow-sdk.ts).
> Đổi URL Pages: sửa `APP_URL` trong [electron/main.cjs](electron/main.cjs).
