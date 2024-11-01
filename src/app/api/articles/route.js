import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    const article = await Article.create(data);

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    console.log("GET /api/articles called");
    await dbConnect();
    console.log("Connected to database");

    const articles = await Article.find({}).sort({ publishDate: -1 });
    console.log("Found articles:", articles);

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error("Error in GET /api/articles:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
