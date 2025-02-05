import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    // Ensure `id` exists and is valid
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch game data for the given user ID
    const gameData = await prisma.game.findUnique({
      where: { userId: id },
    });

    if (!gameData) {
      return NextResponse.json(
        { message: "No game data found for user" },
        { status: 404 }
      );
    }

    return NextResponse.json(gameData);
  } catch (error) {
    console.error("Error fetching game data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
