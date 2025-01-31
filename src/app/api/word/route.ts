import { getDailyWord } from "../../../utils/wordService";

export async function GET() {
  const { word } = await getDailyWord();
  console.log(word);
  
  return Response.json({ word });
}
