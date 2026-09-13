const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');
assert.match(app, /ADMIN_APP_BUILD = '2026\.09\.13\.06'/, 'ต้อง bump build .06');
assert.match(app, /profile_pct,profile_exempt,profile_missing&order=name/, 'คิวร้านต้องดึงฟิลด์ onboarding');
assert.match(app, /ข้อมูลร้าน<\/dt><dd>\$\{Number\(row\.profile_pct/, 'การ์ดร้านต้องแสดง %');
assert.match(app, /data-store-exempt=/, 'ต้องมีปุ่มสลับสิทธิ์เปิดก่อนครบ');
assert.match(app, /section: 'onboarding', data: \{ profile_exempt: next \}/, 'ปุ่มต้องเรียก section onboarding');
assert.match(app, /กรอกข้อมูลให้ครบ 100% ก่อนเปิดขาย/, 'ข้อความอนุมัติต้องบอกเงื่อนไข 100%');

const edge = fs.readFileSync('supabase/functions/role-access/index.ts', 'utf8');
assert.match(edge, /active: false, moderation_status: 'active', registered_address: appRow\.address, pickup_address: appRow\.address/, 'อนุมัติต้องสร้างร้านแบบปิด + ที่อยู่ตั้งต้น');
assert.match(edge, /has\('pickup_address'\)/, 'merchant_update_store ต้องรับที่อยู่ร้าน');
assert.match(edge, /profile_pct: prof\?\.profile_pct/, 'merchant_update_store ต้องคืน % ล่าสุด');
assert.match(edge, /profile_exempt: true, legal_name/, 'provision ต้องยกเว้นร้านแอดมินสร้าง');
assert.match(edge, /if \(isNewStore\) await admin\.from\('stores'\)\.update\(\{ profile_exempt: true \}\)/, 'provision ใหม่ต้องยกเว้น');
assert.match(edge, /'operations', 'onboarding'/, 'ต้องมี section onboarding');
assert.match(edge, /moderation_changed_at,profile_pct,profile_exempt,profile_missing/, 'select ต้องมีฟิลด์ onboarding');

console.log('admin onboarding contract: PASS');
