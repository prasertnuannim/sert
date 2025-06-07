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
    name?: string;
    password?: string;
    general?: string;
  };
  values?: {
    name: string;
    password?: string;
  };
  success?: boolean;
};