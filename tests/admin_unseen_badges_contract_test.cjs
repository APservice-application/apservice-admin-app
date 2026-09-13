const fs = require('fs');
const assert = require('assert');

const admin = fs.readFileSync('admin/admin-app.js', 'utf8');
const navigation = fs.readFileSync('admin/admin-navigation.css', 'utf8');
const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');

assert.match(admin, /accounts: 'accounts', riders: 'riders'/, 'badge เมนูต้องครอบคลุมบัญชีและไรเดอร์');
assert.match(admin, /const getSeenAt = section =>/, 'ต้องจำเวลาที่แอดมินเข้าดูแต่ละหมวด');
assert.match(admin, /const markSeen = section =>/, 'ต้องตีว่าดูแล้วเมื่อเข้าเพจ');
assert.match(admin, /seenSectionForRoute/, 'ต้องผูกทุกหน้าเข้ากับหมวด unseen ของมัน');
assert.match(admin, /lastVisitSeenAt = getSeenAt\(seenSection\); markSeen\(seenSection\)/, 'gate ต้องจำครั้งก่อนแล้วตีว่าดูแล้วทันที');
assert.match(admin, /created_at=gt\.\$\{iso\('accounts'\)\}/, 'badge บัญชีต้องนับเฉพาะสมัครใหม่หลังเข้าดูครั้งก่อน');
assert.match(admin, /ordered_at=gt\.\$\{iso\('orders'\)\}/, 'badge ออเดอร์ต้องนับเฉพาะออเดอร์ใหม่');
assert.match(admin, /status=eq\.requested&requested_at=gt/, 'badge การเงินต้องใช้สถานะคำขอถอนจริง');
assert.match(admin, /uploaded_at=gt\.\$\{iso\('finance'\)\}/, 'badge การเงินต้องรวมสลิปที่อัปโหลดใหม่');
assert.match(admin, /submitted_at=gt\.\$\{iso\('riders'\)\}/, 'badge ไรเดอร์ต้องนับใบสมัครใหม่');
assert.match(admin, /status=in\.\(pending,failed\)/, 'badge แจ้งเตือนต้องรวมงานส่งไม่สำเร็จ');
assert.match(admin, /startNavBadgePoller/, 'ต้องรีเฟรช badge อัตโนมัติโดยไม่รีโหลดหน้า');
assert.match(admin, /has-unseen/, 'ต้องมีจุดแดงที่เมนูเพิ่มเติมเมื่อมีของใหม่ซ่อนอยู่');
assert.match(admin, /isNewSinceLastVisit\(person\.created_at\)/, 'การ์ดบัญชีต้องติดป้ายใหม่ให้รายการที่มาก่อนเข้าดูครั้งนี้');
assert.match(navigation, /\.admin-nav-more\.has-unseen summary::after/, 'CSS ต้องวาดจุดแดงบนเมนูเพิ่มเติม');
assert.match(dashboard, /admin-navigation\.css\?v=admin-nav-v3-unseen-dot/, 'ทุกหน้าต้องโหลด navigation CSS ใหม่');
assert.match(dashboard, /unseen=unseen-v1/, 'ทุกหน้าต้อง cache-bust runtime ระบบ unseen ใหม่');

console.log('admin unseen badges contract: PASS');
