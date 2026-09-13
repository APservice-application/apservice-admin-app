const fs = require('fs');
const assert = require('assert');

const page = fs.readFileSync('admin/finance.html', 'utf8');
const app = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(page, /ap-service-media\.js/, 'Admin finance ต้องโหลด Shared Media Service');
assert.match(app, /checkout_group_payments\?select=/, 'Admin finance ต้องอ่านคิวตรวจสลิปจาก group payments');
assert.match(app, /status=eq\.under_review/, 'คิวตรวจสลิปต้องกรองเฉพาะรายการรอตรวจ');
assert.match(app, /createSignedImageUrl/, 'Admin ต้องเปิด private slip ด้วย signed URL');
assert.match(app, /mpa-modal-backdrop/, 'Admin ต้องแสดงหลักฐานในหน้าเว็บ ไม่เปิดหน้าต่างใหม่');
assert.match(app, /rpc\/admin_review_checkout_group_payment/, 'Admin ต้องบันทึกผลตรวจผ่าน RPC กลุ่ม');
assert.match(app, /p_decision: approved \? 'verify' : 'reject'/, 'ผลตรวจต้องส่ง verify/reject ตามปุ่มที่กด');
assert.match(app, /p_idempotency_key: idempotencyKey/, 'ผลตรวจต้องมี idempotency key กันกดซ้ำ');

console.log('admin payment slip MPA contract: PASS');
