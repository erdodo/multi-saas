import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Basit demo: Tüm randevuları çek
  const randevular = await prisma.randevu.findMany();
  console.log('Randevular:', randevular);

  // Basit ekleme örneği
  // await prisma.randevu.create({ data: { title: 'Demo randevu', startTime: new Date(), endTime: new Date(), userId: 1 }});
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
