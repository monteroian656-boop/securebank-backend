-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('success', 'failure');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[],
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "result" "AuditResult" NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_change_entries" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "previousState" TEXT NOT NULL,
    "newState" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_change_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL,
    "avgResponseMs" INTEGER NOT NULL,
    "breached" BOOLEAN NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sla_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_policies" (
    "tenantId" TEXT NOT NULL,
    "minLength" INTEGER NOT NULL DEFAULT 10,
    "expirationDays" INTEGER NOT NULL DEFAULT 90,
    "requireComplexity" BOOLEAN NOT NULL DEFAULT true,
    "inactivityDays" INTEGER NOT NULL DEFAULT 60,
    "lockoutMinutes" INTEGER NOT NULL DEFAULT 15,
    CONSTRAINT "security_policies_pkey" PRIMARY KEY ("tenantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_name_key" ON "tenants"("name");
CREATE UNIQUE INDEX "roles_tenantId_name_key" ON "roles"("tenantId", "name");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "audit_log_entries_tenantId_createdAt_idx" ON "audit_log_entries"("tenantId", "createdAt");
CREATE INDEX "sla_metrics_tenantId_recordedAt_idx" ON "sla_metrics"("tenantId", "recordedAt");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_log_entries" ADD CONSTRAINT "audit_log_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_change_entries" ADD CONSTRAINT "role_change_entries_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sla_metrics" ADD CONSTRAINT "sla_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "security_policies" ADD CONSTRAINT "security_policies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
