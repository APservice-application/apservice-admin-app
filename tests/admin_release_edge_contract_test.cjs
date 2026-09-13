const fs = require('fs');
const assert = require('assert');

const edge = fs.readFileSync('supabase/functions/role-access/index.ts', 'utf8');

assert.match(edge, /ADMIN_REVIEW: 'รอแอดมินตรวจสอบ'/, 'edge ฝั่งแอดมินต้องรู้จักสถานะรอแอดมินตรวจสอบ');
assert.match(edge, /\[ORDER_STATUS\.ADMIN_REVIEW\]: \[ORDER_STATUS\.STORE_ACCEPTED, ORDER_STATUS\.CANCELLED\]/, 'edge ต้องอนุญาตให้ปล่อยออเดอร์หรือยกเลิกจากคิวตรวจเท่านั้น');
assert.match(edge, /ORDER_STATUS\.ADMIN_REVIEW, ORDER_STATUS\.STORE_ACCEPTED/, 'edge ต้องให้แอดมินแก้ไขออเดอร์ระหว่างรอตรวจได้');

console.log('admin release edge contract: PASS');
