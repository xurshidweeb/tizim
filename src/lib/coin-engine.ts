/**
 * IT Time Academy - Coin Market Business Logic Engine
 * Mahsulot spetsifikatsiyasi bo'yicha hisob-kitob qoidalari
 */

export interface DailyScoresInput {
  isPresent: boolean;
  homeworkScore?: number; // 0 to 3
  activityScore?: number; // 0 to 3
  isExam?: boolean;
  examScore?: number;     // 0 to 40
}

export interface CalculatedLessonScore {
  attendanceScore: number;
  homeworkScore: number;
  activityScore: number;
  examScore: number;
  totalScore: number;
}

/**
 * 4.1 Har darsdagi ballar hisobi:
 * - Kelishi: 4 ball
 * - Asosiy vazifa: 0-3 ball
 * - Darsdagi aktivligi: 0-3 ball
 * Muhim qoida: Agar o'quvchi darsga kelmasa, barcha ballar (vazifa, aktivlik) 0 bo'ladi!
 */
export function calculateLessonScore(input: DailyScoresInput): CalculatedLessonScore {
  if (input.isExam) {
    const exam = Math.min(40, Math.max(0, input.examScore || 0));
    return {
      attendanceScore: 0,
      homeworkScore: 0,
      activityScore: 0,
      examScore: exam,
      totalScore: exam,
    };
  }

  if (!input.isPresent) {
    return {
      attendanceScore: 0,
      homeworkScore: 0,
      activityScore: 0,
      examScore: 0,
      totalScore: 0,
    };
  }

  const attendance = 4;
  const homework = Math.min(3, Math.max(0, input.homeworkScore || 0));
  const activity = Math.min(3, Math.max(0, input.activityScore || 0));

  return {
    attendanceScore: attendance,
    homeworkScore: homework,
    activityScore: activity,
    examScore: 0,
    totalScore: attendance + homework + activity,
  };
}

/**
 * 4.4 Bonuslar (110 balldan mustaqil, alohida qo'shiladi):
 * - 12 ta darsning barchasiga kelish: +100 coin
 * - 11 taga kelish: +80 coin
 * - 10 taga kelish: +60 coin
 * - < 10 taga kelish: 0 coin
 */
export function calculateAttendanceBonus(attendedCount: number): number {
  if (attendedCount >= 12) return 100;
  if (attendedCount === 11) return 80;
  if (attendedCount === 10) return 60;
  return 0;
}

/**
 * 4.3 110 ball chegarasi:
 * Har fan uchun alohida hisoblanadi.
 * Agar 110 ballga yetsa — jami to'plangan summa (12 dars + imtihon) umumiy balansga o'tadi.
 * Agar 110 ga yetmasa — o'sha oy yig'indisi 0 ga tushadi, keyingi oyga o'tmaydi.
 */
export function evaluateMonthlyCycle(regularLessonsScore: number, examScore: number) {
  const grandTotal = regularLessonsScore + examScore;
  const passed110 = grandTotal >= 110;
  const coinsFromPoints = passed110 ? grandTotal : 0;

  return {
    grandTotal,
    passed110,
    coinsFromPoints,
    deficitFor110: passed110 ? 0 : 110 - grandTotal,
  };
}

/**
 * 11. Davomat kiritish va o'zgartirish huquqi tekshiruvi:
 * O'qituvchi faqat joriy oy va o'tgan oyni (jami 2 oy) o'zgartira oladi.
 * Undan oldingisini faqat Admin / Super-admin tuzatishi mumkin.
 */
export function canTeacherEditAttendance(lessonDate: Date): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const lessonYear = lessonDate.getFullYear();
  const lessonMonth = lessonDate.getMonth();

  const monthDiff = (currentYear - lessonYear) * 12 + (currentMonth - lessonMonth);

  // 0 = joriy oy, 1 = o'tgan oy. Jami 2 oyga ruxsat.
  return monthDiff >= 0 && monthDiff <= 1;
}

/**
 * Do'stini taklif qilish bonusi
 */
export const REFERRAL_BONUS_COINS = 150;
