import { auth } from "@/lib/auth";
import { getPortfolioByUserId } from "@/lib/db/queries";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id)
        return NextResponse.json({ vanity: null }, { status: 401 });

    const portfolio = await getPortfolioByUserId(session.user.id);
    if (portfolio) {
        return NextResponse.json({ portfolio }, { status: 200 });
    } else {
        return NextResponse.json({ porfolio: null }, { status: 200 });
    }
}
