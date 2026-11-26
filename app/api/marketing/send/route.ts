import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, template, customerIds } = body;

    // In production, send WhatsApp messages via Twilio
    const sentCount = customerIds?.length || 0;

    const campaign = await prisma.marketingCampaign.create({
      data: {
        title: title || "Campaign",
        template: template || "",
        sentToCount: sentCount,
      },
    });

    return NextResponse.json({
      message: `"${title}" offer ${sentCount} customers ko bhej diya!`,
      campaign,
    });
  } catch (error) {
    return NextResponse.json({ error: "Campaign nahi bhej paya" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { id: "desc" },
      take: 20,
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
