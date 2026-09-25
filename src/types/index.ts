export type NumeralMode = 'myanmar' | 'english';

export interface Live2DResultItem {
  set: string;
  value: string;
  open_time: string;
  twod: string;
  stock_date: string;
  stock_datetime: string;
  history_id: number | null;
}

export interface Live2DData {
  server_time: string;
  live: {
    set: string;
    value: string;
    time: string;
    twod: string;
    date: string;
  };
  result: Live2DResultItem[];
  holiday?: {
    status: string;
    date: string;
    name: string;
  };
  is_fallback?: boolean;
}

export interface ThreeDItem {
  result: string;
  datetime: string;
}

export interface ThreeDResponse {
  data: ThreeDItem[];
  result: number;
  message: string;
  is_fallback?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  badge?: string;
  prediction?: string;
  avatarColor?: string;
}

export type ThreeDSubMode = 'arkarsoe' | 'monthlyCalendar' | 'list';

export type TabType =
  | '2d_live'
  | '3d_result'
  | '3d_arkarsoe'
  | '3d_calendar'
  | '3d_history'
  | 'group_chat'
  | 'ai_chat'
  | 'tools';
