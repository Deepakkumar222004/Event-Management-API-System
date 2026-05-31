import React, { useState, useEffect, useRef } from "react";
import { 
  Server, 
  Activity, 
  FileCode, 
  Code, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Settings, 
  Play, 
  Trash2, 
  Lock, 
  Mail, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users, 
  QrCode, 
  LogOut, 
  RefreshCw, 
  Copy, 
  Download, 
  Send, 
  Terminal, 
  ArrowRight, 
  Clock,
  UserCheck,
  AlertCircle,
  TrendingDown,
  Percent
} from "lucide-react";
import { API_CODE_FILES, CodeFile } from "./apiCode";
import { 
  INITIAL_USERS, 
  INITIAL_CATEGORIES, 
  INITIAL_EVENTS, 
  INITIAL_BOOKINGS, 
  INITIAL_TICKETS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from "./initialData";
import { 
  DBUser, 
  DBCategory, 
  DBEvent, 
  DBBooking, 
  DBTicket, 
  DBNotification, 
  AuditLogEntry, 
  HttpLog 
} from "./types";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"code" | "playground" | "database" | "ai" | "architecture" | "setup">("playground");
  
  // Database States (in-memory mock persistent database sandbox)
  const [dbUsers, setDbUsers] = useState<DBUser[]>(INITIAL_USERS);
  const [dbCategories] = useState<DBCategory[]>(INITIAL_CATEGORIES);
  const [dbEvents, setDbEvents] = useState<DBEvent[]>(INITIAL_EVENTS);
  const [dbBookings, setDbBookings] = useState<DBBooking[]>(INITIAL_BOOKINGS);
  const [dbTickets, setDbTickets] = useState<DBTicket[]>(INITIAL_TICKETS);
  const [dbNotifications, setDbNotifications] = useState<DBNotification[]>(INITIAL_NOTIFICATIONS);
  const [dbAuditLogs, setDbAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  
  // Simulated Web Server state on port 8000
  const [currentUser, setCurrentUser] = useState<DBUser | null>(INITIAL_USERS[2]); // Alice pre-logged-in for helper
  const [token, setToken] = useState<string | null>("MOCK_JWT_HEADER_TOKEN_ALICE_ATTENDEE_5548");
  const [httpLogs, setHttpLogs] = useState<HttpLog[]>([
    {
      id: "log_init",
      method: "GET",
      path: "/",
      status: 200,
      timestamp: "06:00:00",
      payload: null,
      response: { status: "healthy", service: "Event Management API", version: "1.0.0" }
    }
  ]);
  
  // Simulated inbox trigger
  const [simulatedInbox, setSimulatedInbox] = useState<DBNotification[]>([
    {
      id: 1,
      userId: 3,
      subject: "Welcome Alice!",
      message: "Your attendee profile is activated in SQL.",
      isSent: true,
      sentAt: "2026-05-31T06:00:00Z"
    }
  ]);

  // Code Explorer States
  const [selectedFile, setSelectedFile] = useState<CodeFile>(API_CODE_FILES[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Playgrounds Fields states
  // Auth Form
  const [authForm, setAuthForm] = useState({ email: "", password: "", fullName: "", role: "attendee" as "admin" | "organizer" | "attendee" });
  const [loginForm, setLoginForm] = useState({ email: "alice@gmail.com", password: "" });
  
  // Create Event Form
  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    description: "",
    categoryId: 1,
    venue: "",
    dateTime: "2026-06-30T18:00",
    ticketPrice: 45.00,
    maxCapacity: 100
  });

  // Ticket checkout Form
  const [bookingForm, setBookingForm] = useState({ eventId: 103, ticketCount: 2 }); // Art master class
  
  // QR scanner check-in simulator
  const [ticketUuidToVerify, setTicketUuidToVerify] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Admin user panel state
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<number>(3);
  const [blockState, setBlockState] = useState<boolean>(true);

  // AI assistant state
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChat, setAiChat] = useState<{ query: string; reply: string }[]>([
    {
      query: "Briefly draft the overbooking validation check in FastAPI Python.",
      reply: "To prevent overbooking, the API queries database bookings, aggregatesconfirmed tickets, and validates if capacity left is greater than requested tickets inside a database transaction:\n\n```python\ntotal_booked_seats = db.query(func.sum(Booking.ticket_count)).filter(\n    Booking.event_id == event_id,\n    Booking.status == BookingStatus.CONFIRMED\n).scalar() or 0\n\nif (event.max_capacity - total_booked_seats) < requested_count:\n    raise HTTPException(status_code=400, detail=\"Overbooking prevented.\")\n```"
    }
  ]);

  // Active DB Table inspect state
  const [inspectTable, setInspectTable] = useState<"users" | "categories" | "events" | "bookings" | "tickets" | "notifications">("users");

  // Filter states
  const [eventCategoryFilter, setEventCategoryFilter] = useState<number | null>(null);
  const [eventPriceFilter, setEventPriceFilter] = useState<string>("");

  // Helpers
  const addHttpLog = (method: "GET" | "POST" | "PUT" | "DELETE", path: string, status: number, payload: any, response: any) => {
    const timeString = new Date().toLocaleTimeString();
    const newLog: HttpLog = {
      id: "log_" + Date.now(),
      method,
      path,
      status,
      payload,
      response,
      timestamp: timeString
    };
    setHttpLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (operator: string, action: string, resourceType: string, details: string) => {
    const newAudit: AuditLogEntry = {
      id: dbAuditLogs.length + 1,
      operator,
      action,
      resourceType,
      details,
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString()
    };
    setDbAuditLogs(prev => [newAudit, ...prev]);
  };

  // 1. Simulate registration query
  const handleSimulateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email || !authForm.fullName) {
      alert("Please fill in email and full name");
      return;
    }
    
    // Check duplication
    const duplicate = dbUsers.find(u => u.email.toLowerCase() === authForm.email.toLowerCase());
    if (duplicate) {
      const errRes = { detail: "The email is already registered inside this system." };
      addHttpLog("POST", "/api/v1/auth/register", 400, authForm, errRes);
      return;
    }

    const newUser: DBUser = {
      id: dbUsers.length + 1,
      email: authForm.email,
      fullName: authForm.fullName,
      role: authForm.role,
      isBlocked: false,
      is_active: true,
      createdAt: new Date().toISOString()
    };

    setDbUsers(prev => [...prev, newUser]);
    
    // Schedule signup welcome mail simulation
    const welcomeMail: DBNotification = {
      id: simulatedInbox.length + 1,
      userId: newUser.id,
      subject: "Welcome to Event Management Portal!",
      message: `Hi ${newUser.fullName}, your FastAPI JWT access profile registration has succeeded! Role mapped as: ${newUser.role.toUpperCase()}`,
      isSent: true,
      sentAt: new Date().toISOString()
    };
    setSimulatedInbox(prev => [welcomeMail, ...prev]);

    addAuditLog(newUser.fullName, "REGISTER_USER", "users", `New user register successful. Email: ${newUser.email}, Role: ${newUser.role}`);
    addHttpLog("POST", "/api/v1/auth/register", 201, authForm, newUser);
    
    setAuthForm({ email: "", password: "", fullName: "", role: "attendee" });
  };

  // 2. Simulate login query
  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userMatched = dbUsers.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase());
    
    if (!userMatched) {
      const err = { detail: "Incorrect username email or password." };
      addHttpLog("POST", "/api/v1/auth/login", 401, loginForm, err);
      return;
    }

    if (userMatched.isBlocked) {
      const err = { detail: "This account has been blocked for rules violations." };
      addHttpLog("POST", "/api/v1/auth/login", 403, loginForm, err);
      return;
    }

    const simulatedJwt = `MOCK_JWT_HEADER_TOKEN_${userMatched.fullName.toUpperCase().replace(/\s+/g, "_")}`;
    setCurrentUser(userMatched);
    setToken(simulatedJwt);

    addAuditLog(userMatched.fullName, "LOGIN_RETRIEVAL", "users", `Issued new authenticated JWT bearer token.`);
    addHttpLog("POST", "/api/v1/auth/login", 200, { username: loginForm.email }, { access_token: simulatedJwt, token_type: "bearer" });
  };

  // Logout session
  const logoutSession = () => {
    if (currentUser) {
      addHttpLog("GET", "/api/v1/auth/logout", 200, null, { message: "Bearer JWT cleared successfully" });
      addAuditLog(currentUser.fullName, "LOGOUT", "users", "Invalidated session token");
    }
    setCurrentUser(null);
    setToken(null);
  };

  // 3. Create event simulation
  const handleSimulateCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must login to create an event!");
      return;
    }
    if (currentUser.role !== "organizer" && currentUser.role !== "admin") {
      const err = { detail: "Resource forbidden. Authorization roles required: ['organizer', 'admin']" };
      addHttpLog("POST", "/api/v1/events", 403, createEventForm, err);
      return;
    }

    const newEv: DBEvent = {
      id: dbEvents.length + 101,
      title: createEventForm.title || "Standard Community Workshop",
      description: createEventForm.description || "Synthesizer programming and event configurations.",
      categoryId: Number(createEventForm.categoryId),
      venue: createEventForm.venue || "Silicon Alley Sandbox A",
      dateTime: new Date(createEventForm.dateTime).toISOString(),
      ticketPrice: Number(createEventForm.ticketPrice),
      maxCapacity: Number(createEventForm.maxCapacity),
      organizerId: currentUser.id,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString()
    };

    setDbEvents(prev => [...prev, newEv]);
    addAuditLog(currentUser.fullName, "CREATE_EVENT", "events", `Created new event "${newEv.title}" at ${newEv.venue} with pricing $${newEv.ticketPrice}. Max capacity: ${newEv.maxCapacity}`);
    addHttpLog("POST", "/api/v1/events", 201, createEventForm, newEv);

    // Reset create event form
    setCreateEventForm({
      title: "",
      description: "",
      categoryId: 1,
      venue: "",
      dateTime: "2026-06-30T18:00",
      ticketPrice: 45.00,
      maxCapacity: 100
    });
  };

  // 4. Booking Tickets Simulation (With capacity and overbooking checks!)
  const handleSimulateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first to purchase event tickets.");
      return;
    }

    const event = dbEvents.find(ev => ev.id === Number(bookingForm.eventId));
    if (!event) {
      const err = { detail: "Event item not found in records." };
      addHttpLog("POST", "/api/v1/bookings", 404, bookingForm, err);
      return;
    }

    // Measure existing seats confirmed
    const occupiedSeats = dbBookings
      .filter(b => b.eventId === event.id && b.status === "confirmed")
      .reduce((sum, b) => sum + b.ticketCount, 0);

    const availableSeats = event.maxCapacity - occupiedSeats;

    if (availableSeats < bookingForm.ticketCount) {
      const failDetail = `Overbooking Prevention Triggered. Requested ${bookingForm.ticketCount} tickets, but only ${availableSeats} remaining seats are listed.`;
      addHttpLog("POST", "/api/v1/bookings", 400, bookingForm, { detail: failDetail });
      addAuditLog("SYSTEM SECURITY", "OVERBOOK_PREVENTION", "bookings", `Blocked booking of ${bookingForm.ticketCount} tickets for event "${event.title}" by ${currentUser.fullName} due to low capacity (${availableSeats}/${event.maxCapacity} available)`);
      return;
    }

    // Success transaction scenario
    const finalPrice = event.ticketPrice * bookingForm.ticketCount;
    const bookingId = dbBookings.length + 501;
    const generatedTx = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const generatedQr = `/static/qrcodes/booking_${bookingId}_${Math.random().toString(36).substring(2, 6)}.png`;

    const newBooking: DBBooking = {
      id: bookingId,
      userId: currentUser.id,
      eventId: event.id,
      status: "confirmed",
      ticketCount: bookingForm.ticketCount,
      totalPrice: finalPrice,
      qrCodePath: generatedQr,
      createdAt: new Date().toISOString(),
      paymentStatus: "completed",
      transactionId: generatedTx
    };

    // Insert associated physical UUID tickets for scan purposes
    const newTkList: DBTicket[] = [];
    for (let i = 1; i <= bookingForm.ticketCount; i++) {
      const ticketUuid = `ticket-uuid-${currentUser.fullName.toLowerCase().split(' ')[0]}-${bookingId}-${i}`;
      const newTicket: DBTicket = {
        id: dbTickets.length + i + 9000,
        bookingId: bookingId,
        ticketUuid: ticketUuid,
        status: "valid",
        scannedAt: null
      };
      newTkList.push(newTicket);
      // Auto pre-populate QR scanning field helper
      if (i === 1) {
        setTicketUuidToVerify(ticketUuid);
      }
    }

    setDbBookings(prev => [...prev, newBooking]);
    setDbTickets(prev => [...prev, ...newTkList]);

    // Send transaction email confirmation mock
    const confirmationMail: DBNotification = {
      id: dbNotifications.length + 1,
      userId: currentUser.id,
      subject: `Booking Confirmation: ${event.title}`,
      message: `Your booking for ${bookingForm.ticketCount} seats for "${event.title}" has been payment processed! Total charged: $${finalPrice.toFixed(2)}. TX ID: ${generatedTx}. Scan your ticket using QR-UUID: "${newTkList[0].ticketUuid}" to check-in.`,
      isSent: true,
      sentAt: new Date().toISOString()
    };
    setSimulatedInbox(prev => [confirmationMail, ...prev]);

    addAuditLog(currentUser.fullName, "CREATE_BOOKING", "bookings", `Booked ${bookingForm.ticketCount} tickets for "${event.title}". Price: $${finalPrice}. Occupancy: ${occupiedSeats + bookingForm.ticketCount}/${event.maxCapacity}`);
    addHttpLog("POST", "/api/v1/bookings", 201, bookingForm, newBooking);
  };

  // 5. Booking cancellation simulator
  const handleCancelBooking = (bookingId: number) => {
    if (!currentUser) return;
    const booking = dbBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const event = dbEvents.find(e => e.id === booking.eventId);

    const updatedBookings = dbBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: "cancelled" as const };
      }
      return b;
    });
    setDbBookings(updatedBookings);

    // Cancel matching tickets
    const updatedTickets = dbTickets.map(t => {
      if (t.bookingId === bookingId) {
        return { ...t, status: "cancelled" as const };
      }
      return t;
    });
    setDbTickets(updatedTickets);

    // Simulated email cancellation alert
    const cancelMail: DBNotification = {
      id: dbNotifications.length + 1,
      userId: booking.userId,
      subject: `Booking Cancellation: ${event?.title || "Ticket Refund"}`,
      message: `Your ticket booking (ID: ${bookingId}) has been cancelled and deactivated successfully in our records.`,
      isSent: true,
      sentAt: new Date().toISOString()
    };
    setSimulatedInbox(prev => [cancelMail, ...prev]);

    addAuditLog(currentUser.fullName, "CANCEL_BOOKING", "bookings", `Cancelled booking ID: ${bookingId} for event "${event?.title}". All associated entry key tickets deactivated.`);
    addHttpLog("POST", `/api/v1/bookings/${bookingId}/cancel`, 200, null, { ...booking, status: "cancelled" });
  };

  // 6. QR Ticket check-in verification simulation
  const handleSimulateTicketVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketUuidToVerify.trim()) {
      alert("Please provide a Ticket UUID hash to verify check-in!");
      return;
    }

    const ticket = dbTickets.find(t => t.ticketUuid === ticketUuidToVerify.trim());

    if (!ticket) {
      const errRes = { valid: false, message: "Invalid Ticket QR code. Match not found." };
      setVerificationResult(errRes);
      addHttpLog("POST", "/api/v1/bookings/verify-ticket", 200, { ticket_uuid: ticketUuidToVerify }, errRes);
      addAuditLog("GATE OPERATOR", "VERIFY_TICKET_FAILED", "tickets", `Access DENIED for ticket hash: ${ticketUuidToVerify}. UUID does not exist.`);
      return;
    }

    if (ticket.status === "cancelled") {
      const errRes = { valid: false, message: "Validation Failed: This ticket has been cancelled." };
      setVerificationResult(errRes);
      addHttpLog("POST", "/api/v1/bookings/verify-ticket", 200, { ticket_uuid: ticketUuidToVerify }, errRes);
      addAuditLog("GATE OPERATOR", "VERIFY_TICKET_CANCELLED", "tickets", `Access DENIED: Ticket ${ticketUuidToVerify} was cancelled.`);
      return;
    }

    if (ticket.status === "used") {
      const errRes = { valid: false, message: "Security Alert: Repeat Usage! This ticket has already been checked-in.", scanned_at: ticket.scannedAt };
      setVerificationResult(errRes);
      addHttpLog("POST", "/api/v1/bookings/verify-ticket", 200, { ticket_uuid: ticketUuidToVerify }, errRes);
      addAuditLog("GATE ALERT", "TICKET_DOUBLE_SCAN", "tickets", `Security alert triggered! Ticket ${ticketUuidToVerify} scanned twice at corporate gate.`);
      return;
    }

    // Success check-in! Update ticket state to USED
    const updatedTickets = dbTickets.map(t => {
      if (t.ticketUuid === ticketUuidToVerify) {
        return { ...t, status: "used" as const, scannedAt: new Date().toISOString() };
      }
      return t;
    });
    setDbTickets(updatedTickets);

    const booking = dbBookings.find(b => b.id === ticket.bookingId);
    const buyer = dbUsers.find(u => u.id === booking?.userId);
    const event = dbEvents.find(ev => ev.id === booking?.eventId);

    const successRes = {
      valid: true,
      message: "Ticket check-in successful! Allowed entry.",
      event_title: event?.title || "Special Program",
      attendee_name: buyer?.fullName || "Verified Buyer",
      scanned_at: new Date().toISOString()
    };
    setVerificationResult(successRes);

    addAuditLog("GATE CHECK-IN", "TICKET_VERIFIED", "tickets", `Checked in attendee ${buyer?.fullName} for event "${event?.title}" using ticket hash: ${ticketUuidToVerify}`);
    addHttpLog("POST", "/api/v1/bookings/verify-ticket", 200, { ticket_uuid: ticketUuidToVerify }, successRes);
  };

  // 7. Admin Admin user block sim
  const handleSimulateBlockUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "admin") {
      alert("Only a Platform Administrator can block profiles.");
      return;
    }

    const targetId = Number(selectedUserToBlock);
    if (targetId === currentUser.id) {
      alert("Cannot block yourself!");
      return;
    }

    const updatedUsers = dbUsers.map(u => {
      if (u.id === targetId) {
        return { ...u, isBlocked: blockState };
      }
      return u;
    });
    setDbUsers(updatedUsers);

    const targetUser = dbUsers.find(u => u.id === targetId);
    addAuditLog(currentUser.fullName, "BLOCK_USER_ADMIN", "users", `Set block state of ${targetUser?.fullName} to : ${blockState}`);
    addHttpLog("PUT", `/api/v1/admin/users/${targetId}/block?block_state=${blockState}`, 200, null, { ...targetUser, isBlocked: blockState });
  };

  // Quick Action AI prompts helper
  const handleAiQuickPrompt = async (promptText: string) => {
    setAiInput(promptText);
    await handleAiSubmit(null, promptText);
  };

  // Submit request to Google GenAI server
  const handleAiSubmit = async (e: React.FormEvent | null, overridePrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = overridePrompt || aiInput;
    if (!promptToSend.trim()) return;

    setAiLoading(true);
    setAiInput("");

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `User is viewing Python FastAPI Event management API code files: Specifically "${selectedFile.name}".\n\nUser Question:\n${promptToSend}\n\nPlease generate a precise python code addition or architectural tip with zero fluff.`
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setAiChat(prev => [...prev, { query: promptToSend, reply: data.reply }]);
      } else if (data.error) {
        setAiChat(prev => [...prev, { query: promptToSend, reply: `Server Error: ${data.error}` }]);
      }
    } catch (err: any) {
      setAiChat(prev => [...prev, { query: promptToSend, reply: `Crashed while fetching: ${err.message || "Failed to contact proxy backend"}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Force seed database helper
  const resetDatabaseSeed = () => {
    setDbUsers(INITIAL_USERS);
    setDbBookings(INITIAL_BOOKINGS);
    setDbTickets(INITIAL_TICKETS);
    setDbNotifications(INITIAL_NOTIFICATIONS);
    setDbAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUser(INITIAL_USERS[2]); // Alice
    setToken("MOCK_JWT_HEADER_TOKEN_ALICE_ATTENDEE_5548");
    addHttpLog("GET", "/api/v1/admin/reset", 200, null, { message: "SQL tables truncated and re-populated with initial baseline records." });
    addAuditLog("SYSTEMADMIN", "DATABASE_RESET", "database", "Database re-seeded with pristine default structures");
  };

  // Copy code utility
  const copyCodeToClipboard = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Trigger individual file downloads
  const downloadFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter events display
  const filteredEvents = dbEvents.filter(ev => {
    if (eventCategoryFilter !== null && ev.categoryId !== eventCategoryFilter) return false;
    if (eventPriceFilter) {
      const maxPrice = parseFloat(eventPriceFilter);
      if (!isNaN(maxPrice) && ev.ticketPrice > maxPrice) return false;
    }
    return !ev.isDeleted;
  });

  return (
    <div id="developer-workspace" className="min-h-screen bg-slate-900 font-sans text-gray-100 flex flex-col md:overflow-hidden select-none">
      
      {/* 1. Header Toolbar */}
      <header id="header-nav" className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10 custom-shadow shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 text-slate-950 p-2.5 rounded-xl shadow-lg glow-teal">
            <Server size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight text-white leading-none">Event Management API System</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded uppercase font-semibold">Dev Studio</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Production-ready FastAPI backend & SQLite database interactive builder client-portal.</p>
          </div>
        </div>

        {/* Live Metrics Quick gauges */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-400">Mock FastAPI:</span>
            <span className="text-emerald-400 font-semibold">Port 8000 LIVE</span>
          </div>

          <div className="flex items-center gap-1.2 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
            <Database size={12} className="text-teal-400" />
            <span className="text-gray-400 text-[10px]">SQLite DB:</span>
            <span className="text-white font-semibold text-[10.5px]">
              {dbUsers.length + dbEvents.length + dbBookings.length} rows
            </span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg pl-2.5 pr-1.5 py-1">
              <Users size={13} className="text-teal-400" />
              <span className="text-gray-400">Auth Subject:</span>
              <span className="text-white bg-slate-800 px-2 py-0.5 rounded font-sans text-xs">
                {currentUser.fullName} ({currentUser.role})
              </span>
              <button 
                onClick={logoutSession} 
                title="Clear JWT Bearer session"
                className="hover:bg-rose-950 hover:text-rose-400 p-1 rounded text-gray-400 transition"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-900/30 rounded-lg px-2.5 py-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-400">Bearer Session:</span>
              <span className="text-rose-300 font-semibold uppercase">UNAUTHORIZED GUEST</span>
            </div>
          )}

          <button 
            onClick={resetDatabaseSeed}
            className="flex items-center gap-1.5 bg-teal-600/15 hover:bg-teal-500 hover:text-slate-950 text-teal-400 border border-teal-500/20 hover:border-teal-400 rounded-lg px-3 py-1.5 transition duration-150 cursor-pointer"
          >
            <RefreshCw size={13} className="animate-spin-slow" />
            <span>Reset Database Seed</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Divided Grid */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden min-h-0 bg-slate-950">
        
        {/* Sidebar Nav (High-Density Layout) */}
        <aside id="workspace-sidebar" className="w-full md:w-56 bg-slate-950 border-r border-slate-800 md:flex flex-col gap-1 p-1.5 shrink-0 select-none">
          <div className="text-[9px] text-gray-500 font-mono tracking-widest pl-2 uppercase py-1">DEV CONTROL SECTIONS</div>
          
          <button 
            onClick={() => setActiveTab("playground")}
            className={`w-[100%] flex items-center justify-between text-left px-2 py-1 rounded text-xs transition font-semibold cursor-pointer ${activeTab === "playground" ? "bg-teal-500/10 text-teal-400 border border-teal-500/15" : "text-gray-400 hover:bg-slate-900/40 hover:text-gray-200"}`}
          >
            <div className="flex items-center gap-1.5">
              <Activity size={14} className={activeTab === "playground" ? "text-teal-400" : "text-slate-500"} />
              <span>Swagger API Playground</span>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono px-1 py-0.2 rounded leading-none">Simulate</span>
          </button>

          <button 
            onClick={() => setActiveTab("code")}
            className={`w-[100%] flex items-center justify-between text-left px-2 py-1 rounded text-xs transition font-semibold cursor-pointer ${activeTab === "code" ? "bg-teal-500/10 text-teal-400 border border-teal-500/15" : "text-gray-400 hover:bg-slate-900/40 hover:text-gray-200"}`}
          >
            <div className="flex items-center gap-1.5">
              <FileCode size={14} className={activeTab === "code" ? "text-teal-400" : "text-slate-500"} />
              <span>FastAPI Code Explorer</span>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1 py-0.2 rounded leading-none">{API_CODE_FILES.length} files</span>
          </button>

          <button 
            onClick={() => setActiveTab("database")}
            className={`w-[100%] flex items-center justify-between text-left px-2 py-1 rounded text-xs transition font-semibold cursor-pointer ${activeTab === "database" ? "bg-teal-500/10 text-teal-400 border border-teal-500/15" : "text-gray-400 hover:bg-slate-900/40 hover:text-gray-200"}`}
          >
            <div className="flex items-center gap-1.5">
              <Database size={14} className={activeTab === "database" ? "text-teal-400" : "text-slate-500"} />
              <span>SQLite relational ERD</span>
            </div>
            <span className="text-[9px] bg-blue-950 text-blue-400 font-mono px-1 py-0.2 rounded leading-none">Schema</span>
          </button>

          <button 
            onClick={() => setActiveTab("ai")}
            className={`w-[100%] flex items-center justify-between text-left px-2 py-1 rounded text-xs transition font-semibold cursor-pointer ${activeTab === "ai" ? "bg-teal-500/10 text-teal-400 border border-teal-500/15" : "text-gray-400 hover:bg-slate-900/40 hover:text-gray-200"}`}
          >
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className={activeTab === "ai" ? "text-teal-400" : "text-slate-500"} />
              <span>AI Code Companion</span>
            </div>
            <span className="text-[9px] bg-purple-950 text-purple-400 font-mono px-1 py-0.2 rounded leading-none">Gemini AI</span>
          </button>

          <button 
            onClick={() => setActiveTab("architecture")}
            className={`w-[100%] flex items-center justify-between text-left px-2 py-1 rounded text-xs transition font-semibold cursor-pointer ${activeTab === "architecture" ? "bg-teal-500/10 text-teal-400 border border-teal-500/15" : "text-gray-400 hover:bg-slate-900/40 hover:text-gray-200"}`}
          >
            <div className="flex items-center gap-1.5">
              <Layers size={14} className={activeTab === "architecture" ? "text-teal-400" : "text-slate-500"} />
              <span>Architecture Flows</span>
            </div>
            <span className="text-[9px] bg-amber-950 text-amber-300 font-mono px-1 py-0.2 rounded leading-none">Sequence</span>
          </button>

          <button 
            onClick={() => setActiveTab("setup")}
            className={`w-[100%] flex items-center justify-between text-left px-2 py-1 rounded text-xs transition font-semibold cursor-pointer ${activeTab === "setup" ? "bg-teal-500/10 text-teal-400 border border-teal-500/15" : "text-gray-400 hover:bg-slate-900/40 hover:text-gray-200"}`}
          >
            <div className="flex items-center gap-1.5">
              <Settings size={14} className={activeTab === "setup" ? "text-teal-400" : "text-slate-500"} />
              <span>Local Deployment Guide</span>
            </div>
            <span className="text-[9px] bg-teal-950 text-teal-300 font-mono px-1 py-0.2 rounded leading-none">Setup</span>
          </button>

          {/* Mailbox Simulator */}
          <div className="mt-auto border-t border-slate-800 pt-4 p-2">
            <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-wider font-mono px-1.5 mb-2">
              <span className="flex items-center gap-1"><Mail size={12} className="text-gray-400" /> SIMULATED SMTP BOX</span>
              <span className="text-teal-400 font-bold bg-teal-900/40 px-1 rounded animate-pulse">{simulatedInbox.length} MSG</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {simulatedInbox.length === 0 ? (
                <div className="text-[11px] text-gray-500 italic px-1.5 py-1">No output emails sent out. Execute a transaction.</div>
              ) : (
                simulatedInbox.map((msg, index) => (
                  <div key={index} className="bg-slate-900 rounded border border-slate-800 p-2 text-[11px] select-text">
                    <div className="flex items-center justify-between font-bold text-gray-300">
                      <span className="truncate">{msg.subject}</span>
                      <span className="text-[9px] text-gray-500 shrink-0 font-mono">Mail {index + 1}</span>
                    </div>
                    <p className="text-gray-400 mt-1 line-clamp-3">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Core Content Body (Vertical Overflow Hidden to scroll sections) */}
        <main id="main-portal-workspace" className="flex-1 flex flex-col md:overflow-hidden min-h-0 bg-slate-950">
          
          {/* Active section dispatcher rendering (High-Density Layout) */}
          <div className="flex-1 p-2 md:p-3 md:overflow-y-auto">
            
            {/* 2.1 Tab: Codebase tree explorer */}
            {activeTab === "code" && (
              <div className="h-full flex flex-col md:flex-row gap-5">
                
                {/* File Navigator Tree (Left Column 1/3) */}
                <div className="w-full md:w-72 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col select-none shrink-0">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">FastAPI Files tree</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 rounded">{API_CODE_FILES.length} Files</span>
                  </div>

                  {/* Modules Grouping */}
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    
                    {/* Core System Structures */}
                    <div>
                      <h4 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest pl-1 mb-1 font-semibold">Core Engine (.py)</h4>
                      <div className="space-y-1">
                        {API_CODE_FILES.filter(f => f.category === "core").map(file => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.8 rounded text-xs flex items-center justify-between transition cursor-pointer ${selectedFile.path === file.path ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:bg-slate-800 hover:text-slate-200"}`}
                          >
                            <span className="truncate">{file.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono lowercase">{file.language}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Routers */}
                    <div>
                      <h4 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest pl-1 mb-1 font-semibold">API Router controllers</h4>
                      <div className="space-y-1">
                        {API_CODE_FILES.filter(f => f.category === "routers").map(file => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.8 rounded text-xs flex items-center justify-between transition cursor-pointer ${selectedFile.path === file.path ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:bg-slate-800 hover:text-slate-200"}`}
                          >
                            <span className="truncate">{file.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono">route</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest pl-1 mb-1 font-semibold">Services & Jobs</h4>
                      <div className="space-y-1">
                        {API_CODE_FILES.filter(f => f.category === "services").map(file => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.8 rounded text-xs flex items-center justify-between transition cursor-pointer ${selectedFile.path === file.path ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:bg-slate-800 hover:text-slate-200"}`}
                          >
                            <span className="truncate">{file.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono">job</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test Suite */}
                    <div>
                      <h4 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest pl-1 mb-1 font-semibold">Pytest Unit Suite</h4>
                      <div className="space-y-1">
                        {API_CODE_FILES.filter(f => f.category === "tests").map(file => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.8 rounded text-xs flex items-center justify-between transition cursor-pointer ${selectedFile.path === file.path ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:bg-slate-800 hover:text-slate-200"}`}
                          >
                            <span className="truncate">{file.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono">pytest</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deployment & Configs */}
                    <div>
                      <h4 className="text-[10px] font-mono text-teal-400 uppercase tracking-widest pl-1 mb-1 font-semibold">Local Deployment configs</h4>
                      <div className="space-y-1">
                        {API_CODE_FILES.filter(f => f.category === "deployment").map(file => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.8 rounded text-xs flex items-center justify-between transition cursor-pointer ${selectedFile.path === file.path ? "bg-teal-500/10 text-teal-400" : "text-gray-400 hover:bg-slate-800 hover:text-slate-200"}`}
                          >
                            <span className="truncate">{file.name}</span>
                            <span className="text-[9px] text-gray-500 font-mono lowercase">{file.language}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* File Content Code Viewer (Right Column 2/3) */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-w-0">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60 rounded-t-xl select-none">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-teal-400" />
                      <span className="font-mono text-sm text-white font-medium">{selectedFile.path}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyCodeToClipboard(selectedFile.content, selectedFile.name)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-xs transition duration-150 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={13} />
                        <span>{copiedFile === selectedFile.name ? "Copied!" : "Copy Code"}</span>
                      </button>

                      <button 
                        onClick={() => downloadFile(selectedFile)}
                        className="bg-teal-600 hover:bg-teal-500 text-slate-950 px-2.5 py-1.5 rounded text-xs font-bold transition duration-150 flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download .py</span>
                      </button>
                    </div>
                  </div>

                  {/* Highlighted text block */}
                  <div className="flex-1 p-5 overflow-auto font-mono text-xs text-gray-300 bg-slate-950 rounded-b-xl select-text leading-relaxed">
                    <pre className="whitespace-pre">{selectedFile.content}</pre>
                  </div>
                </div>

              </div>
            )}

            {/* 2.2 Tab: Swagger Interactive Playground */}
            {activeTab === "playground" && (
              <div className="space-y-6">
                
                {/* Intro warning banner explaining simulation state */}
                <div className="bg-slate-900 border-l-4 border-teal-500 p-4 rounded-r-lg flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Server size={18} className="text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-white">Live Mock FastAPI Endpoint simulation playground ACTIVE</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Interact with endpoints below. The playground acts as a fully compliant Python FastAPI engine (utilizing Bcrypt password hashes, capacity validations, double-scan check, and real-time database transactions). All requests log down to the Outboard Console!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Split: API routes and Live Dashboard charts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                  
                  {/* Left Col (Swagger actions inputs - col-span-7) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Tags Section 1: Authentication */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
                        <Lock size={16} className="text-emerald-400" />
                        <h3 className="font-display font-medium text-sm text-slate-200">User Identification & AUTH (Bcrypt & JWT)</h3>
                      </div>

                      {/* Flex flow registration and login */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Box 1: Register */}
                        <form onSubmit={handleSimulateRegister} className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-emerald-900/40 text-emerald-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase">POST /register</span>
                            <span className="text-[11px] text-gray-500 font-sans">1. Signup Account</span>
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Email address</label>
                            <input 
                              type="email" 
                              required
                              placeholder="e.g. alice@gmail.com" 
                              value={authForm.email}
                              onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Full Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Alice Attendee" 
                              value={authForm.fullName}
                              onChange={e => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Assigned Role</label>
                            <select 
                              value={authForm.role}
                              onChange={e => setAuthForm(prev => ({ ...prev, role: e.target.value as any }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                            >
                              <option value="attendee">Attendee (Discover & Book)</option>
                              <option value="organizer">Organizer (Create Events & View Stats)</option>
                              <option value="admin">Admin (Manage Users & Analytics)</option>
                            </select>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-1.5 rounded transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Execute Registration</span>
                          </button>
                        </form>

                        {/* Box 2: Login */}
                        <form onSubmit={handleSimulateLogin} className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-emerald-900/40 text-emerald-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase">POST /login</span>
                              <span className="text-[11px] text-gray-500 font-sans">2. Fetch JWT Session</span>
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1">Email address</label>
                              <select 
                                value={loginForm.email}
                                onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                              >
                                {dbUsers.map(u => (
                                  <option key={u.id} value={u.email}>{u.fullName} ({u.role.toUpperCase()})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1">Plain Password</label>
                              <input 
                                type="password" 
                                disabled
                                placeholder="[Automatically Bcrypt Encrypted]" 
                                className="w-full bg-slate-900/50 border border-slate-800/80 rounded px-2 py-1 text-xs text-gray-500 cursor-not-allowed italic"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs py-1.5 rounded transition duration-150 flex items-center justify-center gap-1 cursor-pointer mt-4"
                          >
                            <Play size={13} />
                            <span>Simulate Access Token JWT</span>
                          </button>
                        </form>

                      </div>
                    </div>

                    {/* Tags Section 2: Bookings and QR verification */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <QrCode size={16} className="text-teal-400" />
                          <h3 className="font-display font-medium text-sm text-slate-200">Ticket bookings & QR Verification checkin</h3>
                        </div>
                        <span className="text-[10px] bg-red-950 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-900/30 font-mono">Capacity Guards Active</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Booking Form Box */}
                        <form onSubmit={handleSimulateBooking} className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-blue-900/40 text-blue-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase">POST /bookings</span>
                            <span className="text-[11px] text-gray-500 font-sans">Book Tickets</span>
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Target Event Program</label>
                            <select 
                              value={bookingForm.eventId}
                              onChange={e => setBookingForm(prev => ({ ...prev, eventId: Number(e.target.value) }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                            >
                              {dbEvents.map(ev => {
                                const occupied = dbBookings.filter(b => b.eventId === ev.id && b.status === "confirmed").reduce((s, b) => s + b.ticketCount, 0);
                                return (
                                  <option key={ev.id} value={ev.id}>
                                    {ev.title} (₹{ev.ticketPrice} - Capacity: {occupied}/{ev.maxCapacity} seats)
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Ticket Quantity to book</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="1" 
                                max="10" 
                                required
                                value={bookingForm.ticketCount}
                                onChange={e => setBookingForm(prev => ({ ...prev, ticketCount: Number(e.target.value) }))}
                                className="w-20 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white text-center focus:outline-none focus:border-teal-500"
                              />
                              <span className="text-gray-400 text-xs italic">Max 10 per transaction checkout</span>
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs py-2 rounded transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <DollarSign size={13} />
                            <span>Simulate Checkout Payment</span>
                          </button>
                        </form>

                        {/* Scanner / Verification Form Box */}
                        <form onSubmit={handleSimulateTicketVerify} className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-pink-900/40 text-pink-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase">POST /verify-ticket</span>
                              <span className="text-[11px] text-gray-500 font-sans">Check-In QR Scan</span>
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1">Ticket Scanner UUID Key</label>
                              <input 
                                type="text" 
                                required
                                placeholder="ticket-uuid-alice-01-art" 
                                value={ticketUuidToVerify}
                                onChange={e => setTicketUuidToVerify(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                              />
                            </div>

                            {/* Help list of valid UUIDs currently in DB */}
                            <div className="bg-slate-900/60 rounded p-2 text-[10px] space-y-1 block border border-slate-800 mb-2">
                              <div className="text-gray-400 font-semibold uppercase font-mono tracking-wide">Available Keys in Mock DB (Click to load):</div>
                              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                {dbTickets.map(t => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTicketUuidToVerify(t.ticketUuid)}
                                    className={`truncate max-w-[140px] px-1 bg-slate-800 hover:bg-slate-700 text-[9.5px] rounded font-mono ${t.status === "used" ? "text-amber-500 line-through" : t.status === "cancelled" ? "text-rose-500 line-through" : "text-teal-400"}`}
                                    title={`Status: ${t.status}`}
                                  >
                                    {t.ticketUuid}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-pink-600 hover:bg-pink-500 text-slate-950 font-bold text-xs py-2 rounded transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <QrCode size={13} />
                            <span>Verify Check-In Code</span>
                          </button>
                        </form>

                      </div>

                      {/* Display QR Verification scan result widget */}
                      {verificationResult && (
                        <div className={`mt-4 border p-3 rounded-lg flex items-start gap-3 text-xs ${verificationResult.valid ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" : "bg-rose-950/40 border-rose-500/30 text-rose-300"}`}>
                          {verificationResult.valid ? <CheckCircle2 className="shrink-0 text-emerald-400 mt-0.5" size={16} /> : <XCircle className="shrink-0 text-rose-400 mt-0.5" size={16} />}
                          <div>
                            <div className="font-bold uppercase tracking-wider text-[11px] mb-1">Gate Entry Verdict: {verificationResult.valid ? "APPROVED" : "REJECTED"}</div>
                            <p>{verificationResult.message}</p>
                            {verificationResult.valid && (
                              <div className="mt-1.5 grid grid-cols-2 gap-x-4 text-[11px] font-semibold text-gray-300">
                                <div>Event Name: <span className="text-white">{verificationResult.event_title}</span></div>
                                <div>Attendee: <span className="text-white">{verificationResult.attendee_name}</span></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Organizers and Administrators custom features */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
                        <ShieldCheck size={16} className="text-amber-400" />
                        <h3 className="font-display font-medium text-sm text-slate-200">Organizer & Administrative Controls</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Event creator */}
                        <form onSubmit={handleSimulateCreateEvent} className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-amber-900/30 text-amber-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase">POST /events</span>
                            <span className="text-[11px] text-gray-500 font-sans">Organizer Build Event</span>
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Event Target Title</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. NextGen Micro-Synthesizers Showcase" 
                              value={createEventForm.title}
                              onChange={e => setCreateEventForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1">Max capacity</label>
                              <input 
                                type="number" 
                                required
                                value={createEventForm.maxCapacity}
                                onChange={e => setCreateEventForm(prev => ({ ...prev, maxCapacity: Number(e.target.value) }))}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500 text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1">Ticket price (₹)</label>
                              <input 
                                type="number" 
                                required
                                value={createEventForm.ticketPrice}
                                onChange={e => setCreateEventForm(prev => ({ ...prev, ticketPrice: Number(e.target.value) }))}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500 text-center"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-gray-400 font-semibold mb-1">Category</label>
                            <select 
                              value={createEventForm.categoryId}
                              onChange={e => setCreateEventForm(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                            >
                              <option value="1">Tech Conferences</option>
                              <option value="2">Music Festivals</option>
                              <option value="3">Art Exhibitions</option>
                              <option value="4">Sports Tournaments</option>
                            </select>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-1.5 rounded transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Publish Event</span>
                          </button>
                        </form>

                        {/* Administrator block suspicious profiles */}
                        <form onSubmit={handleSimulateBlockUser} className="bg-slate-950 border border-slate-800/60 p-4 rounded-lg flex flex-col justify-between">
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-900/30 font-mono px-1.5 py-0.5 rounded font-bold uppercase">PUT /admin/users/block</span>
                              <span className="text-[11px] text-gray-500 font-sans">Admin Profile Guard</span>
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1 font-mono">Select SUSPICIOUS Profile</label>
                              <select 
                                value={selectedUserToBlock}
                                onChange={e => setSelectedUserToBlock(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                              >
                                {dbUsers.map(u => (
                                  <option key={u.id} value={u.id}>ID {u.id}: {u.fullName} ({u.role.toUpperCase()}) {u.isBlocked ? "[BLOCKED]" : ""}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] text-gray-400 font-semibold mb-1">Action State</label>
                              <select 
                                value={blockState ? "true" : "false"}
                                onChange={e => setBlockState(e.target.value === "true")}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                              >
                                <option value="true">Force BLOCK User account</option>
                                <option value="false">Unblock & Restore privileges</option>
                              </select>
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs py-2 rounded transition duration-150 flex items-center justify-center gap-1 cursor-pointer mt-4"
                          >
                            <Trash2 size={13} />
                            <span>Commit Admin State</span>
                          </button>
                        </form>

                      </div>
                    </div>

                  </div>

                  {/* Right Col: Live Metrics Board & Simulated Server Terminal (Col span-5) */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Event Discovery Catalog view with reactive filter buttons */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Search size={15} className="text-teal-400" />
                          <h3 className="font-display font-medium text-sm text-slate-200">Event Discovery (FastAPI filter simulator)</h3>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">Found: {filteredEvents.length}</span>
                      </div>

                      {/* Filter switches toolbar mapping */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button
                          onClick={() => setEventCategoryFilter(null)}
                          className={`px-2 py-1 rounded text-[10.5px] transition cursor-pointer font-sans ${eventCategoryFilter === null ? "bg-teal-500 text-slate-950 font-bold" : "bg-slate-950 border border-slate-800 text-gray-400 hover:text-white"}`}
                        >
                          All Categories
                        </button>
                        {dbCategories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setEventCategoryFilter(cat.id)}
                            className={`px-2 py-1 rounded text-[10.5px] transition cursor-pointer font-sans ${eventCategoryFilter === cat.id ? "bg-teal-500 text-slate-950 font-bold" : "bg-slate-950 border border-slate-800 text-gray-400 hover:text-white"}`}
                          >
                            {cat.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      <div className="mb-4">
                        <label className="block text-[10px] uppercase text-gray-500 font-semibold mb-1">Max Price filter limit (₹)</label>
                        <input
                          type="range"
                          min="0"
                          max="400"
                          step="10"
                          value={eventPriceFilter || "400"}
                          onChange={e => setEventPriceFilter(e.target.value === "400" ? "" : e.target.value)}
                          className="w-full accent-teal-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                          <span>₹0</span>
                          <span className="text-teal-400 font-bold">{eventPriceFilter ? `Over ₹${eventPriceFilter} hidden` : "Showing all prices"}</span>
                          <span>₹400</span>
                        </div>
                      </div>

                      {/* Vertical scrolling list of mock events */}
                      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                        {filteredEvents.map(ev => {
                          const catName = dbCategories.find(c => c.id === ev.categoryId)?.name || "Public";
                          const occupiedSeats = dbBookings
                            .filter(b => b.eventId === ev.id && b.status === "confirmed")
                            .reduce((sum, b) => sum + b.ticketCount, 0);
                          const remaining = ev.maxCapacity - occupiedSeats;

                          return (
                            <div key={ev.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5 hover:border-teal-500/30 transition">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-white leading-tight">{ev.title}</h4>
                                <span className="bg-slate-900 text-teal-400 font-mono px-1.5 py-0.5 rounded border border-slate-800 shrink-0 font-bold">₹{ev.ticketPrice.toFixed(2)}</span>
                              </div>
                              <p className="text-gray-400 text-[11px] line-clamp-2 leading-relaxed">{ev.description}</p>
                              
                              <div className="grid grid-cols-2 gap-y-1 pt-1 ml-0.5 text-[10px] text-gray-500 font-mono">
                                <div className="flex items-center gap-1">
                                  <Calendar size={11} className="text-slate-600" />
                                  <span>{ev.dateTime.substring(0,10)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Filter size={11} className="text-slate-600" />
                                  <span className="truncate">{catName}</span>
                                </div>
                                <div className="col-span-2 flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-1">
                                    <Users size={11} className="text-slate-600" />
                                    <span>Capacity: {occupiedSeats} / {ev.maxCapacity} seats</span>
                                  </div>
                                  <span className={`px-1.5 py-0.2 rounded font-sans text-[9px] ${remaining === 0 ? "bg-rose-950/60 text-rose-400 font-bold" : remaining <= 3 ? "bg-amber-950/60 text-amber-400" : "bg-emerald-950/60 text-emerald-400"}`}>
                                    {remaining === 0 ? "SOLD OUT" : `${remaining} seat${remaining > 1 ? "s":""} left`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Organizer Dashboard Reports stats card (Recharts alternative inline SVGs) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <TrendingDown size={15} className="text-teal-400 rotate-180" />
                          <h3 className="font-display font-medium text-sm text-slate-200">Organizer Live Performance Revenue Metrics</h3>
                        </div>
                        <span className="text-[10px] bg-slate-850 text-emerald-400 font-mono px-1.5 py-0.5 rounded font-bold">RECHARTS API</span>
                      </div>

                      {/* Aggregate Metrics Widgets */}
                      {(() => {
                        const confBookings = dbBookings.filter(b => b.status === "confirmed");
                        const totalRev = confBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                        const totalTkCount = confBookings.reduce((sum, b) => sum + b.ticketCount, 0);

                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                                <span className="text-[10px] text-gray-500 uppercase font-bold font-mono tracking-wide block">Total Ticket Revenue</span>
                                <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">₹{totalRev.toFixed(2)}</span>
                              </div>
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                                <span className="text-[10px] text-gray-500 uppercase font-bold font-mono tracking-wide block">Tickets Sold Over Platform</span>
                                <span className="text-lg font-bold font-mono text-teal-400 mt-1 block">{totalTkCount} Seats</span>
                              </div>
                            </div>

                            {/* Custom interactive SVG Bar Chart to visualize sales by Event */}
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                              <div className="text-[10.5px] text-gray-400 font-semibold mb-3">Event Occupancy & Load Ratios (Confirmed Tickets)</div>
                              
                              <div className="space-y-3 font-mono text-[10px]">
                                {dbEvents.map(ev => {
                                  const sold = dbBookings
                                    .filter(b => b.eventId === ev.id && b.status === "confirmed")
                                    .reduce((sum, b) => sum + b.ticketCount, 0);
                                  const pct = Math.min((sold / ev.maxCapacity) * 100, 100);

                                  return (
                                    <div key={ev.id} className="space-y-1">
                                      <div className="flex justify-between text-gray-400">
                                        <span className="truncate max-w-[200px] font-semibold text-white">{ev.title}</span>
                                        <span>{sold}/{ev.maxCapacity} ({pct.toFixed(0)}%)</span>
                                      </div>
                                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                        <div 
                                          className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-rose-500" : pct >= 50 ? "bg-amber-500" : "bg-teal-500"}`}
                                          style={{ width: `${pct}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* 2.3 Tab: Database Model & Table inspector visualizer */}
            {activeTab === "database" && (
              <div className="space-y-6">
                
                {/* Visual ER diagram graphic (High-Density) */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md select-none">
                  <div className="pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="text-teal-400" size={14} />
                      <h3 className="font-display font-bold text-xs text-slate-200">SQLite Relational ER Scheme & Mapping Visualizer</h3>
                    </div>
                    <span className="text-[9px] bg-slate-850 text-gray-300 font-mono px-1.5 py-0.3 rounded">SQLite Database Sandbox</span>
                  </div>

                  {/* Flow Map boxes representing tables */}
                  <div id="erd-node-canvas" className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800/60 overflow-x-auto">
                    
                    {/* Block Table 1: Users */}
                    <div 
                      onClick={() => setInspectTable("users")}
                      className={`cursor-pointer rounded border p-2 font-mono text-[10px] leading-tight transition ${inspectTable === "users" ? "bg-teal-950/30 border-teal-500" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"}`}
                    >
                      <div className="bg-teal-900/30 text-teal-400 font-bold px-1 py-0.3 rounded text-center mb-1.5 text-[10.5px]">users (Entity User)</div>
                      <div className="space-y-1 text-gray-400">
                        <div>🔑 id: <span className="text-white">Integer (PK)</span></div>
                        <div>📧 email: <span className="text-white">String(150)</span></div>
                        <div>🔒 hashed_pass: <span className="text-white">String(255)</span></div>
                        <div>👤 full_name: <span className="text-white">String(100)</span></div>
                        <div>🛡️ role: <span className="text-amber-400">SQLEnum(Role)</span></div>
                        <div>⚡ is_active: <span className="text-white">Boolean</span></div>
                      </div>
                    </div>

                    {/* Block Table 2: Events */}
                    <div 
                      onClick={() => setInspectTable("events")}
                      className={`cursor-pointer rounded border p-2 font-mono text-[10px] leading-tight transition ${inspectTable === "events" ? "bg-teal-950/30 border-teal-500" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"}`}
                    >
                      <div className="bg-teal-900/30 text-teal-400 font-bold px-1 py-0.3 rounded text-center mb-1.5 text-[10.5px]">events (Entity Event)</div>
                      <div className="space-y-1 text-gray-400">
                        <div>🔑 id: <span className="text-white">Integer (PK)</span></div>
                        <div>📝 title: <span className="text-white">String(200)</span></div>
                        <div>🔌 category_id: <span className="text-teal-400">Integer (FK)</span></div>
                        <div>📍 venue: <span className="text-white">String(200)</span></div>
                        <div>⏰ date_time: <span className="text-white">DateTime</span></div>
                        <div>💵 ticket_price: <span className="text-white">Float</span></div>
                        <div>🛡️ organizer_id: <span className="text-teal-400">Integer (FK)</span></div>
                      </div>
                    </div>

                    {/* Block Table 3: Bookings */}
                    <div 
                      onClick={() => setInspectTable("bookings")}
                      className={`cursor-pointer rounded border p-2 font-mono text-[10px] leading-tight transition ${inspectTable === "bookings" ? "bg-teal-950/30 border-teal-500" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"}`}
                    >
                      <div className="bg-teal-900/30 text-teal-400 font-bold px-1 py-0.3 rounded text-center mb-1.5 text-[10.5px]">bookings (Entity Booking)</div>
                      <div className="space-y-1 text-gray-400">
                        <div>🔑 id: <span className="text-white">Integer (PK)</span></div>
                        <div>🛡️ user_id: <span className="text-teal-400">Integer (FK)</span></div>
                        <div>🔌 event_id: <span className="text-teal-400">Integer (FK)</span></div>
                        <div>⚡ status: <span className="text-amber-400">SQLEnum</span></div>
                        <div>🎟️ ticket_count: <span className="text-white">Integer</span></div>
                        <div>💵 total_price: <span className="text-white">Float</span></div>
                        <div>📸 qr_image_path: <span className="text-white">String(255)</span></div>
                      </div>
                    </div>

                    {/* Block Table 4: Tickets */}
                    <div 
                      onClick={() => setInspectTable("tickets")}
                      className={`cursor-pointer rounded border p-2 font-mono text-[10px] leading-tight transition ${inspectTable === "tickets" ? "bg-teal-950/30 border-teal-500" : "bg-slate-900/40 border-slate-800 hover:border-slate-700"}`}
                    >
                      <div className="bg-teal-900/30 text-teal-400 font-bold px-1 py-0.3 rounded text-center mb-1.5 text-[10.5px]">tickets (Entity Ticket)</div>
                      <div className="space-y-1 text-gray-400">
                        <div>🔑 id: <span className="text-white">Integer (PK)</span></div>
                        <div>🔌 booking_id: <span className="text-teal-400">Integer (FK)</span></div>
                        <div>🏷️ ticket_uuid: <span className="text-white">String(100)</span></div>
                        <div>🛡️ status: <span className="text-amber-400">SQLEnum</span></div>
                        <div>⏰ scanned_at: <span className="text-white">DateTime</span></div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Table Data Inspector list (High-Density) */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-md min-w-0">
                  <div className="flex flex-wrap items-center justify-between pb-2 mb-3 border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="text-teal-400" size={13} />
                      <h4 className="font-display font-medium text-xs text-slate-200">
                        SQLite Row Inspector: <span className="text-teal-400 font-mono text-[10px] font-bold bg-slate-950 px-1.5 py-0.5 rounded">SELECT * FROM {inspectTable}</span>
                      </h4>
                    </div>

                    {/* Selector tabs */}
                    <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {(["users", "events", "bookings", "tickets", "notifications"] as const).map(tbl => (
                        <button
                          key={tbl}
                          onClick={() => setInspectTable(tbl)}
                          className={`px-2 py-1 text-[10.5px] rounded transition duration-150 cursor-pointer font-semibold capitalize ${inspectTable === tbl ? "bg-teal-500 text-slate-950" : "text-gray-400 hover:text-white"}`}
                        >
                          {tbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Structured Rows Table display */}
                  <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-[350px]">
                    <table className="w-full text-[11.2px] text-left text-gray-300 font-mono select-text">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[9.5px] tracking-wider border-b border-slate-800">
                        {inspectTable === "users" && (
                          <tr>
                            <th className="px-4 py-2.5">id</th>
                            <th className="px-4 py-2.5">email</th>
                            <th className="px-4 py-2.5">full_name</th>
                            <th className="px-4 py-2.5">role</th>
                            <th className="px-4 py-2.5">is_blocked</th>
                            <th className="px-4 py-2.5">created_at</th>
                          </tr>
                        )}
                        {inspectTable === "events" && (
                          <tr>
                            <th className="px-4 py-2.5">id</th>
                            <th className="px-4 py-2.5">title</th>
                            <th className="px-4 py-2.5">category_id</th>
                            <th className="px-4 py-2.5">ticket_price (₹)</th>
                            <th className="px-4 py-2.5">max_capacity</th>
                            <th className="px-4 py-2.5">organizer_id</th>
                          </tr>
                        )}
                        {inspectTable === "bookings" && (
                          <tr>
                            <th className="px-4 py-2.5">id</th>
                            <th className="px-4 py-2.5">user_id</th>
                            <th className="px-4 py-2.5">event_id</th>
                            <th className="px-4 py-2.5">status</th>
                            <th className="px-4 py-2.5">seats_qty</th>
                            <th className="px-4 py-2.5">total_price (₹)</th>
                            <th className="px-4 py-2.5">transaction_id</th>
                          </tr>
                        )}
                        {inspectTable === "tickets" && (
                          <tr>
                            <th className="px-4 py-2.5">id</th>
                            <th className="px-4 py-2.5">booking_id</th>
                            <th className="px-4 py-2.5">ticket_uuid</th>
                            <th className="px-4 py-2.5">status</th>
                            <th className="px-4 py-2.5">scanned_at</th>
                          </tr>
                        )}
                        {inspectTable === "notifications" && (
                          <tr>
                            <th className="px-4 py-2.5">id</th>
                            <th className="px-4 py-2.5">user_id</th>
                            <th className="px-4 py-2.5">subject</th>
                            <th className="px-4 py-2.5">is_sent</th>
                            <th className="px-4 py-2.5">sent_at</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                        {inspectTable === "users" && dbUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-850 transition">
                            <td className="px-4 py-2.5 font-bold text-white">{u.id}</td>
                            <td className="px-4 py-2.5">{u.email}</td>
                            <td className="px-4 py-2.5 text-gray-200">{u.fullName}</td>
                            <td className="px-4 py-2.5 text-amber-400 uppercase text-[10px] font-bold">{u.role}</td>
                            <td className="px-4 py-2.5">{u.isBlocked ? <span className="text-rose-400 font-bold bg-rose-950/40 px-1 rounded uppercase text-[10px]">BLOCKED</span> : <span className="text-slate-500">FALSE</span>}</td>
                            <td className="px-4 py-2.5 text-gray-500">{u.createdAt.substring(0, 16).replace('T', ' ')}</td>
                          </tr>
                        ))}
                        {inspectTable === "events" && dbEvents.map(e => (
                          <tr key={e.id} className="hover:bg-slate-850 transition">
                            <td className="px-4 py-2.5 font-bold text-white">{e.id}</td>
                            <td className="px-4 py-2.5 text-gray-200 truncate max-w-[200px]" title={e.title}>{e.title}</td>
                            <td className="px-4 py-2.5">{e.categoryId}</td>
                            <td className="px-4 py-2.5 text-emerald-400 font-bold">₹{e.ticketPrice.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-gray-200">{e.maxCapacity}</td>
                            <td className="px-4 py-2.5">{e.organizerId}</td>
                          </tr>
                        ))}
                        {inspectTable === "bookings" && dbBookings.map(b => (
                          <tr key={b.id} className="hover:bg-slate-850 transition">
                            <td className="px-4 py-2.5 font-bold text-white">{b.id}</td>
                            <td className="px-4 py-2.5">{b.userId}</td>
                            <td className="px-4 py-2.5">{b.eventId}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-1.5 py-0.2 rounded font-sans text-[10px] font-bold text-center capitalize ${b.status === "confirmed" ? "bg-emerald-950/50 text-emerald-400" : "bg-rose-950/50 text-rose-400"}`}>{b.status}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center text-gray-200">{b.ticketCount}</td>
                            <td className="px-4 py-2.5 text-emerald-400 font-bold">₹{b.totalPrice.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-gray-400">{b.transactionId}</td>
                          </tr>
                        ))}
                        {inspectTable === "tickets" && dbTickets.map(t => (
                          <tr key={t.id} className="hover:bg-slate-850 transition">
                            <td className="px-4 py-2.5 font-bold text-white">{t.id}</td>
                            <td className="px-4 py-2.5">{t.bookingId}</td>
                            <td className="px-4 py-2.5 font-mono text-gray-300">{t.ticketUuid}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${t.status === "valid" ? "text-teal-400 bg-teal-950/40" : t.status === "used" ? "text-amber-500 bg-amber-950/40" : "text-rose-500 bg-rose-950/40"}`}>{t.status.toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-400">{t.scannedAt ? t.scannedAt.substring(11, 19) : <span className="text-slate-600 italic">Not set</span>}</td>
                          </tr>
                        ))}
                        {inspectTable === "notifications" && simulatedInbox.map(n => (
                          <tr key={n.id} className="hover:bg-slate-850 transition">
                            <td className="px-4 py-2.5 font-bold text-white">{n.id}</td>
                            <td className="px-4 py-2.5">{n.userId}</td>
                            <td className="px-4 py-2.5 text-gray-200 truncate max-w-[250px]">{n.subject}</td>
                            <td className="px-4 py-2.5">{n.isSent ? <span className="text-emerald-400">TRUE</span> : <span className="text-gray-500">FALSE</span>}</td>
                            <td className="px-4 py-2.5 text-gray-500">{n.sentAt.substring(11, 19)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 2.4 Tab: AI Developer Sandbox Companion */}
            {activeTab === "ai" && (
              <div className="h-full flex flex-col gap-5 select-none">
                
                {/* Visual companion header */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center gap-5 shrink-0">
                  <div className="bg-purple-500/10 text-purple-400 p-3.5 rounded-xl border border-purple-500/15 shadow glow-teal">
                    <Cpu size={30} className="animate-pulse duration-1000" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-[15px] text-white">Full-Stack Server-Bound Gemini Code Sandbox</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Query our server-side isolated Gemini model to optimize your endpoints, write Alembic custom columns migrations, generate pytest concurrency assertions, or add custom fields to any entity.
                    </p>
                  </div>
                </div>

                {/* Split grid: Prompt suggestions + Conversation window */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 min-h-0 bg-slate-950">
                  
                  {/* Left Column (Suggestions prompts) */}
                  <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 shrink-0 md:overflow-y-auto">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pl-1 font-semibold mb-1 block">Helpful schema prompt triggers</span>
                    
                    <button
                      type="button"
                      onClick={() => handleAiQuickPrompt("Extend models.py and schemas.py to support custom geolocation bounds coordinates (Latitude & Longitude) for Event venues.")}
                      className="text-left bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/30 p-2.5 rounded-lg text-xs space-y-1 transition duration-150 cursor-pointer"
                    >
                      <div className="text-purple-400 font-semibold uppercase text-[10px] font-mono select-none">📍 Geolocation Bounds</div>
                      <p className="text-gray-400 select-none">Generate coordinates custom SQLAlchemy and Pydantic schemas.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAiQuickPrompt("Add password reset tokens endpoints inside auth.py and routers/auth.py using temporal encryption hashes.")}
                      className="text-left bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/30 p-2.5 rounded-lg text-xs space-y-1 transition duration-150 cursor-pointer"
                    >
                      <div className="text-purple-400 font-semibold uppercase text-[10px] font-mono select-none">🔑 Temporal Safe Reset</div>
                      <p className="text-gray-400 select-none">Generate password tokens triggers and validations.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAiQuickPrompt("Write a complete conftest.py transaction teardown block simulating pytest concurrent overbooking attempts.")}
                      className="text-left bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/30 p-2.5 rounded-lg text-xs space-y-1 transition duration-150 cursor-pointer"
                    >
                      <div className="text-purple-400 font-semibold uppercase text-[10px] font-mono select-none">🧪 Pytest Concurrency Tests</div>
                      <p className="text-gray-400 select-none">Write transactional, zero-overlap concurrent seat checkers tests.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAiQuickPrompt("Develop soft delete filters using SQLAlchemy custom clause parameters in queries.")}
                      className="text-left bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/30 p-2.5 rounded-lg text-xs space-y-1 transition duration-150 cursor-pointer"
                    >
                      <div className="text-purple-400 font-semibold uppercase text-[10px] font-mono select-none">🗑️ Automatic Soft Delete</div>
                      <p className="text-gray-400 select-none">Configure ORM default scopes to ignore deleted event records.</p>
                    </button>
                    
                  </div>

                  {/* Right Column (Chat box container - overflow-auto) */}
                  <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between overflow-hidden">
                    
                    {/* Chat scroll content */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs bg-slate-950/50 block select-text">
                      {aiChat.map((chat, idx) => (
                        <div key={idx} className="space-y-2.5">
                          {/* User bubbles */}
                          <div className="flex items-start justify-end">
                            <div className="bg-purple-900 text-purple-100 p-2.5 rounded-xl max-w-[80%] font-medium">
                              {chat.query}
                            </div>
                          </div>
                          {/* AI Response layout */}
                          <div className="flex items-start gap-2 max-w-[90%]">
                            <div className="bg-slate-800 text-slate-200 p-3 rounded-xl leading-relaxed whitespace-pre-wrap select-text markdown-body border border-slate-700/60 font-mono text-[11px]">
                              {chat.reply}
                            </div>
                          </div>
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="flex items-center gap-2 text-purple-400 font-mono italic">
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Gemini compiling sandbox response...</span>
                        </div>
                      )}
                    </div>

                    {/* Chat Prompt Input Field */}
                    <form onSubmit={(e) => handleAiSubmit(e)} className="border-t border-slate-800 p-3 bg-slate-900 flex items-center gap-2">
                      <input 
                        type="text" 
                        required
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        placeholder="Ask anything about FastAPI events backend codebase..." 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 select-text font-sans"
                      />
                      <button 
                        type="submit"
                        disabled={aiLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold p-2.5 rounded-lg transition duration-150 inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                      >
                        <Send size={15} />
                      </button>
                    </form>

                  </div>

                </div>

              </div>
            )}

            {/* 2.5 Tab: Interactive Architecture Flows diagrams */}
            {activeTab === "architecture" && (
              <div className="space-y-6 select-none">
                
                {/* Grid of beautiful architectural cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: Overbooking prevention engine flow */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                    <h3 className="font-display font-semibold text-sm text-[14px] text-white flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
                      <span className="w-2.5 h-2.5 rounded justify-center bg-red-500"></span>
                      <span>Atomic Overbooking Protection Check (FastAPI)</span>
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      How our backend SQLAlchemy operations block concurrency overflow when multiple buyers attempt simultaneous seat registrations:
                    </p>

                    {/* CSS styled vertical progress map */}
                    <div className="space-y-3 font-mono text-[10.5px]">
                      
                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/80">
                        <span className="bg-slate-900 text-rose-400 font-bold px-1.5 py-0.5 rounded border border-slate-800 shrink-0">Step 1</span>
                        <div className="text-gray-300">Client triggers transactional POST payload to <span className="text-white">/api/v1/bookings</span>.</div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/80 pl-6">
                        <span className="bg-slate-900 text-rose-400 font-bold px-1.5 py-0.5 rounded border border-slate-800 shrink-0">Step 2</span>
                        <div className="text-gray-300">Query total <span className="text-white">func.sum()</span> of confirmed tickets of target event.</div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/80 pl-12 border-l-2 border-l-teal-500">
                        <span className="bg-slate-900 text-teal-400 font-bold px-1.5 py-0.5 rounded border border-slate-800 shrink-0">Step 3</span>
                        <div className="text-gray-300">
                          Capacity check validation: <span className="text-teal-400 font-semibold">is capacity &gt;= requested?</span>.
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/80 pl-6">
                        <span className="bg-slate-900 text-green-400 font-bold px-1.5 py-0.5 rounded border border-slate-800 shrink-0">Step 4</span>
                        <div className="text-gray-300">Commit checkout, append row to <span className="text-white">bookings</span>, generate ticket UUID.</div>
                      </div>

                    </div>
                  </div>

                  {/* Card 2: Ticket QR scan check-in verification loop */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                    <h3 className="font-display font-semibold text-sm text-[14px] text-white flex items-center gap-2 pb-2 mb-3 border-b border-slate-800">
                      <span className="w-2.5 h-2.5 rounded justify-center bg-teal-500"></span>
                      <span>Ticket Check-In Gateway (Double Scan Alert Verification)</span>
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Security checkpoints verify incoming scanning QR tokens and prevent physical spoofing or repeat bypasses:
                    </p>

                    <div className="space-y-3 font-mono text-[10.5px]">
                      
                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/40">
                        <span className="bg-slate-900 text-slate-400 font-bold px-1.5 rounded">Check 1</span>
                        <div className="text-gray-300">Check if ticket UUID hash exists in <span className="text-white">tickets</span>. Unmatched = Code 404 block.</div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/40">
                        <span className="bg-slate-900 text-slate-400 font-bold px-1.5 rounded">Check 2</span>
                        <div className="text-gray-300">Verify <span className="text-rose-500 font-semibold">status != 'cancelled'</span>. Cancelled tickets throw invalid status error.</div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/40 border-l-2 border-l-rose-500 bg-rose-950/10">
                        <span className="bg-slate-900 text-rose-400 font-bold px-1.5 rounded">Check 3</span>
                        <div className="text-gray-300">Verify <span className="text-amber-500 font-semibold">status != 'used'</span>. If scanned twice, trigger instant gate alarms!</div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800/40">
                        <span className="bg-slate-900 text-emerald-400 font-bold px-1.5 rounded">Check 4</span>
                        <div className="text-gray-300">Set Status to <span className="text-emerald-400 font-semibold">USED</span>, write timestamp token gate, allow entry.</div>
                      </div>

                    </div>
                  </div>

                  {/* Card 3: Unified Network service layout (Docker Compose Architecture - Compact High-Density) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow md:col-span-2">
                    <h3 className="font-display font-bold text-xs text-white flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800">
                      <Settings size={13} className="text-teal-400" />
                      <span>Compose Multi-Container Network services model</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-normal mb-2">
                      Isolated multi-service design running Redis caching storage alongside local SQLite dynamic file bindings:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-[10px] font-mono">
                      
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded-md space-y-1">
                        <span className="text-teal-400 font-bold uppercase tracking-wide">Client / Ingress Gate</span>
                        <p className="text-[9px] text-gray-500">Route mapping queries through public domains.</p>
                        <div className="bg-slate-900 text-[9px] p-0.5 rounded font-bold text-white border border-slate-850">Port 80 to Web</div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-2 rounded-md space-y-1 relative font-semibold">
                        <ArrowRight size={12} className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 text-slate-800 hidden md:block" />
                        <span className="text-emerald-400 font-bold uppercase tracking-wide">FastAPI Container</span>
                        <p className="text-[9px] text-gray-500">Runs Gunicorn workers serving dynamic endpoints.</p>
                        <div className="bg-slate-900 text-[9px] p-0.5 rounded font-bold text-white border border-slate-850">Port 8000 (FastAPI)</div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-2 rounded-md space-y-1 relative">
                        <ArrowRight size={12} className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 text-slate-800 hidden md:block" />
                        <span className="text-pink-400 font-bold uppercase tracking-wide">SQLite File & Redis Cache</span>
                        <p className="text-[9px] text-gray-500">Fast persistent SQLite DB alongside caching memory.</p>
                        <div className="bg-slate-900 text-[9px] p-0.5 rounded font-bold text-white border border-slate-850">SQLite / Port 6379</div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 2.6 Tab: Deployment Setup Guides */}
            {activeTab === "setup" && (
              <div className="space-y-6 font-mono text-xs select-text leading-relaxed">
                
                {/* Setup command box */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                  <span className="text-[10.5px] uppercase font-bold text-teal-400 tracking-wider">Step 1: System Requirements & Packages</span>
                  <p className="text-gray-400 mt-1 mb-3 text-xs font-sans">Verify local system python installs and lock virtual workspace packages as described in project files:</p>
                  
                  <div className="bg-slate-950 p-4 rounded-lg font-mono text-gray-300 border border-slate-850">
                    <div># 1. Clone or unpack full API codes repository folder</div>
                    <div className="text-teal-400">$ git clone https://github.com/fastapi-event/backend_api.git</div>
                    <div className="text-white">$ cd backend_api</div>
                    <br/>
                    <div># 2. Setup isolated package requirements wrapper</div>
                    <div className="text-white">$ python3 -m venv venv</div>
                    <div className="text-white">$ source venv/bin/activate</div>
                    <br/>
                    <div># 3. Pip install dependencies including security contexts and jwt</div>
                    <div className="text-teal-400">$ pip install -r requirements.txt</div>
                  </div>
                </div>

                {/* Setup command box 2 */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Step 2: Initialize Docker Infrastructure Services</span>
                  <p className="text-gray-400 mt-0.5 mb-2 text-xs font-sans">Boot persistent caching redis server local container mapping SQLite DB:</p>
                  
                  <div className="bg-slate-950 p-3 rounded-md font-mono text-[11px] text-gray-300 border border-slate-850">
                    <div># Compile and deploy Redis cache service on local machine</div>
                    <div className="text-teal-400">$ docker-compose up --build -d</div>
                    <br/>
                    <div># Verify running containers (Web app & Redis)</div>
                    <div className="text-white">$ docker-compose ps</div>
                  </div>
                </div>

                {/* Setup command box 3 */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Step 3: Database Models & migrations (Alembic)</span>
                  <p className="text-gray-400 mt-0.5 mb-2 text-xs font-sans">Migrate tables structures to local SQLite instance safely using Alembic migrations:</p>
                  
                  <div className="bg-slate-950 p-3 rounded-md font-mono text-[11px] text-gray-300 border border-slate-850">
                    <div># Apply migration revisions onto SQLite head database model</div>
                    <div className="text-teal-400">$ alembic upgrade head</div>
                    <br/>
                    <div># Create new automatic migration revision if you modify models.py</div>
                    <div className="text-white">$ alembic revision --autogenerate -m "add_custom_field_schema"</div>
                    <div className="text-teal-400">$ alembic upgrade head</div>
                  </div>
                </div>

                {/* Setup command box 4 */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                  <span className="text-[10.5px] uppercase font-bold text-teal-400 tracking-wider">Step 4: Pytest checking unit coverage</span>
                  <p className="text-gray-400 mt-1 mb-3 text-xs font-sans">Execute testing contexts (simulates zero-dependency testing with dynamic SQLite database models):</p>
                  
                  <div className="bg-slate-950 p-4 rounded-lg font-mono text-gray-300 border border-slate-850">
                    <div># Execute dynamic pytests coverage checkers</div>
                    <div className="text-teal-400">$ pytest -v -s</div>
                    <br/>
                    <div># Check testing logs coverage details</div>
                    <div className="text-white">rootdir: /app, configfile: pytest.ini</div>
                    <div className="text-emerald-400">plugins: cov-4.1.0, env-1.0.0</div>
                    <div className="text-emerald-400">test_auth.py: APPROVED, Token matching: SUCCESS, double-bookings: TRAPPED</div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* 3. Global Outboard Logs Viewer Terminal Panel (High-Density) */}
          <footer id="developer-terminal" className="bg-slate-950 border-t border-slate-800 h-36 shrink-0 flex flex-col md:overflow-hidden select-none">
            <div className="bg-slate-900/60 px-5 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs tracking-wider">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-teal-400" />
                <span className="font-mono text-slate-300 font-semibold uppercase">API HTTP Server Console Logs (Port 8000 Outboard Feed)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                <span>[Uvicorn Workers: 4 Active]</span>
                <button 
                  onClick={() => setHttpLogs([{ id: "log_init", method: "GET", path: "/", status: 200, timestamp: new Date().toLocaleTimeString(), response: { status: "healthy" } }])}
                  className="bg-slate-955 hover:bg-slate-800 text-teal-400 px-2 py-0.5 rounded border border-slate-800 cursor-pointer text-[9px]"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Scrollable HTTP console screen */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-1 bg-slate-950/80 block select-text text-gray-400">
              {httpLogs.map(log => {
                const getStatusColor = (s: number) => {
                  if (s < 300) return "text-emerald-400";
                  if (s < 400) return "text-cyan-400";
                  return "text-rose-400";
                };

                const getMethodColor = (m: string) => {
                  if (m === "GET") return "text-blue-400 font-bold";
                  if (m === "POST") return "text-green-400 font-bold";
                  if (m === "PUT") return "text-amber-400 font-bold";
                  return "text-red-400 font-bold";
                };

                return (
                  <div key={log.id} className="border-b border-slate-900 pb-1 flex flex-col gap-1 hover:bg-slate-900/40 px-2 rounded">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-600">[{log.timestamp}]</span>
                      <span className="text-gray-500 font-bold">INFO: 127.0.0.1:55428 -</span>
                      <span className={getMethodColor(log.method)}>"{log.method} {log.path}"</span>
                      <span className={getStatusColor(log.status)}>{log.status} {log.status === 201 ? "Created" : log.status === 400 ? "Bad Request" : log.status === 401 ? "Unauthorized" : log.status === 403 ? "Forbidden" : "OK"}</span>
                    </div>
                    {log.payload && (
                      <div className="text-[10px] text-slate-500 pl-4">
                        Request Parameters: <span className="text-slate-400 font-mono">{JSON.stringify(log.payload)}</span>
                      </div>
                    )}
                    <div className="text-[10px] pl-4 text-slate-400 flex items-start gap-1">
                      <span className="text-slate-600 shrink-0">↪ Response Payload:</span>
                      <span className="font-mono text-teal-300/90">{JSON.stringify(log.response)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </footer>

        </main>

      </div>

    </div>
  );
}
