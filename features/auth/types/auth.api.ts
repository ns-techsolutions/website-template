/** Client -> server request payloads for the auth endpoints. */
export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  /** Email-verification code; omitted when the salon has email disabled. */
  code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
