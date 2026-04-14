import { auth } from "@/lib/auth";
import { getChats, getMessagesCountByUserId } from "@/lib/db/queries";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") as string;
    const page = searchParams.get("page") as string;

    // count
    const count = await getMessagesCountByUserId();

    const { chats } = await getChats({
        page: parseInt(page),
        limit: parseInt(limit as string) || 10,
        userId: session.user.id
    });
    return NextResponse.json({
        limit,
        chats,
        count,
    }, {
        status: 200
    });
}
