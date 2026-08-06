const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prismaClient = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const existing = await prismaClient.user.findUnique({
    where: { email: "admin@upulstores.lk" },
  });

  if (existing) {
    console.log("✅ Admin already exists. Skipping.");
    return;
  }

  const hashed = await bcrypt.hash("Admin@123", 12);

  const admin = await prismaClient.user.create({
    data: {
      name: "Upul Admin",
      email: "admin@upulstores.lk",
      password: hashed,
      role: "OWNER",
      isActive: true,
      phone: "+94771234567",
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);
  console.log("📧 Email: admin@upulstores.lk");
  console.log("🔑 Password: Admin@123");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });