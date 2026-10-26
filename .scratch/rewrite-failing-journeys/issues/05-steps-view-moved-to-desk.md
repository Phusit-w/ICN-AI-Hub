# 05: "ดูขั้นตอน" ในเมนู ⋯ และแผงขั้นตอนด้านข้างถูกเอาออก

**What to build:** แบบ A มีรายการ "ดูขั้นตอน" ในเมนู ⋯ ใต้ผลงาน ซึ่งเปิดแผงขั้นตอนด้านขวา (`StepsPanel`) แบบ B ลบทั้งสองอย่างออก เพราะพื้นที่ทำงาน (Desk) แสดงแผน ความคืบหน้า และผลงานอยู่แล้ว และมีหัวข้อพับ "ดูขั้นตอนที่ทำ" ใต้ผลงานที่เสร็จ เทสต์ 3 ข้อยังเปิดแผงนั้นหรือหารายการนั้นในเมนู ให้เปลี่ยนไปตรวจที่ที่ย้ายไป: เปิดหัวข้อ "ดูขั้นตอนที่ทำ" ใน Desk แล้วเห็นขั้นตอนครบ และเห็นการส่งงานกลับของ Review ในนั้น

**Blocked by:** 01 (ข้อใน `workspace-chat-or-plan` ต้องกดปุ่มเริ่มก่อนถึงจะถึงขั้นนี้)

**Status:** ready-for-agent

เทสต์ในตั๋วนี้ (3 ข้อ):
- `artifact-actions`: "⋯" menu from the keyboard opens with Enter, moves with the arrow keys, runs an item with Enter, and closes with Escape (ตอนนี้เมนูมีแค่ "คัดลอก" กับ "แชร์" ให้เทสต์ใช้สองรายการนี้)
- `workspace-chat-or-plan`: "ดูขั้นตอน" opens the steps as a side panel next to the Thread, closed again in one click (เขียนใหม่เป็นเปิดและปิดหัวข้อใน Desk)
- `workspace-chat-or-plan`: in an Agent with Steps, a Review after a Research sends the work back once (อ่านจำนวนครั้งที่ส่งกลับจากหัวข้อ "ดูขั้นตอนที่ทำ · ส่งกลับไปแก้ N ครั้ง" และจาก Desk)

- [ ] เทสต์ทั้ง 3 ข้อตรวจที่ที่ย้ายไป และผ่าน
- [ ] ไม่มีเทสต์ใดอ้างแผง "ขั้นตอนการทำงาน" (complementary) หรือรายการเมนู "ดูขั้นตอน" ที่ไม่มีแล้ว
- [ ] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม
