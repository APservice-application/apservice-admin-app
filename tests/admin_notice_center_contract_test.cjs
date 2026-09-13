const fs = require('fs');
const assert = require('assert');

const css = fs.readFileSync('shared/ap-service-mpa.css', 'utf8');
const runtime = fs.readFileSync('shared/ap-service-mpa.js', 'utf8');
const mobile = fs.readFileSync('admin/admin-mobile-ux.css', 'utf8');
const dashboard = fs.readFileSync('admin/dashboard.html', 'utf8');

assert.match(css, /\.mpa-toast\{position:fixed;z-index:100000;inset:0;margin:auto/, 'แจ้งเตือนต้องอยู่กลางจอและเลเยอร์หน้าสุดเหนือทุก pop up');
assert.match(css, /\.mpa-toast\.error\{background:linear-gradient\(145deg,#9f3041/, 'ผิดพลาดต้องเป็นสีแดง');
assert.match(css, /\.mpa-toast\.warning\{background:linear-gradient\(145deg,#96630b/, 'เตือนต้องเป็นสีส้ม');
assert.match(css, /145deg,#087c58,#0aa37e/, 'สำเร็จต้องเป็นสีเขียว');
assert.match(css, /@keyframes mpa-toast-enter/, 'ต้องมีอนิเมชันตอนแจ้งเตือนเข้า');
assert.match(css, /@keyframes mpa-toast-leave/, 'ต้องมีอนิเมชันตอนแจ้งเตือนออก');
assert.match(css, /@keyframes mpa-toast-icon-pop/, 'ไอคอนต้องมีอนิเมชันเด้ง');
assert.match(css, /prefers-reduced-motion/, 'ต้องเคารพการตั้งค่าลดอนิเมชัน');
assert.match(runtime, /is-leaving/, 'runtime ต้องเล่นอนิเมชันออกก่อนซ่อน');
assert.match(runtime, /void host\.offsetWidth/, 'ต้องรีสตาร์ทอนิเมชันทุกครั้งที่แจ้งเตือนซ้ำ');
assert.match(mobile, /\.mpa-toast \{\s*width: calc\(100vw - 20px\);\s*\}/, 'mobile ต้องคุมแค่ความกว้าง ไม่ดึงแจ้งเตือนกลับไปมุมจอ');
assert.match(dashboard, /ap-service-mpa\.css\?v=mpa-v3-notice-center/, 'ทุกหน้าต้องโหลด CSS แจ้งเตือนกลางจอรุ่นใหม่');
assert.match(dashboard, /ap-service-mpa\.js\?v=admin-gate-v2-notice-center/, 'ทุกหน้าต้องโหลด runtime แจ้งเตือนรุ่นใหม่');

console.log('admin notice center contract: PASS');
