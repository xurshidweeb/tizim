import prisma from './prisma';

/**
 * 10. Login va parol generatsiyasi
 * Format: [FILIAL_KOD]-[TARTIB_RAQAM] (Masalan: URG-0231)
 */
export async function generateNextLogin(branchCode: string): Promise<string> {
  const cleanCode = branchCode.toUpperCase().trim();
  
  // Ushbu filial kodi bilan boshlanuvchi loginlar sonini topish
  const count = await prisma.user.count({
    where: {
      login: {
        startsWith: `${cleanCode}-`,
      },
    },
  });

  const nextNumber = count + 1;
  const padded = String(nextNumber).padStart(4, '0');
  let candidate = `${cleanCode}-${padded}`;

  // Takrorlanmaslik kafolati
  let exists = await prisma.user.findUnique({ where: { login: candidate } });
  let counter = nextNumber;
  while (exists) {
    counter++;
    candidate = `${cleanCode}-${String(counter).padStart(4, '0')}`;
    exists = await prisma.user.findUnique({ where: { login: candidate } });
  }

  return candidate;
}

export function generateRandomPassword(length: number = 6): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
