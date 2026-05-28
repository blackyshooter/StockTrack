const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  await prisma.role.upsert({
    where: { name: "OPERADOR" },
    update: {},
    create: { name: "OPERADOR" },
  });

  await prisma.role.upsert({
    where: { name: "CONSULTA" },
    update: {},
    create: { name: "CONSULTA" },
  });

  await prisma.category.createMany({
    data: [
      {
        name: "Redes",
        description: "Equipos de red como routers, switches y access points",
      },
      {
        name: "Periféricos",
        description: "Mouse, teclado, lectores y accesorios",
      },
      {
        name: "Impresión",
        description: "Impresoras, toners y consumibles",
      },
      {
        name: "Energía",
        description: "UPS, estabilizadores y zapatillas eléctricas",
      },
      {
        name: "Cámaras",
        description: "Cámaras, DVR y accesorios de seguridad",
      },
    ],
    skipDuplicates: true,
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@stocktrack.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@stocktrack.com",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Seed ejecutado correctamente");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });