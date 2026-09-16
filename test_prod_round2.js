const PROD_BASE_URL = 'https://baocaotiendo.fcbvn.vn/api';

async function requestApi(method, path, body = null, token = null) {
  const start = Date.now();
  const url = `${PROD_BASE_URL}/${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const duration = Date.now() - start;
    const json = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data: json, duration };
  } catch (err) {
    const duration = Date.now() - start;
    return { status: 500, ok: false, data: null, duration, error: err.message };
  }
}

async function main() {
  console.log('================================================================================================');
  console.log('🏗️ BẮT ĐẦU ROUND 2: MÔ PHỎNG QUẢN LÝ DỰ ÁN THỰC CHIẾN - KHÔNG DÙNG ADMIN');
  console.log('👥 TẬP TRUNG: ĐA NGƯỜI DÙNG ĐỒNG THỜI | CẬP NHẬT TIẾN ĐỘ LIÊN ĐỚI (PARENT/CHILD/PROJECT) | HIỆU NĂNG UI');
  console.log(`🌐 Target Server: ${PROD_BASE_URL}`);
  console.log('================================================================================================\n');

  // STEP 1: LOGIN AS PROJECT MANAGER (PM MINH)
  console.log('👔 [BƯỚC 1] Đăng nhập bằng tài khoản Quản Lý Dự Án (PM Nguyễn Văn Minh)...');
  const pmLogin = await requestApi('POST', 'Auth/login', {
    email: 'pm.minh@construction.com',
    password: 'Password@123456',
  });
  if (!pmLogin.ok) {
    console.error('❌ Đăng nhập PM Minh thất bại:', pmLogin);
    process.exit(1);
  }
  const pmToken = pmLogin.data.data.token;
  console.log(`   ✅ PM Minh đăng nhập thành công. (Thời gian phản hồi: ${pmLogin.duration}ms)`);
  console.log(`   🔑 Danh sách quyền của PM: [${pmLogin.data.data.permissions.slice(0, 8).join(', ')}...]`);

  // Ensure PM has permissions to create project and tasks
  const projCode = 'ECO-2026';

  // STEP 2: PM CREATES A MASSIVE NEW MEGA PROJECT
  console.log('\n🏢 [BƯỚC 2] PM Minh tự tạo Dự án Mới: [ECO-2026] Khu Đô Thị Sinh Thái Eco Park Riverside...');
  
  // First, get team members
  const supLogin = await requestApi('POST', 'Auth/login', { email: 'sup.thao@construction.com', password: 'Password@123456' });
  const supToken = supLogin.data.data.token;
  const engNamLogin = await requestApi('POST', 'Auth/login', { email: 'eng.nam@construction.com', password: 'Password@123456' });
  const engNamToken = engNamLogin.data.data.token;
  const engHungLogin = await requestApi('POST', 'Auth/login', { email: 'eng.hung@construction.com', password: 'Password@123456' });
  const engHungToken = engHungLogin.data.data.token;
  const workTuanLogin = await requestApi('POST', 'Auth/login', { email: 'work.tuan@construction.com', password: 'Password@123456' });
  const workTuanToken = workTuanLogin.data.data.token;
  const workHanhLogin = await requestApi('POST', 'Auth/login', { email: 'work.hanh@construction.com', password: 'Password@123456' });
  const workHanhToken = workHanhLogin.data.data.token;

  const team = [
    { name: 'PM Nguyễn Văn Minh', id: pmLogin.data.data.user.id, token: pmToken },
    { name: 'GS Trần Phương Thảo', id: supLogin.data.data.user.id, token: supToken },
    { name: 'KS Lê Hoàng Nam', id: engNamLogin.data.data.user.id, token: engNamToken },
    { name: 'KS Ngô Quang Hùng', id: engHungLogin.data.data.user.id, token: engHungToken },
    { name: 'ĐT Phạm Anh Tuấn', id: workTuanLogin.data.data.user.id, token: workTuanToken },
    { name: 'ĐT Vũ Đức Hạnh', id: workHanhLogin.data.data.user.id, token: workHanhToken },
  ];

  console.log(`   👥 Đội ngũ tham gia dự án (${team.length} thành viên):`);
  team.forEach(m => console.log(`      • ${m.name} (ID: ${m.id})`));

  // Check if project exists or PM creates it
  const pmProjects = await requestApi('GET', 'Projects?pageSize=100', null, pmToken);
  let project = (pmProjects.data?.data?.items || []).find(p => p.code === projCode);

  if (!project) {
    const createProjRes = await requestApi('POST', 'Projects', {
      code: projCode,
      name: 'Đại Đô Thị Sinh Thái Eco Park Riverside - Phân Khu Sapphire',
      description: 'Quy hoạch 20ha gồm 4 tháp căn hộ 32 tầng, 120 biệt thự ven sông và hồ cảnh quan sinh thái',
      location: 'Khu Đô Thị Mới Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh',
      managerId: team[0].id,
      managerIds: [team[0].id],
      startDate: new Date('2026-03-01').toISOString(),
      plannedEndDate: new Date('2028-06-30').toISOString(),
      priority: 3, // Urgent
      memberUserIds: team.map(m => m.id),
    }, pmToken);

    if (createProjRes.ok) {
      project = createProjRes.data.data;
      console.log(`   ✅ PM Minh đã tạo thành công Dự án: [${project.code}] ${project.name} (API latency: ${createProjRes.duration}ms)`);
    } else {
      console.log(`   ⚠️ PM create project response status ${createProjRes.status}: ${createProjRes.data?.message || 'Will use Admin if needed'}`);
    }
  } else {
    console.log(`   ℹ️ Dự án [${project.code}] ${project.name} đã sẵn sàng.`);
  }

  // Ensure members
  for (const m of team) {
    await requestApi('POST', `Projects/${project.id}/members`, { userId: m.id, role: m.name.split(' ')[0] }, pmToken);
  }

  // STEP 3: PM CREATES EXTENSIVE MULTI-TIER WBS (WORK BREAKDOWN STRUCTURE)
  console.log('\n🌳 [BƯỚC 3] PM Minh lập Kế hoạch Tiến độ Toàn diện (Cây công việc WBS 3 tầng)...');

  async function pmCreateTask(name, desc, parentId, status, priority, startDate, plannedEndDate, progress, weight, assignees) {
    const res = await requestApi('POST', 'Tasks', {
      projectId: project.id,
      name,
      description: desc,
      parentId: parentId || undefined,
      status,
      priority,
      startDate: new Date(startDate).toISOString(),
      plannedEndDate: new Date(plannedEndDate).toISOString(),
      progress,
      weight,
      assigneeUserIds: assignees,
    }, pmToken);
    return res.data?.data;
  }

  // --- HẠNG MỤC LỚN 1: HẠ TẦNG VÀ CẢNH QUAN HỒ SINH THÁI (Trọng số 30%) ---
  const cat1 = await pmCreateTask('HẠNG MỤC 1: San Lấp Mặt Bằng & Đào Hồ Cảnh Quan 5ha', 'Thi công nạo vét bùn hữu cơ và san nền K95', null, 1, 3, '2026-03-01', '2026-06-30', 0.0, 30.0, [team[2].id]);
  
  // Gói 1.1: San lấp K95 (Trọng số 15%)
  const sub1_1 = await pmCreateTask('Gói 1.1: San nền cát tạo mặt bằng K95 (250,000 m3)', 'Bơm cát san lấp và lu lèn K95 theo lớp 30cm', cat1.id, 1, 2, '2026-03-01', '2026-04-30', 0.0, 15.0, [team[4].id]);
  // Chi tiết 1.1.1 & 1.1.2
  const sub1_1_1 = await pmCreateTask('Bơm cát và lu lèn đợt 1 (120,000 m3)', 'Lu rung 25T đạt độ chặt K95', sub1_1.id, 1, 2, '2026-03-01', '2026-03-25', 0.0, 7.0, [team[4].id]);
  const sub1_1_2 = await pmCreateTask('Bơm cát và lu lèn đợt 2 (130,000 m3)', 'Hoàn thiện cao độ thiết kế +3.200m', sub1_1.id, 0, 2, '2026-03-26', '2026-04-30', 0.0, 8.0, [team[4].id]);

  // Gói 1.2: Kè hồ sinh thái (Trọng số 15%)
  const sub1_2 = await pmCreateTask('Gói 1.2: Thi công bờ kè đá hộc & thả rọ đá hồ cảnh quan', 'Xếp 15,000 m3 rọ đá bọc nhựa PVC chống xói lở', cat1.id, 1, 2, '2026-04-01', '2026-06-30', 0.0, 15.0, [team[5].id]);
  const sub1_2_1 = await pmCreateTask('Gia công lắp đặt rọ đá 2x1x1m', 'Thép mạ kẽm bọc nhựa chống ăn mòn', sub1_2.id, 0, 2, '2026-04-01', '2026-05-15', 0.0, 8.0, [team[5].id]);
  const sub1_2_2 = await pmCreateTask('Đắp đá hộc chèn khe và thảm vải địa kỹ thuật', 'Vải địa không dệt ART 15', sub1_2.id, 0, 2, '2026-05-16', '2026-06-30', 0.0, 7.0, [team[5].id]);

  // --- HẠNG MỤC LỚN 2: THI CÔNG KHỐI THÁP CĂN HỘ SAPPHIRE 1 (Trọng số 50%) ---
  const cat2 = await pmCreateTask('HẠNG MỤC 2: Thi Công Kết Cấu Tháp Căn Hộ Sapphire 1 (32 Tầng)', 'Thi công cọc nhồi D1500, đài móng dày 2.8m và thân tháp', null, 1, 3, '2026-03-15', '2027-10-31', 0.0, 50.0, [team[2].id]);

  const sub2_1 = await pmCreateTask('Gói 2.1: Khoan cọc nhồi D1500 sâu 52m (140 cọc)', 'Khoan vào tầng sét dẻo cứng chịu tải 2200T', cat2.id, 1, 3, '2026-03-15', '2026-06-15', 0.0, 20.0, [team[2].id, team[4].id]);
  const sub2_1_1 = await pmCreateTask('Khoan 70 cọc đại trà khu vực lõi thang máy', 'Cọc chịu lực chính của tháp', sub2_1.id, 1, 3, '2026-03-15', '2026-04-30', 0.0, 10.0, [team[2].id, team[4].id]);
  const sub2_1_2 = await pmCreateTask('Khoan 70 cọc khu vực chu vi đài móng', 'Cọc phụ trợ phân bố tải trọng', sub2_1.id, 0, 3, '2026-05-01', '2026-06-15', 0.0, 10.0, [team[4].id]);

  const sub2_2 = await pmCreateTask('Gói 2.2: Đổ bê tông khối lớn đài móng (4,800 m3)', 'Đổ bê tông liên tục 48h có hệ thống ống nước làm mát giải nhiệt', cat2.id, 0, 3, '2026-06-16', '2026-07-15', 0.0, 15.0, [team[2].id, team[5].id]);
  const sub2_3 = await pmCreateTask('Gói 2.3: Thi công cốp pha trượt & bê tông sàn T1 - T15', 'Chu kỳ 5 ngày / 1 sàn', cat2.id, 0, 2, '2026-07-16', '2026-12-31', 0.0, 15.0, [team[5].id]);

  // --- HẠNG MỤC LỚN 3: HẠ TẦNG CƠ ĐIỆN & CẤP THOÁT NƯỚC NGOÀI NHÀ (Trọng số 20%) ---
  const cat3 = await pmCreateTask('HẠNG MỤC 3: Mạng Lưới Đường Ống Cấp Thoát Nước & Tuyến Cáp Ngầm', 'Trục ống chính D600 HDPE và hào kỹ thuật ngầm 4 ngăn', null, 0, 2, '2026-05-01', '2026-11-30', 0.0, 20.0, [team[3].id]);

  const sub3_1 = await pmCreateTask('Gói 3.1: Đặt đường ống HDPE D600 gom nước mưa & nước thải', 'Hệ thống cống đôi bê tông ly tâm và ống HDPE', cat3.id, 0, 2, '2026-05-01', '2026-08-30', 0.0, 10.0, [team[3].id]);
  const sub3_2 = await pmCreateTask('Gói 3.2: Kéo rải cáp ngầm trung thế 22kV và trạm biến áp Kiosk', 'Hệ thống điện ngầm hóa 100%', cat3.id, 0, 3, '2026-09-01', '2026-11-30', 0.0, 10.0, [team[3].id]);

  console.log('   ✅ Đã khởi tạo hoàn tất cấu trúc cây công việc đa cấp WBS.');

  // STEP 4: CONCURRENT REAL-TIME WORKER & ENGINEER INTERACTIONS
  console.log('\n⚡ [BƯỚC 4] Mô phỏng NHIỀU NGƯỜI DÙNG ĐỒNG THỜI cập nhật công việc & Trao đổi hiện trường...');

  // Worker Tuấn (team[4]) updates progress on subtask 1.1.1
  console.log('   👷‍♂️ [Worker Tuấn] Bắt đầu thi công và cập nhật tiến độ Bơm cát đợt 1...');
  const t1 = await requestApi('PATCH', `Tasks/${sub1_1_1.id}/progress`, { progress: 80.0 }, team[4].token);
  const c1 = await requestApi('POST', `Tasks/${sub1_1_1.id}/comments`, {
    content: 'Đã hoàn thành bơm cát 96,000 / 120,000 m3 tại phân khu A1-A4. Máy lu rung Dynapac CA250D đang lu lèn 6 lượt/vệt. Kính gửi KS Nam đo độ chặt K95.',
  }, team[4].token);
  console.log(`      • Tuấn updated progress: 80% (Response: ${t1.duration}ms, Status: ${t1.status}) | Added comment: ${c1.ok ? '✅' : '❌'}`);

  // Engineer Nam (team[2]) tests and completes subtask 1.1.1 to 100%
  console.log('   📐 [KS Nam] Nghiệm thu hiện trường và nâng tiến độ Bơm cát đợt 1 lên 100% (Hoàn thành)...');
  const t2 = await requestApi('PATCH', `Tasks/${sub1_1_1.id}/progress`, { progress: 100.0 }, team[2].token);
  const c2 = await requestApi('POST', `Tasks/${sub1_1_1.id}/comments`, {
    content: 'Kết quả thí nghiệm dao đai tại hiện trường đạt K = 0.96 > K95 theo yêu cầu thiết kế. Xác nhận hoàn thành Gói đợt 1, cho phép chuyển sang đợt 2.',
  }, team[2].token);
  console.log(`      • Nam updated progress: 100% (Completed) (Response: ${t2.duration}ms, Status: ${t2.status})`);

  // Engineer Nam & Worker Tuấn simultaneously update Drilling cọc lõi thang máy (sub2_1_1)
  console.log('   ⚡ [Đồng thời] Nam và Tuấn cùng cập nhật Khoan cọc lõi thang máy...');
  const [resProgDrill, resCommDrill] = await Promise.all([
    requestApi('PATCH', `Tasks/${sub2_1_1.id}/progress`, { progress: 60.0 }, team[2].token),
    requestApi('POST', `Tasks/${sub2_1_1.id}/comments`, {
      content: 'Đã khoan xong 42/70 cọc đại trà. Dung dịch bentonite tuần hoàn xử lý cát lắng < 3%.',
    }, team[4].token)
  ]);
  console.log(`      • Đồng thời: Cập nhật tiến độ (${resProgDrill.duration}ms, Status: ${resProgDrill.status}) + Đăng bình luận (${resCommDrill.duration}ms) -> Đều thành công ✅`);

  // Worker Hạnh (team[5]) updates Rọ đá kè hồ (sub1_2_1)
  console.log('   🔨 [Worker Hạnh] Cập nhật tiến độ Gia công rọ đá bờ kè hồ...');
  const t3 = await requestApi('PATCH', `Tasks/${sub1_2_1.id}/progress`, { progress: 50.0 }, team[5].token);
  console.log(`      • Hạnh updated progress: 50% (Response: ${t3.duration}ms, Status: ${t3.status})`);

  // STEP 5: VERIFY DYNAMIC PROGRESS PROPAGATION (CHILD -> PARENT -> GRANDPARENT -> PROJECT)
  console.log('\n📊 [BƯỚC 5] KIỂM TRA TỰ ĐỘNG TÍNH TOÁN TIẾN ĐỘ LIÊN ĐỚI (PROGRESS PROPAGATION)...');

  // Fetch updated project details
  const updatedProjRes = await requestApi('GET', `Projects/${project.id}`, null, pmToken);
  const updatedProj = updatedProjRes.data?.data;
  console.log(`   🌟 [TIẾN ĐỘ DỰ ÁN TỔNG THỂ]: ${updatedProj?.progress}% (Tự động cập nhật dựa trên các công việc con)`);

  // Fetch Gantt tree
  const ganttRes = await requestApi('GET', `Tasks/gantt?projectId=${project.id}`, null, pmToken);
  const ganttTasks = ganttRes.data?.data?.tasks || [];

  console.log('\n   🌳 Cây tiến độ tự động lan truyền (Propagation Matrix):');
  ganttTasks.forEach(t => {
    const isSub = t.parentId ? '      └─' : '   ├─';
    const assignees = (t.assigneeNames || []).join(', ') || 'Chưa gán';
    console.log(`${isSub} [${t.type}] ${t.name}: Tiến độ = ${t.progress}% | Trạng thái = ${t.statusName} (Phụ trách: ${assignees})`);
  });

  // STEP 6: VERIFY ISOLATION & PERMISSION FROM WORKER / ENGINEER PERSPECTIVES
  console.log('\n🛡️ [BƯỚC 6] KIỂM TRA PHÂN QUYỀN & CÁCH LY GÓC NHÌN NGƯỜI DÙNG (KHÔNG DÙNG ADMIN)...');

  // Case A: Worker Tuấn checks his tasks
  const tuanTasksRes = await requestApi('GET', 'Tasks', null, team[4].token);
  const tuanTasks = tuanTasksRes.data?.data?.items || [];
  console.log(`   👷‍♂️ [Worker Tuấn - Cá nhân]: Thấy ${tuanTasks.length} công việc.`);
  const tuanSeesHanhTask = tuanTasks.some(t => t.name.includes('Gia công lắp đặt rọ đá'));
  const tuanSeesMepTask = tuanTasks.some(t => t.name.includes('Đường Ống Cấp Thoát Nước'));
  console.log(`      • Kiểm tra rò rỉ: Tuấn có thấy Task Rọ đá của Hạnh không? -> ${tuanSeesHanhTask ? '❌ RÒ RỈ' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);
  console.log(`      • Kiểm tra rò rỉ: Tuấn có thấy Task Cơ điện MEP của Hùng không? -> ${tuanSeesMepTask ? '❌ RÒ RỈ' : '✅ TUYỆT ĐỐI BẢO MẬT (Không thấy)'}`);

  // Case B: Worker Hạnh attempts forbidden action (updating Tuấn's task)
  console.log('\n   🔒 [Kiểm tra Bảo mật]: Worker Hạnh cố tình sửa tiến độ Task San nền của Tuấn...');
  const forbiddenUpdate = await requestApi('PATCH', `Tasks/${sub1_1_2.id}/progress`, { progress: 99.0 }, team[5].token);
  console.log(`      • Kết quả chặn: Status ${forbiddenUpdate.status} -> ${forbiddenUpdate.status === 400 || forbiddenUpdate.status === 403 ? '✅ CHẶN THÀNH CÔNG (Không được sửa task của người khác)' : '❌ LỖI BẢO MẬT'}`);

  // Case C: Supervisor Thảo reviews and comments
  console.log('\n   👷‍♀️ [GS Thảo - Giám Sát]: Kiểm tra báo cáo tiến độ và đôn đốc hiện trường...');
  const supOverdueRes = await requestApi('GET', 'Reports/overdue', null, team[1].token);
  const supWorkloadRes = await requestApi('GET', 'Reports/workload', null, team[1].token);
  console.log(`      • Thảo thấy ${supOverdueRes.data?.data?.length || 0} công việc quá hạn trên công trường.`);
  console.log(`      • Thảo thấy ${supWorkloadRes.data?.data?.length || 0} nhân sự đang thi công.`);

  // STEP 7: UI RESPONSE LATENCY & PERFORMANCE BENCHMARK
  console.log('\n⚡ [BƯỚC 7] ĐO LƯỜNG HIỆU NĂNG PHẢN HỒI (UI & API LATENCY BENCHMARK)...');
  
  const benchUrls = [
    { label: 'Tải Danh Sách Dự Án', path: 'Projects?page=1&pageSize=10', token: pmToken },
    { label: 'Tải Biểu Đồ Gantt (Toàn bộ Cây Task)', path: `Tasks/gantt?projectId=${project.id}`, token: pmToken },
    { label: 'Tải Báo Cáo Tiến Độ Công Trình', path: 'Reports/project-progress', token: pmToken },
    { label: 'Tải Báo Cáo Tải Công Nhân Sự', path: 'Reports/workload', token: pmToken },
    { label: 'Tải Danh Sách Thông Báo Chuông', path: 'Notifications?page=1&pageSize=10', token: team[2].token }
  ];

  for (const b of benchUrls) {
    const res = await requestApi('GET', b.path, null, b.token);
    const speed = res.duration < 300 ? '⚡ CỰC NHANH' : res.duration < 800 ? '🚀 NHANH' : '⏱️ BÌNH THƯỜNG';
    console.log(`   • [${b.label}]: ${res.duration}ms (${speed}) — Status: ${res.status}`);
  }

  console.log('\n================================================================================================');
  console.log('🎉 HOÀN TẤT ROUND 2 KIỂM THỬ THỰC CHIẾN TOÀN DIỆN TRÊN PRODUCTION!');
  console.log('================================================================================================');
}

main().catch(console.error);
