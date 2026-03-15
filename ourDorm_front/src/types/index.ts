export interface User {
  userId: number;
  username: string;
  memberId?: number | null;
}

export interface Member {
  id: number;
  name: string;
  birthday?: string | null;
  hometown?: string | null;
  hobby?: string | null;
  role?: string | null;
  avatar?: string | null;
}

export interface Flag {
  id: number;
  title: string;
  content: string;
  needCheckin: boolean;
  status: "active" | "deleted";
  createTime: number;
  checkedInToday?: boolean;
  members?: Member[];
  checkinLogs?: CheckinLog[];
}

export interface CheckinLog {
  member: string;
  date: string;
}

export interface Countdown {
  id: number;
  title: string;
  date: string;
  daysLeft: number;
  color: string;
  orderIndex: number;
  createTime: number;
}

export interface DormLog {
  id: number;
  title: string;
  content: string;
  images: string[];
  type: string;
  createTime: number;
}

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
}

export interface LoginResponse {
  code: string;
  message: string;
  JWT: string;
}

export interface CreateFlagRequest {
  title: string;
  content: string;
  needCheckin: boolean;
  memberIds: number[];
}

export interface CreateCountdownRequest {
  title: string;
  targetDate: string;
}

export interface UpdateCountdownRequest {
  id: number;
  title: string;
  targetDate: string;
}

export interface CreateLogRequest {
  title: string;
  content: string;
  images: string[];
  type: string;
}
