export interface AuthFormModel {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}


export interface UserModel {
  username: string;
  email?: string;
}


export interface AuthStateModel {
  user: UserModel | null;
  isLoading: boolean;
  error: string | null;
}


export interface LoginCredentialsModel {
  username: string;
  password: string;
}


export interface RegisterCredentialsModel extends LoginCredentialsModel {
  email: string;
}


export interface responseModel {
  access: string;
  refresh: string;
}
