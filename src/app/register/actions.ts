"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  businessName: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export async function registerUser(formData: FormData) {
  try {
    const rawData = {
      businessName: formData.get("businessName") as string,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = registerSchema.parse(rawData);

    // E-posta kullanımda mı?
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: "Bu e-posta adresi zaten kullanılıyor." };
    }

    // Tenant oluştur
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.businessName,
      },
    });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Kullanıcıyı oluştur ve Tenant'a bağla
    const user = await prisma.user.create({
      data: {
        name: validatedData.fullName,
        email: validatedData.email,
        password: hashedPassword,
        role: "ADMIN", // İlk kullanıcı ADMIN
        tenantId: tenant.id,
      },
    });

    // TODO: (Yakında) Session başlatma veya NextAuth login
    
    return { success: true, email: validatedData.email };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validasyon hatası" };
    }
    console.error("Registration error:", error);
    return { success: false, error: "Kayıt işlemi sırasında bir hata oluştu." };
  }
}
