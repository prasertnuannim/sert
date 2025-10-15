// type สำหรับ Prisma createUser
export type UserFormType = {
  name: string;
  email: string;
  password: string;
  roleId?: string;
};
