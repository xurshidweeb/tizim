import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseConfig(): { url: string } {
  const envUrl = process.env.DATABASE_URL;

  // 1. Agar foydalanuvchi tashqi ma'lumotlar bazasini (Postgres/MySQL/Supabase/Neon) ulasa
  if (envUrl && !envUrl.startsWith('file:')) {
    return { url: envUrl };
  }

  // 2. Vercel Serverless muhitida (AWS Lambda read-only bo'lgani sababli /tmp ga nusxalash)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = process.platform === 'win32' ? os.tmpdir() : '/tmp';
    const tmpDbPath = path.join(tmpDir, 'dev.db');

    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const needsCopy = !fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0;

      if (needsCopy) {
        const candidatePaths = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
          path.resolve('./prisma/dev.db'),
          path.resolve('./dev.db'),
          path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
          path.join(__dirname, '..', 'prisma', 'dev.db'),
          path.join(__dirname, 'prisma', 'dev.db'),
        ];

        let sourcePath: string | null = null;
        for (const p of candidatePaths) {
          if (fs.existsSync(p) && fs.statSync(p).size > 0) {
            sourcePath = p;
            break;
          }
        }

        if (sourcePath) {
          fs.copyFileSync(sourcePath, tmpDbPath);
          console.log(`[Vercel SQLite] SQLite bazasi muvaffaqiyatli ${tmpDbPath} ga nusxalandi: ${sourcePath}`);
        } else {
          console.warn('[Vercel SQLite] Loyiha ichida dev.db topilmadi, qidirilgan yo\'llar:', candidatePaths);
        }
      }
    } catch (err) {
      console.error('[Vercel SQLite] SQLite bazasini nusxalashda xatolik:', err);
    }

    const normalizedPath = tmpDbPath.replace(/\\/g, '/');
    return { url: `file:${normalizedPath}` };
  }

  // 3. Lokal muhit (Desktop / Localhost)
  return { url: envUrl || 'file:./dev.db' };
}

const dbConfig = getDatabaseConfig();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbConfig.url,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
