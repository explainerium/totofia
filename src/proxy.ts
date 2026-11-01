import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { orderTokenCookie, RESET_TOKEN_COOKIE } from "./lib/access-cookies";

const intl = createMiddleware(routing);

/** `/account/...` or `/en/account/...` */
const ACCOUNT_PATH = /^(?:\/(?:en|bn))?\/account(?:\/|$)/;
/** `/order/12`, `/en/order/12/invoice` */
const ORDER_PATH = /^(?:\/(?:en|bn))?\/order\/(\d+)(?:\/invoice)?$/;
/** `/reset-password`, `/en/reset-password` */
const RESET_PATH = /^(?:\/(?:en|bn))?\/reset-password$/;

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Access tokens in links (emails, checkout, gateway return, password reset) move into an
  // httpOnly cookie and out of the address bar, so Google/Meta tags, browser history and
  // referrers never see them. The page reads the cookie (`readAccessToken`).
  const token = request.nextUrl.searchParams.get("token");
  const order = token ? ORDER_PATH.exec(pathname) : null;
  if (token && token.length <= 200 && (order || RESET_PATH.test(pathname))) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("token");
    const res = NextResponse.redirect(url);
    res.cookies.set(order ? orderTokenCookie(Number(order[1])) : RESET_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: order ? 90 * 24 * 60 * 60 : 60 * 60,
    });
    return res;
  }

  // Fast redirect for signed-out visitors. This only checks that a session cookie exists —
  // the account layout verifies the session itself.
  if (ACCOUNT_PATH.test(pathname) && !getSessionCookie(request, { cookiePrefix: "tf" })) {
    const prefix = pathname.startsWith("/en/") || pathname === "/en" ? "/en" : "";
    const url = new URL(`${prefix}/login`, request.url);
    url.searchParams.set("next", pathname.replace(/^\/(en|bn)/, "") + search);
    return NextResponse.redirect(url);
  }

  return intl(request);
}

export const config = {
  // Everything except API routes, the admin panel, media files, Next internals and files with an
  // extension. Note the double backslash: in a JS string "\." is just ".", which would exclude
  // every path longer than one character.
  matcher: "/((?!api|admin|media|_next|_vercel|.*\\..*).*)",
};
