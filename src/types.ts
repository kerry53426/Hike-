export interface Registration {
  id?: string;
  userId: string;
  userName: string;
  phone?: string;
  date: string; // YYYY-MM-DD
  goingUp: boolean;
  goingDown: boolean;
  stayingZhudong: boolean;
  note: string;
  updatedAt: string; // ISO String
  deleted?: boolean;
}
