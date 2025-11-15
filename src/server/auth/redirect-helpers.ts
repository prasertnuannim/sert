import { AccessRole, ROLE_REDIRECT_MAP } from "@/lib/auth/roles";

export { resolveRoleRedirectPath } from "@/lib/auth/roles";

export const AUTH_REDIRECT_PATH = ROLE_REDIRECT_MAP[AccessRole.Guest];

type RedirectArgs = { url: string; baseUrl: string };

function normalizeInternalUrl(target: string, baseUrl: string) {
  try {
    const resolved = new URL(target, baseUrl);
    if (resolved.origin !== baseUrl) {
      return AUTH_REDIRECT_PATH;
    }
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    if (target.startsWith("/")) {
      return target;
    }
    return AUTH_REDIRECT_PATH;
  }
}

export function resolveAuthRedirect({ url, baseUrl }: RedirectArgs) {
  try {
    const parsed = new URL(url, baseUrl);
    const redirectParam =
      parsed.searchParams.get("redirectTo") ?? parsed.searchParams.get("next");
    if (redirectParam) {
      return normalizeInternalUrl(redirectParam, baseUrl);
    }

    if (parsed.origin === baseUrl) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    // allow external provider URLs (e.g. Google OAuth) to pass through
    return parsed.toString();
  } catch {
    if (url.startsWith("/")) {
      return normalizeInternalUrl(url, baseUrl);
    }
  }

  return AUTH_REDIRECT_PATH;
}
