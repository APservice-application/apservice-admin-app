const fs = require('fs');
const assert = require('assert');

const migration = fs.readFileSync('supabase/migrations/20260913_coupon_wallet_claim_grant.sql', 'utf8');
const coupons = fs.readFileSync('admin/admin-coupons.js', 'utf8');
const page = fs.readFileSync('admin/coupons.html', 'utf8');

assert.match(migration, /ADD COLUMN IF NOT EXISTS owner_type/, 'migration ต้องต่อคอลัมน์เจ้าของคูปองโดยไม่แตะของเดิม');
assert.match(migration, /ADD COLUMN IF NOT EXISTS distribution_type/, 'migration ต้องต่อคอลัมน์วิธีแจก');
assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.customer_coupons/, 'ต้องมีตารางกระเป๋าคูปองลูกค้า');
assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.merchant_coupon_requests/, 'ต้องมีตารางคำขอคูปองร้านค้า');
assert.match(migration, /CREATE OR REPLACE FUNCTION public\.claim_customer_coupon/, 'ต้องมี RPC กดรับคูปอง');
assert.match(migration, /CREATE OR REPLACE FUNCTION public\.admin_grant_coupon/, 'ต้องมี RPC แจกคูปองอัตโนมัติ');
assert.match(migration, /grant_auto_coupons_after_customer_role/, 'สมัครลูกค้าใหม่ต้องได้รับคูปองแจกอัตโนมัติ');
assert.match(migration, /p_coupons jsonb DEFAULT NULL/, 'checkout v3 ต้องรับคูปองแยกร้านแบบไม่บังคับ');
assert.match(migration, /pg_advisory_xact_lock\(hashtext\(v_customer_id::text \|\| ':coupon-use:'/, 'ใช้คูปองต้องล็อกกันกดซ้ำระดับทรานแซกชัน');
assert.match(migration, /DROP FUNCTION IF EXISTS public\.create_food_checkout_group_v3\(jsonb, uuid, text, text, text\)/, 'ต้องลบ v3 รุ่นเก่าที่ไม่มีคูปองทิ้ง');
assert.match(migration, /UPDATE public\.coupons SET status = 'disabled' WHERE active = false AND status = 'active'/, 'backfill ต้องแตะเฉพาะแถวที่ไม่ตรงกันเท่านั้น');

assert.match(coupons, /name="owner_type"/, 'ฟอร์มต้องเลือกเจ้าของคูปองแพลตฟอร์ม/ร้าน');
assert.match(coupons, /name="distribution_type"/, 'ฟอร์มต้องเลือกวิธีกดรับ/แจกอัตโนมัติ');
assert.match(coupons, /name="max_discount_amount"/, 'ฟอร์มต้องมีเพดานส่วนลดสูงสุด');
assert.match(coupons, /name="status"/, 'ฟอร์มต้องเลือกสถานะฉบับร่าง/เปิด/พัก/ปิด');
assert.match(coupons, /rpc\/admin_grant_coupon/, 'ต้องมีปุ่มแจกคูปองให้ลูกค้าทุกคน');
assert.match(coupons, /merchant_coupon_requests/, 'ต้องมีคิวคำขอคูปองจากร้านค้า');
assert.match(coupons, /data-request-approve/, 'ต้องอนุมัติคำขอพร้อมสร้างคูปองผูกร้าน');
assert.match(coupons, /data-request-reject/, 'ต้องปฏิเสธคำขอพร้อมหมายเหตุได้');
assert.match(coupons, /coupon_stats/, 'การ์ดคูปองต้องแสดงสถิติรับ/ใช้/คงเหลือ');
assert.match(page, /admin-coupons\.js\?v=admin-coupons-v7-wallet-grant/, 'หน้าคูปองต้องโหลด JS รุ่นกระเป๋าคูปอง');

console.log('admin coupon wallet grant contract: PASS');
