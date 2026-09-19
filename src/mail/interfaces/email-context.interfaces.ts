export interface WelcomeEmailContext {
  alias: string;
  dashboardUrl: string;
  companyName: string;
}

export interface VerifyEmailContext {
  alias: string;
  token: string;
  verifyUrl: string;
  expirationTime: string;
}

export interface PasswordResetContext {
  alias: string;
  token: string;
  resetUrl: string;
  expirationTime: string;
}

export interface TwoFactorCodeContext {
  code: string;
  expirationTime: string;
}

export interface SecurityAlertContext {
  alias: string;
  alertType: string;
  timestamp: string;
  device: string;
  ipAddress: string;
  location?: string;
  secureAccountUrl: string;
}
