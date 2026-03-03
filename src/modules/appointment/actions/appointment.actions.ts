"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "../schemas/appointment.schema";
import { generateTimeSlots } from "../utils/time-slots";
import { format, parseISO, startOfDay, endOfDay, addMinutes } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getAvailableSlots(staffId: string, dateStr: string, serviceDurationMinutes: number) {
  try {
    const targetDate = parseISO(dateStr);
    const dayOfWeek = targetDate.getDay();

    // 1. Personelin o günkü çalışma saatlerini getir
    const availability = await prisma.availability.findFirst({
      where: {
        staffId,
        dayOfWeek,
      },
    });

    if (!availability) {
      return { success: true, data: [] }; // O gün çalışmıyor
    }

    // 2. O güne ait mevcut onaylı ve bekleyen randevuları getir
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId,
        startTime: {
          gte: start,
        },
        endTime: {
          lte: end,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // 3. Slotları hesapla
    const slots = generateTimeSlots(
      targetDate,
      { startTime: availability.startTime, endTime: availability.endTime },
      existingAppointments.filter((a) => a.startTime != null && a.endTime != null) as { startTime: Date; endTime: Date }[],
      serviceDurationMinutes
    );

    return { success: true, data: slots };
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return { success: false, error: "Müsait saatler alınırken bir hata oluştu" };
  }
}

export async function createAppointment(data: z.infer<typeof createAppointmentSchema>, tenantId: string) {
  try {
    // 1. Validasyon
    const validatedData = createAppointmentSchema.parse(data);

    // 2. Servis ve Personel Kontrolü
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });
    
    if (!service) {
      return { success: false, error: "Hizmet bulunamadı" };
    }

    // Seçilen tarihteki saat dilimlerini Date objesine çevir
    const appointmentDate = parseISO(validatedData.date); // Sadece tarihi alıyor (00:00:00)
    // "HH:mm" formatındaki string'i ilgili güne ekle:
    const [hours, minutes] = validatedData.startTime.split(":").map(Number);
    
    const startTime = new Date(appointmentDate);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = addMinutes(startTime, service.duration);

    // 3. Çakışma Kontrolü (Concurrency Avoidance)
    // Belirtilen saat aralığında (kesişen) başka bir randevu var mı?
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId: validatedData.staffId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          // Yeni randevunun başlangıcı, eskisinin içinde mi?
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          }
        ],
      },
    });

    if (conflictingAppointment) {
      return { success: false, error: "Seçtiğiniz saat dilimi dolu, lütfen başka bir saat seçin." };
    }

    // 4. Randevuyu Oluştur
    const newAppointment = await prisma.appointment.create({
      data: {
        tenantId,
        staffId: validatedData.staffId,
        serviceId: validatedData.serviceId,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        notes: validatedData.notes,
        startTime,
        endTime,
        status: "PENDING",
      },
    });

    // TODO: (Yakında) Bildirim entegrasyonu (SMS, Email) buraya gelecek.

    revalidatePath(`/[tenantSlug]/book`, "page");
    revalidatePath(`/admin/appointments`, "page");

    return { success: true, data: newAppointment };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Lütfen form bilgilerini kontrol edin" };
    }
    console.error("Error creating appointment:", error);
    return { success: false, error: "Randevu oluşturulurken beklenmeyen bir hata oluştu" };
  }
}
