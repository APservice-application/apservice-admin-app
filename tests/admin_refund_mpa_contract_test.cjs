const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('admin/admin-app.js', 'utf8');

assert.match(app, /order_cancellation_requests\?select=/, 'Admin finance ต้องอ่านคิวคำขอยกเลิก');
assert.match(app, /order_refunds\?select=/, 'Admin finance ต้องอ่านคิวคืนเงิน');
assert.match(app, /resolve_order_cancellation/, 'ต้องพิจารณายกเลิกผ่าน edge action');
assert.match(app, /process_order_refund/, 'ต้องจัดการคืนเงินผ่าน edge action');
assert.match(app, /refund_decision/, 'อนุมัติยกเลิกต้องเลือกได้ว่าจะคืนเงินหรือไม่');
assert.match(app, /bucket: 'refund-proofs'/, 'หลักฐานโอนคืนต้องเก็บใน bucket refund-proofs');
assert.match(app, /data-cancel-approve-refund/, 'ต้องมีปุ่มอนุมัติ+คืนเงิน');
assert.match(app, /data-refund-pay/, 'ต้องมีปุ่มบันทึกโอนคืน');
assert.match(app, /finance-cancels/, 'badge การเงินต้องนับคำขอยกเลิก');
assert.match(app, /finance-refunds/, 'badge การเงินต้องนับคำขอคืนเงิน');

console.log('admin refund MPA contract: PASS');
