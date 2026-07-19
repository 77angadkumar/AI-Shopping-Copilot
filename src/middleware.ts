import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting in-memory logs (IP -> Timestamps of recent requests)
const rateLimitMap = new Map<string, number[]>();

// Rate limit settings: 60 requests per 60 seconds
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || (request as any).ip || "unknown-ip";
  const now = Date.now();

  // Retrieve previous logs for this IP
  const requests = rateLimitMap.get(ip) || [];

  // Filter logs to only keep those inside the active rate limiting window
  const activeRequests = requests.filter(time => now - time < WINDOW_MS);

  if (activeRequests.length >= MAX_REQUESTS) {
    console.warn(`[Rate Limit Exceeded] IP: ${ip} | Path: ${request.nextUrl.pathname}`);
    
    // Return standard JSON response for 429 Too Many Requests
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Too many requests. Please slow down and try again."
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60"
        }
      }
    );
  }

  // Record current request timestamp
  activeRequests.push(now);
  rateLimitMap.set(ip, activeRequests);

  // Allow request to proceed
  const response = NextResponse.next();
  
  // Append security headers
  response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(MAX_REQUESTS - activeRequests.length));
  
  return response;
}

// Config to only intercept API routes
export const config = {
  matcher: "/api/:path*"
};
