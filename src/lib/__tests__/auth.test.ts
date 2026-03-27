import { vi, test, expect, beforeEach, describe } from "vitest";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

import { getSession } from "@/lib/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSession", () => {
  test("returns null when no auth-token cookie exists", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const session = await getSession();

    expect(session).toBeNull();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  });

  test("returns null when cookie has no value", async () => {
    mockCookieStore.get.mockReturnValue({});

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns null when JWT verification fails with invalid token", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "invalid-token",
    });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("returns null when token has invalid signature", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.invalid_signature",
    });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("calls get on cookie store with auth-token key", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await getSession();

    expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
  });

  test("returns null for malformed JWT token", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "not.a.valid.jwt",
    });

    const session = await getSession();

    expect(session).toBeNull();
  });

  test("handles JSON parse errors gracefully", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "eyJhbGciOiJIUzI1NiJ9.invalid.signature",
    });

    const session = await getSession();

    expect(session).toBeNull();
  });
});
