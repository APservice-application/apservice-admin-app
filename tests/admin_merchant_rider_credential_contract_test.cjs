const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../supabase/functions/role-access/index.ts'), 'utf8');
const storeUi = fs.readFileSync(path.resolve(__dirname, '../admin/admin-control-plane-completeness.js'), 'utf8');

assert.match(source, /const secureTemporaryPassword/, 'Credential workflow must use a shared temporary-password policy');
assert.match(source, /body\.action === 'reset_rider_password'/, 'Role access must expose a Rider credential reset action');
assert.match(source, /body\.action === 'reset_store_password'/, 'Role access must preserve a Merchant credential reset action');
assert.match(source, /body\.action === 'provision_store_owner'/, 'Store creation must use a supported atomic provision action');
assert.match(source, /admin\.auth\.admin\.deleteUser\(userId\)/, 'Failed store provisioning must clean up the newly-created auth user');
assert.match(storeUi, /field\('password'.*minlength="12"/, 'Visible Merchant create form must require the backend password length');
assert.match(storeUi, /เงื่อนไขรหัสผ่าน/, 'Visible Merchant create form must explain the password policy');
assert.match(source, /admin\.auth\.admin\.updateUserById\(rider\.user_id, \{ password \}\)/, 'Rider reset must update only the rider account bound to the selected entity');
assert.match(source, /action: 'rider_password_reset', after_state: \{ rider_id: entityId \}/, 'Rider password reset audit must contain only the entity ID, never the password');
assert.match(source, /action: 'store_password_reset', after_state: \{ store_id: entityId \}/, 'Merchant password reset audit must contain only the entity ID, never the password');

assert.match(source, /owner_user_id/, 'Provision must support attaching an existing user account as store owner');
assert.match(source, /action: 'store_owner_attached'/, 'Attaching an existing owner must write a dedicated audit event');
assert.match(source, /หนึ่งบัญชีผูกได้หนึ่งร้าน/, 'Attach must refuse accounts that already own a store (merchant login binds one store)');
assert.match(source, /บัญชีนี้ยังไม่มี Login ID/, 'Attach must require a Login ID only when the account lacks one');
assert.match(storeUi, /name="account_mode"/, 'Store create form must let admin choose existing account or new account');
assert.match(storeUi, /owner_user_id/, 'Store create form must submit the picked owner account id');
assert.match(storeUi, /ค้นหาบัญชี/, 'Store create form must offer account search for prefilling owner data');
assert.match(storeUi, /ใช้รหัสผ่านเดิมของบัญชี/, 'Existing-account mode must keep the original password (no reset)');
assert.doesNotMatch(source, /text\(entity\.(legal_name|registration_number|contact_name|contact_email|registered_address|pickup_address|delivery_address)\) \|\| null/, 'Store insert must never send NULL into NOT NULL DEFAULT columns (partial save must work)');
assert.match(source, /registered_address: text\(entity\.registered_address\) \|\| ''/, 'Empty store addresses must fall back to empty string so stores can open before data is complete');
assert.match(source, /resolveCategoryId/, 'Provision must validate category_id against store_categories instead of trusting form input');
assert.match(storeUi, /select name="category_id"/, 'Store create form must offer categories as a dropdown, not free text');
assert.match(storeUi, /store_categories\?select=id,name,icon/, 'Category dropdown must load real categories from the server');
assert.match(storeUi, /datalist id="owner-account-list"/, 'Owner picker must offer a dropdown of existing accounts');
assert.match(storeUi, /user_profiles\?select=user_id,display_name,email,phone,login_id&order=created_at\.desc&limit=200/, 'Owner dropdown must preload recent accounts for one-tap picking');
assert.match(storeUi, /stores\?select=owner_id/, 'Owner dropdown must exclude accounts that already own a store');

console.log('admin merchant/rider credential contract: PASS');
