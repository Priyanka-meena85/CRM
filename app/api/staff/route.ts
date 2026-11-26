import { apiError, apiOk, withApiHandler } from "@/lib/api-response";
import { requireRole, requireSession, sanitizeText } from "@/lib/security";
import { StaffService } from "@/services/staff.service";

export async function GET() {
  return withApiHandler("GET /api/staff", async () => {
    const user = await requireSession();
    if (!user) return apiError("Unauthorized", 401);

    const staff = await StaffService.listWithPerformance();
    return apiOk(staff);
  });
}

export async function POST(req: Request) {
  return withApiHandler("POST /api/staff", async () => {
    const owner = await requireRole(["OWNER"]);
    if (!owner) return apiError("Forbidden: Sirf Owner team add kar sakta hai", 403);

    const body = await req.json();
    const name = sanitizeText(body?.name);
    const phone = sanitizeText(body?.phone);
    if (!name || !phone) {
      return apiError("Naam aur phone zaroori hai", 400);
    }

    const created = await StaffService.create({
      name,
      phone,
      email: body?.email ? sanitizeText(body.email) : undefined,
      password: typeof body?.password === "string" ? body.password : undefined,
      role: sanitizeText(body?.role) || "STAFF",
      targetMonthly: body?.targetMonthly,
      commissionPercent: body?.commissionPercent,
    });
    return apiOk(created, 201);
  });
}
