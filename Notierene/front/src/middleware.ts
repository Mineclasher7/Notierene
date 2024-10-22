// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from 'axios';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('jwtToken'); // Retrieve the token from cookies

    // Modify the request headers to include the token if it exists
    if (token) {
        req.headers.set('Authorization', `Bearer ${token}`);
    }

    return NextResponse.next();
}

