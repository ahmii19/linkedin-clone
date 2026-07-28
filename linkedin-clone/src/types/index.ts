export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  headline?: string;
  location?: string;
  skills?: string[];
  experience?: IExperience[];
  education?: IEducation[];
  profilePhoto?: string;
  coverPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface IEducation {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface IPost {
  _id: string;
  author: IUser | string;
  content: string;
  image?: string;
  likes: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id: string;
  post: string;
  author: IUser | string;
  content: string;
  createdAt: Date;
}

export interface IConnection {
  _id: string;
  requester: IUser | string;
  recipient: IUser | string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  sender: IUser | string;
  receiver: IUser | string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface INotification {
  _id: string;
  recipient: string;
  sender: IUser | string;
  type: "connection_request" | "connection_accepted" | "new_comment" | "new_like";
  post?: string;
  comment?: string;
  read: boolean;
  createdAt: Date;
}
