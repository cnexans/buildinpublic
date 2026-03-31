import { NextResponse } from "next/server";
import { fetchAggregatedMetrics } from "@/lib/posthog";

export const revalidate = 3600;

export async function GET() {
  try {
    const metrics = await fetchAggregatedMetrics();
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
