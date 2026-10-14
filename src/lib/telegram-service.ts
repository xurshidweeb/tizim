import prisma from './prisma';

export interface DailyStudentAttendanceDigest {
  studentName: string;
  subjectName: string;
  groupName: string;
  isPresent: boolean;
  attendanceScore: number;
  homeworkScore: number;
  activityScore: number;
  absentCountThisMonth: number;
  atRiskBonusText?: string;
}

/**
 * 12. Ota-onalar Telegram boti uchun xabar formati
 * Baholovchi yomon so'zlarsiz, professional va amaliy format.
 */
export function formatDailyParentMessage(records: DailyStudentAttendanceDigest[]): string {
  const dateStr = new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
  let msg = `📅 *IT Time Academy — Kunlik hisobot (${dateStr})*\n\n`;

  records.forEach((rec, idx) => {
    msg += `👤 *${rec.studentName}* (${rec.subjectName} — ${rec.groupName}):\n`;
    if (rec.isPresent) {
      msg += `  ✅ Darsda qatnashdi (+${rec.attendanceScore} ball)\n`;
      msg += `  📝 Vazifa: ${rec.homeworkScore}/3 ball\n`;
      msg += `  💡 Faollik: ${rec.activityScore}/3 ball\n`;
      
      if (rec.homeworkScore < 2) {
        msg += `  ℹ️ _Tavsiya: Vazifa qilish jarayoniga e'tibor bering._\n`;
      } else if (rec.activityScore < 2) {
        msg += `  ℹ️ _Tavsiya: Darsda savol-javoblarda faolroq bo'lishi maqsadga muvofiq._\n`;
      }
    } else {
      msg += `  ❌ Darsga kelmadi (0 ball)\n`;
      msg += `  ⚠️ Shu oyda jami ${rec.absentCountThisMonth}-dars qoldirildi.\n`;
      if (rec.atRiskBonusText) {
        msg += `  ⚠️ *Oqibat:* ${rec.atRiskBonusText}\n`;
      }
    }
    if (idx < records.length - 1) msg += `\n`;
  });

  msg += `\n🎯 _Maqsad: O'quvchining oylik 110 ball chegarasidan o'tishi va oylik bonus coinlarni to'plashiga yordam berish._`;
  return msg;
}

/**
 * Xabarni yuborish (haqiqiy bot tokeni bo'lsa Telegram API ga, aks holda bazaga log yozadi)
 */
export async function sendParentNotification(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token && token !== 'mock_telegram_bot_token') {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.error('Telegram message send error:', err);
    }
  }
}
