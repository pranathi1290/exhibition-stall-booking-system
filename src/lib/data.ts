export type DemoExhibition = {
  id: string;
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  bannerUrl: string;
  status: "ACTIVE" | "DRAFT" | "CLOSED";
};

export type DemoStall = {
  id: string;
  exhibitionId: string;
  stallNumber: string;
  width: number;
  length: number;
  area: number;
  price: number;
  advancePercentage: number;
  status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
  positionX: number;
  positionY: number;
};

export const exhibitions: DemoExhibition[] = [
  {
    id: "expo-1",
    name: "India Build Expo 2026",
    description:
      "A leading construction, architecture, and industrial innovation showcase for infrastructure leaders and investors.",
    venue: "Bengaluru International Exhibition Centre",
    startDate: "2026-09-12",
    endDate: "2026-09-15",
    bannerUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    status: "ACTIVE",
  },
  {
    id: "expo-2",
    name: "Healthcare Innovation Summit",
    description:
      "An international trade fair covering digital health, biotech, hospital infrastructure, and wellness technology.",
    venue: "Mumbai Convention Centre",
    startDate: "2026-10-02",
    endDate: "2026-10-05",
    bannerUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    status: "ACTIVE",
  },
];

export const stalls: DemoStall[] = [
  { id: "stall-101", exhibitionId: "expo-1", stallNumber: "A-101", width: 4, length: 5, area: 20, price: 50000, advancePercentage: 50, status: "AVAILABLE", positionX: 40, positionY: 35 },
  { id: "stall-102", exhibitionId: "expo-1", stallNumber: "A-102", width: 4, length: 5, area: 20, price: 50000, advancePercentage: 50, status: "HELD", positionX: 48, positionY: 35 },
  { id: "stall-103", exhibitionId: "expo-1", stallNumber: "A-103", width: 4, length: 5, area: 20, price: 50000, advancePercentage: 50, status: "BOOKED", positionX: 56, positionY: 35 },
  { id: "stall-104", exhibitionId: "expo-1", stallNumber: "A-104", width: 6, length: 8, area: 48, price: 84500, advancePercentage: 50, status: "AVAILABLE", positionX: 64, positionY: 35 },
  { id: "stall-105", exhibitionId: "expo-1", stallNumber: "A-105", width: 6, length: 8, area: 48, price: 84500, advancePercentage: 50, status: "BLOCKED", positionX: 72, positionY: 35 },
  { id: "stall-201", exhibitionId: "expo-1", stallNumber: "B-201", width: 5, length: 8, area: 40, price: 72000, advancePercentage: 50, status: "AVAILABLE", positionX: 40, positionY: 60 },
  { id: "stall-202", exhibitionId: "expo-1", stallNumber: "B-202", width: 5, length: 8, area: 40, price: 72000, advancePercentage: 50, status: "AVAILABLE", positionX: 48, positionY: 60 },
  { id: "stall-203", exhibitionId: "expo-1", stallNumber: "B-203", width: 5, length: 8, area: 40, price: 72000, advancePercentage: 50, status: "BOOKED", positionX: 56, positionY: 60 },
  { id: "stall-301", exhibitionId: "expo-2", stallNumber: "C-301", width: 4, length: 6, area: 24, price: 62000, advancePercentage: 50, status: "AVAILABLE", positionX: 34, positionY: 42 },
  { id: "stall-302", exhibitionId: "expo-2", stallNumber: "C-302", width: 4, length: 6, area: 24, price: 62000, advancePercentage: 50, status: "HELD", positionX: 44, positionY: 42 },
  { id: "stall-303", exhibitionId: "expo-2", stallNumber: "C-303", width: 4, length: 6, area: 24, price: 62000, advancePercentage: 50, status: "BOOKED", positionX: 54, positionY: 42 },
];

export const demoBookings: Record<string, unknown>[] = [];

export function getExhibitions() {
  return exhibitions;
}

export function getExhibitionById(id: string) {
  return exhibitions.find((exhibition) => exhibition.id === id) ?? null;
}

export function getStallsForExhibition(exhibitionId: string) {
  return stalls.filter((stall) => stall.exhibitionId === exhibitionId);
}

export function getStallById(stallId: string) {
  return stalls.find((stall) => stall.id === stallId) ?? null;
}

export function getStatusCount(exhibitionId: string, status: DemoStall["status"]) {
  return getStallsForExhibition(exhibitionId).filter((stall) => stall.status === status).length;
}

export function updateStallStatus(stallId: string, status: DemoStall["status"]) {
  const index = stalls.findIndex((stall) => stall.id === stallId);
  if (index === -1) return null;
  stalls[index] = { ...stalls[index], status };
  return stalls[index];
}

export function getBookingSummary(stallId: string) {
  const stall = getStallById(stallId);
  if (!stall) return null;
  const advanceAmount = stall.price * (stall.advancePercentage / 100);
  return {
    totalAmount: stall.price,
    advanceAmount,
    remainingAmount: stall.price - advanceAmount,
  };
}
