import { prisma } from "@/lib/prisma";
import { hashPassword, isValidEmail, normalizeEmail } from "@/lib/authUsers";

async function main() {
  const [, , rawEmail, rawPassword] = process.argv;
  const email = normalizeEmail(rawEmail ?? "");
  const password = rawPassword ?? "";

  if (!isValidEmail(email)) {
    throw new Error("Debes pasar un correo electrónico válido como primer argumento.");
  }
  if (password.length < 8) {
    throw new Error("Debes pasar una contraseña de al menos 8 caracteres como segundo argumento.");
  }

  await prisma.adminUser.deleteMany();
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      role: "ADMIN",
    },
  });

  console.log(`AUTH_USERS_RESET_OK:${email}`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
