import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const gameData = await prisma.game.findUnique({
    where: { userId: id },
  });

  return NextResponse.json(gameData);
}
