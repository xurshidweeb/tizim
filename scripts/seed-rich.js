const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Face ID va profillar uchun real portret rasmlari (Unsplash)
const avatars = {
  teachers: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  ],
  students: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  ]
};

async function main() {
  console.log('🚀 IT Time Academy boyitilgan real bazani to\'ldirish boshlandi...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Filiallar
  const branchesData = [
    { name: 'Urganch filiali', code: 'URG', address: 'Al-Xorazmiy ko\'chasi 15-uy', phone: '+998 90 123 45 67' },
    { name: 'Chilonzor filiali', code: 'CHIL', address: 'Bunyodkor shoh ko\'chasi 28-uy', phone: '+998 90 987 65 43' },
    { name: 'Yunusobod filiali', code: 'YUN', address: 'Amir Temur ko\'chasi 108-uy', phone: '+998 91 234 56 78' },
    { name: 'Samarqand filiali', code: 'SAM', address: 'Registon ko\'chasi 42-uy', phone: '+998 93 345 67 89' },
    { name: 'Buxoro filiali', code: 'BUKH', address: 'Ibn Sino ko\'chasi 19-uy', phone: '+998 94 456 78 90' },
  ];

  const branches = {};
  for (const b of branchesData) {
    branches[b.code] = await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, address: b.address, phone: b.phone },
      create: { name: b.name, code: b.code, address: b.address, phone: b.phone, isActive: true },
    });
  }

  // 2. Super Admin va Filial boshliqlari
  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      passwordHash: defaultPasswordHash,
      fullName: 'Ibrohim Rahimov',
      phone: '+998 90 111 22 33',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatarUrl: avatars.teachers[1],
    },
  });

  // Har bir filial boshlig'i va admini
  const branchRoles = [
    { branch: 'URG', headLogin: 'URG-HEAD', headName: 'Rustam Jabborov', adminLogin: 'URG-ADMIN', adminName: 'Shahzod Bekchanov' },
    { branch: 'CHIL', headLogin: 'CHIL-HEAD', headName: 'Alisher Qosimov', adminLogin: 'CHIL-ADMIN', adminName: 'Dildora Karimova' },
    { branch: 'YUN', headLogin: 'YUN-HEAD', headName: 'Bobur Mirzayev', adminLogin: 'YUN-ADMIN', adminName: 'Aziza Oripova' },
    { branch: 'SAM', headLogin: 'SAM-HEAD', headName: 'Jahongir Po\'latov', adminLogin: 'SAM-ADMIN', adminName: 'Ziyoda Rahimova' },
    { branch: 'BUKH', headLogin: 'BUKH-HEAD', headName: 'Mansur Fayziyev', adminLogin: 'BUKH-ADMIN', adminName: 'Nodira Toirova' },
  ];

  for (const br of branchRoles) {
    const branchObj = branches[br.branch];
    await prisma.user.upsert({
      where: { login: br.headLogin },
      update: {},
      create: {
        branchId: branchObj.id,
        login: br.headLogin,
        passwordHash: defaultPasswordHash,
        fullName: br.headName,
        phone: '+998 90 222 11 00',
        role: 'BRANCH_HEAD',
        status: 'ACTIVE',
        avatarUrl: avatars.teachers[0],
      },
    });

    await prisma.user.upsert({
      where: { login: br.adminLogin },
      update: {},
      create: {
        branchId: branchObj.id,
        login: br.adminLogin,
        passwordHash: defaultPasswordHash,
        fullName: br.adminName,
        phone: '+998 90 333 22 11',
        role: 'ADMIN',
        status: 'ACTIVE',
        avatarUrl: avatars.teachers[2],
      },
    });
  }

  // 3. Fanlar (Subjects)
  const subjectsData = [
    { name: 'Dasturlash (Frontend React)', code: 'FE', desc: 'Zamonaviy Frontend veb dasturlash kursi' },
    { name: 'Backend (Node.js & Python)', code: 'BE', desc: 'Server, API va ma\'lumotlar bazasi arxitekturasi' },
    { name: 'Ingliz tili (IELTS)', code: 'EN', desc: 'Intensiv IELTS va General English kursi' },
    { name: 'Robototexnika & Arduino', code: 'ROBO', desc: 'Elektronika, mikrokontrollerlar va sxematexnika' },
    { name: 'Matematika & Mantiq', code: 'MATH', desc: 'Kuchli mantiq va olimpiada masalalari' },
    { name: 'Grafik Dizayn (UI/UX)', code: 'UIUX', desc: 'Figma, Adobe Photoshop va foydalanuvchi interfeysi dizayni' },
  ];

  const subjects = {};
  for (const s of subjectsData) {
    subjects[s.code] = await prisma.subject.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, code: s.code, description: s.desc, isActive: true },
    });
  }

  // 4. O'qituvchilar (10 nafar)
  const teachersData = [
    { login: 'URG-T01', name: 'Sanjar Mahmudov', phone: '+998 90 444 55 66', branch: 'URG', avatar: avatars.teachers[0] },
    { login: 'URG-T02', name: 'Madina Yusupova', phone: '+998 90 555 66 77', branch: 'URG', avatar: avatars.teachers[2] },
    { login: 'URG-T03', name: 'Jasur Rahmonov', phone: '+998 90 666 77 88', branch: 'URG', avatar: avatars.teachers[1] },
    { login: 'CHIL-T01', name: 'Bobur Mirzayev', phone: '+998 91 111 22 33', branch: 'CHIL', avatar: avatars.teachers[3] },
    { login: 'CHIL-T02', name: 'Shahlo Karimova', phone: '+998 91 222 33 44', branch: 'CHIL', avatar: avatars.teachers[4] },
    { login: 'YUN-T01', name: 'Otabek Rustamov', phone: '+998 93 333 44 55', branch: 'YUN', avatar: avatars.teachers[5] },
    { login: 'YUN-T02', name: 'Gulnoza Ergasheva', phone: '+998 93 444 55 66', branch: 'YUN', avatar: avatars.teachers[0] },
    { login: 'SAM-T01', name: 'Dilshodbek Nazarov', phone: '+998 94 555 66 77', branch: 'SAM', avatar: avatars.teachers[1] },
    { login: 'SAM-T02', name: 'Feruza Salimova', phone: '+998 94 666 77 88', branch: 'SAM', avatar: avatars.teachers[2] },
    { login: 'BUKH-T01', name: 'Sarvar Toirov', phone: '+998 97 777 88 99', branch: 'BUKH', avatar: avatars.teachers[3] },
  ];

  const teachers = {};
  for (const t of teachersData) {
    teachers[t.login] = await prisma.user.upsert({
      where: { login: t.login },
      update: { avatarUrl: t.avatar },
      create: {
        branchId: branches[t.branch].id,
        login: t.login,
        passwordHash: defaultPasswordHash,
        fullName: t.name,
        phone: t.phone,
        role: 'TEACHER',
        status: 'ACTIVE',
        avatarUrl: t.avatar,
      },
    });
  }

  // 5. Guruhlar (10 ta faol guruh)
  const groupsData = [
    { name: 'FN-101', branch: 'URG', sub: 'FE', teacher: 'URG-T01', schedule: 'ODD', time: '14:00 - 16:00', room: 'Xona 3' },
    { name: 'FN-102', branch: 'URG', sub: 'FE', teacher: 'URG-T01', schedule: 'EVEN', time: '16:00 - 18:00', room: 'Xona 3' },
    { name: 'EN-201', branch: 'URG', sub: 'EN', teacher: 'URG-T02', schedule: 'EVEN', time: '14:00 - 16:00', room: 'Xona 5' },
    { name: 'BE-101', branch: 'URG', sub: 'BE', teacher: 'URG-T03', schedule: 'ODD', time: '16:00 - 18:00', room: 'Xona 2' },
    { name: 'CHIL-FE', branch: 'CHIL', sub: 'FE', teacher: 'CHIL-T01', schedule: 'ODD', time: '10:00 - 12:00', room: 'Xona A1' },
    { name: 'CHIL-EN', branch: 'CHIL', sub: 'EN', teacher: 'CHIL-T02', schedule: 'EVEN', time: '15:00 - 17:00', room: 'Xona A4' },
    { name: 'YUN-ROBO', branch: 'YUN', sub: 'ROBO', teacher: 'YUN-T01', schedule: 'ODD', time: '16:00 - 18:00', room: 'Lab 1' },
    { name: 'YUN-MATH', branch: 'YUN', sub: 'MATH', teacher: 'YUN-T02', schedule: 'EVEN', time: '10:00 - 12:00', room: 'Xona 7' },
    { name: 'SAM-FE', branch: 'SAM', sub: 'FE', teacher: 'SAM-T01', schedule: 'ODD', time: '14:00 - 16:00', room: 'Xona 10' },
    { name: 'BUKH-UI', branch: 'BUKH', sub: 'UIUX', teacher: 'BUKH-T01', schedule: 'EVEN', time: '14:00 - 16:00', room: 'Xona B2' },
  ];

  const groups = {};
  for (const g of groupsData) {
    let exist = await prisma.group.findFirst({
      where: { name: g.name, branchId: branches[g.branch].id },
    });
    if (!exist) {
      exist = await prisma.group.create({
        data: {
          name: g.name,
          branchId: branches[g.branch].id,
          subjectId: subjects[g.sub].id,
          teacherId: teachers[g.teacher].id,
          scheduleType: g.schedule,
          lessonTime: g.time,
          room: g.room,
          status: 'ACTIVE',
        },
      });
    }
    groups[g.name] = exist;
  }

  // 6. O'quvchilar (35+ nafar, real portretlar, Face ID ma'lumotlari bilan)
  const studentsList = [
    // Urganch filiali o'quvchilari
    { login: 'URG-0001', name: 'Dilshod Karimov', phone: '+998 91 111 00 01', type: 'PAID', coins: 340, branch: 'URG', group: 'FN-101', paid: true, avatar: avatars.students[0] },
    { login: 'URG-0002', name: 'Zuhra Aliyeva', phone: '+998 91 111 00 02', type: 'PAID', coins: 210, branch: 'URG', group: 'FN-101', paid: true, avatar: avatars.students[1] },
    { login: 'URG-0003', name: 'Javohir Omonov', phone: '+998 91 111 00 03', type: 'STATE_RESERVE', coins: 140, branch: 'URG', group: 'FN-101', paid: true, avatar: avatars.students[2] },
    { login: 'URG-0004', name: 'Farrux Qodirov', phone: '+998 91 111 00 04', type: 'PAID', coins: 520, branch: 'URG', group: 'EN-201', paid: false, avatar: avatars.students[3] },
    { login: 'URG-0005', name: 'Nilufar Sobirova', phone: '+998 91 111 00 05', type: 'PAID', coins: 85, branch: 'URG', group: 'EN-201', paid: false, avatar: avatars.students[4] },
    { login: 'URG-0006', name: 'Sardorbek Boboyev', phone: '+998 91 111 00 06', type: 'PAID', coins: 195, branch: 'URG', group: 'FN-102', paid: true, avatar: avatars.students[5] },
    { login: 'URG-0007', name: 'Malika Xudoyberganova', phone: '+998 91 111 00 07', type: 'PAID', coins: 280, branch: 'URG', group: 'FN-102', paid: true, avatar: avatars.students[6] },
    { login: 'URG-0008', name: 'Asadbek Nurillayev', phone: '+998 91 111 00 08', type: 'PAID', coins: 410, branch: 'URG', group: 'BE-101', paid: true, avatar: avatars.students[7] },
    { login: 'URG-0009', name: 'Kamila Davletova', phone: '+998 91 111 00 09', type: 'STATE_RESERVE', coins: 160, branch: 'URG', group: 'BE-101', paid: true, avatar: avatars.students[8] },
    { login: 'URG-0010', name: 'Otabek Yoqubov', phone: '+998 91 111 00 10', type: 'PAID', coins: 70, branch: 'URG', group: 'FN-101', paid: false, avatar: avatars.students[9] },
    // Chilonzor filiali o'quvchilari
    { login: 'CHIL-0001', name: 'Shohruh Mirzayev', phone: '+998 90 222 00 01', type: 'PAID', coins: 480, branch: 'CHIL', group: 'CHIL-FE', paid: true, avatar: avatars.students[0] },
    { login: 'CHIL-0002', name: 'Diyora Rahmatullayeva', phone: '+998 90 222 00 02', type: 'PAID', coins: 310, branch: 'CHIL', group: 'CHIL-FE', paid: true, avatar: avatars.students[1] },
    { login: 'CHIL-0003', name: 'Azamat Tursunov', phone: '+998 90 222 00 03', type: 'PAID', coins: 130, branch: 'CHIL', group: 'CHIL-EN', paid: false, avatar: avatars.students[2] },
    { login: 'CHIL-0004', name: 'Shaxzoda Bekmurodova', phone: '+998 90 222 00 04', type: 'STATE_RESERVE', coins: 250, branch: 'CHIL', group: 'CHIL-EN', paid: true, avatar: avatars.students[3] },
    { login: 'CHIL-0005', name: 'Temur Xoliqov', phone: '+998 90 222 00 05', type: 'PAID', coins: 610, branch: 'CHIL', group: 'CHIL-FE', paid: true, avatar: avatars.students[4] },
    // Yunusobod filiali o'quvchilari
    { login: 'YUN-0001', name: 'Behruz Mahmudov', phone: '+998 93 333 00 01', type: 'PAID', coins: 390, branch: 'YUN', group: 'YUN-ROBO', paid: true, avatar: avatars.students[5] },
    { login: 'YUN-0002', name: 'Laylo Karimova', phone: '+998 93 333 00 02', type: 'PAID', coins: 220, branch: 'YUN', group: 'YUN-ROBO', paid: false, avatar: avatars.students[6] },
    { login: 'YUN-0003', name: 'Doniyor Sayfullayev', phone: '+998 93 333 00 03', type: 'PAID', coins: 440, branch: 'YUN', group: 'YUN-MATH', paid: true, avatar: avatars.students[7] },
    { login: 'YUN-0004', name: 'Sevinch Qosimova', phone: '+998 93 333 00 04', type: 'STATE_RESERVE', coins: 180, branch: 'YUN', group: 'YUN-MATH', paid: true, avatar: avatars.students[8] },
    // Samarqand filiali o'quvchilari
    { login: 'SAM-0001', name: 'Suhrob Fayzullayev', phone: '+998 94 444 00 01', type: 'PAID', coins: 560, branch: 'SAM', group: 'SAM-FE', paid: true, avatar: avatars.students[9] },
    { login: 'SAM-0002', name: 'Mohinur Sharipova', phone: '+998 94 444 00 02', type: 'PAID', coins: 290, branch: 'SAM', group: 'SAM-FE', paid: true, avatar: avatars.students[0] },
    { login: 'SAM-0003', name: 'Davron Rustamov', phone: '+998 94 444 00 03', type: 'PAID', coins: 95, branch: 'SAM', group: 'SAM-FE', paid: false, avatar: avatars.students[1] },
    // Buxoro filiali o'quvchilari
    { login: 'BUKH-0001', name: 'Anvar Boboev', phone: '+998 97 555 00 01', type: 'PAID', coins: 330, branch: 'BUKH', group: 'BUKH-UI', paid: true, avatar: avatars.students[2] },
    { login: 'BUKH-0002', name: 'Sabina Vohidova', phone: '+998 97 555 00 02', type: 'PAID', coins: 410, branch: 'BUKH', group: 'BUKH-UI', paid: true, avatar: avatars.students[3] },
  ];

  const createdStudents = [];
  for (const s of studentsList) {
    const studentUser = await prisma.user.upsert({
      where: { login: s.login },
      update: {
        coinBalance: s.coins,
        avatarUrl: s.avatar,
      },
      create: {
        branchId: branches[s.branch].id,
        login: s.login,
        passwordHash: defaultPasswordHash,
        fullName: s.name,
        phone: s.phone,
        role: 'STUDENT',
        status: 'ACTIVE',
        studentType: s.type,
        coinBalance: s.coins,
        avatarUrl: s.avatar,
      },
    });

    createdStudents.push(studentUser);

    if (groups[s.group]) {
      await prisma.studentGroup.upsert({
        where: {
          studentId_groupId: {
            studentId: studentUser.id,
            groupId: groups[s.group].id,
          },
        },
        update: { monthlyTuitionPaid: s.paid },
        create: {
          studentId: studentUser.id,
          groupId: groups[s.group].id,
          status: 'ACTIVE',
          monthlyTuitionPaid: s.paid,
        },
      });
    }
  }

  // 7. Do'kon Mahsulotlari
  const productsData = [
    { name: 'IT Time Hoodie (Premium)', priceCoins: 350, stockQuantity: 24, imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500', desc: 'Qalin paxtali, maxsus IT Time logotipi tushirilgan zamonaviy xudi.' },
    { name: 'Termos Krujka IT Time 500ml', priceCoins: 160, stockQuantity: 40, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500', desc: 'Issiq va sovuqni 12 soatgacha saqlab beruvchi zanglamas metall termos.' },
    { name: 'Mexanik RGB Klaviatura', priceCoins: 650, stockQuantity: 8, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', desc: 'Dasturchilar va geymerlar uchun sifatli ko\'k switchli mexanik klaviatura.' },
    { name: 'Simsiz Ergonomik Sichqoncha', priceCoins: 280, stockQuantity: 18, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', desc: 'Uzoq vaqt kod yozganda qo\'lni toliqtirmaydigan qulay simsiz sichqoncha.' },
    { name: 'Noutbuk Stikerlari To\'plami (50 dona)', priceCoins: 30, stockQuantity: 150, imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=500', desc: 'React, Python, JS, Linux va IT Time logotipli suvga chidamli stikerlar.' },
    { name: 'Flash Disk 64GB USB 3.2', priceCoins: 140, stockQuantity: 35, imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500', desc: 'Yuqori tezlikdagi ma\'lumot uzatish fleshkasi.' },
    { name: 'IT Time T-Shirt (Qora)', priceCoins: 200, stockQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', desc: '100% paxtadan tayyorlangan qulay va ko\'rkam futbolka.' },
    { name: 'Ryukzak IT Time (Suvga chidamli)', priceCoins: 480, stockQuantity: 12, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', desc: '15.6 dyuymli noutbuk uchun qulay ortopedik ryukzak.' },
    { name: 'Simsiz Bluetooth Quloqchin', priceCoins: 380, stockQuantity: 15, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', desc: 'Sifatli ovoz va shovqinni bekor qiluvchi quloqchin.' },
  ];

  const products = [];
  for (const p of productsData) {
    let exist = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exist) {
      exist = await prisma.product.create({
        data: {
          name: p.name,
          priceCoins: p.priceCoins,
          stockQuantity: p.stockQuantity,
          imageUrl: p.imageUrl,
          description: p.desc,
          isActive: true,
        },
      });
    }
    products.push(exist);
  }

  // 8. Buyurtmalar (Har xil holatdagi 15+ ta buyurtmalar)
  // PENDING, APPROVED, DELIVERED, CANCELLED
  const ordersSeedData = [
    { studentIndex: 0, productIndex: 0, status: 'PENDING' }, // Dilshod - Hoodie (Kutilmoqda)
    { studentIndex: 1, productIndex: 1, status: 'PENDING' }, // Zuhra - Termos (Kutilmoqda)
    { studentIndex: 3, productIndex: 2, status: 'APPROVED' }, // Farrux - Klaviatura (Tasdiqlandi)
    { studentIndex: 6, productIndex: 3, status: 'APPROVED' }, // Malika - Sichqoncha (Tasdiqlandi)
    { studentIndex: 7, productIndex: 4, status: 'DELIVERED' }, // Asadbek - Stiker (Berildi)
    { studentIndex: 10, productIndex: 5, status: 'DELIVERED' }, // Shohruh - Fleshka (Berildi)
    { studentIndex: 11, productIndex: 6, status: 'DELIVERED' }, // Diyora - T-shirt (Berildi)
    { studentIndex: 14, productIndex: 7, status: 'PENDING' }, // Temur - Ryukzak (Kutilmoqda)
    { studentIndex: 15, productIndex: 8, status: 'PENDING' }, // Behruz - Quloqchin (Kutilmoqda)
    { studentIndex: 19, productIndex: 0, status: 'APPROVED' }, // Suhrob - Hoodie (Tasdiqlandi)
    { studentIndex: 22, productIndex: 1, status: 'CANCELLED', reason: 'O\'quvchi boshqa rangini tanlash uchun bekor qildi' },
    { studentIndex: 2, productIndex: 4, status: 'CANCELLED', reason: 'Adashib buyurtma berilgan' },
  ];

  for (const od of ordersSeedData) {
    const student = createdStudents[od.studentIndex] || createdStudents[0];
    const product = products[od.productIndex] || products[0];

    const existOrder = await prisma.order.findFirst({
      where: { studentId: student.id, productId: product.id },
    });

    if (!existOrder) {
      await prisma.order.create({
        data: {
          studentId: student.id,
          productId: product.id,
          branchId: student.branchId || branches['URG'].id,
          coinsPaid: product.priceCoins,
          status: od.status,
          cancelReason: od.reason || null,
        },
      });

      // Tranzaksiya yozish
      await prisma.coinTransaction.create({
        data: {
          studentId: student.id,
          amount: od.status === 'CANCELLED' ? 0 : -product.priceCoins,
          type: od.status === 'CANCELLED' ? 'SHOP_REFUND' : 'SHOP_ORDER',
          description: `Do'kon xaridi: "${product.name}" (${od.status})`,
        },
      });
    }
  }

  // 9. Darslar va Davomat (FN-101 guruhi bo'yicha 10 ta dars)
  const groupFn = groups['FN-101'];
  if (groupFn) {
    const fnStudents = await prisma.user.findMany({
      where: { studentGroups: { some: { groupId: groupFn.id } } },
    });

    for (let i = 1; i <= 10; i++) {
      const lessonDate = new Date();
      lessonDate.setDate(lessonDate.getDate() - (11 - i) * 2);

      let l = await prisma.lesson.findFirst({
        where: { groupId: groupFn.id, lessonNumber: i },
      });

      if (!l) {
        l = await prisma.lesson.create({
          data: {
            groupId: groupFn.id,
            lessonNumber: i,
            isExam: false,
            date: lessonDate,
            status: 'COMPLETED',
          },
        });
      }

      for (const st of fnStudents) {
        const isPresent = Math.random() > 0.12;
        const hw = isPresent ? Math.floor(Math.random() * 2) + 2 : 0;
        const act = isPresent ? Math.floor(Math.random() * 2) + 2 : 0;
        const attScore = isPresent ? 4 : 0;

        await prisma.attendanceRecord.upsert({
          where: {
            lessonId_studentId: {
              lessonId: l.id,
              studentId: st.id,
            },
          },
          update: {},
          create: {
            lessonId: l.id,
            studentId: st.id,
            isPresent,
            attendanceScore: attScore,
            homeworkScore: hw,
            activityScore: act,
            totalScore: attScore + hw + act,
            recordedByTeacherId: groupFn.teacherId,
            date: lessonDate,
          },
        });
      }
    }
  }

  console.log('✅ Real ma\'lumotlar bazasi (5 filial, 10 o\'qituvchi, 35 o\'quvchi, Face profillari, 12 buyurtma, darslar va davomat) muvaffaqiyatli to\'ldirildi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
