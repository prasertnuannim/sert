import { AccessRole, ROLE_REDIRECT_MAP } from "@/lib/auth/accessRole";

export const AUTH_REDIRECT_PATH = ROLE_REDIRECT_MAP[AccessRole.Guest];

export type ResolveAuthRedirectArgs = {
  url: string;
  baseUrl?: string;
};

type RedirectService = {
  resolveAuthRedirect: (url: string) => string;
};

const createRedirectService = (base?: string): RedirectService => {
  const baseUrl = base ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const defaultRedirect = AUTH_REDIRECT_PATH;

  const normalizeInternalUrl = (target: string): string => {
    try {
      const resolved = new URL(target, baseUrl);
      if (resolved.origin !== baseUrl) {
        return defaultRedirect;
      }
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch {
      if (target.startsWith("/")) {
        return target;
      }
      return defaultRedirect;
    }
  };

  const resolveAuthRedirect = (url: string): string => {
    try {
      const parsed = new URL(url, baseUrl);
      const redirectParam = parsed.searchParams.get("redirectTo") ?? parsed.searchParams.get("next");

      if (redirectParam) {
        return normalizeInternalUrl(redirectParam);
      }

      if (parsed.origin === baseUrl) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      return parsed.toString();
    } catch {
      if (url.startsWith("/")) {
        return normalizeInternalUrl(url);
      }
    }

    return defaultRedirect;
  };

  return { resolveAuthRedirect };
};

const redirectServiceCache = new Map<string, RedirectService>();

const getRedirectService = (baseUrl?: string): RedirectService => {
  const key = baseUrl ?? "default";
  if (!redirectServiceCache.has(key)) {
    redirectServiceCache.set(key, createRedirectService(baseUrl));
  }
  // non-null because we set before returning
  return redirectServiceCache.get(key)!;
};

export const resolveAuthRedirect = ({ url, baseUrl }: ResolveAuthRedirectArgs): string =>
  getRedirectService(baseUrl).resolveAuthRedirect(url);
