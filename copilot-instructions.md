# Exhibition Stall Booking System — Copilot Instructions

You are assisting with the **Exhibition Stall Booking System**, a production web application for managing exhibition stall bookings with user registration, admin controls, and payment processing.

## Project Structure

```
src/
  app/
    globals.css, layout.tsx, page.tsx (public site)
    admin/
      page.tsx, login/ (admin portal)
    book/
      [stallId]/page.tsx (stall booking flow)
    exhibitions/
      [id]/page.tsx (exhibition details & layout)
    login/, register/ (user authentication)
  lib/
    booking.ts (booking business logic)
    data.ts (data fetching & queries)
    demo-store.ts (demo data)
    prisma.ts (database client)
prisma/
  schema.prisma (data models)
```

## Architecture Principles

### 1. Separation of Concerns
- **UI Components**: Render only; no business logic inside components
- **Server Actions / API Routes**: Handle all business logic, validation, and database operations
- **Libraries** (`src/lib/`): Pure functions for booking logic, payment verification, queries

### 2. Server-Side Validation & Safety
- **Always validate on the server** — never trust client-side confirmations
- **Double-booking protection**: Use database transactions and constraints
- **Payment verification**: Verify payment with Razorpay on the server before confirming booking
- **Stall status transitions**: Handle atomically with database locks/transactions

### 3. Clean Code Standards
- Type-safe with TypeScript
- Modular, testable functions
- Proper error handling and logging
- No hardcoded values; use configuration

## Key Features & Implementation Patterns

### Stall Status System

Four statuses with specific colors:
- **AVAILABLE** (green) — Open for booking
- **HELD** (yellow) — User in payment process; expires after 10 minutes
- **BOOKED** (red) — Claimed; no other user can book
- **BLOCKED** (gray) — Manually blocked by admin

**Implementation**:
- Store status in `Stall` model with `status` enum field
- Use **database transactions** to prevent race conditions
- Implement hold expiry logic (scheduled job or check on read)
- Check status before allowing booking; reject if not AVAILABLE

### Booking & Payment Flow

**Advance Payment**: 50% of total stall price

Example: Stall price ₹50,000 → Advance ₹25,000, Remaining ₹25,000

**Flow**:
1. User selects stall → Backend marks stall as HELD with timestamp
2. User initiates payment → Create Razorpay order for 50% amount
3. Payment succeeds → Verify with Razorpay server → Update stall to BOOKED → Create booking record
4. Payment fails/expires → Verify failure → Revert stall to AVAILABLE
5. Hold expiry (10 min) → Scheduled job or check-on-read logic

**Database Protection**:
- Use **unique constraints** or **pessimistic locks** to prevent concurrent bookings
- All payment-triggered updates must be transactional
- Verify payment on backend before any stall/booking changes

### Admin Portal Features

**Authentication**:
- Secure login (hash passwords with bcryptjs)
- Session management
- Admin-only routes

**Content Management**:
- Create/edit/delete exhibitions
- Manage stalls (number, dimensions, price, advance %, position)
- Block specific stalls
- Manually book/cancel bookings

**Booking & Payment Views**:
- List all bookings with filters (status, exhibition, date)
- Customer details & payment history
- Record remaining payment
- View stall availability heatmap

### User Website Features

**Public Views**:
- Exhibition list & details
- Stall layout (visual grid with X/Y positions)
- Stall number, size, price, status
- Color-coded status indicators

**User Account**:
- Register & login
- Browse exhibitions & stalls
- Book stall (pay 50% advance)
- View booking confirmation
- View booking history
- View remaining balance & payment details

## Database Schema Guidelines

### Models

**Exhibition**
- id, name, description, venue
- startDate, endDate
- bannerUrl / image
- status (ACTIVE, INACTIVE, ENDED)

**Stall**
- id, stallNumber, exhibitionId
- width, length, area (computed or stored)
- price, advancePercentage
- status (AVAILABLE, HELD, BOOKED, BLOCKED)
- positionX, positionY (for visual layout)
- heldUntil (nullable; timestamp for HELD expiry)

