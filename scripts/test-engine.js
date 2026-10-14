const assert = require('assert');

// Coin engine test logic
function calculateLessonScore(input) {
  if (input.isExam) {
    const exam = Math.min(40, Math.max(0, input.examScore || 0));
    return { attendanceScore: 0, homeworkScore: 0, activityScore: 0, examScore: exam, totalScore: exam };
  }
  if (!input.isPresent) {
    return { attendanceScore: 0, homeworkScore: 0, activityScore: 0, examScore: 0, totalScore: 0 };
  }
  const attendance = 4;
  const homework = Math.min(3, Math.max(0, input.homeworkScore || 0));
  const activity = Math.min(3, Math.max(0, input.activityScore || 0));
  return { attendanceScore: attendance, homeworkScore: homework, activityScore: activity, examScore: 0, totalScore: attendance + homework + activity };
}

function calculateAttendanceBonus(attendedCount) {
  if (attendedCount >= 12) return 100;
  if (attendedCount === 11) return 80;
  if (attendedCount === 10) return 60;
  return 0;
}

function evaluateMonthlyCycle(regularLessonsScore, examScore) {
  const grandTotal = regularLessonsScore + examScore;
  const passed110 = grandTotal >= 110;
  const coinsFromPoints = passed110 ? grandTotal : 0;
  return { grandTotal, passed110, coinsFromPoints, deficitFor110: passed110 ? 0 : 110 - grandTotal };
}

function canTeacherEditAttendance(lessonDate) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lessonYear = lessonDate.getFullYear();
  const lessonMonth = lessonDate.getMonth();
  const monthDiff = (currentYear - lessonYear) * 12 + (currentMonth - lessonMonth);
  return monthDiff >= 0 && monthDiff <= 1;
}

console.log('🧪 IT Time Academy Coin Engine testlari boshlandi...');

// Test 1: Har darsdagi ballar
const fullScore = calculateLessonScore({ isPresent: true, homeworkScore: 3, activityScore: 3 });
assert.strictEqual(fullScore.totalScore, 10, 'To\'liq dars 10 ball bo\'lishi kerak');
assert.strictEqual(fullScore.attendanceScore, 4, 'Kelganlik uchun 4 ball');

const absentScore = calculateLessonScore({ isPresent: false, homeworkScore: 3, activityScore: 3 });
assert.strictEqual(absentScore.totalScore, 0, 'Kelmagan bo\'lsa barcha ballar 0 bo\'lishi kerak');
assert.strictEqual(absentScore.homeworkScore, 0, 'Kelmagan o\'quvchi vazifasi 0 bo\'lishi kerak');

// Test 2: 110 ball chegarasi
const passedCycle = evaluateMonthlyCycle(90, 30); // 120 ball
assert.strictEqual(passedCycle.passed110, true, '120 ball 110 dan o\'tishi kerak');
assert.strictEqual(passedCycle.coinsFromPoints, 120, 'O\'tgan barcha ball doimiy balansga aylanadi');

const failedCycle = evaluateMonthlyCycle(70, 25); // 95 ball
assert.strictEqual(failedCycle.passed110, false, '95 ball 110 ga yetmagan');
assert.strictEqual(failedCycle.coinsFromPoints, 0, 'Yetmagan ball 0 ga tushadi');
assert.strictEqual(failedCycle.deficitFor110, 15, '15 ball yetmagan');

// Test 3: Davomat bonuslari (110 dan mustaqil!)
assert.strictEqual(calculateAttendanceBonus(12), 100, '12 darsga to\'liq kelish +100 coin');
assert.strictEqual(calculateAttendanceBonus(11), 80, '11 darsga kelish +80 coin');
assert.strictEqual(calculateAttendanceBonus(10), 60, '10 darsga kelish +60 coin');
assert.strictEqual(calculateAttendanceBonus(9), 0, '9 darsga kelish 0 coin');

// Test 4: O'qituvchi tahrirlash huquqi (2 oylik cheklov)
const today = new Date();
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 15);

assert.strictEqual(canTeacherEditAttendance(today), true, 'Bugungi darsni o\'zgartirish mumkin');
assert.strictEqual(canTeacherEditAttendance(lastMonth), true, 'O\'tgan oydagi darsni o\'zgartirish mumkin');
assert.strictEqual(canTeacherEditAttendance(threeMonthsAgo), false, '3 oy oldingi darsni o\'zgartirish taqiqlangan');

console.log('✅ Barcha testlar (110 qoidasi, davomat bonusi, dars ballari, 2 oylik cheklov) 100% muvaffaqiyatli o\'tdi!');
