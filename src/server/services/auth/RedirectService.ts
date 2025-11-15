import { AccessRole, ROLE_REDIRECT_MAP } from "@/lib/auth/access-role";

export const AUTH_REDIRECT_PATH = ROLE_REDIRECT_MAP[AccessRole.Guest];

export type ResolveAuthRedirectArgs = {
  url: string;
  baseUrl?: string;
};

export class RedirectService {
  private readonly baseUrl: string;
  private readonly defaultRedirect: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    this.defaultRedirect = AUTH_REDIRECT_PATH;
  }

  public resolveAuthRedirect(url: string): string {
    try {
      const parsed = new URL(url, this.baseUrl);
      const redirectParam =
        parsed.searchParams.get("redirectTo") ?? parsed.searchParams.get("next");

      if (redirectParam) {
        return this.normalizeInternalUrl(redirectParam);
      }

      if (parsed.origin === this.baseUrl) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      return parsed.toString();
    } catch {
      if (url.startsWith("/")) {
        return this.normalizeInternalUrl(url);
      }
    }

    return this.defaultRedirect;
  }

  private normalizeInternalUrl(target: string): string {
    try {
      const resolved = new URL(target, this.baseUrl);
      if (resolved.origin !== this.baseUrl) {
        return this.defaultRedirect;
      }
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch {
      if (target.startsWith("/")) {
        return target;
      }
      return this.defaultRedirect;
    }
  }
}

const redirectServiceCache = new Map<string, RedirectService>();
function getRedirectService(baseUrl?: string) {
  const key = baseUrl ?? "default";
  if (!redirectServiceCache.has(key)) {
    redirectServiceCache.set(key, new RedirectService(baseUrl));
  }
  return redirectServiceCache.get(key)!;
}

export function resolveAuthRedirect({ url, baseUrl }: ResolveAuthRedirectArgs): string {
  return getRedirectService(baseUrl).resolveAuthRedirect(url);
}
