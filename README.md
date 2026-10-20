# ICN AI Hub — Enterprise AI Workspace (Prototype)

Interactive prototype สำหรับ Innovation Contest "The Future of Work & Life".
React 19 + Tailwind CSS v4 + Vite · ใช้ mock data ทั้งหมด ไม่มี backend และไม่เรียก AI จริง

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/ (HashRouter — host ได้ทุกที่)
```

- เอกสารออกแบบ (concept, sitemap, IA, flows, screens, design system, scope): [`docs/DESIGN.md`](docs/DESIGN.md)
- Mock data: `src/data/` · Orchestration simulator: `src/lib/runs.js` · Global state: `src/store/AppStore.jsx`
- State อยู่ในหน่วยความจำ — refresh หน้าแล้วข้อมูลกลับเป็นค่าเริ่มต้น
