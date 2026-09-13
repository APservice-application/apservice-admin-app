const fs = require('fs');
const assert = require('assert');

const controlPlane = fs.readFileSync('admin/admin-control-plane-patch.js', 'utf8');
const page = fs.readFileSync('admin/orders.html', 'utf8');
const styles = fs.readFileSync('admin/admin-orders.css', 'utf8');

assert.match(controlPlane, /function ordersPatch\(/, 'orders.html ต้องถูกควบคุมโดย Orders Control Plane handler');
assert.match(controlPlane, /data-order-tab="new"/, 'ต้องมีแท็บออเดอร์ใหม่');
assert.match(controlPlane, /data-order-tab="active"/, 'ต้องมีแท็บออเดอร์กำลังดำเนินการ');
assert.match(controlPlane, /data-order-tab="history"/, 'ต้องมีแท็บประวัติออเดอร์');
assert.match(controlPlane, /const orderBucket = status =>/, 'ต้องจัดกลุ่มสถานะจาก shared canonical contract');
assert.match(controlPlane, /C\.PAYMENT_REVIEW, C\.PAYMENT_RETRY, C\.CREDIT_REVIEW/, 'สถานะรอตรวจสอบการชำระเงินต้องอยู่ในกลุ่มออเดอร์ใหม่');
assert.match(controlPlane, /status === C\.COMPLETED \|\| status === C\.CANCELLED/, 'ออเดอร์เสร็จสิ้นและยกเลิกต้องอยู่ในประวัติ');
assert.match(controlPlane, /data-order-count="new"/, 'แท็บต้องแสดงจำนวนออเดอร์ใหม่จากข้อมูลจริง');
assert.match(controlPlane, /data-order-count="active"/, 'แท็บต้องแสดงจำนวนออเดอร์กำลังดำเนินการจากข้อมูลจริง');
assert.match(controlPlane, /data-order-count="history"/, 'แท็บต้องแสดงจำนวนออเดอร์ประวัติจากข้อมูลจริง');
assert.match(controlPlane, /class="admin-order-grid"/, 'Orders ต้อง render เป็น card workspace แบบ responsive');
assert.match(controlPlane, /data-status-order=/, 'Orders card ต้องมี action เปลี่ยนสถานะ');
assert.match(controlPlane, /C\.order\.canTransition\(\{ from: order\.status, to: nextStatus, actor: 'admin' \}\)/, 'การเปลี่ยนสถานะต้องผ่าน shared canonical transition');
assert.match(controlPlane, /data-edit-order=/, 'ต้องคง action แก้รายการเดิม');
assert.match(controlPlane, /data-assign-order=/, 'ต้องคง action มอบหมาย Rider เดิม');
assert.match(controlPlane, /data-history-order=/, 'ต้องคง action ดูประวัติเดิม');
assert.match(page, /admin-orders\.css\?v=orders-v1/, 'orders.html ต้องโหลด stylesheet ของ card workspace');
assert.match(page, /admin-control-plane-patch\.js\?v=control-plane-v\d+/, 'orders.html ต้องโหลด Orders Control Plane เวอร์ชันที่ระบุ cache key');
assert.match(styles, /\.admin-order-grid/, 'ต้องมี grid layout ของ order cards');
assert.match(styles, /\.admin-order-actions/, 'ต้องมี layout ของปุ่ม action บน order cards');
assert.match(styles, /@media\(max-width:760px\).*\.admin-order-grid/s, 'Orders cards ต้องมี mobile breakpoint');

assert.match(controlPlane, /C\.ADMIN_REVIEW, C\.PAYMENT_REVIEW, C\.PAYMENT_RETRY, C\.CREDIT_REVIEW/, 'คิวรอแอดมินตรวจสอบต้องอยู่ในกลุ่มออเดอร์ใหม่');
assert.match(controlPlane, /data-detail-call/, 'รายละเอียดออเดอร์ต้องมีปุ่มโทรหาร้านค้า');
assert.match(controlPlane, /data-detail-release/, 'รายละเอียดออเดอร์ต้องมีปุ่มปล่อยออเดอร์ให้ร้านค้าเมื่ออยู่ในคิวตรวจ');
assert.match(controlPlane, /function releaseOrderToStore\(order, onSaved\)/, 'ต้องมีขั้นตอนปล่อยออเดอร์ให้ร้านค้า');
assert.match(controlPlane, /manageOrder\(order, 'status', \{ status: C\.STORE_ACCEPTED \}/, 'การปล่อยออเดอร์ต้องเปลี่ยนสถานะเป็นร้านค้ารับออร์เดอร์ผ่าน edge');
assert.match(controlPlane, /audit\('admin_order_store_called'/, 'การโทรหาร้านค้าต้องถูกบันทึก audit');
assert.match(controlPlane, /audit\('admin_order_released_to_store'/, 'การปล่อยออเดอร์ต้องถูกบันทึก audit');
assert.match(controlPlane, /window\.location\.href = `tel:/, 'ปุ่มโทรหาร้านค้าต้องเปิดตัวโทรออก');
assert.match(controlPlane, /มอบหมายไรเดอร์ไม่ได้/, 'ต้องห้ามมอบหมายไรเดอร์ก่อนแอดมินปล่อยออเดอร์');
assert.match(controlPlane, /ยังไม่ผ่านการตรวจและปล่อยจากแอดมิน/, 'ข้อความกันมอบหมายไรเดอร์ต้องสื่อว่ายังไม่ผ่านการตรวจ');

console.log('admin orders grouping contract: PASS');
