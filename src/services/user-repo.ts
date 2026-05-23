/**
 * User repository
 *
 * Wraps Prisma user queries with consistent shapes and helper methods.
 * Auth code, session handlers, and the paper-trading engine all hit
 * these functions instead of touching prisma.user directly — that way
 * concerns like "auto-create RiskSettings on user creation" live in
 * exactly one place.
 */

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const userRepo = {
  /** Lookup by id (returns null if missing) */
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  /** Lookup by email (returns null if missing) */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  /**
   * Create a new user via credentials provider.
   * Hashes the password, creates default RiskSettings, returns the user.
   */
  async createWithPassword(input: {
    email: string;
    name?: string;
    password: string;
  }) {
    const password = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        name: input.name?.trim() || null,
        password,
        riskSettings: { create: {} }, // default settings
      },
    });
  },

  /** Verify a plaintext password against the stored hash */
  async verifyPassword(user: { password: string | null }, plaintext: string) {
    if (!user.password) return false;
    return bcrypt.compare(plaintext, user.password);
  },

  /** Update paperBalance — used by the order engine after fills */
  async updateBalance(userId: string, delta: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { paperBalance: { increment: delta } },
    });
  },

  /** Record a successful sign-in */
  async touchLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  /** Reset paper account to the configured starting balance */
  async resetPaperAccount(userId: string, balance = 100_000) {
    return prisma.$transaction([
      prisma.order.deleteMany({ where: { userId } }),
      prisma.position.deleteMany({ where: { userId } }),
      prisma.trade.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { paperBalance: balance },
      }),
    ]);
  },
};
