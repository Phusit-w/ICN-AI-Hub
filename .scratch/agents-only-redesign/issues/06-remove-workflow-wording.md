# 06: ล้างคำว่า "สายงาน" ที่เหลือ

**What to build:** ไม่มีคำว่า "สายงาน" หรือ "Workflow" ในส่วนที่ผู้ใช้หรือผู้นำเสนอเห็นอีก ได้แก่ tour, Help, ข้อความในหน้าต่างๆ, `docs/DESIGN.md` และ README ทุกที่อธิบายด้วย **ผู้ช่วย AI** และ **ขั้นตอน** ตาม `GLOSSARY.md` tour เล่าเรื่องใหม่: คุยในแชต → ได้ผลงาน → บันทึกไว้ใช้ซ้ำเป็นผู้ช่วย → สร้างผู้ช่วยแบบแชต

Spec: `.scratch/agents-only-redesign/spec.md` (Implementation Decisions: Wording; Further Notes)

**Blocked by:** 02, 05

**Status:** done

- [x] ค้นในโค้ดแอปและเอกสารแล้วไม่พบ "สายงาน" หรือ "Workflow" ในข้อความที่แสดงผล (ยกเว้น ADR และ GLOSSARY ที่อธิบายว่าเลิกใช้)
- [x] Journey tour เดินครบทุกขั้นกับหน้าตาใหม่
- [x] `npm test` ผ่านทั้งหมด
