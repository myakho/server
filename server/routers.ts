import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { insertApplication, getAllApplications } from "./db";
import { generateApplicationPdf } from "./pdfGenerator";

const applicationSchema = z.object({
  motive: z.string().min(1, "신청 계기를 입력해 주세요"),
  name: z.string().min(1, "성명을 입력해 주세요"),
  age: z.number().int().min(1).max(120),
  gender: z.enum(["male", "female"] as const),
  reason: z.string().min(1, "신청 사유를 입력해 주세요"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  application: router({
    submit: publicProcedure
      .input(applicationSchema)
      .mutation(async ({ input }) => {
        await insertApplication({
          motive: input.motive,
          name: input.name,
          age: input.age,
          gender: input.gender,
          reason: input.reason,
        });
        return { success: true };
      }),

    downloadPdf: publicProcedure
      .input(applicationSchema)
      .mutation(async ({ input }) => {
        const pdfBuffer = await generateApplicationPdf(input);
        const base64 = pdfBuffer.toString("base64");
        return { pdfBase64: base64 };
      }),

    getAll: publicProcedure
      .query(async () => {
        const applications = await getAllApplications();
        return applications;
      }),
  }),
});

export type AppRouter = typeof appRouter;
