// Bối cảnh từng phong cách — viết theo hướng VIDEO cho Veo: tất cả bắt đầu bằng động từ
// (gerund) để ghép mượt vào "the model is ...", kèm chuyển động + máy quay + ánh sáng.
// Ưu tiên ánh sáng SÁNG – RÕ (tránh tối/xỉn) ở mọi phong cách.
export const STYLE_CONTEXTS: Record<string, string> = {
  'Street Style': 'walking confidently down a trendy urban street on a bright sunny day bathed in clear natural daylight, vibrant lively city backdrop, candid high-fashion street look, smooth handheld tracking shot following the model.',
  'Phong cách UGC': 'filming an authentic selfie-style clip in a bright airy room with large windows and plenty of natural daylight, casual relaxed movement, light handheld phone-camera feel, clean bright exposure, genuine UGC vibe.',
  'Tại Studio': 'posing and slowly turning in a clean bright white photo studio, crisp high-key studio lighting with soft even fill, bright and evenly lit, slow orbiting camera, sharp focus on the fabric texture.',
  'Trong Shop quần áo': 'browsing inside a bright modern premium clothing boutique, warm but bright and inviting interior lighting, softly blurred clothing racks in the background, smooth gimbal camera glide.'
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
    // 1) Độ chân thực + máy quay (giảm cảm giác "AI/CGI")
    'Photorealistic high-fashion film shot on a professional cinema camera with an 85mm lens, real camera footage, ultra-detailed and lifelike, natural film look — not CGI, not animated, not a cartoon.',
    // 2) Chủ thể + trang phục
    `Subject: ${model} ${wardrobe}, with natural realistic facial features and authentic skin texture.`,
    // 3) Hành động / bối cảnh theo phong cách
    `Action: the model is ${scene}`,
    // 4) Trung thành với sản phẩm (giữ đúng màu/logo/họa tiết)
    'The outfit fits and drapes naturally; fabric folds and the printed design move realistically and stay faithful to the garment in the reference image — keep colors, logos and patterns accurate and clearly visible.',
    // 5) Ánh sáng & màu: SÁNG, rõ, sống động nhưng vẫn tự nhiên
    'Bright, clean and well-exposed with abundant flattering light; vibrant yet true-to-life colors, accurate white balance, luminous natural lighting and soft gentle shadows, radiant healthy skin tones; crisp sharp focus, shallow depth of field, smooth steady camera. Avoid dark, murky, underexposed, dull or washed-out tones; no heavy filter, no oversaturation.'
  ].join(' ');
}
