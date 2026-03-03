import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding appointment module data...")

  // 1. Get first tenant
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) {
    console.error("No tenant found. Please run main app seeder first.")
    return
  }

  // 2. Create Services
  const service1 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: "Saç Kesimi",
      duration: 30,
      price: 250,
      color: "#3b82f6"
    }
  })

  const service2 = await prisma.service.create({
    data: {
      tenantId: tenant.id,
      name: "Cilt Bakımı",
      duration: 60,
      price: 500,
      color: "#10b981"
    }
  })

  // 3. Create Staff
  const staff1 = await prisma.staff.create({
    data: {
      tenantId: tenant.id,
      name: "Ahmet Yılmaz",
      staffServices: {
        create: [
          { serviceId: service1.id },
          { serviceId: service2.id }
        ]
      },
      availabilityRules: {
        create: [
          { tenantId: tenant.id, dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, // Pazartesi
          { tenantId: tenant.id, dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, // Salı
          { tenantId: tenant.id, dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, // Çarşamba
          { tenantId: tenant.id, dayOfWeek: 4, startTime: "09:00", endTime: "18:00" }, // Perşembe
          { tenantId: tenant.id, dayOfWeek: 5, startTime: "09:00", endTime: "18:00" }, // Cuma
        ]
      }
    }
  })

  console.log("✅ Seed completed for appointment module")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
