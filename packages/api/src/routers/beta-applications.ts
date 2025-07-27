import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure, adminProcedure } from "../trpc";
import { betaApplication, user } from "@bounty/db";

const createBetaApplicationSchema = z.object({
  name: z.string().min(1).max(100),
  twitter: z.string().min(1).max(50),
  projectName: z.string().min(1).max(200),
  projectLink: z.string().url(),
  description: z.string().min(10).max(1000),
});

const updateStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().optional(),
});

export const betaApplicationsRouter = router({
  checkExisting: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const existingApplication = await ctx.db
        .select()
        .from(betaApplication)
        .where(eq(betaApplication.userId, userId))
        .limit(1);

      return {
        hasSubmitted: existingApplication.length > 0,
        application: existingApplication[0] || null,
      };
    }),

  create: protectedProcedure
    .input(createBetaApplicationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existingApplication = await ctx.db
        .select()
        .from(betaApplication)
        .where(eq(betaApplication.userId, userId))
        .limit(1);

      if (existingApplication.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already submitted a beta application",
        });
      }

      const [application] = await ctx.db
        .insert(betaApplication)
        .values({
          userId,
          name: input.name,
          twitter: input.twitter,
          projectName: input.projectName,
          projectLink: input.projectLink,
          description: input.description,
        })
        .returning();

      return application;
    }),

  getAll: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, page, limit } = input;
      const offset = (page - 1) * limit;

      const whereClause = status ? eq(betaApplication.status, status) : undefined;

      const [applications, total] = await Promise.all([
        ctx.db
          .select({
            id: betaApplication.id,
            name: betaApplication.name,
            twitter: betaApplication.twitter,
            projectName: betaApplication.projectName,
            projectLink: betaApplication.projectLink,
            description: betaApplication.description,
            status: betaApplication.status,
            reviewNotes: betaApplication.reviewNotes,
            createdAt: betaApplication.createdAt,
            updatedAt: betaApplication.updatedAt,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
          })
          .from(betaApplication)
          .leftJoin(user, eq(betaApplication.userId, user.id))
          .where(whereClause)
          .orderBy(desc(betaApplication.createdAt))
          .limit(limit)
          .offset(offset),
        ctx.db
          .select({ count: betaApplication.id })
          .from(betaApplication)
          .where(whereClause)
          .then((result) => result.length),
      ]);

      return {
        applications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  updateStatus: adminProcedure
    .input(updateStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, status, reviewNotes } = input;
      const adminUserId = ctx.session.user.id;

      const [application] = await ctx.db
        .update(betaApplication)
        .set({
          status,
          reviewNotes,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(betaApplication.id, id))
        .returning();

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Beta application not found",
        });
      }

      if (status === "approved") {
        await ctx.db
          .update(user)
          .set({ betaAccessStatus: "approved" })
          .where(eq(user.id, application.userId));
      } else if (status === "rejected") {
        await ctx.db
          .update(user)
          .set({ betaAccessStatus: "denied" })
          .where(eq(user.id, application.userId));
      }

      return application;
    }),
}); 