import dns from 'dns';

/**
 * Common disposable / temporary email domains list.
 * Rejects temporary disposable mailbox services.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'grr.la',
  'sharklasers.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'dispostable.com',
  'burnermail.io',
  'getnada.com',
  'nada.ltd',
  'fakeinbox.com',
  'maildrop.cc',
  'crazymailing.com',
  'inboxkitten.com',
  'spam4.me',
  'tempail.com',
  'disposablemail.com',
  'mohmal.com',
  'mytemp.email',
  'generator.email',
  'emailondeck.com',
  'getairmail.com',
  'dropmail.me',
  'fakemailgenerator.com',
  'mintemail.com',
  'deadaddress.com',
  'binkmail.com',
  'safetymail.info',
  'filzmail.com',
  'trash-mail.com',
  'harakirimail.com',
  'mailforspam.com',
  'mytrashmail.com',
  'spambog.com',
  'tempinbox.com',
  'throwawayemailaddress.com',
  'guerrillamail.de',
  'pokemail.net',
  'fakemail.net',
  'anonymbox.com',
  'boximail.com',
]);

const TRUSTED_PROVIDER_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.id',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'aol.com',
  'mail.com',
  'gmx.com',
]);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  reason?: 'syntax' | 'disposable' | 'domain_unreachable' | 'mx_missing';
  domain?: string;
  cleanEmail?: string;
}

/**
 * 1. Syntax Validation
 * Strict RFC 5322 compliance, checks lengths and structure.
 */
export function validateEmailSyntax(email: string): { valid: boolean; error?: string; cleanEmail?: string; domain?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: "We couldn't find the email address." };
  }

  const clean = email.trim().toLowerCase();

  // Total length check (RFC 5321 limit is 254 characters)
  if (clean.length === 0 || clean.length > 254) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  // Must contain exactly one @ symbol
  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  const [localPart, domainPart] = atParts;

  // Local part length check (max 64 chars)
  if (!localPart || localPart.length > 64) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  // Domain part length check (max 255 chars)
  if (!domainPart || domainPart.length > 255) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  // Prevent consecutive dots or leading/trailing dots in local or domain part
  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..') ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    domainPart.includes('..')
  ) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  // Domain must have at least one dot separating name and TLD
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  // TLD must be at least 2 alpha characters
  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-z]{2,24}$/i.test(tld)) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  // Standard email regex test
  const strictRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
  if (!strictRegex.test(clean)) {
    return { valid: false, error: "We couldn't find the email address." };
  }

  return { valid: true, cleanEmail: clean, domain: domainPart };
}

/**
 * 2. Disposable Email Detection
 */
export function isDisposableDomain(domain: string): boolean {
  const cleanDomain = domain.trim().toLowerCase();
  if (DISPOSABLE_DOMAINS.has(cleanDomain)) {
    return true;
  }

  // Check subdomains (e.g. mail.mailinator.com)
  for (const disposable of DISPOSABLE_DOMAINS) {
    if (cleanDomain.endsWith(`.${disposable}`)) {
      return true;
    }
  }

  return false;
}

/**
 * 3. Domain & MX Validation
 * Checks whether the domain has valid MX records or host records capable of receiving email.
 */
export async function validateDomainMX(domain: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanDomain = domain.trim().toLowerCase();

    // Fast path: Well-known major email providers
    if (TRUSTED_PROVIDER_DOMAINS.has(cleanDomain)) {
      return { valid: true };
    }

    // Query MX records with a 4-second timeout to prevent hanging on unresponsive DNS
    const mxPromise = dns.promises.resolveMx(cleanDomain);
    const timeoutPromise = new Promise<dns.MxRecord[]>((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 4000)
    );

    let mxRecords: dns.MxRecord[] = [];
    try {
      mxRecords = await Promise.race([mxPromise, timeoutPromise]);
    } catch (dnsErr: unknown) {
      const code = (dnsErr as { code?: string })?.code || '';
      const msg = dnsErr instanceof Error ? dnsErr.message : String(dnsErr);

      // If domain doesn't exist at all (NXDOMAIN, ENOTFOUND, SERVFAIL)
      if (code === 'ENOTFOUND' || code === 'NXDOMAIN' || code === 'SERVFAIL') {
        return {
          valid: false,
          error: "We couldn't find the email address.",
        };
      }

      // If timeout or other non-fatal error, check fallback A record
      if (msg === 'DNS_TIMEOUT' || code === 'ENODATA' || code === 'EREFUSED') {
        try {
          const aPromise = dns.promises.resolve4(cleanDomain);
          const aTimeout = new Promise<string[]>((_, reject) =>
            setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3000)
          );
          const aRecords = await Promise.race([aPromise, aTimeout]);
          if (aRecords && aRecords.length > 0) {
            // RFC 5321: If no MX record is present, fallback to address record A
            return { valid: true };
          }
        } catch {
          // If neither MX nor A resolved and error is ENOTFOUND:
          if (code === 'ENOTFOUND' || code === 'NXDOMAIN') {
            return {
              valid: false,
              error: "We couldn't find the email address.",
            };
          }
        }
      }

      // If code was specifically ENODATA (no MX records found)
      if (code === 'ENODATA') {
        // Try A record
        try {
          const aRecords = await dns.promises.resolve4(cleanDomain);
          if (aRecords && aRecords.length > 0) {
            return { valid: true };
          }
        } catch {
          return {
            valid: false,
            error: "We couldn't find the email address.",
          };
        }
      }

      return {
        valid: false,
        error: "We couldn't find the email address.",
      };
    }

    if (!mxRecords || mxRecords.length === 0) {
      // Fallback check for A record (RFC 5321)
      try {
        const aRecords = await dns.promises.resolve4(cleanDomain);
        if (aRecords && aRecords.length > 0) {
          return { valid: true };
        }
      } catch {
        return {
          valid: false,
          error: "We couldn't find the email address.",
        };
      }
      return {
        valid: false,
        error: "We couldn't find the email address.",
      };
    }

    // Filter out null MX record (RFC 7505: priority 0, exchange ".") which indicates domain explicitly refuses mail
    const hasValidMx = mxRecords.some((record) => record.exchange && record.exchange !== '.');
    if (!hasValidMx) {
      return {
        valid: false,
        error: "We couldn't find the email address.",
      };
    }

    return { valid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`DNS MX resolution error for ${domain}:`, msg);
    return {
      valid: false,
      error: "We couldn't find the email address.",
    };
  }
}

/**
 * Master Verification Hierarchy:
 * 1. Syntax check
 * 2. Disposable detection
 * 3. Domain & MX record validation
 */
export async function verifyEmailAddress(email: string): Promise<EmailValidationResult> {
  // Step 1: Syntax
  const syntaxCheck = validateEmailSyntax(email);
  if (!syntaxCheck.valid || !syntaxCheck.cleanEmail || !syntaxCheck.domain) {
    return {
      valid: false,
      error: "We couldn't find the email address.",
      reason: 'syntax',
    };
  }

  const { cleanEmail, domain } = syntaxCheck;

  // Step 2: Disposable detection
  if (isDisposableDomain(domain)) {
    return {
      valid: false,
      error: "We couldn't find the email address.",
      reason: 'disposable',
      domain,
      cleanEmail,
    };
  }

  // Step 3: Domain / MX validation
  const mxCheck = await validateDomainMX(domain);
  if (!mxCheck.valid) {
    return {
      valid: false,
      error: mxCheck.error || "We couldn't find the email address.",
      reason: 'domain_unreachable',
      domain,
      cleanEmail,
    };
  }

  return {
    valid: true,
    cleanEmail,
    domain,
  };
}
