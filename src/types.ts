export interface DBUser {
  id: number;
  email: string;
  fullName: string;
  role: "admin" | "organizer" | "attendee";
  isBlocked: boolean;
  is_active: boolean;
  createdAt: string;
}

export interface DBCategory {
  id: number;
  name: string;
  description: string;
}

export interface DBEvent {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  venue: string;
  dateTime: string;
  ticketPrice: number;
  maxCapacity: number;
  organizerId: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface DBBooking {
  id: number;
  userId: number;
  eventId: number;
  status: "confirmed" | "cancelled";
  ticketCount: number;
  totalPrice: number;
  qrCodePath: string;
  createdAt: string;
  paymentStatus: "pending" | "completed" | "failed";
  transactionId: string;
}

export interface DBTicket {
  id: number;
  bookingId: number;
  ticketUuid: string;
  status: "valid" | "used" | "cancelled";
  scannedAt: string | null;
}

export interface DBNotification {
  id: number;
  userId: number;
  subject: string;
  message: string;
  isSent: boolean;
  sentAt: string;
}

export interface AuditLogEntry {
  id: number;
  operator: string;
  action: string;
  resourceType: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface HttpLog {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: number;
  payload?: any;
  response: any;
  timestamp: string;
}

export interface InteractiveState {
  users: DBUser[];
  categories: DBCategory[];
  events: DBEvent[];
  bookings: DBBooking[];
  tickets: DBTicket[];
  notifications: DBNotification[];
  auditLogs: AuditLogEntry[];
  httpLogs: HttpLog[];
  currentUser: DBUser | null;
  authToken: string | null;
}
