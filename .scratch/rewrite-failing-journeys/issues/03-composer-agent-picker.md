# 03: ช่องเลือก Agent เป็นเมนูที่กางออก ไม่ใช่ select ธรรมดา

**What to build:** ในช่องสั่งงาน ตัวเลือก Agent เปลี่ยนจาก select เนทีฟ (role `combobox` ชื่อ "เลือก Agent…") เป็นเมนูกางออกเอง (`components/run/ComposerPick.jsx`, listbox ที่กางจากปุ่ม ด้านล่างช่องในหน้าแรก ด้านบนช่องในแชต) เทสต์ 4 ข้อยังหา combobox เดิม ให้เขียนใหม่ให้เปิดเมนูแล้วเลือกตัวเลือกจากเมนูนั้น ตรวจชื่อ role และชื่อที่เข้าถึงได้จริงจาก DOM ก่อนเขียน

**Blocked by:** ไม่มี

**Status:** ready-for-agent

เทสต์ในตั๋วนี้ (4 ข้อ):
- `5-use-shared`: an employee finds a shared Agent and uses it within 2 clicks; an employee finds a shared Agent with Steps and uses it as-is within 2 clicks
- `shared-items`: "ใช้งาน" on a shared Agent with Steps picks it as-is in the composer
- `steps-in-agent-form`: the new Agent runs its Steps in order straight away and ends with an Artifact

- [ ] เทสต์ทั้ง 4 ข้อเลือก Agent ผ่านเมนูที่กางออก และผ่าน
- [ ] จำนวนคลิกในเทสต์ยังตรงกับงบคลิกเดิม (ไม่เกิน 2 คลิก) ถ้าเมนูใหม่ใช้คลิกมากกว่า ให้จดไว้ในตั๋วนี้แทนการขยับงบเงียบๆ
- [ ] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม
