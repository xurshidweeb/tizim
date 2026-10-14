# tizim

**IT Time Academy — Coin Market CRM / ERP Tizimi**

Apple iOS Liquid Glass dizayni va mobil touch-kartalarga ega o'quv markazini kompleks boshqarish tizimi.

## Imkoniyatlar
- **Apple iOS Liquid Glass Dizayni**: Plus Jakarta Sans tipografiyasi, suyuq shisha effektlari (`backdrop-filter: blur`), va ambient yorug'lik effektlari.
- **5 ta Rol Boshqaruvi**:
  - Super Admin
  - Filial Rahbari
  - Admin
  - O'qituvchi
  - O'quvchi
- **110 Ball Tizimi va Davomat**: 12 ta dars davomati va imtihon ballari asosida avtomatik hisob-kitob.
- **Coin Market**: O'quvchilar yig'ilgan ballarga sovg'a xarid qilishi, buyurtmalar boshqaruvi.
- **Face ID va Eksport**: Excel formatida login va parollarni eksport qilish.

## Ishga tushirish
```bash
npm install
npx prisma db push
node scripts/seed-rich.js
npm run dev
```

Barcha test akkauntlar paroli: `password123`
