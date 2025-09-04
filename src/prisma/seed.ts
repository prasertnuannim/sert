// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // Create roles
//   const adminRole = await prisma.role.upsert({
//     where: { name: "admin" },
//     update: {},
//     create: { name: "admin" },
//   });

//   const userRole = await prisma.role.upsert({
//     where: { name: "user" },
//     update: {},
//     create: { name: "user" },
//   });

//   console.log("Roles seeded:", { adminRole, userRole });
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(() => prisma.$disconnect());



import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });

  // Create users with hashed passwords
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordUser = await bcrypt.hash("user123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: passwordAdmin,
      roleId: adminRole.id, // assuming user has roleId foreign key
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "User",
      password: passwordUser,
      roleId: userRole.id,
    },
  });

  console.log("Seeded roles:", { adminRole, userRole });
  console.log("Seeded users:", { adminUser, normalUser });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
