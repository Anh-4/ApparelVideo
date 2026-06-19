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
    // 2) Chủ thể + trang phục: MẶC ĐỦ, không thiếu đồ (vd thiếu quần)
    `Subject: ${model}, with a natural realistic face and body and authentic lifelike skin texture, ${wardrobe} as the featured hero piece, fully styled with well-fitted complementary clothing and footwear so the outfit is always complete — fully and modestly dressed, never missing any garment.`,
    // 3) Hành động / bối cảnh theo phong cách
    `Action: the model is ${scene}`,
    // 4) NGUYÊN TẮC DUY NHẤT: giữ nguyên design mặt trước & sau; còn lại AI tự do sáng tạo
    'Most important rule: the featured garment design must exactly match the reference images — keep the FRONT and BACK artwork, prints, graphics, text, logos, colors and patterns identical, and do not change, add, remove, distort or recolor any design element. Everything else — the model, the rest of the outfit, pose, scenery and background — can be freely and creatively imagined and look natural, as long as the featured garment design stays faithful. The garment fits and drapes naturally and its print moves realistically with the fabric.',
    // 5) Ánh sáng & màu: SÁNG, rõ, sống động nhưng vẫn tự nhiên
    'Bright, clean and well-exposed with abundant flattering light; vibrant yet true-to-life colors, accurate white balance, luminous natural lighting and soft gentle shadows, radiant healthy skin tones; crisp sharp focus, shallow depth of field, smooth steady camera. Avoid dark, murky, underexposed, dull or washed-out tones; no heavy filter, no oversaturation.'
  ].join(' ');
}
