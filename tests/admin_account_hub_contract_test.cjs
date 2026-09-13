const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const accounts = fs.readFileSync('admin/accounts.html', 'utf8');

assert.match(admin, /\['accounts','บัญชีทุกบทบาท','account'\]/, 'เมนูหลักต้องมีบัญชีทุกบทบาทในกลุ่มบัญชีและบทบาท');
assert.match(admin, /people = links\.slice\(3, 6\)/, 'กลุ่มบัญชีและบทบาทต้องครอบคลุมบัญชี ไรเดอร์ และลูกค้า');
assert.doesNotMatch(admin, /\['admins','ผู้ใช้และบทบาท','accounts\.html'\]/, 'ต้องย้ายบัญชีออกจากเมนู legacy มาอยู่กลุ่มหลักแล้ว');
assert.match(admin, /<option value="store_owner">เจ้าของร้าน<\/option>/, 'ฟอร์มเพิ่มบัญชีต้องรองรับเจ้าของร้าน');
assert.match(admin, /<option value="rider">ไรเดอร์<\/option>/, 'ฟอร์มเพิ่มบัญชีต้องรองรับไรเดอร์');
assert.match(admin, /action: 'provision_store_owner'/, 'ศูนย์บัญชีต้องสร้างร้านพร้อมบัญชีผ่าน atomic provision');
assert.match(admin, /user_id: result\.user_id/, 'ศูนย์บัญชีต้องผูกงานจัดส่งไรเดอร์กับบัญชีที่สร้างทันที');
assert.match(admin, /ศูนย์บัญชีทุกบทบาท/, 'ศูนย์บัญชีต้องสื่อว่าจัดการได้ทุกบทบาทที่เดียว');
assert.match(admin, /params\.get\('create'\) === '1'/, 'ศูนย์บัญชีต้องรองรับ deep-link เปิดฟอร์มสร้างทันที');
assert.match(admin, /accounts\.html\?role=rider&create=1/, 'หน้าไรเดอร์ต้องส่งงานเพิ่มไรเดอร์ไปศูนย์บัญชี');
assert.match(admin, /location\.replace\('accounts\.html\?role=customer'\)/, 'หน้าลูกค้าแบบอ่านอย่างเดียวต้องรวมเข้าศูนย์บัญชี');
assert.match(admin, /href="stores\.html"/, 'ศูนย์บัญชีต้องคงทางลัดไปหน้าร้านค้า');
assert.match(admin, /href="riders\.html"/, 'ศูนย์บัญชีต้องคงทางลัดไปหน้าไรเดอร์');
assert.match(accounts, /hub=account-hub-v1/, 'หน้า Accounts ต้อง cache-bust runtime ศูนย์บัญชีใหม่');

console.log('admin account hub contract: PASS');
