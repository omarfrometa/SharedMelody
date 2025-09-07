// Extensión de tipos para Express
declare namespace Express {
  interface Request {
    user?: {
      userId: number;
      username: string;
      email: string;
      role: string;
    };
    clientIP?: string;
  }
}
