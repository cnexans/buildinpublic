import { NextResponse } from "next/server";
import { fetchAllMetrics } from "@/lib/posthog";

// Revalidate cache every hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const metrics = await fetchAllMetrics();
    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
