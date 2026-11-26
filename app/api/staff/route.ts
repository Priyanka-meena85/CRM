import { apiError, apiOk, withApiHandler } from "@/lib/api-response";
import { StaffService } from "@/services/staff.service";

export async function GET() {
  return withApiHandler("GET /api/staff", async () => {
    const staff = await StaffService.listWithPerformance();
    return apiOk(staff);
  });
}

export async function POST(req: Request) {
  return withApiHandler("POST /api/staff", async () => {
    const body = await req.json();
    if (!body?.name?.trim() || !body?.phone?.trim()) {
      return apiError("Naam aur phone zaroori hai", 400);
    }
    const created = await StaffService.create(body);
    return apiOk(created, 201);
  });
}
