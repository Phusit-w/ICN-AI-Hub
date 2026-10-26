# 04: Schedule เป็นของ Agent ส่วนตัว

**What to build:** ย้ายกติกา Schedule จากตัว Agent (`agent.schedule`) ไปเป็นของ Agent ส่วนตัวของผู้ใช้ การ์ด Schedule ในแชต (`ScheduleCard` ใน `pages/Workspace.jsx`) แสดงว่าตั้งไว้ที่ Agent ส่วนตัว ไม่ใช่ลิงก์ไปหน้า Agent ในคลัง Schedule ที่ลงมือออกนอก (เช่นเพิ่มแถว Excel ทุกจันทร์) ใช้การตั้ง "ทำเองเลย" ของประเภทนั้นจากตั๋ว 03 ถ้าไม่ได้ตั้ง Run จะหยุดรอการกดยืนยัน ตัวอย่างแชต "บันทึกก้าวเดิน" ที่มีอยู่ต้องยังทำงานครบ แก้เทสต์เดิมที่คาดว่า Schedule อยู่ที่ตัว Agent

Spec: `.scratch/personal-agent/spec.md`

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Journey: ตั้ง "ทุกวันจันทร์ 20:00" ในแชตแล้วการ์ด Schedule บอกว่าตั้งไว้ที่ Agent ส่วนตัว และ Agent ในคลังไม่มี Schedule
- [ ] Journey: Schedule ที่เพิ่มแถว Excel รอการกดยืนยันเมื่อไม่ได้ตั้ง "ทำเองเลย" และทำต่อเองเมื่อตั้งไว้
- [ ] ตัวอย่างแชต "บันทึกก้าวเดิน" ยังทำงานครบและเทสต์ของมันผ่าน
- [ ] `npx vitest run` ไม่มีข้อไหนล้มเพิ่ม
