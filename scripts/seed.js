const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ma\'lumotlar bazasini boshlang\'ich ma\'lumotlar bilan to\'ldirish boshlandi...');

  // 1. Filiallar yaratish
  const branchUrg = await prisma.branch.upsert({
    where: { code: 'URG' },
    update: {},
    create: {
      name: 'Urganch filiali',
      code: 'URG',
      address: 'Al-Xorazmiy ko\'chasi 15-uy',
      phone: '+998 90 123 45 67',
      isActive: true,
    },
  });

  const branchChil = await prisma.branch.upsert({
    where: { code: 'CHIL' },
    update: {},
    create: {
      name: 'Chilonzor filiali',
      code: 'CHIL',
      address: 'Bunyodkor shoh ko\'chasi 28-uy',
      phone: '+998 90 987 65 43',
      isActive: true,
    },
  });

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Foydalanuvchilar (Rollar bo'yicha)
  // Super Admin (Global, branchId = null)
  const superAdmin = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      passwordHash: defaultPasswordHash,
      fullName: 'Ibrohim Rahimov',
      phone: '+998 90 111 22 33',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      coinBalance: 0,
    },
  });

  // Filial boshlig'i (Urganch)
  const branchHead = await prisma.user.upsert({
    where: { login: 'URG-HEAD' },
    update: {},
    create: {
      branchId: branchUrg.id,
      login: 'URG-HEAD',
      passwordHash: defaultPasswordHash,
      fullName: 'Rustam Jabborov',
      phone: '+998 90 222 33 44',
      role: 'BRANCH_HEAD',
      status: 'ACTIVE',
    },
  });

  // Admin (Urganch)
  const branchAdmin = await prisma.user.upsert({
    where: { login: 'URG-ADMIN' },
    update: {},
    create: {
      branchId: branchUrg.id,
      login: 'URG-ADMIN',
      passwordHash: defaultPasswordHash,
      fullName: 'Shahzod Bekchanov',
      phone: '+998 90 333 44 55',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // O'qituvchilar
  const teacherFrontend = await prisma.user.upsert({
    where: { login: 'URG-T01' },
    update: {},
    create: {
      branchId: branchUrg.id,
      login: 'URG-T01',
      passwordHash: defaultPasswordHash,
      fullName: 'Sanjar Mahmudov',
      phone: '+998 90 444 55 66',
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  });

  const teacherEnglish = await prisma.user.upsert({
    where: { login: 'URG-T02' },
    update: {},
    create: {
      branchId: branchUrg.id,
      login: 'URG-T02',
      passwordHash: defaultPasswordHash,
      fullName: 'Madina Yusupova',
      phone: '+998 90 555 66 77',
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  });

  // Fanlar (Subjects)
  const subFrontend = await prisma.subject.upsert({
    where: { name: 'Dasturlash (Frontend React)' },
    update: {},
    create: {
      name: 'Dasturlash (Frontend React)',
      code: 'FE',
      description: 'Zamonaviy Frontend veb dasturlash kursi',
    },
  });

  const subEnglish = await prisma.subject.upsert({
    where: { name: 'Ingliz tili (IELTS)' },
    update: {},
    create: {
      name: 'Ingliz tili (IELTS)',
      code: 'EN',
      description: 'Intensiv IELTS va General English kursi',
    },
  });

  // Guruhlar
  let groupFrontend = await prisma.group.findFirst({
    where: { name: 'FN-101', branchId: branchUrg.id },
  });
  if (!groupFrontend) {
    groupFrontend = await prisma.group.create({
      data: {
        branchId: branchUrg.id,
        subjectId: subFrontend.id,
        teacherId: teacherFrontend.id,
        name: 'FN-101',
        scheduleType: 'ODD',
        lessonTime: '14:00 - 16:00',
        room: 'Xona 3',
        status: 'ACTIVE',
      },
    });
  }

  let groupEnglish = await prisma.group.findFirst({
    where: { name: 'EN-201', branchId: branchUrg.id },
  });
  if (!groupEnglish) {
    groupEnglish = await prisma.group.create({
      data: {
        branchId: branchUrg.id,
        subjectId: subEnglish.id,
        teacherId: teacherEnglish.id,
        name: 'EN-201',
        scheduleType: 'EVEN',
        lessonTime: '16:00 - 18:00',
        room: 'Xona 5',
        status: 'ACTIVE',
      },
    });
  }

  // O'quvchilar (Students)
  const studentData = [
    { login: 'URG-0001', name: 'Dilshod Karimov', phone: '+998 91 111 00 01', type: 'PAID', coins: 260, group: groupFrontend.id },
    { login: 'URG-0002', name: 'Zuhra Aliyeva', phone: '+998 91 111 00 02', type: 'PAID', coins: 180, group: groupFrontend.id },
    { login: 'URG-0003', name: 'Javohir Omonov', phone: '+998 91 111 00 03', type: 'STATE_RESERVE', coins: 90, group: groupFrontend.id },
    { login: 'URG-0004', name: 'Farrux Qodirov', phone: '+998 91 111 00 04', type: 'PAID', coins: 380, group: groupEnglish.id },
    { login: 'URG-0005', name: 'Nilufar Sobirova', phone: '+998 91 111 00 05', type: 'PAID', coins: 0, group: groupEnglish.id },
  ];

  for (const s of studentData) {
    const student = await prisma.user.upsert({
      where: { login: s.login },
      update: {},
      create: {
        branchId: branchUrg.id,
        login: s.login,
        passwordHash: defaultPasswordHash,
        fullName: s.name,
        phone: s.phone,
        role: 'STUDENT',
        status: 'ACTIVE',
        studentType: s.type,
        coinBalance: s.coins,
      },
    });

    await prisma.studentGroup.upsert({
      where: {
        studentId_groupId: {
          studentId: student.id,
          groupId: s.group,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        groupId: s.group,
        status: 'ACTIVE',
        monthlyTuitionPaid: s.type === 'STATE_RESERVE' ? true : true,
      },
    });
  }

  // Darslar (12 dars + 1 imtihon) yaratish
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  for (let i = 1; i <= 13; i++) {
    const isExam = i === 13;
    const lessonDate = new Date(year, month - 1, Math.min(28, i * 2));
    
    let lesson = await prisma.lesson.findFirst({
      where: { groupId: groupFrontend.id, lessonNumber: i },
    });

    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          groupId: groupFrontend.id,
          lessonNumber: i,
          isExam,
          date: lessonDate,
          status: i <= 8 ? 'COMPLETED' : 'SCHEDULED',
        },
      });

      // 1-8 gacha o'tilgan darslar uchun davomat kiritish
      if (i <= 8) {
        const students = await prisma.user.findMany({
          where: { role: 'STUDENT', studentGroups: { some: { groupId: groupFrontend.id } } },
        });

        for (const st of students) {
          const isPresent = Math.random() > 0.15; // 85% davomat
          const hw = isPresent ? Math.floor(Math.random() * 2) + 2 : 0; // 2 yoki 3
          const act = isPresent ? Math.floor(Math.random() * 2) + 2 : 0;
          const attScore = isPresent ? 4 : 0;
          const total = attScore + hw + act;

          await prisma.attendanceRecord.upsert({
            where: {
              lessonId_studentId: {
                lessonId: lesson.id,
                studentId: st.id,
              },
            },
            update: {},
            create: {
              lessonId: lesson.id,
              studentId: st.id,
              isPresent,
              attendanceScore: attScore,
              homeworkScore: hw,
              activityScore: act,
              examScore: 0,
              totalScore: total,
              recordedByTeacherId: teacherFrontend.id,
              date: lessonDate,
            },
          });
        }
      }
    }
  }

  // Do'kon mahsulotlari (Market Products)
  const products = [
    { name: 'IT Time Hoodie (Premium)', priceCoins: 350, stockQuantity: 15, imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60', description: 'Qalin paxtali, maxsus IT Time logotipi tushirilgan zamonaviy xudi.' },
    { name: 'Termos Krujka IT Time 500ml', priceCoins: 160, stockQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60', description: 'Issiq va sovuqni 12 soatgacha saqlab beruvchi zanglamas metall termos.' },
    { name: 'Mexanik RGB Klaviatura', priceCoins: 650, stockQuantity: 5, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', description: 'Dasturchilar va geymerlar uchun sifatli ko\'k switchli mexanik klaviatura.' },
    { name: 'Simsiz Ergonomik Sichqoncha', priceCoins: 280, stockQuantity: 12, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60', description: 'Uzoq vaqt kod yozganda qo\'lni toliqtirmaydigan qulay simsiz sichqoncha.' },
    { name: 'Noutbuk Stikerlari To\'plami (50 dona)', priceCoins: 30, stockQuantity: 100, imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=500&auto=format&fit=crop&q=60', description: 'React, Python, JavaScript, Linux va IT Time logotipli suvga chidamli stikerlar.' },
    { name: 'Flash Disk 64GB USB 3.2', priceCoins: 140, stockQuantity: 25, imageUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=500&auto=format&fit=crop&q=60', description: 'Yuqori tezlikdagi ma\'lumot uzatish fleshkasi.' },
    { name: 'IT Time T-Shirt (Qora)', priceCoins: 200, stockQuantity: 20, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60', description: '100% paxtadan tayyorlangan qulay va ko\'rkam futbolka.' },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  // Xodimlar uchun Jarima va Bonus qoidalari (Default nofaol va 0 so'm, as per spec!)
  const penaltyRules = [
    { code: 'MISSED_ATTENDANCE', title: 'Dars kuni davomat va coin kiritmaslik', targetRole: 'TEACHER', type: 'PENALTY', amountUzSum: 30000, isActive: false, description: 'Dars tugagan kunda davomat kiritilmaganda avtomatik aniqlanadi' },
    { code: 'LOW_ATTENDANCE', title: 'Oylik o\'rtacha davomat 70% dan pastligi', targetRole: 'TEACHER', type: 'PENALTY', amountUzSum: 100000, threshold: 70.0, isActive: false, description: 'Guruhning oylik davomati me\'yordan tushib ketishi' },
    { code: 'HIGH_ATTENDANCE', title: 'Oylik o\'rtacha davomat 90% dan yuqoriligi', targetRole: 'TEACHER', type: 'BONUS', amountUzSum: 200000, threshold: 90.0, isActive: false, description: 'Yuqori davomat va o\'quvchilar ushlab qolinishi uchun rag\'bat' },
    { code: 'STUDENT_DROPOUT', title: 'Guruhdan o\'quvchi chiqib ketishi', targetRole: 'TEACHER', type: 'PENALTY', amountUzSum: 50000, isActive: false, description: 'Guruhdan har bir chiqib ketgan o\'quvchi uchun' },
    { code: 'UNPAID_STUDENT', title: 'Filialda to\'lov qilmagan o\'quvchilar soni', targetRole: 'ADMIN', type: 'PENALTY', amountUzSum: 20000, isActive: false, description: 'Muddati o\'tgan to\'lanmagan har bir o\'quvchi uchun' },
  ];

  for (const r of penaltyRules) {
    const exist = await prisma.staffPenaltyBonusRule.findFirst({ where: { code: r.code } });
    if (!exist) {
      await prisma.staffPenaltyBonusRule.create({ data: r });
    }
  }

  console.log('✅ Boshlang\'ich ma\'lumotlar (filiallar, rollar, o\'qituvchilar, guruhlar, o\'quvchilar, mahsulotlar) muvaffaqiyatli kiritildi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
