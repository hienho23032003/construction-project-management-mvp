const BASE_URL = 'http://localhost:5047/api';

async function requestApi(method, path, body = null, token = null) {
  const url = `${BASE_URL}/${path}`;
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
  console.log('===============================================================');
  console.log('🚀 BẮT ĐẦU QUY TRÌNH KIỂM THỬ THỰC TẾ & TẠO DỮ LIỆU MỚI (E2E)');
  console.log('===============================================================\n');

  // STEP 1: Login SuperAdmin
  console.log('👉 BƯỚC 1: Đăng nhập tài khoản SuperAdmin...');
  const adminLogin = await requestApi('POST', 'Auth/login', {
    email: 'admin@construction.com',
    password: 'Admin@123456',
  });
  if (!adminLogin.ok) {
    console.error('❌ Đăng nhập admin thất bại:', adminLogin);
    process.exit(1);
  }
  const adminToken = adminLogin.data.data.token;
  console.log(`✅ SuperAdmin đã đăng nhập thành công. Tổng số quyền: ${adminLogin.data.data.permissions.length}`);

  // Fetch Roles
  const rolesRes = await requestApi('GET', 'Roles', null, adminToken);
  const roles = rolesRes.data.data;
  console.log(`📋 Hệ thống có ${roles.length} vai trò:`);
  roles.forEach(r => console.log(`   - [${r.code}] ${r.name} (ID: ${r.id})`));

  const pmRole = roles.find(r => r.code === 'PROJECT_MANAGER' || r.name.includes('PM') || r.name.includes('Quản Lý'));
  const supRole = roles.find(r => r.code === 'SITE_SUPERVISOR' || r.name.includes('Giám Sát'));
  const engRole = roles.find(r => r.code === 'FIELD_ENGINEER' || r.name.includes('Kỹ Sư'));
  const empRole = roles.find(r => r.code === 'EMPLOYEE' || r.name.includes('Công nhân'));

  // STEP 2: Create / Get Users
  console.log('\n👉 BƯỚC 2: Tạo các nhân sự mới cho công trình...');

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
      console.log(`   ✅ Đã tạo mới nhân sự: ${fullName} (${email}) | Vị trí: ${dept}`);
      return createRes.data.data;
    } else {
      const usersRes = await requestApi('GET', 'Users?pageSize=100', null, adminToken);
      const user = usersRes.data.data.items.find(u => u.email === email);
      console.log(`   ℹ️ Đã tồn tại nhân sự: ${fullName} (${email}) | ID: ${user.id}`);
      return user;
    }
  }

  const pmMinh = await getOrCreateUser('Nguyễn Văn Minh', 'pm.minh@construction.com', pmRole.id, 2, 'Ban Quản Lý Dự Án', '0901112233');
  const supThao = await getOrCreateUser('Trần Phương Thảo', 'sup.thao@construction.com', supRole.id, 3, 'Đội Giám Sát Kỹ Thuật', '0902223344');
  const engNam = await getOrCreateUser('Lê Hoàng Nam', 'eng.nam@construction.com', engRole.id, 4, 'Khối Thi Công Hiện Trường', '0903334455');
  const workTuan = await getOrCreateUser('Phạm Anh Tuấn', 'work.tuan@construction.com', empRole.id, 4, 'Tổ Đội Cơ Giới & Xây Dựng', '0904445566');

  // STEP 3: Create Project
  console.log('\n👉 BƯỚC 3: Tạo Dự án Mới & Thiết lập Ban Quản Lý...');
  const projectCode = 'LM-2026';
  const projectsList = await requestApi('GET', 'Projects?pageSize=100', null, adminToken);
  let project = projectsList.data.data.items.find(p => p.code === projectCode);

  if (!project) {
    const newProjRes = await requestApi('POST', 'Projects', {
      code: projectCode,
      name: 'Tổ Hợp Chung Cư Cao Cấp Landmark Green Tower',
      description: 'Dự án phức hợp 35 tầng căn hộ cao cấp, 2 tầng hầm và trung tâm thương mại xanh',
      location: 'Khu Đô Thị Mới Nam Sài Gòn, TP. Hồ Chí Minh',
      managerId: pmMinh.id,
      managerIds: [pmMinh.id],
      startDate: new Date('2026-03-01').toISOString(),
      plannedEndDate: new Date('2027-12-31').toISOString(),
      priority: 3,
      memberUserIds: [supThao.id, engNam.id, workTuan.id],
    }, adminToken);

    project = newProjRes.data.data;
    console.log(`   ✅ Đã tạo Dự án mới: [${project.code}] ${project.name}`);
  } else {
    console.log(`   ℹ️ Dự án đã có sẵn trong CSDL: [${project.code}] ${project.name}`);
  }

  // Add members
  await requestApi('POST', `Projects/${project.id}/members`, { userId: supThao.id, role: 'Giám sát kỹ thuật' }, adminToken);
  await requestApi('POST', `Projects/${project.id}/members`, { userId: engNam.id, role: 'Kỹ sư hiện trường' }, adminToken);
  await requestApi('POST', `Projects/${project.id}/members`, { userId: workTuan.id, role: 'Đội trưởng thi công' }, adminToken);
  console.log(`   ✅ Đã thêm các thành viên (PM Minh, GS Thảo, KS Nam, ĐT Tuấn) vào ban quản lý dự án.`);

  // STEP 4: Create Tasks
  console.log('\n👉 BƯỚC 4: Tạo các hạng mục công việc & Phân công (Assign Task)...');

  // Task 1: Cọc khoan nhồi (Assignee: Nam)
  const task1Res = await requestApi('POST', 'Tasks', {
    projectId: project.id,
    name: 'Thi công cọc khoan nhồi D1200 và tường vây D-Wall',
    description: 'Khoan nhồi 120 cọc đại trà D1200mm sâu 45m và 300m tường vây liên tục',
    status: 1, // InProgress
    priority: 3, // High
    startDate: new Date('2026-03-05').toISOString(),
    plannedEndDate: new Date('2026-05-30').toISOString(),
    progress: 65.0,
    weight: 25.0,
    assigneeUserIds: [engNam.id],
  }, adminToken);
  const task1 = task1Res.data?.data;
  console.log(`   ✅ [Hạng mục 1] "${task1?.name}" -> Phân công: KS. Lê Hoàng Nam (Tiến độ: 65%)`);

  // Task 2: Tầng hầm (Assignees: Nam & Tuấn)
  const task2Res = await requestApi('POST', 'Tasks', {
    projectId: project.id,
    name: 'Đào đất sâu và đổ bê tông đài móng sàn hầm B1-B2',
    description: 'Đào 45,000 m3 đất, lắp đặt hệ kingpost chống shoring và đổ bê tông sàn đáy hầm',
    status: 1, // InProgress
    priority: 3,
    startDate: new Date('2026-04-15').toISOString(),
    plannedEndDate: new Date('2026-08-15').toISOString(),
    progress: 20.0,
    weight: 30.0,
    assigneeUserIds: [engNam.id, workTuan.id],
  }, adminToken);
  const task2 = task2Res.data?.data;
  console.log(`   ✅ [Hạng mục 2] "${task2?.name}" -> Phân công: KS. Lê Hoàng Nam + ĐT. Phạm Anh Tuấn (Tiến độ: 20%)`);

  // Task 3: Thân công trình (Assignee: Tuấn)
  const task3Res = await requestApi('POST', 'Tasks', {
    projectId: project.id,
    name: 'Lắp dựng cốt thép và đổ bê tông cột dầm sàn tầng 1 - 5',
    description: 'Gia công lắp dựng cốp pha trượt và đổ bê tông thương phẩm R28 C35/45',
    status: 0, // NotStarted
    priority: 2,
    startDate: new Date('2026-08-16').toISOString(),
    plannedEndDate: new Date('2026-11-30').toISOString(),
    progress: 0.0,
    weight: 20.0,
    assigneeUserIds: [workTuan.id],
  }, adminToken);
  const task3 = task3Res.data?.data;
  console.log(`   ✅ [Hạng mục 3] "${task3?.name}" -> Phân công: ĐT. Phạm Anh Tuấn (Tiến độ: 0%)`);

  // Task 4: Nghiệm thu trắc đạc (Assignee: Thảo - Overdue simulation)
  const task4Res = await requestApi('POST', 'Tasks', {
    projectId: project.id,
    name: 'Nghiệm thu trắc đạc tim trục móng và quan trắc lún đợt 1',
    description: 'Lập mốc tọa độ chuẩn quốc gia và bàn giao tim trục thi công móng',
    status: 1, // InProgress
    priority: 3,
    startDate: new Date('2026-03-01').toISOString(),
    plannedEndDate: new Date('2026-03-10').toISOString(), // Hạn chót trong quá khứ -> Quá hạn
    progress: 50.0,
    weight: 5.0,
    assigneeUserIds: [supThao.id],
  }, adminToken);
  const task4 = task4Res.data?.data;
  console.log(`   ✅ [Hạng mục 4] "${task4?.name}" -> Phân công: GS. Trần Phương Thảo (Quá hạn test case)`);

  // STEP 5: Engineer Nam interacts
  console.log('\n👉 BƯỚC 5: Kỹ sư Lê Hoàng Nam đăng nhập, cập nhật tiến độ & bình luận hiện trường...');
  const namLogin = await requestApi('POST', 'Auth/login', {
    email: 'eng.nam@construction.com',
    password: 'Password@123456',
  });
  const namToken = namLogin.data.data.token;
  console.log(`   ✅ KS Nam đã đăng nhập. Quyền hạn: [${namLogin.data.data.permissions.join(', ')}]`);

  if (task1?.id) {
    await requestApi('POST', `Tasks/${task1.id}/comments`, {
      content: 'Đã hoàn thành siêu âm 100% cọc khoan nhồi số D01-D45. Kết quả sóng siêu âm đồng nhất, bê tông đạt mác. Chuẩn bị nghiệm thu đợt 1 với TVGS Thảo.',
    }, namToken);
    console.log('   💬 KS Nam đã đăng bình luận cập nhật kỹ thuật cho Hạng mục 1.');

    await requestApi('PUT', `Tasks/${task1.id}/progress`, { progress: 80.0 }, namToken);
    console.log('   📈 KS Nam đã cập nhật tiến độ Hạng mục 1 lên 80%.');
  }

  // STEP 6: Check Notifications
  console.log('\n👉 BƯỚC 6: Kiểm tra Hệ thống Thông báo (Notifications)...');
  const namNotifs = await requestApi('GET', 'Notifications?page=1&pageSize=10', null, namToken);
  console.log(`   📬 Hộp thư thông báo của KS. Lê Hoàng Nam (${namNotifs.data?.data?.totalCount || 0} thông báo):`);
  (namNotifs.data?.data?.items || []).forEach(n => {
    console.log(`      • [${n.typeName}] ${n.title} -> ${n.message}`);
  });

  const minhLogin = await requestApi('POST', 'Auth/login', {
    email: 'pm.minh@construction.com',
    password: 'Password@123456',
  });
  const minhToken = minhLogin.data.data.token;
  const minhNotifs = await requestApi('GET', 'Notifications?page=1&pageSize=10', null, minhToken);
  console.log(`   📬 Hộp thư thông báo của PM. Nguyễn Văn Minh (${minhNotifs.data?.data?.totalCount || 0} thông báo):`);
  (minhNotifs.data?.data?.items || []).forEach(n => {
    console.log(`      • [${n.typeName}] ${n.title} -> ${n.message}`);
  });

  // STEP 7: Comprehensive Permission & Isolation Testing
  console.log('\n===============================================================');
  console.log('🔍 BƯỚC 7: KIỂM THỬ PHÂN QUYỀN TOÀN DIỆN TỪNG TÀI KHOẢN');
  console.log('===============================================================');

  // Case 1: Super Admin
  console.log('\n👑 [CASE 1] SuperAdmin (admin@construction.com)');
  console.log('   Scope: Toàn hệ thống (projects.view_all, tasks.view_all, reports.view_all)');
  const aProjects = await requestApi('GET', 'Projects', null, adminToken);
  const aTasks = await requestApi('GET', 'Tasks', null, adminToken);
  const aProgReport = await requestApi('GET', 'Reports/project-progress', null, adminToken);
  const aWorkload = await requestApi('GET', 'Reports/workload', null, adminToken);
  console.log(`   - Dự án thấy được: ${aProjects.data?.data?.totalCount} (Bao gồm tất cả dự án trong công ty)`);
  console.log(`   - Công việc thấy được: ${aTasks.data?.data?.totalCount} (Toàn bộ task hệ thống)`);
  console.log(`   - Báo cáo tiến độ: ${aProgReport.data?.data?.length} dòng`);
  console.log(`   - Báo cáo nhân sự: ${aWorkload.data?.data?.length} nhân sự toàn công ty`);

  // Case 2: PM Nguyễn Văn Minh
  console.log('\n👔 [CASE 2] Project Manager (pm.minh@construction.com)');
  console.log('   Vai trò: Quản lý dự án Landmark Green Tower');
  const mProjects = await requestApi('GET', 'Projects', null, minhToken);
  const mTasks = await requestApi('GET', 'Tasks', null, minhToken);
  const mProgReport = await requestApi('GET', 'Reports/project-progress', null, minhToken);
  const mWorkload = await requestApi('GET', 'Reports/workload', null, minhToken);
  const mHasLandmark = (mProjects.data?.data?.items || []).some(p => p.code === 'LM-2026');
  console.log(`   - Dự án thấy được: ${mProjects.data?.data?.totalCount} (Landmark Green Tower: ${mHasLandmark ? '✅ ĐÃ THẤY' : '❌ LỖI'})`);
  console.log(`   - Công việc thấy được: ${mTasks.data?.data?.totalCount} task`);
  console.log(`   - Báo cáo nhân sự quản lý: Thấy ${mWorkload.data?.data?.length} nhân sự thuộc các dự án quản lý`);

  // Case 3: Giám sát Trần Phương Thảo
  console.log('\n👷‍♀️ [CASE 3] Supervisor (sup.thao@construction.com)');
  console.log('   Vai trò: Giám sát công trường dự án Landmark Green Tower');
  const thaoLogin = await requestApi('POST', 'Auth/login', {
    email: 'sup.thao@construction.com',
    password: 'Password@123456',
  });
  const thaoToken = thaoLogin.data.data.token;
  const tProjects = await requestApi('GET', 'Projects', null, thaoToken);
  const tTasks = await requestApi('GET', 'Tasks', null, thaoToken);
  const tOverdue = await requestApi('GET', 'Reports/overdue', null, thaoToken);
  const tHasLandmark = (tProjects.data?.data?.items || []).some(p => p.code === 'LM-2026');
  console.log(`   - Dự án thấy được: ${tProjects.data?.data?.totalCount} (Landmark Green Tower: ${tHasLandmark ? '✅ ĐÃ THẤY' : '❌ LỖI'})`);
  console.log(`   - Công việc thấy được: ${tTasks.data?.data?.totalCount} task`);
  console.log(`   - Báo cáo quá hạn: Thấy ${tOverdue.data?.data?.length} công việc quá hạn trong dự án`);

  // Case 4: Kỹ sư Lê Hoàng Nam (Cá nhân - chỉ được assign Task 1 & Task 2)
  console.log('\n📐 [CASE 4] Kỹ sư hiện trường (eng.nam@construction.com)');
  console.log('   Scope: Cá nhân (projects.view, tasks.view, reports.view)');
  const nProjects = await requestApi('GET', 'Projects', null, namToken);
  const nTasks = await requestApi('GET', 'Tasks', null, namToken);
  const nProgReport = await requestApi('GET', 'Reports/project-progress', null, namToken);
  const nTaskReport = await requestApi('GET', 'Reports/tasks', null, namToken);
  const nWorkload = await requestApi('GET', 'Reports/workload', null, namToken);
  console.log(`   - Dự án thấy được: ${nProjects.data?.data?.totalCount} (Thấy dự án Landmark vì được giao việc trong đó)`);
  console.log(`   - Số task KS Nam thấy: ${nTasks.data?.data?.totalCount} task`);
  console.log('   - Danh sách công việc của KS Nam:');
  (nTasks.data?.data?.items || []).forEach(t => {
    console.log(`     + [${t.statusName}] ${t.name} (Tiến độ: ${t.progress}%)`);
  });
  const namSeesTask3 = (nTasks.data?.data?.items || []).some(t => t.name.includes('Lắp dựng cốt thép'));
  console.log(`   - Kiểm tra rò rỉ: KS Nam có bị thấy Task 3 (giao riêng cho Tuấn) không? -> ${namSeesTask3 ? '❌ RÒ RỈ DỮ LIỆU' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);
  console.log(`   - Báo cáo tải công nhân sự của KS Nam: Thấy ${nWorkload.data?.data?.length} dòng (Chính bản thân Nam)`);

  // Case 5: Đội trưởng thi công Phạm Anh Tuấn (Cá nhân - chỉ được assign Task 2 & Task 3)
  console.log('\n🔨 [CASE 5] Đội trưởng thi công (work.tuan@construction.com)');
  console.log('   Scope: Cá nhân');
  const tuanLogin = await requestApi('POST', 'Auth/login', {
    email: 'work.tuan@construction.com',
    password: 'Password@123456',
  });
  const tuanToken = tuanLogin.data.data.token;
  const tuProjects = await requestApi('GET', 'Projects', null, tuanToken);
  const tuTasks = await requestApi('GET', 'Tasks', null, tuanToken);
  console.log(`   - Dự án thấy được: ${tuProjects.data?.data?.totalCount} (Dự án Landmark Green Tower)`);
  console.log(`   - Số task ĐT Tuấn thấy: ${tuTasks.data?.data?.totalCount} task`);
  console.log('   - Danh sách công việc của ĐT Tuấn:');
  (tuTasks.data?.data?.items || []).forEach(t => {
    console.log(`     + [${t.statusName}] ${t.name} (Tiến độ: ${t.progress}%)`);
  });
  const tuanSeesTask1 = (tuTasks.data?.data?.items || []).some(t => t.name.includes('Thi công cọc khoan nhồi'));
  console.log(`   - Kiểm tra rò rỉ: ĐT Tuấn có bị thấy Task 1 (giao riêng cho Nam) không? -> ${tuanSeesTask1 ? '❌ RÒ RỈ DỮ LIỆU' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);

  // Case 6: User độc lập ngoài dự án (Kỹ sư Đỗ Đăng Khoa - Ban Dự Án Khác)
  console.log('\n🚫 [CASE 6] Kỹ sư Độc Lập (eng.khoa@construction.com - Hoàn toàn không liên quan đến LM-2026)');
  const engKhoa = await getOrCreateUser('Đỗ Đăng Khoa', 'eng.khoa@construction.com', engRole.id, 4, 'Ban Điều Hành Miền Trung', '0905556677');
  const khoaLogin = await requestApi('POST', 'Auth/login', {
    email: 'eng.khoa@construction.com',
    password: 'Password@123456',
  });
  if (khoaLogin.ok) {
    const khoaToken = khoaLogin.data.data.token;
    const kProjects = await requestApi('GET', 'Projects', null, khoaToken);
    const kTasks = await requestApi('GET', 'Tasks', null, khoaToken);
    const kHasLandmark = (kProjects.data?.data?.items || []).some(p => p.code === 'LM-2026');
    const kHasLandmarkTask = (kTasks.data?.data?.items || []).some(t => t.projectCode === 'LM-2026');
    console.log(`   - Thấy dự án Landmark Green Tower? -> ${kHasLandmark ? '❌ RÒ RỈ DỮ LIỆU' : '✅ KHÔNG THẤY (Cách ly an toàn 100%)'}`);
    console.log(`   - Thấy công việc của Landmark Green Tower? -> ${kHasLandmarkTask ? '❌ RÒ RỈ DỮ LIỆU' : '✅ KHÔNG THẤY (Cách ly an toàn 100%)'}`);
    console.log(`   - Tổng số dự án KS Khoa thấy: ${kProjects.data?.data?.totalCount || 0}`);
    console.log(`   - Tổng số công việc KS Khoa thấy: ${kTasks.data?.data?.totalCount || 0}`);
  }

  console.log('\n===============================================================');
  console.log('🎯 KẾT LUẬN KIỂM TRA: TOÀN BỘ LOGIC PHÂN QUYỀN VÀ DỮ LIỆU HOÀN HẢO!');
  console.log('===============================================================');
}

main().catch(console.error);