**User**
- id, email, password (hashed), name
- company, phone, address
- createdAt

**Booking**
- id, bookingNumber (unique, formatted)
- userId, exhibitionId, stallId
- totalAmount, advanceAmount, remainingAmount
- status (PENDING, CONFIRMED, CANCELLED)
- paymentStatus (PENDING, PARTIAL, COMPLETED)
- createdAt, updatedAt

**Payment**
- id, bookingId
- amount, paymentType (advance, remaining)
- gatewayTransactionId (Razorpay order/payment ID)
- status (PENDING, SUCCESS, FAILED)
- paymentDate, metadata

### Relationships
- Exhibition → Stalls (1:many)
- Exhibition → Bookings (1:many)
- User → Bookings (1:many)
- Stall → Bookings (1:many)
- Booking → Payments (1:many)

## Razorpay Integration

**When to call Razorpay**:
- **Server side only** — create orders, verify payments
- Never expose API keys to client

**Flow**:
1. Backend creates order: `razorpay.orders.create()` → returns orderId, amount
2. Client renders Razorpay checkout with orderId
3. On success, client sends payment ID to backend
4. Backend verifies: `razorpay.payments.fetch(paymentId)` → check status, amount
5. Only after verification, confirm booking

**Environment Variables**:
```
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=... (if using webhooks)
```

## Best Practices

### Transactions & Concurrency
```typescript
// Prevent double-booking with transaction
await prisma.$transaction(async (tx) => {
  // 1. Lock and check stall status
  const stall = await tx.stall.findUnique({
    where: { id: stallId }
  });
  if (stall.status !== 'AVAILABLE') throw new Error('Not available');
  
  // 2. Update stall to BOOKED
  await tx.stall.update({
    where: { id: stallId },
    data: { status: 'BOOKED' }
  });
  
  // 3. Create booking & payment records
  await tx.booking.create({ data: {...} });
  await tx.payment.create({ data: {...} });
});
```

### Hold Expiry
- Store `heldUntil` timestamp on stall when status = HELD
- Check on read: if current time > heldUntil, revert to AVAILABLE
- Optional: scheduled job to clean up expired holds

### Error Handling
- Validate input (Zod schemas)
- Catch and log errors with context
- Return meaningful error messages to client
- Never expose database errors to frontend

### Security Checklist
- [ ] Hash all passwords (bcryptjs)
- [ ] Validate all API inputs on server
- [ ] Check user ownership (user can only view/modify their own bookings)
- [ ] Admin routes require auth check
- [ ] Payment amounts verified against database records
- [ ] Razorpay signature verification (if using webhooks)
- [ ] No sensitive data in client-side state
- [ ] HTTPS in production

## File Organization for New Features

When adding features:
1. **Data models** → `prisma/schema.prisma`
2. **Business logic** → `src/lib/booking.ts` or new file in `src/lib/`
3. **Data queries** → `src/lib/data.ts`
4. **API routes / Server actions** → `src/app/api/...` or use Next.js Server Components
5. **UI Components** → `src/app/.../page.tsx` or extract to `src/components/`
6. **Types** → Colocate with domain (e.g., in `src/lib/booking.ts`)

## Testing & Validation

- Use Zod for schema validation on user input
- Add logging for payment operations
- Test double-booking scenarios with concurrent requests
- Verify payment cancellation reverting stall status
- Test hold expiry logic

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Framework | Next.js 16 (App Router) |
| Backend | Next.js Server Components / API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | bcryptjs (passwords), session-based or JWT |
| Payments | Razorpay (orders, payments, verification) |
| Validation | Zod |
| Styling | Tailwind CSS + PostCSS |

---

**When helping with this project:**
- Always prioritize server-side safety and validation
- Suggest transactions for multi-step operations
- Question any client-side payment confirmations
- Recommend modular, testable code patterns
- Flag potential race conditions or double-booking risks
