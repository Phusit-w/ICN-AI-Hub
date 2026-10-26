// Each Agent's Cube (see components/ui/EyeTracker.jsx): its body shape, eye style, body colour and accessory.
export const CUBE_SHAPES = ['Cube', 'Ball', 'Pill', 'Hexagon']
export const CUBE_EYES = ['Slant', 'Dots', 'Squares']
// navy (the default), steel blue, teal, violet, amber, rose: all dark enough for the white eyes to read
export const CUBE_COLORS = ['#1e3a5f', '#3f6594', '#0f766e', '#7c3aed', '#b45309', '#be185d']

// what an Agent wears or holds, 'none' for nothing; an Agent that chose nothing gets the one that suits its kind
export const CUBE_ACCESSORIES = [
  'none', 'glasses', 'document', 'briefcase', 'magnifier', 'chart', 'headset', 'hardhat', 'calculator',
  'badge', 'stamp', 'translate', 'camera', 'tie',
]
export const ACCESSORY_LABELS = {
  none: 'ไม่ใส่', glasses: 'แว่นตา', document: 'เอกสาร', briefcase: 'กระเป๋า', magnifier: 'แว่นขยาย',
  chart: 'กราฟ', headset: 'หูฟัง', hardhat: 'หมวกนิรภัย', calculator: 'เครื่องคิดเลข',
  badge: 'บัตรพนักงาน', stamp: 'แสตมป์ตรา', translate: 'ฟองคำพูด', camera: 'กล้อง', tie: 'เนกไท',
}
const ACCESSORY_BY_KIND = {
  research: 'glasses', document: 'document', sales: 'briefcase', review: 'magnifier', data: 'chart',
  it: 'headset', project: 'hardhat', maintenance: 'hardhat', accounting: 'calculator',
  hr: 'badge', bid: 'stamp', translate: 'translate', image: 'camera', exec: 'tie',
}

// the short line under a Cube on a card, so what the Agent does reads even before its accessory is recognised
export const ROLE_LABELS = {
  research: 'ค้นข้อมูล', document: 'เอกสาร', sales: 'งานขาย', review: 'ตรวจทาน', data: 'วิเคราะห์ข้อมูล',
  it: 'IT', project: 'โครงการ', maintenance: 'ซ่อมบำรุง', accounting: 'บัญชี',
  hr: 'HR', bid: 'ตรวจ TOR / SOC', translate: 'แปลภาษา', image: 'ทำภาพ', exec: 'ผู้บริหาร',
}

/**
 * The Cube of `agent` (its `kind` is read): what it chose, over a plain navy Cube wearing what suits its kind.
 * Unchosen Cubes all look alike on purpose, so the ones somebody shaped stand out.
 */
export function cubeOf(agent) {
  return {
    shape: 'Cube', eyes: 'Slant', color: CUBE_COLORS[0],
    accessory: ACCESSORY_BY_KIND[agent?.kind] ?? 'none',
    ...agent?.cube,
  }
}
