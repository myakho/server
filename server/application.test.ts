import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB and email functions
vi.mock("./db", () => ({
  insertApplication: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAllApplications: vi.fn().mockResolvedValue([]),
}));

vi.mock("./email", () => ({
  sendApplicationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./pdfGenerator", () => ({
  generateApplicationPdf: vi.fn().mockResolvedValue(Buffer.from("mock-pdf-content")),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

const sampleApplication = {
  motive: "스트레스가 심해서 전문적인 도움이 필요합니다",
  name: "홍길동",
  age: 28,
  gender: "male" as const,
  reason: "최근 직장 스트레스로 인해 불안감이 심해졌습니다",
};

describe("application.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("유효한 신청 데이터로 제출 시 성공을 반환한다", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.submit(sampleApplication);

    expect(result).toEqual({ success: true });
  });

  it("DB 저장 함수가 올바른 데이터로 호출된다", async () => {
    const { insertApplication } = await import("./db");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.application.submit(sampleApplication);

    expect(insertApplication).toHaveBeenCalledWith({
      motive: sampleApplication.motive,
      name: sampleApplication.name,
      age: sampleApplication.age,
      gender: sampleApplication.gender,
      reason: sampleApplication.reason,
    });
  });


});

describe("application.downloadPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PDF 생성 후 base64 문자열을 반환한다", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.downloadPdf(sampleApplication);

    expect(result).toHaveProperty("pdfBase64");
    expect(typeof result.pdfBase64).toBe("string");
    // base64 디코딩 시 mock PDF 내용과 일치해야 함
    const decoded = Buffer.from(result.pdfBase64, "base64").toString();
    expect(decoded).toBe("mock-pdf-content");
  });

  it("PDF 생성 함수가 올바른 데이터로 호출된다", async () => {
    const { generateApplicationPdf } = await import("./pdfGenerator");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.application.downloadPdf(sampleApplication);

    expect(generateApplicationPdf).toHaveBeenCalledWith(sampleApplication);
  });
});

describe("application input validation", () => {
  it("빈 성명으로 제출 시 에러를 반환한다", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.application.submit({ ...sampleApplication, name: "" })
    ).rejects.toThrow();
  });

  it("빈 신청 계기로 제출 시 에러를 반환한다", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.application.submit({ ...sampleApplication, motive: "" })
    ).rejects.toThrow();
  });

  it("범위 밖의 나이로 제출 시 에러를 반환한다", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.application.submit({ ...sampleApplication, age: 0 })
    ).rejects.toThrow();
  });
});
