(() => {
  'use strict';
  const boot = () => {
    const R = window.APServiceAdminRuntime;
    if (!R) return setTimeout(boot, 20);
    const { M, $, h, gate } = R;
    const state = { coupons: [], stores: [], menus: [], media: [], couponStores: [], couponMenus: [], stats: [], requests: [], editing: null };
    const date = value => value ? new Date(value).toLocaleString('th-TH') : '-';
    const imageUrl = row => row?.visibility === 'public' ? `${M.config.url}/storage/v1/object/public/${encodeURIComponent(row.bucket_id)}/${String(row.storage_path || '').split('/').map(encodeURIComponent).join('/')}?v=${encodeURIComponent(row.version || 1)}` : '';
    const discount = row => row.discount_type === 'percent' ? `${row.discount_value}%${row.max_discount_amount ? ` (สูงสุด ${M.ui.baht(row.max_discount_amount)})` : ''}` : M.ui.baht(row.discount_value);
    const scope = row => row.scope_type === 'store' ? 'เฉพาะร้านที่เลือก' : row.scope_type === 'menu' ? 'เฉพาะเมนูที่เลือก' : 'ใช้ได้ทุกร้าน';
    const ownerLabel = row => row.owner_type === 'store' ? `คูปองร้าน${row.owner_store_id ? ` · ${h(state.stores.find(store => String(store.id) === String(row.owner_store_id))?.name || 'ไม่ระบุชื่อร้าน')}` : ''}` : 'คูปองแพลตฟอร์ม';
    const distLabel = row => row.distribution_type === 'auto_grant' ? 'แจกอัตโนมัติ' : 'ลูกค้ากดรับเอง';
    const statusLabel = row => ({ draft: 'ฉบับร่าง', active: 'เปิดใช้งาน', paused: 'พักชั่วคราว', disabled: 'ปิดใช้งาน' })[row.status] || (row.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน');
    const statFor = id => state.stats.find(item => String(item.coupon_id) === String(id));
    const formMarkup = () => `<form id="couponForm" class="coupon-form"><div class="coupon-form-grid"><label class="mpa-field"><span>รหัสคูปอง *</span><input name="code" required maxlength="40" placeholder="WELCOME2026"></label><label class="mpa-field"><span>ชื่อคูปอง *</span><input name="name" required maxlength="120" placeholder="ส่วนลดสมาชิกใหม่"></label><label class="mpa-field full"><span>รายละเอียดคูปอง</span><textarea name="description" rows="2" maxlength="500" placeholder="รายละเอียดและเงื่อนไขที่ลูกค้าควรรู้"></textarea></label><label class="mpa-field"><span>ประเภทส่วนลด *</span><select name="discount_type"><option value="percent">ลดเป็นเปอร์เซ็นต์</option><option value="fixed">ลดเป็นจำนวนเงิน</option></select></label><label class="mpa-field"><span>มูลค่าส่วนลด *</span><input name="discount_value" type="number" min="0.01" step="0.01" required></label><label class="mpa-field"><span>เพดานส่วนลดสูงสุด (บาท)</span><input name="max_discount_amount" type="number" min="0" step="0.01" placeholder="ใช้กับแบบเปอร์เซ็นต์"></label><label class="mpa-field"><span>ยอดสั่งซื้อขั้นต่ำ</span><input name="min_order_amount" type="number" min="0" step="0.01" value="0"></label><label class="mpa-field"><span>เจ้าของคูปอง *</span><select name="owner_type"><option value="platform">แพลตฟอร์ม</option><option value="store">ร้านค้า (ผูกกับร้าน)</option></select></label><label class="mpa-field"><span>ร้านเจ้าของคูปอง</span><select name="owner_store_id"><option value="">เลือกเมื่อเป็นคูปองร้าน</option>${state.stores.map(row => `<option value="${h(row.id)}">${h(row.name)}</option>`).join('')}</select></label><label class="mpa-field"><span>วิธีแจกคูปอง *</span><select name="distribution_type"><option value="claim">ลูกค้ากดรับเอง</option><option value="auto_grant">แจกอัตโนมัติทุกคน</option></select></label><label class="mpa-field"><span>สถานะ *</span><select name="status"><option value="draft">ฉบับร่าง</option><option value="active">เปิดใช้งาน</option><option value="paused">พักชั่วคราว</option><option value="disabled">ปิดใช้งาน</option></select></label><label class="mpa-field"><span>ขอบเขตการใช้ *</span><select name="scope_type"><option value="all">ทุกสินค้า/ทุกร้าน</option><option value="store">เฉพาะร้าน</option><option value="menu">เฉพาะเมนู</option></select></label><label class="mpa-field"><span>ร้านที่กำหนด</span><select name="store_id"><option value="">เลือกเมื่อใช้เฉพาะร้าน</option>${state.stores.map(row => `<option value="${h(row.id)}">${h(row.name)}</option>`).join('')}</select></label><label class="mpa-field"><span>เมนูที่กำหนด</span><select name="menu_item_id"><option value="">เลือกเมื่อใช้เฉพาะเมนู</option>${state.menus.map(row => `<option value="${h(row.id)}">${h(row.name)} · ${h(row.store_name || 'ไม่ระบุร้าน')}</option>`).join('')}</select></label><label class="mpa-field"><span>จำนวนสิทธิ์รวม</span><input name="max_redemptions" type="number" min="1" placeholder="ไม่จำกัด"></label><label class="mpa-field"><span>จำกัดต่อคน</span><input name="per_customer_limit" type="number" min="1" value="1"></label><label class="mpa-field"><span>เริ่มใช้</span><input name="starts_at" type="datetime-local"></label><label class="mpa-field"><span>หมดอายุ</span><input name="ends_at" type="datetime-local"></label><div class="mpa-field full coupon-media-field"><span>รูปภาพคูปอง</span><div class="coupon-media-actions"><label class="mpa-button mpa-button-secondary">อัปโหลดรูปใหม่<input hidden type="file" accept="image/jpeg,image/png,image/webp" data-coupon-upload></label><select name="image_url" aria-label="เลือกรูปภาพคูปอง"><option value="">ไม่ใช้รูปภาพ</option>${state.media.map(row => `<option value="${h(imageUrl(row))}">${h(row.media_type || 'ภาพ')} · ${h(row.storage_path || row.id)}</option>`).join('')}</select></div><div class="coupon-media-preview" data-coupon-preview><span class="coupon-muted">ยังไม่ได้เลือกรูปภาพ</span></div><small class="coupon-muted">อัปโหลดรูปใหม่หรือเลือกรูป public/ready ที่มีอยู่แล้ว ระบบจะแสดงตัวอย่างก่อนบันทึก</small></div></div><div class="coupon-form-actions"><button class="mpa-button" type="submit">${state.editing ? 'บันทึกการแก้ไขคูปอง' : 'สร้างคูปอง'}</button>${state.editing ? '<button class="mpa-button mpa-button-secondary" type="button" data-coupon-cancel>ยกเลิกแก้ไข</button>' : ''}</div></form>`;
    const card = row => {
      const stat = statFor(row.id);
      const statText = stat ? `รับแล้ว ${stat.claimed} · ใช้แล้ว ${stat.used} · คงเหลือ ${stat.remaining === null ? 'ไม่จำกัด' : stat.remaining}` : 'ยังไม่มีสถิติ';
      return `<article class="coupon-card"><div>${row.image_url ? `<img class="coupon-media-preview" src="${h(row.image_url)}" alt="${h(row.name)}">` : '<div class="coupon-media-preview" aria-hidden="true"></div>'}</div><div><h3>${h(row.name)} <span class="mpa-badge">${h(row.code)}</span></h3><p>${h(row.description || 'ไม่มีรายละเอียดเพิ่มเติม')}</p><div class="coupon-card-meta"><span class="mpa-badge">${h(discount(row))}</span><span class="mpa-badge">${h(scope(row))}</span><span class="mpa-badge">${ownerLabel(row)}</span><span class="mpa-badge">${h(distLabel(row))}</span><span class="mpa-badge">${h(statusLabel(row))}</span></div><p class="coupon-muted">ใช้ได้ ${date(row.starts_at)} ถึง ${row.ends_at ? date(row.ends_at) : 'ไม่มีกำหนด'} · ขั้นต่ำ ${h(M.ui.baht(row.min_order_amount || 0))}</p><p class="coupon-muted">${h(statText)}</p></div><div class="coupon-card-actions"><button class="mpa-button mpa-button-secondary" type="button" data-coupon-edit="${h(row.id)}">แก้ไข</button>${row.distribution_type === 'auto_grant' ? `<button class="mpa-button mpa-button-secondary" type="button" data-coupon-grant="${h(row.id)}">แจกลูกค้าทุกคน</button>` : ''}<button class="mpa-button mpa-button-secondary" type="button" data-coupon-toggle="${h(row.id)}">${row.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</button><button class="mpa-button mpa-button-secondary" type="button" data-coupon-delete="${h(row.id)}">ลบ</button></div></article>`;
    };
    const requestCard = row => {
      const storeName = state.stores.find(store => String(store.id) === String(row.store_id))?.name || row.store_id;
      const value = row.discount_type === 'percent' ? `${row.discount_value}%` : M.ui.baht(row.discount_value);
      const statusText = { pending: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธแล้ว', cancelled: 'ยกเลิกแล้ว' }[row.status] || row.status;
      return `<article class="coupon-card"><div><h3>${h(row.name)} <span class="mpa-badge">${h(storeName)}</span></h3><p>${h(row.description || 'ไม่มีรายละเอียดเพิ่มเติม')}</p><div class="coupon-card-meta"><span class="mpa-badge">${h(value)}</span><span class="mpa-badge">ขั้นต่ำ ${h(M.ui.baht(row.min_order_amount || 0))}</span><span class="mpa-badge">${h(statusText)}</span></div><p class="coupon-muted">ขอเมื่อ ${date(row.created_at)}${row.admin_note ? ` · หมายเหตุ: ${h(row.admin_note)}` : ''}</p></div>${row.status === 'pending' ? `<div class="coupon-card-actions"><button class="mpa-button" type="button" data-request-approve="${h(row.id)}">อนุมัติและสร้างคูปอง</button><button class="mpa-button mpa-button-secondary" type="button" data-request-reject="${h(row.id)}">ปฏิเสธ</button></div>` : ''}</article>`;
    };
    const render = () => { const host = $('#coupons'); if (!host) return; host.innerHTML = `<div class="mpa-page-head"><div><span class="admin-kicker">COUPONS</span><h1>จัดการคูปอง</h1><p>สร้างคูปองส่วนลดสำหรับลูกค้า พร้อมกำหนดร้าน เมนู ช่วงเวลา และจำนวนสิทธิ์</p></div><a class="mpa-button mpa-button-secondary" href="dashboard.html">กลับภาพรวม</a></div><section class="mpa-card"><h2>${state.editing ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}</h2>${formMarkup()}</section><section class="mpa-card" style="margin-top:16px"><div class="mpa-page-head"><div><h2>คำขอคูปองจากร้านค้า</h2><p>อนุมัติเพื่อสร้างคูปองของร้าน หรือปฏิเสธพร้อมหมายเหตุ</p></div><strong>${state.requests.filter(item => item.status === 'pending').length} รอตรวจสอบ</strong></div><div class="coupon-list">${state.requests.map(requestCard).join('') || '<p class="coupon-muted">ยังไม่มีคำขอจากร้านค้า</p>'}</div></section><section class="mpa-card" style="margin-top:16px"><div class="mpa-page-head"><div><h2>คูปองทั้งหมด</h2><p>รายการนี้เป็นข้อมูลที่ Admin สร้างและลูกค้าจะเห็นตามสถานะ/ช่วงเวลา</p></div><strong>${state.coupons.length} รายการ</strong></div><div class="coupon-list">${state.coupons.map(card).join('') || '<p class="coupon-muted">ยังไม่มีคูปอง กรุณาสร้างรายการแรก</p>'}</div></section>`; bind(); };
    const syncScopeControls = form => {
      const isStoreOwner = form.owner_type.value === 'store';
      form.owner_store_id.disabled = !isStoreOwner;
      form.scope_type.disabled = isStoreOwner;
      if (isStoreOwner) form.scope_type.value = 'store';
      form.store_id.disabled = form.scope_type.value !== 'store' || isStoreOwner;
      form.menu_item_id.disabled = form.scope_type.value !== 'menu';
    };
    const adminIdentity = async () => { try { const session = await M.auth.refreshSession(false); return session?.user?.id || null; } catch { return null; } };
    const bind = () => {
      const form = $('#couponForm'); if (!form) return;
      form.owner_type.onchange = () => syncScopeControls(form);
      form.scope_type.onchange = () => syncScopeControls(form);
      syncScopeControls(form);
      const updateImagePreview = url => { const preview = form.querySelector('[data-coupon-preview]'); if (!preview) return; preview.innerHTML = url ? `<img src="${h(url)}" alt="ตัวอย่างรูปคูปอง" loading="lazy">` : '<span class="coupon-muted">ยังไม่ได้เลือกรูปภาพ</span>'; };
      form.image_url.onchange = () => updateImagePreview(form.image_url.value); updateImagePreview(form.image_url.value);
      form.querySelector('[data-coupon-upload]')?.addEventListener('change', async event => { const file = event.currentTarget.files?.[0]; if (!file) return; const input = event.currentTarget; input.disabled = true; try { const session = await M.auth.refreshSession(false); if (!session?.access_token || !session?.user?.id) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'); if (!window.APServiceMedia?.uploadPublicImage) throw new Error('ระบบอัปโหลดรูปภาพยังโหลดไม่พร้อม กรุณารีเฟรชหน้าเว็บแล้วลองใหม่'); const uploaded = await window.APServiceMedia.uploadPublicImage(file, { url: M.config.url, publishableKey: M.config.publishableKey, accessToken: session.access_token, actorId: session.user.id, bucket: 'catalog-media', pathPrefix: 'admin', scope: 'coupon', mediaType: 'ADVERTISEMENT', ownerType: 'admin' }); const option = new Option(`รูปใหม่ · ${uploaded.mediaId || uploaded.path}`, uploaded.publicUrl, true, true); form.image_url.add(option); form.image_url.value = uploaded.publicUrl; updateImagePreview(uploaded.publicUrl); M.ui.setNotice('อัปโหลดรูปคูปองแล้ว กรุณากดสร้างคูปองเพื่อบันทึก'); } catch (error) { M.ui.setNotice(error.message || 'อัปโหลดรูปคูปองไม่สำเร็จ', 'error'); } finally { input.disabled = false; input.value = ''; } });
      if (state.editing) { const row = state.coupons.find(item => item.id === state.editing); if (row) Object.entries({ code: row.code, name: row.name, description: row.description, discount_type: row.discount_type, discount_value: row.discount_value, max_discount_amount: row.max_discount_amount || '', min_order_amount: row.min_order_amount, owner_type: row.owner_type || 'platform', owner_store_id: row.owner_store_id || '', distribution_type: row.distribution_type || 'claim', status: row.status || (row.active ? 'active' : 'disabled'), scope_type: row.scope_type, store_id: state.couponStores.find(item => item.coupon_id === row.id)?.store_id || '', menu_item_id: state.couponMenus.find(item => item.coupon_id === row.id)?.menu_item_id || '', max_redemptions: row.max_redemptions || '', per_customer_limit: row.per_customer_limit, image_url: row.image_url || '' }).forEach(([key, value]) => { if (form[key]) form[key].value = value; }); syncScopeControls(form); }
      form.onsubmit = async event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const isStoreOwner = data.owner_type === 'store';
        const value = { code: data.code.trim().toUpperCase(), name: data.name.trim(), description: data.description.trim(), image_url: data.image_url || null, discount_type: data.discount_type, discount_value: Number(data.discount_value), max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : null, scope_type: isStoreOwner ? 'store' : data.scope_type, owner_type: data.owner_type, owner_store_id: isStoreOwner ? data.owner_store_id : null, distribution_type: data.distribution_type, status: data.status, min_order_amount: Number(data.min_order_amount || 0), starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : new Date().toISOString(), ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null, max_redemptions: data.max_redemptions ? Number(data.max_redemptions) : null, per_customer_limit: Number(data.per_customer_limit || 1), updated_at: new Date().toISOString() };
        if (!value.code || !value.name || !Number.isFinite(value.discount_value) || value.discount_value <= 0) return M.ui.setNotice('กรุณากรอกรหัส ชื่อ และมูลค่าส่วนลดให้ถูกต้อง', 'error');
        if (value.discount_type === 'percent' && value.discount_value > 100) return M.ui.setNotice('ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100%', 'error');
        if (value.max_discount_amount !== null && (!Number.isFinite(value.max_discount_amount) || value.max_discount_amount < 0)) return M.ui.setNotice('เพดานส่วนลดสูงสุดไม่ถูกต้อง', 'error');
        if (isStoreOwner && !value.owner_store_id) return M.ui.setNotice('กรุณาเลือกร้านเจ้าของคูปอง', 'error');
        if (value.scope_type === 'store' && !isStoreOwner && !data.store_id) return M.ui.setNotice('กรุณาเลือกร้านที่ใช้คูปอง', 'error');
        if (value.scope_type === 'menu' && !data.menu_item_id) return M.ui.setNotice('กรุณาเลือกเมนูที่ใช้คูปอง', 'error');
        try {
          let row;
          if (state.editing) {
            const updated = await M.request(`coupons?id=eq.${encodeURIComponent(state.editing)}`, { method: 'PATCH', private: true, headers: { Prefer: 'return=representation' }, body: JSON.stringify(value) });
            row = updated?.[0];
            await M.request(`coupon_stores?coupon_id=eq.${encodeURIComponent(state.editing)}`, { method: 'DELETE', private: true });
            await M.request(`coupon_menu_items?coupon_id=eq.${encodeURIComponent(state.editing)}`, { method: 'DELETE', private: true });
          } else {
            const created = await M.request('coupons', { method: 'POST', private: true, headers: { Prefer: 'return=representation' }, body: JSON.stringify(value) });
            row = created?.[0];
          }
          if (!row?.id) throw new Error('ระบบไม่ส่งข้อมูลคูปองกลับมา');
          if (value.scope_type === 'store') await M.request('coupon_stores', { method: 'POST', private: true, body: JSON.stringify({ coupon_id: row.id, store_id: isStoreOwner ? value.owner_store_id : data.store_id }) });
          if (value.scope_type === 'menu') await M.request('coupon_menu_items', { method: 'POST', private: true, body: JSON.stringify({ coupon_id: row.id, menu_item_id: data.menu_item_id }) });
          M.ui.setNotice(state.editing ? 'แก้ไขคูปองแล้ว' : 'สร้างคูปองแล้ว');
          state.editing = null;
          await load();
        } catch (error) { M.ui.setNotice(error.message || 'บันทึกคูปองไม่สำเร็จ', 'error'); }
      };
      form.querySelector('[data-coupon-cancel]')?.addEventListener('click', () => { state.editing = null; render(); });
      document.querySelectorAll('[data-coupon-edit]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); const id = String(button.getAttribute('data-coupon-edit') || '').trim(); if (!id || !state.coupons.some(item => String(item.id) === id)) return M.ui.setNotice('ไม่พบข้อมูลคูปองที่ต้องการแก้ไข', 'error'); state.editing = id; render(); requestAnimationFrame(() => { document.querySelector('#couponForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.querySelector('#couponForm input[name="code"]')?.focus(); }); }));
      document.querySelectorAll('[data-coupon-grant]').forEach(button => button.onclick = async () => {
        const row = state.coupons.find(item => item.id === button.dataset.couponGrant);
        if (!row || !window.confirm(`แจกคูปอง ${row.code} ให้ลูกค้าทุกคนหรือไม่?`)) return;
        try {
          const result = await M.request('rpc/admin_grant_coupon', { method: 'POST', private: true, body: JSON.stringify({ p_coupon_id: row.id }) });
          M.ui.setNotice(`แจกคูปองแล้ว ${result?.granted ?? 0} สิทธิ์`);
          await load();
        } catch (error) { M.ui.setNotice(error.message || 'แจกคูปองไม่สำเร็จ', 'error'); }
      });
      document.querySelectorAll('[data-coupon-toggle]').forEach(button => button.onclick = async () => { const row = state.coupons.find(item => item.id === button.dataset.couponToggle); if (!row) return; try { await M.request(`coupons?id=eq.${encodeURIComponent(row.id)}`, { method: 'PATCH', private: true, body: JSON.stringify({ active: !row.active, updated_at: new Date().toISOString() }) }); M.ui.setNotice(row.active ? 'ปิดใช้งานคูปองแล้ว' : 'เปิดใช้งานคูปองแล้ว'); await load(); } catch (error) { M.ui.setNotice(error.message || 'เปลี่ยนสถานะคูปองไม่สำเร็จ', 'error'); } });
      document.querySelectorAll('[data-coupon-delete]').forEach(button => button.onclick = async () => { const row = state.coupons.find(item => item.id === button.dataset.couponDelete); if (!row || !window.confirm(`ยืนยันลบคูปอง ${row.name} หรือไม่?`)) return; try { await M.request(`coupons?id=eq.${encodeURIComponent(row.id)}`, { method: 'DELETE', private: true }); M.ui.setNotice('ลบคูปองแล้ว'); await load(); } catch (error) { M.ui.setNotice(error.message || 'ลบคูปองไม่สำเร็จ', 'error'); } });
      document.querySelectorAll('[data-request-approve]').forEach(button => button.onclick = async () => {
        const req = state.requests.find(item => item.id === button.dataset.requestApprove);
        if (!req || !window.confirm(`อนุมัติคำขอ "${req.name}" และสร้างคูปองของร้านหรือไม่?`)) return;
        try {
          const adminId = await adminIdentity();
          const code = (`ST${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
          const created = await M.request('coupons', { method: 'POST', private: true, headers: { Prefer: 'return=representation' }, body: JSON.stringify({ code, name: req.name, description: req.description || '', discount_type: req.discount_type, discount_value: req.discount_value, min_order_amount: req.min_order_amount || 0, max_redemptions: req.max_redemptions, per_customer_limit: req.per_customer_limit || 1, starts_at: req.starts_at || new Date().toISOString(), ends_at: req.ends_at, scope_type: 'store', owner_type: 'store', owner_store_id: req.store_id, distribution_type: 'claim', status: 'active' }) });
          const coupon = created?.[0];
          if (!coupon?.id) throw new Error('ระบบไม่ส่งข้อมูลคูปองกลับมา');
          await M.request('coupon_stores', { method: 'POST', private: true, body: JSON.stringify({ coupon_id: coupon.id, store_id: req.store_id }) });
          await M.request(`merchant_coupon_requests?id=eq.${encodeURIComponent(req.id)}`, { method: 'PATCH', private: true, body: JSON.stringify({ status: 'approved', admin_note: `อนุมัติแล้ว รหัสคูปอง ${code}`, reviewed_by: adminId, reviewed_at: new Date().toISOString(), created_coupon_id: coupon.id, updated_at: new Date().toISOString() }) });
          M.ui.setNotice(`อนุมัติแล้ว สร้างคูปอง ${code}`);
          await load();
        } catch (error) { M.ui.setNotice(error.message || 'อนุมัติคำขอไม่สำเร็จ', 'error'); }
      });
      document.querySelectorAll('[data-request-reject]').forEach(button => button.onclick = async () => {
        const req = state.requests.find(item => item.id === button.dataset.requestReject);
        if (!req) return;
        const note = window.prompt(`ปฏิเสธคำขอ "${req.name}" กรุณาระบุเหตุผล`, '');
        if (note === null) return;
        try {
          const adminId = await adminIdentity();
          await M.request(`merchant_coupon_requests?id=eq.${encodeURIComponent(req.id)}`, { method: 'PATCH', private: true, body: JSON.stringify({ status: 'rejected', admin_note: String(note || '').slice(0, 500), reviewed_by: adminId, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
          M.ui.setNotice('ปฏิเสธคำขอแล้ว');
          await load();
        } catch (error) { M.ui.setNotice(error.message || 'ปฏิเสธคำขอไม่สำเร็จ', 'error'); }
      });
    };
    async function load() {
      try {
        const [coupons, stores, menus, media, couponStores, couponMenus, stats, requests] = await Promise.all([
          M.request('coupons?select=*&order=created_at.desc&limit=200', { private: true, forceFresh: true }),
          M.request('stores?select=id,name&order=name.asc&limit=500', { private: true, cacheTtlMs: 30_000 }),
          M.request('menu_items?select=id,name,store_id&order=name.asc&limit=1000', { private: true, cacheTtlMs: 30_000 }),
          M.request('media_assets?select=id,bucket_id,storage_path,version,visibility,media_type,status&visibility=eq.public&status=eq.ready&order=created_at.desc&limit=200', { private: true, cacheTtlMs: 30_000 }),
          M.request('coupon_stores?select=coupon_id,store_id&limit=1000', { private: true, cacheTtlMs: 30_000 }),
          M.request('coupon_menu_items?select=coupon_id,menu_item_id&limit=1000', { private: true, cacheTtlMs: 30_000 }),
          M.request('coupon_stats?select=*&limit=500', { private: true, cacheTtlMs: 30_000 }),
          M.request('merchant_coupon_requests?select=*&order=created_at.desc&limit=200', { private: true, forceFresh: true })
        ]);
        state.coupons = coupons || []; state.couponStores = couponStores || []; state.couponMenus = couponMenus || []; state.stores = stores || []; state.media = media || [];
        state.menus = (menus || []).map(row => ({ ...row, store_name: state.stores.find(store => store.id === row.store_id)?.name || '' }));
        state.stats = stats || []; state.requests = requests || [];
        render();
      } catch (error) { const host = $('#coupons'); if (host) host.innerHTML = M.ui.error('โหลดระบบคูปองไม่สำเร็จ', error.message); }
    }
    gate('admin', '<div id="coupons">กำลังโหลดระบบคูปอง…</div>').then(access => { if (access !== false) load(); });
  };
  window.APServiceAdminCoupons = { mount: boot };
})();
