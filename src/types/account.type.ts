export type Role = {
  id: string;
  name: string;
};

export type FullUser = {
  id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  emailVerified: Date | null;
  image: string | null;
  roleId: string | null;
  role: Role | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type AccountActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
