import { DBUser, DBCategory, DBEvent, DBBooking, DBTicket, DBNotification, AuditLogEntry } from "./types";

export const INITIAL_USERS: DBUser[] = [
  {
    id: 1,
    email: "admin@eventapi.org",
    fullName: "Chief Platform Admin",
    role: "admin",
    isBlocked: false,
    is_active: true,
    createdAt: "2026-05-01T08:00:00Z"
  },
  {
    id: 2,
    email: "organizer@festivals.org",
    fullName: "John Organizer",
    role: "organizer",
    isBlocked: false,
    is_active: true,
    createdAt: "2026-05-02T09:30:00Z"
  },
  {
    id: 3,
    email: "alice@gmail.com",
    fullName: "Alice Attendee",
    role: "attendee",
    isBlocked: false,
    is_active: true,
    createdAt: "2026-05-10T14:15:00Z"
  },
  {
    id: 4,
    email: "bob@gmail.com",
    fullName: "Bob Attendee",
    role: "attendee",
    isBlocked: false,
    is_active: true,
    createdAt: "2026-05-12T16:45:00Z"
  },
  {
    id: 5,
    email: "spammer@suspicious.io",
    fullName: "Spam Profile",
    role: "attendee",
    isBlocked: true,
    is_active: true,
    createdAt: "2026-05-20T11:00:00Z"
  }
];

export const INITIAL_CATEGORIES: DBCategory[] = [
  { id: 1, name: "Tech Conferences", description: "Developers sessions, cloud computing, and AI showcases." },
  { id: 2, name: "Music Festivals", description: "Live performance bands, electric dance music, and synth loops." },
  { id: 3, name: "Art Exhibitions", description: "Modern displays, abstract canvas works, and sculpt design." },
  { id: 4, name: "Sports Tournaments", description: "Championship soccer matches, track sprints, and dynamic athletics." }
];

export const INITIAL_EVENTS: DBEvent[] = [
  {
    id: 101,
    title: "Global AI & Cloud Forum 2026",
    description: "Connect with world developers exploring advanced deep learning architectures, Gemini APIs, and serverless container deployments.",
    categoryId: 1,
    venue: "Convention Center Hall A, California",
    dateTime: "2026-06-15T09:00:00Z",
    ticketPrice: 299.00,
    maxCapacity: 350,
    organizerId: 2,
    isActive: true,
    isDeleted: false,
    createdAt: "2026-05-15T10:00:00Z"
  },
  {
    id: 102,
    title: "Retro Electro Synth Waves",
    description: "An immersive outdoor custom synthesizer festival featuring classic loop bands and high fidelity lasers.",
    categoryId: 2,
    venue: "Twilight Dunes Amphitheater, Nevada",
    dateTime: "2026-07-20T19:30:00Z",
    ticketPrice: 85.50,
    maxCapacity: 800,
    organizerId: 2,
    isActive: true,
    isDeleted: false,
    createdAt: "2026-05-16T12:00:00Z"
  },
  {
    id: 103,
    title: "Elite Masterclass: Abstract Minimalist Art",
    description: "Private hands-on sculpting and layout masterclass with global minimalist designers. Strictly limited seats.",
    categoryId: 3,
    venue: "Sienna Premium Studios, New York",
    dateTime: "2026-08-05T14:00:00Z",
    ticketPrice: 150.00,
    maxCapacity: 5, // Tiny capacity so user can test the Overbooking Prevention immediately!
    organizerId: 2,
    isActive: true,
    isDeleted: false,
    createdAt: "2026-05-18T15:30:00Z"
  },
  {
    id: 104,
    title: "Metro Marathon 2026",
    description: "A fast urban race circuit spanning across bridges and city landmarks. Register to capture your timer chip.",
    categoryId: 4,
    venue: "Downtown Central Park, Boston",
    dateTime: "2026-09-10T06:00:00Z",
    ticketPrice: 45.00,
    maxCapacity: 1500,
    organizerId: 2,
    isActive: true,
    isDeleted: false,
    createdAt: "2026-05-20T08:00:00Z"
  }
];

export const INITIAL_BOOKINGS: DBBooking[] = [
  {
    id: 501,
    userId: 3, // Alice
    eventId: 103, // Art Masterclass
    status: "confirmed",
    ticketCount: 2,
    totalPrice: 300.00,
    qrCodePath: "/static/qrcodes/booking_501_cf2bf11e.png",
    createdAt: "2026-05-25T11:20:00Z",
    paymentStatus: "completed",
    transactionId: "TXN-A3B9F2K2"
  },
  {
    id: 502,
    userId: 4, // Bob
    eventId: 101, // Tech Summit
    status: "confirmed",
    ticketCount: 1,
    totalPrice: 299.00,
    qrCodePath: "/static/qrcodes/booking_502_ea39ff01.png",
    createdAt: "2026-05-26T15:45:00Z",
    paymentStatus: "completed",
    transactionId: "TXN-C9F2H10A"
  }
];

export const INITIAL_TICKETS: DBTicket[] = [
  {
    id: 9001,
    bookingId: 501,
    ticketUuid: "ticket-uuid-alice-01-art",
    status: "valid",
    scannedAt: null
  },
  {
    id: 9002,
    bookingId: 501,
    ticketUuid: "ticket-uuid-alice-02-art",
    status: "valid",
    scannedAt: null
  },
  {
    id: 9003,
    bookingId: 502,
    ticketUuid: "ticket-uuid-bob-tech",
    status: "valid",
    scannedAt: null
  }
];

export const INITIAL_NOTIFICATIONS: DBNotification[] = [
  {
    id: 1,
    userId: 3,
    subject: "Booking Confirmation: Elite Masterclass",
    message: "Your purchase of 2 tickets (₹300.00) for Elite Masterclass: Abstract Minimalist Art is completed. Transaction ID: TXN-A3B9F2K2.",
    isSent: true,
    sentAt: "2026-05-25T11:20:30Z"
  },
  {
    id: 2,
    userId: 4,
    subject: "Booking Confirmation: Global AI & Cloud Forum 2026",
    message: "Your purchase of 1 ticket (₹299.00) for Global AI & Cloud Forum 2026 is completed. Transaction ID: TXN-C9F2H10A.",
    isSent: true,
    sentAt: "2026-05-26T15:45:15Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 1,
    operator: "SYSTEM",
    action: "BOOT",
    resourceType: "database",
    details: "SQLite portable database loaded; alembic head migration applied. 4 tables successfully mapped.",
    ipAddress: "127.0.0.1",
    timestamp: "2026-05-31T06:00:00Z"
  },
  {
    id: 2,
    operator: "Alice Attendee (ID 3)",
    action: "CREATE_BOOKING",
    resourceType: "bookings",
    details: "Booked 2 seats for 'Elite Masterclass: Abstract Minimalist Art'. Total cost: ₹300.00. Seat capacity validation succeeded (2/5 seats occupied).",
    ipAddress: "192.168.1.104",
    timestamp: "2026-05-25T11:20:00Z"
  },
  {
    id: 3,
    operator: "Bob Attendee (ID 4)",
    action: "CREATE_BOOKING",
    resourceType: "bookings",
    details: "Booked 1 seat for 'Global AI & Cloud Forum 2026'. Total cost: ₹299.00. Seat capacity validation succeeded (1/350 seats occupied).",
    ipAddress: "192.168.1.15",
    timestamp: "2026-05-26T15:45:00Z"
  }
];
