import { auth } from "@/lib/auth";
import { getPortfolioVanity } from "@/lib/db/queries";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/portfolio/vanity/[vanity]'>): Promise<NextResponse> {
    const { vanity } = await ctx.params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id)
        return NextResponse.json({ vanity: null }, { status: 401 });

    const isTaken = await getPortfolioVanity(vanity);
    return isTaken ?
        NextResponse.json({ message: "Portfolio vanity not available", available: false }, { status: 400 }) :
        NextResponse.json({ message: "Portfolio vanity available", available: true }, { status: 200 });
}