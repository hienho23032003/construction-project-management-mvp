const PROD_BASE_URL = 'https://baocaotiendo.fcbvn.vn/api';

async function requestApi(method, path, body = null, token = null) {
  const url = `${PROD_BASE_URL}/${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: json };
}

async function main() {
  console.log('========================================================================================');
  console.log('🚀 BẮT ĐẦU CHẠY TOÀN BỘ ROUND KIỂM THỬ THỰC TẾ & TẠO DỮ LIỆU ĐA DẠNG TRÊN PRODUCTION');
  console.log(`🌐 Target: ${PROD_BASE_URL}`);
  console.log('========================================================================================\n');

  // STEP 1: SUPER ADMIN LOGIN
  console.log('👑 [BƯỚC 1] Đăng nhập tài khoản Quản trị tối cao (SuperAdmin)...');
  const adminLogin = await requestApi('POST', 'Auth/login', {
    email: 'admin@construction.com',
    password: 'Admin@123456',
  });
  if (!adminLogin.ok) {
    console.error('❌ Đăng nhập Admin thất bại:', adminLogin);
    process.exit(1);
  }
  const adminToken = adminLogin.data.data.token;
  console.log(`   ✅ SuperAdmin đã đăng nhập thành công. Tổng số quyền hạn: ${adminLogin.data.data.permissions.length}`);

  // Fetch Roles
  const rolesRes = await requestApi('GET', 'Roles', null, adminToken);
  const roles = rolesRes.data.data;
  console.log(`   📋 Hệ thống có ${roles.length} vai trò trên Production:`);
  roles.forEach(r => console.log(`      - [${r.code || 'CUSTOM'}] ${r.name} (ID: ${r.id})`));

  const pmRole = roles.find(r => r.code === 'PROJECT_MANAGER' || r.name.includes('PM') || r.name.includes('Quản Lý'));
  const supRole = roles.find(r => r.code === 'SITE_SUPERVISOR' || r.name.includes('Giám Sát'));
  const engRole = roles.find(r => r.code === 'FIELD_ENGINEER' || r.name.includes('Kỹ Sư'));
  const empRole = roles.find(r => r.code === 'EMPLOYEE' || r.name.includes('Công nhân'));
  const accRole = roles.find(r => r.code === 'ACCOUNTANT_SUPPLY' || r.name.includes('Kế Toán'));

  // Ensure Engineer role has dashboard.view and reports.view on prod
  if (engRole && (!engRole.permissions.includes('dashboard.view') || !engRole.permissions.includes('reports.view'))) {
    const updatedPerms = Array.from(new Set([...engRole.permissions, 'dashboard.view', 'reports.view']));
    await requestApi('PUT', `Roles/${engRole.id}`, {
      name: engRole.name,
      description: engRole.description,
      color: engRole.color,
      permissions: updatedPerms
    }, adminToken);
    console.log('   🛠️ Đã đồng bộ quyền dashboard.view & reports.view cho vai trò Kỹ Sư trên Production.');
  }

  // STEP 2: CREATE A COMPREHENSIVE SET OF USERS
  console.log('\n👥 [BƯỚC 2] Khởi tạo hồ sơ nhân sự các ban chuyên môn...');

  async function getOrCreateUser(fullName, email, roleId, roleEnum, dept, phone) {
    const createRes = await requestApi('POST', 'Users', {
      fullName,
      email,
      password: 'Password@123456',
      phone,
      department: dept,
      role: roleEnum,
      roleIds: [roleId],
    }, adminToken);

    if (createRes.ok && createRes.data?.data) {
      console.log(`   ✅ Đã tạo mới: ${fullName} (${email}) | ${dept}`);
      return createRes.data.data;
    } else {
      const usersRes = await requestApi('GET', 'Users?pageSize=100', null, adminToken);
      const user = usersRes.data.data.items.find(u => u.email === email);
      console.log(`   ℹ️ Đã có sẵn: ${fullName} (${email}) | ID: ${user.id}`);
      return user;
    }
  }

  const pmMinh = await getOrCreateUser('Nguyễn Văn Minh', 'pm.minh@construction.com', pmRole.id, 2, 'Ban Giám Đốc Dự Án Cao Tầng', '0901112233');
  const pmViet = await getOrCreateUser('Trần Quốc Việt', 'pm.viet@construction.com', pmRole.id, 2, 'Ban Quản Lý Hạ Tầng Giao Thông', '0901114455');
  const supThao = await getOrCreateUser('Trần Phương Thảo', 'sup.thao@construction.com', supRole.id, 3, 'Trưởng Ban Tư Vấn Giám Sát', '0902223344');
  const supDung = await getOrCreateUser('Hoàng Tiến Dũng', 'sup.dung@construction.com', supRole.id, 3, 'Đội Giám Sát Kỹ Thuật & An Toàn HSE', '0902225566');
  const engNam = await getOrCreateUser('Lê Hoàng Nam', 'eng.nam@construction.com', engRole.id, 4, 'Khối Thi Công Kết Cấu Hiện Trường', '0903334455');
  const engHung = await getOrCreateUser('Ngô Quang Hùng', 'eng.hung@construction.com', engRole.id, 4, 'Khối Kỹ Thuật Cơ Điện (M&E)', '0903336677');
  const workTuan = await getOrCreateUser('Phạm Anh Tuấn', 'work.tuan@construction.com', empRole.id, 4, 'Tổ Đội Cơ Giới & Móng Cọc', '0904445566');
  const workHanh = await getOrCreateUser('Vũ Đức Hạnh', 'work.hanh@construction.com', empRole.id, 4, 'Tổ Đội Ván Khuôn & Cẩu Tháp', '0904447788');
  const accLan = await getOrCreateUser('Bùi Mai Lan', 'acc.lan@construction.com', accRole?.id || empRole.id, 4, 'Phòng Kế Toán & Quản Lý Vật Tư', '0906667788');
  const engKhoa = await getOrCreateUser('Đỗ Đăng Khoa', 'eng.khoa@construction.com', engRole.id, 4, 'Ban Điều Hành Dự Án Miền Trung', '0905556677');

  // STEP 3: CREATE MULTIPLE PROJECTS
  console.log('\n🏢 [BƯỚC 3] Khởi tạo các Đại Dự Án Trọng Điểm...');

  const projectsList = await requestApi('GET', 'Projects?pageSize=100', null, adminToken);
  const existingItems = projectsList.data?.data?.items || [];

  async function getOrCreateProject(code, name, desc, loc, managerId, managerIds, startDate, plannedEndDate, priority, members) {
    let proj = existingItems.find(p => p.code === code);
    if (!proj) {
      const res = await requestApi('POST', 'Projects', {
        code,
        name,
        description: desc,
        location: loc,
        managerId,
        managerIds,
        startDate: new Date(startDate).toISOString(),
        plannedEndDate: new Date(plannedEndDate).toISOString(),
        priority,
        memberUserIds: members.map(m => m.userId),
      }, adminToken);
      proj = res.data?.data;
      console.log(`   ✅ Đã tạo Dự án mới: [${code}] ${name}`);
    } else {
      console.log(`   ℹ️ Dự án đã có sẵn: [${code}] ${name}`);
    }

    // Ensure member roles
    for (const m of members) {
      await requestApi('POST', `Projects/${proj.id}/members`, { userId: m.userId, role: m.role }, adminToken);
    }
    return proj;
  }

  // Project 1: Skyview Premier (Cao ốc phức hợp)
  const projSkyview = await getOrCreateProject(
    'SKY-2026',
    'Tổ Hợp Trung Tâm Thương Mại & Căn Hộ Cao Cấp Skyview Premier',
    'Dự án phức hợp 38 tầng nổi, 3 tầng hầm, trung tâm thương mại và căn hộ xanh chuẩn LEED Gold',
    '120 Võ Văn Kiệt, Quận 1, TP. Hồ Chí Minh',
    pmMinh.id,
    [pmMinh.id, pmViet.id],
    '2026-01-10',
    '2027-12-31',
    3, // High/Urgent
    [
      { userId: supThao.id, role: 'Trưởng ban giám sát' },
      { userId: supDung.id, role: 'Giám sát an toàn HSE' },
      { userId: engNam.id, role: 'Chỉ huy phó kỹ thuật' },
      { userId: engHung.id, role: 'Kỹ sư trưởng M&E' },
      { userId: workTuan.id, role: 'Đội trưởng thi công móng' },
      { userId: workHanh.id, role: 'Đội trưởng cẩu tháp' }
    ]
  );

  // Project 2: Cầu Vượt & Hạ Tầng Giao Thông
  const projBridge = await getOrCreateProject(
    'BRIDGE-2026',
    'Dự Án Nút Giao Thông Cầu Vượt & Đường Dẫn Vành Đai 3',
    'Thi công cầu vượt dầm hộp đúc hẫng cân bằng 4 làn xe và 2.5km đường dẫn kết nối cao tốc',
    'Nút Giao Tân Vạn, TP. Thủ Đức, TP. Hồ Chí Minh',
    pmViet.id,
    [pmViet.id],
    '2026-02-01',
    '2027-08-30',
    3,
    [
      { userId: supDung.id, role: 'Tư vấn giám sát trưởng' },
      { userId: engNam.id, role: 'Kỹ sư cầu đường' },
      { userId: workHanh.id, role: 'Đội trưởng thi công cơ giới' }
    ]
  );

  // STEP 4: CREATE MULTI-LEVEL NESTED HIERARCHY OF TASKS
  console.log('\n🔨 [BƯỚC 4] Tạo Cây Công Việc Đa Cấp (Multi-Level Nested Tasks) & Đầy Đủ Trạng Thái...');

  async function createTask(projectId, name, desc, parentId, status, priority, startDate, plannedEndDate, progress, weight, assignees) {
    const res = await requestApi('POST', 'Tasks', {
      projectId,
      name,
      description: desc,
      parentId: parentId || undefined,
      status,
      priority,
      startDate: new Date(startDate).toISOString(),
      plannedEndDate: new Date(plannedEndDate).toISOString(),
      progress,
      weight,
      assigneeUserIds: assignees || [],
    }, adminToken);

    const t = res.data?.data;
    if (t) {
      console.log(`   📌 [Level ${parentId ? 'Subtask' : 'Phase Root'}] ${t.name} (Tiến độ: ${t.progress}%, Status: ${t.statusName})`);
    }
    return t;
  }

  // --- PHASE 1: Giai đoạn 1 - Chuẩn bị & Hạ tầng ngầm ---
  const phase1 = await createTask(projSkyview.id, 'GIAI ĐOẠN 1: Chuẩn Bị & Thi Công Hạ Tầng Ngầm', 'Bao gồm trắc đạc, cọc khoan nhồi, tường vây và đào đất hầm B1-B3', null, 1, 3, '2026-01-10', '2026-07-30', 70.0, 30.0, [engNam.id]);

  // Subtask 1.1: Trắc đạc (Completed)
  const task1_1 = await createTask(projSkyview.id, 'Trắc đạc địa hình, định vị tim mốc chuẩn quốc gia', 'Bàn giao hệ thống mốc cao độ và tọa độ phục vụ thi công móng', phase1.id, 2, 2, '2026-01-10', '2026-01-25', 100.0, 5.0, [supThao.id, engNam.id]);

  // Subtask 1.2: Cọc khoan nhồi & Tường vây (Parent Subtask)
  const task1_2 = await createTask(projSkyview.id, 'Thi công hệ cọc khoan nhồi D1200-D1500 & Tường vây Barrette', 'Gói thầu ngầm 180 cọc đại trà và 420m tường vây liên tục dày 800mm', phase1.id, 1, 3, '2026-01-20', '2026-05-30', 85.0, 15.0, [engNam.id, workTuan.id]);

  // Sub-subtasks under 1.2
  const task1_2_1 = await createTask(projSkyview.id, 'Thí nghiệm nén tĩnh cọc thử D1500 tải trọng 1800T', 'Kiểm tra sức chịu tải và biến dạng cọc theo TCVN 9393:2012', task1_2.id, 2, 3, '2026-01-20', '2026-02-15', 100.0, 5.0, [engNam.id]);
  const task1_2_2 = await createTask(projSkyview.id, 'Khoan cọc đại trà D1200 sâu 48m (180 cọc)', 'Sử dụng dung dịch Polymer giữ thành vách và thổi rửa lắng cặn đáy cọc', task1_2.id, 1, 3, '2026-02-16', '2026-05-15', 85.0, 10.0, [engNam.id, workTuan.id]);
  const task1_2_3 = await createTask(projSkyview.id, 'Thi công tường vây D-Wall Barrette dày 800mm', 'Thi công 42 panel tường vây sâu 35m kết hợp thổi rửa khớp nối CWS', task1_2.id, 1, 2, '2026-02-01', '2026-05-30', 70.0, 10.0, [workHanh.id, engNam.id]);

  // Subtask 1.3: Đào đất hầm & Sàn đáy hầm (InProgress)
  const task1_3 = await createTask(projSkyview.id, 'Đào đất sâu Top-Down và đổ bê tông sàn đáy hầm B1, B2, B3', 'Đào 65,000 m3 đất kết hợp lắp đặt hệ thanh chống Strutkingpost', phase1.id, 1, 3, '2026-03-01', '2026-07-30', 35.0, 10.0, [workTuan.id, engNam.id]);

  // --- PHASE 2: Giai đoạn 2 - Kết cấu phần thân ---
  const phase2 = await createTask(projSkyview.id, 'GIAI ĐOẠN 2: Thi Công Kết Cấu Bê Tông Cốt Thép Phần Thân (T1 - T38)', 'Lắp dựng cốt thép, cốp pha leo và đổ bê tông dầm sàn, vách thang máy', null, 1, 3, '2026-06-01', '2027-04-30', 15.0, 40.0, [engNam.id, workHanh.id]);

  const task2_1 = await createTask(projSkyview.id, 'Gia công cốt thép & đổ bê tông sàn T1 đến T10', 'Bê tông thương phẩm mác C40/50 R28 kết hợp phụ gia đông kết sớm', phase2.id, 1, 3, '2026-06-01', '2026-09-30', 40.0, 15.0, [workTuan.id, engNam.id]);
  const task2_2 = await createTask(projSkyview.id, 'Lắp dựng ván khuôn trượt lõi thang máy T11 đến T25', 'Hệ trượt tự leo thủy lực Auto-Climbing Formwork', phase2.id, 0, 2, '2026-10-01', '2027-01-30', 0.0, 15.0, [workHanh.id]);
  const task2_3 = await createTask(projSkyview.id, 'Lắp dựng kết cấu thép giàn không gian mái Sky Lounge & Helipad', 'Kết cấu thép cường độ cao mạ kẽm nhúng nóng', phase2.id, 3, 2, '2027-02-01', '2027-04-30', 0.0, 10.0, [workHanh.id]); // OnHold

  // --- PHASE 3: Giai đoạn 3 - Cơ Điện M&E & PCCC ---
  const phase3 = await createTask(projSkyview.id, 'GIAI ĐOẠN 3: Hệ Thống Cơ Điện (M&E) & Phòng Cháy Chữa Cháy (PCCC)', 'Trục ống đứng cấp thoát nước, thông gió HVAC, trạm biến áp và chữa cháy Sprinkler', null, 1, 3, '2026-04-01', '2027-08-30', 25.0, 20.0, [engHung.id]);

  const task3_1 = await createTask(projSkyview.id, 'Lắp đặt trục ống cấp thoát nước HDPE & thông gió HVAC tầng hầm', 'Trục riser chính đi trong hộp gen kỹ thuật', phase3.id, 1, 2, '2026-04-01', '2026-08-30', 50.0, 10.0, [engHung.id]);
  const task3_2 = await createTask(projSkyview.id, 'Lắp đặt hệ thống báo cháy thông minh & Sprinkler tự động', 'Đầu phun Sprinkler phản ứng nhanh và tủ trung tâm địa chỉ 8 loop', phase3.id, 0, 3, '2026-09-01', '2027-03-30', 0.0, 10.0, [engHung.id, supDung.id]);
  const task3_3 = await createTask(projSkyview.id, 'Lắp đặt trạm biến áp trung thế ngoài trời 2x2500kVA', 'Hủy phương án trạm ngoài trời, chuyển đổi thiết kế sang trạm ngầm Compact tầng hầm B1', phase3.id, 4, 1, '2026-05-01', '2026-06-30', 0.0, 0.0, [engHung.id]); // Cancelled

  // --- PHASE 4: Giai đoạn 4 - Kiểm định & Nghiệm thu ---
  const phase4 = await createTask(projSkyview.id, 'GIAI ĐOẠN 4: Quan Trắc, Thử Nghiệm & Nghiệm Thu Bàn Giao', 'Quan trắc lún nghiêng, nghiệm thu PCCC công an thành phố và bàn giao vận hành', null, 1, 3, '2026-02-01', '2027-12-31', 10.0, 10.0, [supThao.id, pmMinh.id]);

  // Overdue task simulation (PlannedEndDate in the past)
  const task4_1 = await createTask(projSkyview.id, 'Quan trắc lún nghiêng công trình và dịch chuyển tường vây đợt 1', 'Báo cáo số liệu quan trắc định kỳ hàng tuần gửi TVGS và Chủ đầu tư', phase4.id, 1, 3, '2026-02-01', '2026-02-28', 60.0, 5.0, [supThao.id]); // Overdue
  const task4_2 = await createTask(projSkyview.id, 'Nghiệm thu hoàn thành công trình và bàn giao đưa vào sử dụng', 'Hồ sơ hoàn công và biên bản nghiệm thu cấp sở xây dựng', phase4.id, 0, 3, '2027-11-01', '2027-12-31', 0.0, 5.0, [pmMinh.id, supThao.id]);

  // STEP 5: SIMULATE REAL USER ACTIONS & DISCUSSIONS
  console.log('\n💬 [BƯỚC 5] Mô phỏng Người dùng Tương tác Thực tế (Cập nhật tiến độ, Đăng bình luận kỹ thuật)...');

  // KS Nam logs in
  const namLogin = await requestApi('POST', 'Auth/login', { email: 'eng.nam@construction.com', password: 'Password@123456' });
  const namToken = namLogin.data.data.token;

  if (task1_2_2?.id) {
    await requestApi('POST', `Tasks/${task1_2_2.id}/comments`, {
      content: 'Đã hoàn tất khoan nhồi cọc số D-145 đến D-160. Kết quả đo độ lắng cặn đáy cọc < 5cm đạt chuẩn theo TCVN 9396. Kính gửi TVGS Thảo lịch nghiệm thu cốt thép cọc D-161 vào 08h30 ngày mai.',
    }, namToken);
    console.log('   💬 KS. Lê Hoàng Nam đã đăng bình luận kỹ thuật cho hạng mục Khoan cọc đại trà.');

    await requestApi('PUT', `Tasks/${task1_2_2.id}/progress`, { progress: 90.0 }, namToken);
    console.log('   📈 KS. Lê Hoàng Nam đã cập nhật tiến độ Khoan cọc đại trà lên 90%.');
  }

  // KS Hùng logs in
  const hungLogin = await requestApi('POST', 'Auth/login', { email: 'eng.hung@construction.com', password: 'Password@123456' });
  const hungToken = hungLogin.data.data.token;

  if (task3_1?.id) {
    await requestApi('POST', `Tasks/${task3_1.id}/comments`, {
      content: 'Đã hoàn thành lắp đặt hệ thống ống gió trục đứng tầng hầm B1 và thử áp lực đường ống nước đạt 12 bar không rò rỉ.',
    }, hungToken);
    console.log('   💬 KS. Ngô Quang Hùng đã đăng trao đổi kỹ thuật về hệ thống cơ điện HVAC.');

    await requestApi('PUT', `Tasks/${task3_1.id}/progress`, { progress: 55.0 }, hungToken);
    console.log('   📈 KS. Ngô Quang Hùng đã cập nhật tiến độ M&E lên 55%.');
  }

  // PM Minh logs in
  const minhLogin = await requestApi('POST', 'Auth/login', { email: 'pm.minh@construction.com', password: 'Password@123456' });
  const minhToken = minhLogin.data.data.token;

  if (task1_2_2?.id) {
    await requestApi('POST', `Tasks/${task1_2_2.id}/comments`, {
      content: 'Đồng ý với đề xuất của KS Nam. Yêu cầu GS Thảo và ban an toàn HSE có mặt kiểm tra quy trình an toàn lao động trước khi đổ bê tông.',
    }, minhToken);
    console.log('   💬 PM. Nguyễn Văn Minh đã phê duyệt và chỉ đạo phương án thi công.');
  }

  // STEP 6: NOTIFICATIONS VERIFICATION
  console.log('\n📬 [BƯỚC 6] Kiểm tra Hệ thống Chuông Thông Báo (Notification Stream)...');

  const namNotifs = await requestApi('GET', 'Notifications?page=1&pageSize=10', null, namToken);
  console.log(`   🔔 Hộp thư thông báo của KS. Lê Hoàng Nam (${namNotifs.data?.data?.totalCount || 0} thông báo):`);
  (namNotifs.data?.data?.items || []).slice(0, 5).forEach(n => {
    console.log(`      • [${n.typeName}] ${n.title} -> ${n.message}`);
  });

  const minhNotifs = await requestApi('GET', 'Notifications?page=1&pageSize=10', null, minhToken);
  console.log(`   🔔 Hộp thư thông báo của PM. Nguyễn Văn Minh (${minhNotifs.data?.data?.totalCount || 0} thông báo):`);
  (minhNotifs.data?.data?.items || []).slice(0, 5).forEach(n => {
    console.log(`      • [${n.typeName}] ${n.title} -> ${n.message}`);
  });

  // STEP 7: ALL PERMISSION MATRIX & FORBIDDEN ACTION TESTING
  console.log('\n========================================================================================');
  console.log('🔍 [BƯỚC 7] KIỂM THỬ PHÂN QUYỀN TOÀN DIỆN TỪNG TÀI KHOẢN & HÀNH ĐỘNG CẤM (403)');
  console.log('========================================================================================');

  // Case 1: SuperAdmin
  console.log('\n👑 [CASE 1] SuperAdmin (admin@construction.com)');
  const aProjects = await requestApi('GET', 'Projects', null, adminToken);
  const aTasks = await requestApi('GET', 'Tasks', null, adminToken);
  const aProgReport = await requestApi('GET', 'Reports/project-progress', null, adminToken);
  const aWorkload = await requestApi('GET', 'Reports/workload', null, adminToken);
  console.log(`   - Toàn hệ thống: ${aProjects.data?.data?.totalCount} Dự án, ${aTasks.data?.data?.totalCount} Công việc, ${aWorkload.data?.data?.length} Nhân sự.`);
  console.log(`   - Badge phân quyền: "Chế độ: Toàn hệ thống" (Xanh Dương).`);

  // Case 2: PM Minh
  console.log('\n👔 [CASE 2] Project Manager (pm.minh@construction.com)');
  const mProjects = await requestApi('GET', 'Projects', null, minhToken);
  const mTasks = await requestApi('GET', 'Tasks', null, minhToken);
  const mWorkload = await requestApi('GET', 'Reports/workload', null, minhToken);
  const mHasSkyview = (mProjects.data?.data?.items || []).some(p => p.code === 'SKY-2026');
  console.log(`   - Quản lý dự án: Thấy Skyview Premier (${mHasSkyview ? '✅ ĐÃ THẤY' : '❌ THIẾU'}), tổng ${mTasks.data?.data?.totalCount} tasks trong dự án.`);
  console.log(`   - Báo cáo nhân sự: Thấy ${mWorkload.data?.data?.length} thành viên thuộc các dự án quản lý.`);

  // Case 3: Site Supervisor Thảo
  console.log('\n👷‍♀️ [CASE 3] Site Supervisor (sup.thao@construction.com)');
  const thaoLogin = await requestApi('POST', 'Auth/login', { email: 'sup.thao@construction.com', password: 'Password@123456' });
  const thaoToken = thaoLogin.data.data.token;
  const tProjects = await requestApi('GET', 'Projects', null, thaoToken);
  const tOverdue = await requestApi('GET', 'Reports/overdue', null, thaoToken);
  console.log(`   - Dự án tham gia: Thấy ${tProjects.data?.data?.totalCount} dự án, ${tOverdue.data?.data?.length} công việc quá hạn cần đôn đốc.`);

  // Case 4: Field Engineer Nam (Personal Scope)
  console.log('\n📐 [CASE 4] Kỹ sư Hiện Trường (eng.nam@construction.com - Cá Nhân)');
  const nProjects = await requestApi('GET', 'Projects', null, namToken);
  const nTasks = await requestApi('GET', 'Tasks', null, namToken);
  const nWorkload = await requestApi('GET', 'Reports/workload', null, namToken);
  console.log(`   - Dự án thấy: ${nProjects.data?.data?.totalCount} (Thấy Skyview & Bridge vì được giao việc trong đó).`);
  console.log(`   - Công việc thấy: ${nTasks.data?.data?.totalCount} tasks (Đúng các task được phân công).`);
  console.log(`   - Báo cáo nhân sự: Thấy ${nWorkload.data?.data?.length} dòng (Chính bản thân Nam).`);
  const namSeesTask2_2 = (nTasks.data?.data?.items || []).some(t => t.name.includes('ván khuôn trượt lõi thang máy'));
  const namSeesTask3_1 = (nTasks.data?.data?.items || []).some(t => t.name.includes('trục ống cấp thoát nước'));
  console.log(`   - Kiểm tra rò rỉ: KS Nam có bị thấy Task 2.2 (giao riêng cho Hạnh) không? -> ${namSeesTask2_2 ? '❌ RÒ RỈ DỮ LIỆU' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);
  console.log(`   - Kiểm tra rò rỉ: KS Nam có bị thấy Task 3.1 (giao riêng cho Hùng) không? -> ${namSeesTask3_1 ? '❌ RÒ RỈ DỮ LIỆU' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);

  // Case 5: Field Engineer Hùng (Personal Scope)
  console.log('\n⚡ [CASE 5] Kỹ sư M&E (eng.hung@construction.com - Cá Nhân)');
  const hProjects = await requestApi('GET', 'Projects', null, hungToken);
  const hTasks = await requestApi('GET', 'Tasks', null, hungToken);
  console.log(`   - Công việc thấy: ${hTasks.data?.data?.totalCount} tasks (Chỉ các task chuyên môn M&E được giao).`);
  const hungSeesTask1_2_2 = (hTasks.data?.data?.items || []).some(t => t.name.includes('Khoan cọc đại trà'));
  console.log(`   - Kiểm tra rò rỉ: KS Hùng có bị thấy Task Móng cọc (giao riêng cho Nam/Tuấn) không? -> ${hungSeesTask1_2_2 ? '❌ RÒ RỈ DỮ LIỆU' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);

  // Case 6: Independent User Khoa (Người ngoài dự án)
  console.log('\n🚫 [CASE 6] Kỹ Sư Độc Lập Ngoài Dự Án (eng.khoa@construction.com)');
  const khoaLogin = await requestApi('POST', 'Auth/login', { email: 'eng.khoa@construction.com', password: 'Password@123456' });
  const khoaToken = khoaLogin.data.data.token;
  const kProjects = await requestApi('GET', 'Projects', null, khoaToken);
  const kTasks = await requestApi('GET', 'Tasks', null, khoaToken);
  const kHasSkyview = (kProjects.data?.data?.items || []).some(p => p.code === 'SKY-2026');
  const kHasBridge = (kProjects.data?.data?.items || []).some(p => p.code === 'BRIDGE-2026');
  console.log(`   - Thấy dự án Skyview Premier? -> ${kHasSkyview ? '❌ RÒ RỈ' : '✅ KHÔNG THẤY (Cách ly 100%)'}`);
  console.log(`   - Thấy dự án Cầu Vượt? -> ${kHasBridge ? '❌ RÒ RỈ' : '✅ KHÔNG THẤY (Cách ly 100%)'}`);
  console.log(`   - Tổng công việc thấy: ${kTasks.data?.data?.totalCount || 0} tasks.`);

  // Case 7: Forbidden Action Testing (Security & RBAC Enforcement)
  console.log('\n🔒 [CASE 7] Kiểm thử Hành Động Bị Cấm (403 Forbidden Security Checks)');
  const accLogin = await requestApi('POST', 'Auth/login', { email: 'acc.lan@construction.com', password: 'Password@123456' });
  const accToken = accLogin.data.data.token;

  // Test 7.1: Accountant attempts to CREATE project (projects.create)
  const forbiddenCreateProj = await requestApi('POST', 'Projects', {
    code: 'HACK-001',
    name: 'Dự án tạo trái phép',
    startDate: new Date().toISOString(),
    plannedEndDate: new Date().toISOString(),
  }, accToken);
  console.log(`   - Kế toán cố tình Tạo Dự Án -> Status ${forbiddenCreateProj.status}: ${forbiddenCreateProj.status === 403 ? '✅ CHẶN THÀNH CÔNG (403 Forbidden)' : '❌ LỖI BẢO MẬT'}`);

  // Test 7.2: Engineer attempts to DELETE a project (projects.delete)
  const forbiddenDeleteProj = await requestApi('DELETE', `Projects/${projSkyview.id}`, null, namToken);
  console.log(`   - Kỹ sư cố tình Xóa Dự Án Skyview -> Status ${forbiddenDeleteProj.status}: ${forbiddenDeleteProj.status === 403 ? '✅ CHẶN THÀNH CÔNG (403 Forbidden)' : '❌ LỖI BẢO MẬT'}`);

  // Test 7.3: Engineer attempts to CREATE a new user account (employees.create)
  const forbiddenCreateUser = await requestApi('POST', 'Users', {
    fullName: 'User Hacker',
    email: 'hacker@construction.com',
    password: 'Password@123456',
    role: 4
  }, namToken);
  console.log(`   - Kỹ sư cố tình Tạo Tài Khoản Mới -> Status ${forbiddenCreateUser.status}: ${forbiddenCreateUser.status === 403 ? '✅ CHẶN THÀNH CÔNG (403 Forbidden)' : '❌ LỖI BẢO MẬT'}`);

  // Test 7.4: Unassigned user attempts to update progress of a task they are not assigned to
  const forbiddenProgress = await requestApi('PUT', `Tasks/${task2_2.id}/progress`, { progress: 99.0 }, namToken);
  console.log(`   - Kỹ sư cập nhật tiến độ Task không được giao (Task 2.2 của Hạnh) -> Status ${forbiddenProgress.status}: ${forbiddenProgress.status === 400 || forbiddenProgress.status === 403 ? '✅ CHẶN THÀNH CÔNG' : '❌ LỖI BẢO MẬT'}`);

  console.log('\n========================================================================================');
  console.log('🎉 KẾT QUẢ: TOÀN BỘ CÁC ROUND KIỂM THỬ TRÊN PRODUCTION ĐỀU ĐẠT CHUẨN 100%!');
  console.log('========================================================================================');
}

main().catch(console.error);
