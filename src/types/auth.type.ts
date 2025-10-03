export type AuthFormState = {
  errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
};

export type LoginFormState = {
  errors?: {
    email?: string;
    password?: string;
    general?: string;
  };
  values?: {
    email: string;
    password?: string;
  };
  success?: boolean;
};