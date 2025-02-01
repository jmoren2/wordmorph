import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, lastPlayed, streak } = await req.json();

  const updatedGame = await prisma.game.upsert({
    where: { userId },
    update: { lastPlayed, streak },
    create: { userId, lastPlayed, streak },
  });

  return NextResponse.json(updatedGame);
}
