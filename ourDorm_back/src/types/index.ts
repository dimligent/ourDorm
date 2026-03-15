export interface User {
  userId: number;
  userName: string;
  password: string;
  memberId?: number | null;
}

export interface Member {
  memberId: number;
  name: string;
  birthday: string;
  hometown: string;
  hobby: string;
  role: string;
  avatar: string;
}

export interface Flag {
  flagId: number;
  title: string;
  content: string;
  needCheckin: boolean;
  status: string;
  createTime: number;
}

export interface FlagMember {
  id: number;
  flagId: number;
  memberId: number;
}

export interface FlagCheckin {
  checkinId: number;
  flagId: number;
  memberId: number;
  checkinDate: string;
}

export interface Countdown {
  countdownId: number;
  title: string;
  targetDate: string;
  orderIndex: number;
  createTime: number;
}

export interface DormLog {
  logId: number;
  title: string;
  content: string;
  images: string;
  type: string;
  createTime: number;
}

export interface JWTPayload {
  userId: number;
  username: string;
  memberId: number | null;
}

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}
