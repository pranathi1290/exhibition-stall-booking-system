import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function dateValue(value: Date | null | undefined) {
  return value ? value.toISOString() : "";
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      exhibition: true,
      stall: true,
      payments: { orderBy: { paymentDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Booking ID",
    "Booking Number",
    "Booking Status",
    "Payment Status",
    "Booking Created At",
    "Booking Updated At",
    "Customer ID",
    "Customer Name",
    "Customer Email",
    "Company",
    "Phone",
    "Address",
    "Exhibition ID",
    "Exhibition Name",
    "Exhibition Description",
    "Venue",
    "Start Date",
    "End Date",
    "Exhibition Status",
    "Stall ID",
    "Stall Number",
    "Stall Width",
    "Stall Length",
    "Stall Area",
    "Stall Price",
    "Advance Percentage",
    "Advance Amount",
    "Stall Status",
    "Position X",
    "Position Y",
    "Held Until",
    "Total Amount",
    "Booking Advance Amount",
    "Remaining Amount",
    "Total Paid",
    "Outstanding Amount",
    "Payment Records",
  ];

  const rows = bookings.map((booking) => {
    const paid = booking.payments
      .filter((payment) => payment.paymentStatus === "SUCCESS")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const paymentRecords = booking.payments.map((payment) => [
      payment.id,
      payment.amount.toString(),
      payment.paymentType,
      payment.paymentStatus,
      payment.razorpayOrderId || "",
      payment.razorpayPaymentId || "",
      payment.paymentGatewayTransactionId || "",
      dateValue(payment.paymentDate),
    ].join(" | ")).join(" || ");

    return [
      booking.id,
      booking.bookingNumber,
      booking.bookingStatus,
      booking.paymentStatus,
      dateValue(booking.createdAt),
      dateValue(booking.updatedAt),
      booking.user.id,
      booking.user.name,
      booking.user.email,
      booking.user.company,
      booking.user.phone,
      booking.user.address,
      booking.exhibition.id,
      booking.exhibition.name,
      booking.exhibition.description,
      booking.exhibition.venue,
      dateValue(booking.exhibition.startDate),
      dateValue(booking.exhibition.endDate),
      booking.exhibition.status,
      booking.stall.id,
      booking.stall.stallNumber,
      booking.stall.width,
      booking.stall.length,
      booking.stall.area,
      booking.stall.price,
      booking.stall.advancePercentage,
      booking.stall.advanceAmount,
      booking.stall.status,
      booking.stall.positionX,
      booking.stall.positionY,
      dateValue(booking.stall.heldUntil),
      booking.totalAmount,
      booking.advanceAmount,
      booking.remainingAmount,
      paid.toFixed(2),
      Math.max(0, Number(booking.totalAmount) - paid).toFixed(2),
      paymentRecords,
    ].map(csvCell).join(",");
  });

  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stall-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
