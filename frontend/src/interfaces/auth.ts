export interface AuthFormProps {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}


export interface UserProps {
  username: string;
  email?: string;
}


export interface AuthStateProps {
  user: UserProps | null;
  isLoading: boolean;
  error: string | null;
}


export interface LoginCredentialsProps {
  username: string;
  password: string;
}


export interface RegisterCredentialsProps extends LoginCredentialsProps {
  email: string;
}


export interface ResponseProps {
  access: string;
  refresh: string;
}
