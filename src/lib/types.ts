import { Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Timestamp | null;
  createdAt: Timestamp;
}
