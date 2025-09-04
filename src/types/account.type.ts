export type FullUser = {
  name: string | null;
  id: string;
  email: string | null;
  password: string | null;
  emailVerified: Date | null;
  image: string | null;
  roleId: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type Role = {
  id: string;
  name: string;
};