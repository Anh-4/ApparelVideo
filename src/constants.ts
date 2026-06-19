// Bối cảnh từng phong cách — viết theo hướng VIDEO cho Veo: tất cả bắt đầu bằng động từ
// (gerund) để ghép mượt vào "the model is ...", kèm chuyển động + máy quay + ánh sáng.
export const STYLE_CONTEXTS: Record<string, string> = {
  'Street Style': 'walking confidently down a trendy urban street bathed in golden-hour sunlight, candid high-fashion street look, handheld tracking shot following the model.',
  'Phong cách UGC': 'filming an authentic selfie-style clip in a cozy well-lit room, casual relaxed movement, slightly shaky phone camera, warm natural light, genuine UGC vibe.',
  'Tại Studio': 'posing and slowly turning in a clean minimalist photo studio, soft editorial key light with gentle shadows, slow orbiting camera, sharp focus on fabric texture.',
  'Trong Shop quần áo': 'browsing inside a premium clothing boutique with softly blurred racks in the background, warm inviting interior lighting, smooth gimbal camera glide.'
};

// Mô tả người mẫu (tiếng Anh — Veo hiểu tốt nhất).
export const MODEL_CONTEXTS: Record<string, string> = {
  'Người mẫu nam': 'a handsome male fashion model',
  'Người mẫu nữ': 'a beautiful female fashion model',
  'Cặp đôi nam nữ': 'a stylish male and female fashion couple'
};

// Loại sản phẩm: VN (UI) -> EN (prompt). Tránh "wearing a Áo polo".
export const CATEGORY_EN: Record<string, string> = {
  'Áo polo': 'polo shirt',
  'Áo thun (T-shirt)': 't-shirt',
  'Hoodie': 'hoodie',
  'Áo khoác': 'jacket',
  'Váy/Đầm': 'dress',
  'Quần Jeans': 'jeans'
};

export const STYLE_OPTIONS = [
  { name: 'Street Style', icon: 'map', desc: 'Dạo phố đô thị' },
  { name: 'Phong cách UGC', icon: 'camera_front', desc: 'Gần gũi, đời thường' },
  { name: 'Tại Studio', icon: 'photo_camera', desc: 'Phòng chụp chuyên nghiệp' },
  { name: 'Trong Shop quần áo', icon: 'storefront', desc: 'Bối cảnh cửa hàng' }
];

/**
 * Dựng prompt video cho Veo theo cấu trúc: Subject → Action/Scene → Wardrobe fidelity → Camera/Look.
 * Gom 1 chỗ để video đơn và combo dùng chung (tránh lặp prompt).
 */
export function buildVideoPrompt(opts: {
  styleName: string;   // selectedStyle (key của STYLE_CONTEXTS)
  modelName: string;   // selectedModel (key của MODEL_CONTEXTS)
  categoryVi: string;  // loại sản phẩm (tiếng Việt từ UI)
  material: string;    // mô tả chất liệu/thiết kế người dùng nhập
}): string {
  const model = MODEL_CONTEXTS[opts.modelName] || MODEL_CONTEXTS['Người mẫu nữ'];
  const scene = STYLE_CONTEXTS[opts.styleName] || STYLE_CONTEXTS['Street Style'];
  const garment = CATEGORY_EN[opts.categoryVi] || opts.categoryVi;
  const material = opts.material.trim();

  const wardrobe = material
    ? `wearing a ${garment} (${material})`
    : `wearing a ${garment}`;

  return [
    'Photorealistic fashion film, real camera footage, high quality, sharp 4K detail, true to life.',
    `Subject: ${model} ${wardrobe}.`,
    `Action: the model is ${scene}`,
    "The outfit fits and drapes naturally; fabric folds and the printed design move realistically and stay faithful to the garment shown in the reference image — keep colors, logos and patterns accurate.",
    'Natural true-to-life colors with accurate white balance, realistic ambient lighting and soft natural shadows, neutral color grade with no heavy filter and no over-saturation, true-to-life skin tones, shallow depth of field, smooth steady camera.'
  ].join(' ');
}
