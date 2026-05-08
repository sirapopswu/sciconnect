# SciConnect Project Report

## รายชื่อสมาชิกกลุ่ม
1. นายสิรภพ บุญโกสุมภ์ 67102010175
2. นายพณพัฒน์ เขื่อนข่ายแก้ว 67102010522
3. นายวรากร สังข์ทอง 67102010528

---

## 1. ข้อมูลเดิมจาก Phase 1, 2 และ 3

### Phase 1: การรวบรวมความต้องการและวางแผน
- **ปัญหา:** นิสิตคณะวิทยาศาสตร์ขาดแหล่งข้อมูลกลางในการติดต่อสื่อสารและทำความรู้จักข้ามสาขา/ชั้นปี
- **เป้าหมาย:** สร้างระบบจัดเก็บข้อมูลและแสดงรายชื่อนิสิต (Member Directory) เพื่อสร้างเครือข่ายภายในคณะ
- **ขอบเขต:** ระบบ Login/Signup, การจัดการโปรไฟล์เบื้องต้น, การแยกกลุ่มตามสาขาและชั้นปี
- **วิดีโอสัมภาษณ์ Requirement:** [https://youtu.be/6iED8z5rUtI](https://youtu.be/6iED8z5rUtI)

### Phase 2: การออกแบบและพัฒนา Prototype
- **ฟีเจอร์เพิ่มเติม:** ระบบ Skill Tags, Social Media Links (Line/IG), ระบบ Filter & Search
- **สถาปัตยกรรม:** ใช้รูปแบบ MVC (Model-View-Controller)
- **เครื่องมือ:** HTML/CSS/JS (Frontend), PHP/MySQL (Backend - เริ่มต้น), VS Code, GitHub
- **Retrospective Phase 2:** เน้นการปรับปรุงเรื่องเวลาและการเรียนรู้เครื่องมือใหม่ [https://youtu.be/BmSIIbYLIM8](https://youtu.be/BmSIIbYLIM8)

### Phase 3: การพัฒนา Backend และ Testing
- **การเปลี่ยนแปลงเทคโนโลยี:** เปลี่ยนมาใช้ Node.js และ Express สำหรับ Backend API (RESTful)
- **ฟีเจอร์สำคัญ:** การคำนวณรุ่นจากรหัสนิสิต, การลดขนาดรูปภาพอัตโนมัติด้วย Canvas API, การเรียก API ภายนอกสำหรับรูปโปรไฟล์เริ่มต้น
- **Unit Testing:** ทำความครอบคลุม (Coverage) ได้มากกว่า 80% (Statements: 86.48%)
- **Retrospective Phase 3:** [https://youtu.be/vYX8VEisZUs](https://youtu.be/vYX8VEisZUs)

---

## 2. Website Screenshots

### หน้าหลักและฟังก์ชันการใช้งาน (Phase 4)
| หน้าแรก (Home) | หน้าเข้าสู่ระบบ (SignIn) |
|---|---|
| ![Home](https://github.com/user-attachments/assets/3070b6d5-8543-4901-be7c-a85d2ec5bb5d) | ![SignIn](https://github.com/user-attachments/assets/172c4aac-ea9f-48ee-aed4-cdb69019352b) |

| หน้าสมัครสมาชิก (SignUp) | หน้าเชื่อมต่อตามสาขา (Major-Connect) |
|---|---|
| ![SignUp](https://github.com/user-attachments/assets/a75f2728-0db0-4775-b999-ed34f92ac3c9) | ![Major](https://github.com/user-attachments/assets/9bf2e438-e28e-4f56-a973-12a703e47076) |

| หน้าโปรไฟล์ผู้ใช้ (User Profile) | หน้าแก้ไขโปรไฟล์ (Edit Profile) |
|---|---|
| ![Profile](https://github.com/user-attachments/assets/8190e18d-8662-48e5-9455-ceab536132e5) | ![Edit](https://github.com/user-attachments/assets/cd5840b6-6dc7-40bb-a629-c33fb558cb1a) |

| ระบบค้นหาและคัดกรอง (Search Filter) | ระบบจัดการสำหรับ Admin |
|---|---|
| ![Search](https://github.com/user-attachments/assets/7d2aa015-8168-4196-b09c-399bf8ee6f65) | ![Admin](https://github.com/user-attachments/assets/38daa09b-dfa0-4c47-b64c-19ba19b432f9) |

---

## 3. UI Testcases (5 Cases)

| Test ID | Scenario | Expected Result |
|---|---|---|
| **UI-01** | ทดสอบเข้าสู่ระบบสำเร็จ (Sign In) | ระบบแสดงข้อความ "ยินดีต้อนรับ" และ Redirect ไปหน้า `home.html` |
| **UI-02** | ทดสอบเข้าสู่ระบบด้วยข้อมูลผิดพลาด | ระบบแสดง Alert "อีเมลหรือรหัสผ่านไม่ถูกต้อง" และยังคงอยู่ที่หน้าเดิม |
| **UI-03** | ทดสอบการสมัครสมาชิกใหม่สำเร็จ | ข้อมูลถูกบันทึกลง LocalStorage ชั่วคราวและ Redirect ไปหน้า PDPA |
| **UI-04** | ทดสอบสมัครสมาชิกโดยรหัสผ่านไม่ตรงกัน | ระบบแสดงข้อความแจ้งเตือน "รหัสผ่านไม่ตรงกัน" และไม่ให้ดำเนินการต่อ |
| **UI-05** | ทดสอบการกรองข้อมูลตามสาขา | เมื่อคลิกเลือกสาขา ระบบจะต้อง Redirect ไปยังหน้าที่แสดงเฉพาะสมาชิกในสาขานั้น |

---

## 4. ผลการทำ Profiling (เปรียบเทียบ Phase 3 vs Phase 4)

### Static Profiling (Plato Analysis)
- **Phase 3:** โค้ดมีการกระจุกตัวอยู่ที่ไฟล์เดียว (index.js) ทำให้ความซับซ้อนสูง
- **Phase 4:** 
  - **Maintainability Index:** 86.45 / 100 (ระดับดีเยี่ยม)
  - **Cyclomatic Complexity:** เฉลี่ยที่ 1-5 (ลดลงจากการ Refactor แยก Controller)
  - **Lint Errors:** 0 Errors (หลังการรัน `eslint --fix`)

### Dynamic Profiling (Google Lighthouse)
| Category | Phase 3 (Est.) | Phase 4 (Actual) |
|---|:---:|:---:|
| Performance | 90+ | **100** |
| Accessibility | 85 | **90** |
| Best Practices | 95 | **100** |
| SEO | 80 | **91** |

> **สรุปการเปรียบเทียบ:** ใน Phase 4 ประสิทธิภาพ (Performance) พุ่งขึ้นสู่ระดับเต็ม 100 เนื่องจากการกำจัดโค้ดส่วนเกินและการจัดการ Asset ที่ดีขึ้น รวมถึงคะแนน SEO และ Accessibility ที่สูงขึ้นจากการเพิ่ม Meta Tags และ Semantic HTML

---

## 5. การทำ CI/CD (Pipeline)

เราได้นำ **GitHub Actions** มาใช้ในการสร้าง CI Pipeline แบบอัตโนมัติ เพื่อตรวจสอบคุณภาพของโค้ดทุกครั้งที่มีการ Push หรือ Pull Request เข้าสู่ Branch `main`

### รายละเอียด Pipeline (`ci.yml`):
ระบบมีการรันงานแบบ **Parallel Job** (ทำงานขนานกัน) เพื่อความรวดเร็วและใช้โควต้า Free Tier อย่างคุ้มค่า:
1. **Build Job:** ตรวจสอบการติดตั้ง dependencies และการ Build เบื้องต้น
2. **Test Job:** รันชุดทดสอบทั้งหมด (Jest) เพื่อยืนยันว่าไม่มี Logic Error
3. **Lint Job:** ตรวจสอบรูปแบบโค้ด (ESLint) ให้เป็นไปตามมาตรฐานที่กำหนด

```yaml
jobs:
  build: ... (รันขนานกับงานอื่น)
  test:  ... (รันขนานกับงานอื่น)
  lint:  ... (รันขนานกับงานอื่น)
```

---

## 6. กระบวนการทำงาน (Process, Methods, and Tools)

### สิ่งที่เพิ่มเติมจาก Phase 1, 2 และ 3:
1. **การบริหาร Project:** เปลี่ยนจากการสื่อสารทั่วไปมาใช้ **Kanban Board (GitHub Projects)** เต็มรูปแบบ เพื่อติดตาม Backlog และสถานะงานช่วงสุดท้าย
2. **การ Monitor Build:** กำหนดขั้นตอน **Sanity Check** (รัน `node index.js`) ก่อนการ Commit ทุกครั้ง เพื่อตรวจสอบความเสถียรของ Database Connection
3. **การจัดการ Bugs:** ใช้ระบบ **Issue Tracking** บน GitHub โดยเชื่อมโยง Commit Message กับเลข Issue (เช่น `fix: #12 login bug`) เพื่อให้สามารถตรวจสอบย้อนกลับได้
4. **Quality Assurance:** นำ **Cypress** มาใช้ทำ End-to-End Testing เพื่อจำลองพฤติกรรมผู้ใช้จริงบน Browser

---

## 7. สรุปการประชุม Final Retrospective
**หัวข้อ:** การส่งมอบงานและสรุปผลโครงการ
- **สิ่งที่ทำได้ดี:** ระบบทำงานได้ครบถ้วนตามความต้องการของ User, คะแนน Profiling สูงมาก, และมีระบบ CI/CD ที่ช่วยคัดกรอง Error
- **ปัญหาที่พบ:** การจัดการ CSS ในบางหน้ายังมีความซับซ้อน และการทำ Unit Test สำหรับบาง Handler ฟังก์ชันใช้เวลานาน
- **การเรียนรู้:** ทีมมีความเข้าใจในการทำงานแบบ Agile และการใช้เครื่องมือ DevOps (CI/CD, Profiling) มากขึ้น

**Link to Retrospective Youtube video:** [https://youtu.be/vYX8VEisZUs](https://youtu.be/vYX8VEisZUs) (Latest Session)

---

## 8. Onsite Presentation & Video
- **Video Presentation (ซ้อม):** [รอดำเนินการอัปโหลด]
- **PPT Presentation:** ใช้สำหรับการอธิบายกระบวนการพัฒนาและค่า Profiling โดยเน้นการเปรียบเทียบความก้าวหน้าในแต่ละ Phase

---

## 9. ข้อมูลทางเทคนิคใน Git
- **Website Code:** [GitHub Repository](https://github.com/sirapopswu/sciconnect)
- **Test Code:** ดูในโฟลเดอร์ `/test` (Unit Test) และ `/cypress` (UI Test)
- **Profiling results:** ดูในโฟลเดอร์ `/docs` และ `/report`
- **CI Process:** ดูได้ที่แท็บ **Actions** ใน GitHub ของโปรเจกต์
