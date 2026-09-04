import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@drophunter.ai" },
    create: { email: "demo@drophunter.ai", name: "Demo Seller", preferences: { create: {} } },
    update: {},
  });

  console.log(`Seeded demo user: ${user.email} (${user.id})`);
  console.log("No products seeded — use the Import Product page in Demo Mode to generate sample data interactively.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
