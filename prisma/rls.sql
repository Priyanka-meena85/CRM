-- ============================================================================
-- Priya Boutique CRM — PostgreSQL / Supabase Row-Level Security (RLS) Policy
-- Run this migration when deploying to Supabase / PostgreSQL in production.
-- ============================================================================

ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadFollowup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Udhaar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;

-- Owner has full access; Staff can only read/update leads assigned to them
CREATE POLICY "owner_full_access_leads" ON "Lead"
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'OWNER');

CREATE POLICY "staff_assigned_leads_only" ON "Lead"
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'STAFF'
    AND ("assignedTo" IS NULL OR "assignedTo"::text = auth.jwt() ->> 'sub')
  );

CREATE POLICY "owner_only_approvals" ON "Approval"
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'OWNER');

CREATE POLICY "owner_only_staff" ON "Staff"
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'OWNER');
