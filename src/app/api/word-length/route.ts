import { getDailyWord } from "../../../utils/wordService";

export async function GET() {
  const { length } = await getDailyWord();
  return Response.json({ length });
}
