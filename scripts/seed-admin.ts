/**
 * Creates the first admin (or promotes an existing account) from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Run: `npm run seed:admin`. Safe to run again — an existing user keeps their password.
 */
import "dotenv/config";
import { prisma } from "@/server/db/prisma";
import { auth } from "@/server/auth/auth";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await auth.api.signUpEmail({ body: { email, password, name: "Admin" } });
    user = await prisma.user.findUniqueOrThrow({ where: { email } });
    console.log(`Created ${email}`);
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN", banned: false } });
  console.log(`${email} is ADMIN`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
