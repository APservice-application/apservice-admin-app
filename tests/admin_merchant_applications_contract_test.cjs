const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');
assert.match(app, /merchant_applications\?select=/, 'ต้องอ่านคิวใบสมัครร้าน');
assert.match(app, /admin_review_merchant_application/, 'ต้องพิจารณาผ่าน edge');
assert.match(app, /data-app-approve/, 'ต้องมีปุ่มอนุมัติ');
assert.match(app, /data-app-reject/, 'ต้องมีปุ่มปฏิเสธ');
assert.match(app, /ADMIN_APP_BUILD = '2026\.09\.13\.06'/, 'ต้อง bump build');

const edge = fs.readFileSync('supabase/functions/role-access/index.ts', 'utf8');
assert.match(edge, /body\.action === 'merchant_apply'/, 'edge ต้องมี merchant_apply');
assert.match(edge, /body\.action === 'admin_review_merchant_application'/, 'edge ต้องมี review');
assert.match(edge, /ใบสมัครร้านของคุณอยู่ระหว่างตรวจสอบ/, 'login ต้องบล็อกใบสมัคร pending');

console.log('admin merchant applications contract: PASS');
