# รายงานผลการวิเคราะห์ประสิทธิภาพ (Profiling Report)

**Project:** SciConnect
**วันที่วิเคราะห์:** 23 เมษายน 2568

---

## 1. Static Profiling — Plato JavaScript Source Analysis

> **เครื่องมือ:** [Plato](https://github.com/es-analysis/plato) — วิเคราะห์โครงสร้างโค้ด JavaScript เชิง Static ครอบคลุมทุกไฟล์ที่กำหนดในโปรเจกต์

### 1.1 สรุปภาพรวม (Summary)

| เมตริก | ค่า |
|---|---|
| **Total Lines of Code** | 84 |
| **Average Lines per File** | 16 |
| **Average Maintainability Index** | **86.45 / 100** |

> ค่า Maintainability Index ที่สูงกว่า 65 ถือว่าอยู่ในระดับดี โปรเจกต์ SciConnect ได้ค่า **86.45** แสดงว่าโค้ดมีความสามารถในการบำรุงรักษาสูง

---

### 1.2 รายละเอียดรายไฟล์ (Per-File Metrics)

| ไฟล์ | Maintainability | Lines (SLOC) | Cyclomatic Complexity | Est. Errors | Lint Errors |
|---|:---:|:---:|:---:|:---:|:---:|
| `cypress.config.js` | ~70 | 12 | 1 | 0.04 | 3 |
| `db.js` | ~70 | 11 | 1 | 0.04 | 3 |
| `index.js` | ~99 | 31 | 5 | 0.24 | **15** |
| `server.js` | ~99 | 21 | 1 | 0.16 | 10 |
| `test-db.js` | ~95 | 9 | 1 | 0.05 | 3 |

---

### 1.3 การวิเคราะห์ผลรายเมตริก

#### 🔷 Cyclomatic Complexity (ความซับซ้อนของโค้ด)
- ทุกไฟล์มีค่า Complexity = **1** ยกเว้น `index.js` ซึ่งมีค่า **5**
- ค่า 5 ถือว่าอยู่ในเกณฑ์ที่รับได้ (ค่าเกณฑ์เตือนปกติคือ > 10) แต่ควรติดตามหากโปรเจกต์ขยายใหญ่ขึ้น
- (**ปรับปรุงแล้ว**) โค้ดได้รับการ Refactor แยก Route ออกไปยัง `routes/` และ Controller ไปยัง `controllers/` ในการอัปเดตล่าสุด ซึ่งช่วยลด Complexity ลงจากเดิม

#### 🔷 Lines of Code (SLOC)
- โค้ดทั้งโปรเจกต์มี SLOC รวมเพียง **84 บรรทัด** (เฉพาะไฟล์หลัก 5 ไฟล์)
- `index.js` มี SLOC มากที่สุด (31 บรรทัด) สอดคล้องกับการที่มี Complexity สูงสุด

#### 🔶 Estimated Errors in Implementation (ข้อผิดพลาดที่คาดว่าจะเกิด)
- `index.js` มีค่าสูงสุดที่ **0.24** และ `server.js` อยู่ที่ **0.16**
- ค่านี้เป็นการประมาณเชิงสถิติ (ไม่ใช่ Bug ที่แน่นอน) แต่บ่งชี้ว่าโค้ดส่วนนี้ควรได้รับการทดสอบครอบคลุมมากที่สุด

#### ✅ Lint Errors (ข้อผิดพลาดจาก ESLint) — แก้ไขแล้ว
- **ก่อนแก้ไข:** `index.js` มี 15 errors, `server.js` มี 10 errors, ไฟล์อื่นๆ มีไฟล์ละ 3 errors
- **หลังแก้ไข:** ติดตั้ง ESLint v10 พร้อม flat config (`eslint.config.js`) และรัน `--fix` → **0 errors, 0 warnings**
- สาเหตุหลักที่แก้ไข: `body-parser` ที่ไม่ได้ติดตั้ง, debug `console.log` ที่ค้างอยู่, double quotes, missing semicolons, hardcoded credentials ใน `db.js`

---

## 2. Dynamic Profiling — Google Lighthouse

> **เครื่องมือ:** Google Lighthouse (ผ่าน Chrome DevTools) — วิเคราะห์ประสิทธิภาพของเว็บแอปพลิเคชันขณะรันจริงที่ `http://localhost:3000`

### 2.1 สรุปคะแนน Lighthouse

| หมวดหมู่ | คะแนน | ระดับ |
|---|:---:|:---:|
| 🟢 **Performance** | **100** | Excellent |
| 🟢 **Accessibility** | **90** | Good |
| 🟢 **Best Practices** | **100** | Excellent |
| 🟢 **SEO** | **91** | Good |

> ✅ **คะแนนรวมอยู่ในระดับดีเยี่ยม** โดยเฉพาะ Performance และ Best Practices ได้คะแนนเต็ม 100

---

### 2.2 การวิเคราะห์ผลรายหมวด

#### 🟢 Performance (100/100)
- เว็บโหลดได้รวดเร็วมากเนื่องจากใช้ HTML/CSS/JS แบบ Vanilla ไม่มี Framework หนักๆ
- **First Contentful Paint (FCP)** และ **Time to Interactive (TTI)** ต่ำ — ผู้ใช้เห็นหน้าเว็บและใช้งานได้ภายใน < 1 วินาที
- ไม่มีการ Block rendering จาก Render-blocking Resources

#### 🟢 Best Practices (100/100)
- โค้ดปฏิบัติตามมาตรฐานการพัฒนาเว็บสมัยใหม่ครบถ้วน
- ใช้ HTTPS-ready resources, ไม่มี Deprecated API, ไม่มี Console errors ขณะโหลดหน้า

#### 🟢 SEO (91/100)
- มี Meta tags, Title tags และโครงสร้าง Heading ที่ถูกต้อง
- มีจุดที่ปรับปรุงได้เพิ่มเติม (9 คะแนนที่หายไป) เช่น การเพิ่ม `meta description` ที่ครอบคลุมกว่าเดิม หรือ Structured Data

#### 🟡 Accessibility (90/100)
- หน้าเว็บรองรับ Accessibility ได้ดีในระดับสูง
- มีจุดที่อาจปรับปรุงได้ เช่น:
  - เพิ่ม `aria-label` บน Interactive elements บางจุด
  - ตรวจสอบ Color Contrast Ratio ของข้อความบนพื้นหลังสีต่างๆ

---

## 3. สรุปและข้อเสนอแนะ (Summary & Recommendations)

### ✅ จุดแข็งของโปรเจกต์
1. **Performance ดีเยี่ยม (100/100):** การเลือกใช้ Vanilla HTML/CSS/JS ทำให้เว็บโหลดเร็วและไม่มีภาระจาก Framework
2. **Maintainability สูง (86.45):** โครงสร้างโค้ดเข้าใจง่าย หลังจาก Refactor แยก Route และ Controller ออกแล้ว
3. **Cyclomatic Complexity ต่ำ:** ทุกไฟล์มีค่า Complexity ≤ 5 แสดงว่าโค้ดไม่ซับซ้อนเกินไป

### ⚠️ จุดที่ควรปรับปรุง (สถานะ ณ วันที่วิเคราะห์)

| ลำดับ | ปัญหา | ไฟล์ที่เกี่ยวข้อง | ระดับ | สถานะ |
|:---:|---|---|:---:|:---:|
| 1 | Lint Errors 15 รายการ | `index.js` | 🔴 สูง | ✅ แก้ไขแล้ว |
| 2 | Lint Errors 10 รายการ | `server.js` | 🟠 กลาง | ✅ แก้ไขแล้ว |
| 3 | Lint Errors ใน `db.js`, `cypress.config.js`, `test-db.js` | หลายไฟล์ | 🟡 ต่ำ | ✅ แก้ไขแล้ว |
| 4 | เพิ่ม `aria-label` และปรับ Contrast | ทุกหน้า | 🟡 ต่ำ | 🔲 ยังไม่ดำเนินการ |
| 5 | เพิ่ม `meta description` ให้ละเอียด | HTML Pages | 🟡 ต่ำ | 🔲 ยังไม่ดำเนินการ |
| 6 | เพิ่ม Database Indexing (email, major) | PostgreSQL | 🟠 กลาง | 🔲 ยังไม่ดำเนินการ |
| 7 | เพิ่ม API Rate Limiting | `index.js` | 🟠 กลาง | 🔲 ยังไม่ดำเนินการ |

### 📌 ข้อเสนอแนะระยะถัดไป
- **Accessibility Audit:** ใช้ axe DevTools หรือ WAVE เพื่อระบุปัญหา Accessibility ที่เฉพาะเจาะจง
- **Load Testing:** รัน Load Test ด้วย `k6` หรือ `autocannon` เพื่อทดสอบพฤติกรรมภายใต้ Traffic จริง
- **Database Indexing:** เพิ่ม Index ที่คอลัมน์ `email`, `student_id` และ `major` ก่อนที่จำนวนผู้ใช้จะเพิ่มขึ้น
- **Rate Limiting:** เพิ่ม `express-rate-limit` ใน `index.js` เพื่อป้องกัน Brute Force / DDoS

---

## 4. ผลการดำเนินการปรับปรุง (Post-Analysis Fixes)

**วันที่ดำเนินการ:** 23 เมษายน 2568

### 4.1 การติดตั้งและตั้งค่า ESLint
- ติดตั้ง `eslint@10.2.1` และ `@eslint/js` เป็น devDependencies
- สร้าง `eslint.config.js` (flat config format ตามมาตรฐาน ESLint v9+)
- อัปเดต script `lint` และเพิ่ม `lint:fix` ใน `package.json`

### 4.2 ไฟล์ที่แก้ไข

| ไฟล์ | การเปลี่ยนแปลงหลัก |
|---|---|
| `server.js` | ลบ `body-parser` (ไม่ได้ติดตั้ง), แก้ path `controllers`, ลบ debug `console.log`, เพิ่ม `module.exports` |
| `index.js` | ลบ `/* jshint */` directive, เปลี่ยน double quotes เป็น single quotes |
| `db.js` | ย้าย hardcoded credentials ไปใช้ `process.env`, fix indentation |
| `cypress.config.js` | single quotes, เพิ่ม `return config` ใน setupNodeEvents |
| `test-db.js` | ลบ CRLF line endings, single quotes |
| `routes/users.js` | ลบ duplicate routes, import `searchUsers` และ `updateUser` ที่หายไป |
| `controllers/users.js` | Auto-fix: เพิ่ม missing semicolons, `prefer-const` |
| `controllers/user.controller.js` | Auto-fix: single quotes, `prefer-const` |

### 4.3 ผลการทดสอบหลังแก้ไข

```
✅ PASS  test/api.integration.test.js
✅ PASS  test/addUser.test.js
✅ PASS  test/login.test.js
✅ PASS  test/datastructure.test.js
✅ PASS  test/updateUser.test.js
✅ PASS  test/getUsers.test.js
✅ PASS  test/searchUsers.test.js

Test Suites: 7 passed, 7 total
Tests:       28 passed, 28 total
Time:        ~0.7s
```

### 4.4 สรุปผลการแก้ไข ESLint

| เมตริก | ก่อนแก้ไข | หลังแก้ไข |
|---|:---:|:---:|
| ESLint Errors | **34+** | **0** |
| ESLint Warnings | - | **0** |
| Tests Passing | 28/28 | 28/28 |
| ESLint Config | ❌ ไม่มี | ✅ `eslint.config.js` |

