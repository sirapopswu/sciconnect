# ตาราง Unit Test Cases สำหรับโปรเจกต์ SciConnect

เนื่องจากในโปรเจกต์นี้เราใช้ Express.js และเรียกใช้ฐานข้อมูลตรงๆ โดยไม่ได้เขียนโมเดลแบบ OOP เต็มรูปแบบ (เช่น ไม่มี Class `User` แยกต่างหากเหมือนใน Java/C#) แต่เรามี **Data Structure** ที่ชัดเจนคือ **โครงสร้างข้อมูลของ User (Schema/Payload)** ที่กำหนดใน Controller และ Database 

ส่วน **"Class อื่นๆ"** ในที่นี้จะเทียบเท่ากับ **Controller Layers** และ **API Routers** ครับ ดังนั้นเราสามารถเขียนตารางแจกแจง Test Cases ได้ดังนี้:

---

## 1. ตาราง Unit Test Cases ทดสอบ Data Structure & Validation 

| Test ID | Module/Feature | Test Description (กรณีที่ทดสอบ) | Input Data (ข้อมูลนำเข้า) | Expected Result (ผลลัพธ์ที่คาดหวัง) |
| :--- | :--- | :--- | :--- | :--- |
| **01** | User Payload | ตรวจสอบข้อมูลผู้ใช้ที่ถูกต้องครบถ้วน | มี `username`, `password`, `student_id`, `email`, `gender` ครบ | สร้าง Object/Payload ผู้ใช้และผ่านการตรวจสอบ ไม่มี Error |
| **02** | User Payload | กรณีไม่ส่ง `username` (Missing Required Field) | ข้อมูลผู้ใช้ขาด `username` | ระบบแจ้งเตือน 400 "Missing username" |
| **03** | User Payload | กรณีไม่ส่ง `password` (Missing Required Field)| ข้อมูลผู้ใช้ขาด `password` | ระบบแจ้งเตือน 400 "Missing password" |
| **04** | User Payload | กรณีไม่ส่ง `student_id` (Missing Required Field) | ข้อมูลผู้ใช้ขาด `student_id` | ระบบแจ้งเตือน 400 "Missing student_id" |
| **05** | User Payload | กรณีไม่ส่ง `gender` (Missing Required Field) | ข้อมูลผู้ใช้ขาด `gender` | ระบบแจ้งเตือน 400 "Missing gender" |
| **06** | Database Data | ตรวจสอบกรณี `username` หรือ `email` ซ้ำ | ข้อมูลผู้ใช้ที่มี `username` หรือ `email` ตรงกับในฐานข้อมูล | แจ้ง Error Code `23505` (Username หรือ Email ถูกใช้ไปแล้ว) |
| **07** | Data Default | ตรวจสอบค่าเริ่มต้นของ `photo` | ไม่ได้แนบ `photo` มาใน Payload | ข้อมูลบันทึกลงฐานข้อมูลด้วยค่า 'default.png' โดยอัตโนมัติ |
| **08** | Data Default | ตรวจสอบค่าเริ่มต้นของ `skills` และ `bio` | ไม่ได้ส่ง Array ของ skills และ bio | ลงฐานข้อมูลด้วย string ว่าง `''` และ string อาเรย์ว่าง `'[]'` |
| **09** | Data Default | ตรวจสอบค่าเริ่มต้นของสิทธิ์การมองเห็น (`visible`) | ไม่ได้ส่งค่า `visible` | สถานะการมองเห็นจะถูกตั้งเป็น `true` โดยอัตโนมัติ |
| **10** | Data Structure | ตรวจสอบตรรกะแปลงโครงสร้างข้อมูล (Generation) | ค้นหาข้อมูลผู้ใช้ที่มี `student_id` เช่น `65000000` | ระบบสามารถตัดข้อความเอา 2 ตัวหน้าและส่งคืนเป็นฟิลด์ `generation: '65'` ได้ถูกต้อง |

---

## 2. ตาราง Unit Test Cases ทดสอบการทำงานของ Class อื่นๆ (Controllers / API Logic)

| Test ID | Module/Class | Test Description (กรณีที่ทดสอบ) | Pre-condition (เงื่อนไขก่อนหน้า) | Expected Result (ผลลัพธ์ที่คาดหวัง) |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Login Controller | เข้าสู่ระบบสำเร็จด้วยรหัสผ่านผู้ใช้ทั่วไป | มีอีเมลและรหัสผ่านที่ถูกต้องอยู่ในระบบ | ระบบคืนค่าสถานะ `200 OK` พร้อมข้อมูล User |
| **02** | Login Controller | เข้าสู่ระบบไม่สำเร็จ (รหัสผ่านผิด) | มีอีเมลแต่กรอกรหัสผ่านผิด | ระบบคืนค่าสถานะ `401 Unauthorized` "รหัสไม่ถูกต้อง" |
| **03** | Login Controller | เข้าสู่ระบบไม่สำเร็จ (อีเมลผิด/ไม่มีในระบบ) | ไม่มีอีเมลนี้ในฐานข้อมูล | ระบบคืนค่าสถานะ `401 Unauthorized` "ไม่พบอีเมลนี้ในระบบ" |
| **04** | Auth Logic | เข้าสู่ระบบด้วยบัญชี Admin (Hardcode) | ใช้ Email: `admin@gmail.com`, Pass: `hardcode` | ระบบบายพาสและคืนค่าสถานะ Role `admin` ทันที |
| **05** | GetUsers Logic | ดึงข้อมูลผู้ใช้จากฐานข้อมูลต้องคัดเฉพาะผู้ใช้ที่มองเห็นได้ | มีผู้ใช้ทั้ง `visible=true` และ `false` | คืนค่าผู้ใช้ด้วยอาร์เรย์ที่มีเฉพาะ `visible=true` เท่านั้น |
| **06** | Search Logic | ทดสอบดึงข้อมูลด้วยคำค้นหา (Search Keyword) | ส่ง Parameter `keyword=test` มาทาง Query | ผลลัพธ์ต้องฟิลเตอร์เฉพาะคนที่ Username/Bio มีคำว่า `test` |
| **07** | Search Logic | ทดสอบระบบค้นหาแบบตัวกรองควบ (Filter) | ส่ง `gender=M` และ `major=CS` คู่กัน | ผลลัพธ์ต้องแสดงเฉพาะผู้ชาย (`M`) ที่เรียนสาขา `CS` เท่านั้น |
| **08** | UpdateUser Logic | อัปเดตข้อมูลผู้ใช้งานที่มีอยู่จริง | ส่ง Request ที่มี ID ที่มีในระบบ | ตรวจสอบและแก้ไข Database สำเร็จ ส่งแก้ `200 OK` และ Data ใหม่ |
| **09** | UpdateUser Logic | อัปเดตข้อมูลผู้ใช้งานที่ไม่มีอยู่จริง | ส่ง Request อัปเดตไปที่ ID ปลอม/ไม่มี | ระบบคืนค่า `404 Not Found` "ไม่พบผู้ใช้นี้" |
| **10** | Visibility Logic | การเปิด/ปิด Visibility | ส่งค่า Visibility ของ ID หนึ่งเป็น `false` | เปลี่ยนตารางข้อมูลสำเร็จ แจ้งผล 200 OK แสดงว่าข้อมูลถูกซ่อนเรียบร้อย |