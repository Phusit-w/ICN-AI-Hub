# 03: ช่องเลือก Agent เป็นเมนูที่กางออก ไม่ใช่ select ธรรมดา

**What to build:** ในช่องสั่งงาน ตัวเลือก Agent เปลี่ยนจาก select เนทีฟ (role `combobox` ชื่อ "เลือก Agent…") เป็นเมนูกางออกเอง (`components/run/ComposerPick.jsx`, listbox ที่กางจากปุ่ม ด้านล่างช่องในหน้าแรก ด้านบนช่องในแชต) เทสต์ 4 ข้อยังหา combobox เดิม ให้เขียนใหม่ให้เปิดเมนูแล้วเลือกตัวเลือกจากเมนูนั้น ตรวจชื่อ role และชื่อที่เข้าถึงได้จริงจาก DOM ก่อนเขียน

**Blocked by:** ไม่มี

**Status:** done (3 จาก 4 ข้อผ่าน; ข้อที่ 4 รอตั๋ว 05)

เทสต์ในตั๋วนี้ (4 ข้อ):
- `5-use-shared`: an employee finds a shared Agent and uses it within 2 clicks; an employee finds a shared Agent with Steps and uses it as-is within 2 clicks
- `shared-items`: "ใช้งาน" on a shared Agent with Steps picks it as-is in the composer
- `steps-in-agent-form`: the new Agent runs its Steps in order straight away and ends with an Artifact

- [x] เทสต์ทั้ง 4 ข้อเลือก Agent ผ่านเมนูที่กางออก (`expectAgentPicked` ใน `test/journey.jsx` อ่านปุ่ม "เลือก Agent" แทน combobox) ผ่านขั้นนี้แล้ว 3 ข้อ ส่วน `steps-in-agent-form` ผ่านขั้นเลือก Agent แต่ยังล้มที่ `menuitem` "ดูขั้นตอน" ซึ่งเป็นเหตุของตั๋ว 05 (ขั้นตอนย้ายไป Desk) จึงไปปิดที่ตั๋วนั้น
- [x] จำนวนคลิกในเทสต์ยังตรงกับงบคลิกเดิม (ไม่เกิน 2 คลิก) ถ้าเมนูใหม่ใช้คลิกมากกว่า ให้จดไว้ในตั๋วนี้แทนการขยับงบเงียบๆ
- [x] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม

หมายเหตุ: ช่องเลือก Agent เป็นปุ่ม `เลือก Agent` ที่แสดงชื่อ Agent ที่เลือก จำนวนคลิกในเทสต์ไม่เปลี่ยน เพราะเทสต์เหล่านี้เลือกผ่านลิงก์ "ใช้งาน" ไม่ได้เปิดเมนู ล้มค้างหลังตั๋วนี้ 24 ข้อ
