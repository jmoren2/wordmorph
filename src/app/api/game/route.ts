import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const games = await prisma.game.findMany();
  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const { userId, lastPlayed, streak } = await req.json();

  const game = await prisma.game.upsert({
    where: { userId },
    update: { lastPlayed, streak },
    create: { userId, lastPlayed, streak },
  });

  return NextResponse.json(game);
}
