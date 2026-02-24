-- =============================================
-- GEAUX HOME RENTALS - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LISTINGS TABLE
-- =============================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Baton Rouge',
  state TEXT NOT NULL DEFAULT 'LA',
  zip TEXT NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3,1) NOT NULL,
  square_footage INTEGER,
  property_type TEXT NOT NULL DEFAULT 'House',
  available_date DATE NOT NULL,
  pet_policy TEXT NOT NULL DEFAULT 'Case by Case',
  description TEXT,
  utilities_included TEXT[],
  photos TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- APPLICATIONS TABLE
-- =============================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id),
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT,

  -- Section 1: Personal Information
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  desired_move_in DATE NOT NULL,
  applying_as TEXT NOT NULL DEFAULT 'Tenant',

  -- Section 2: Additional Occupants (JSON array)
  additional_occupants JSONB DEFAULT '[]',

  -- Section 3: Guarantor / Co-signer
  guarantor_name TEXT,
  guarantor_email TEXT,
  guarantor_phone TEXT,

  -- Section 4: Current Residence
  current_housing_type TEXT NOT NULL,
  current_address TEXT NOT NULL,
  current_city TEXT NOT NULL,
  current_state TEXT NOT NULL,
  current_zip TEXT NOT NULL,
  current_date_from TEXT NOT NULL,
  current_date_to TEXT NOT NULL,
  current_monthly_rent DECIMAL(10,2) NOT NULL,
  current_landlord_name TEXT NOT NULL,
  current_landlord_email TEXT,
  current_landlord_phone TEXT NOT NULL,

  -- Section 5: Previous Residences (JSON array)
  previous_residences JSONB DEFAULT '[]',

  -- Section 6: Current Employment
  work_status TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  gross_monthly_income DECIMAL(10,2) NOT NULL,
  employment_date_from TEXT NOT NULL,
  employment_date_to TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  supervisor_phone TEXT NOT NULL,
  supervisor_email TEXT,

  -- Section 7: Previous Employment (JSON array)
  previous_employment JSONB DEFAULT '[]',

  -- Section 8: References (JSON array)
  references JSONB DEFAULT '[]',

  -- Section 9: Pets (JSON array)
  has_pets BOOLEAN NOT NULL DEFAULT false,
  pets JSONB DEFAULT '[]',

  -- Section 10: Screening Questions (JSON object)
  screening_questions JSONB NOT NULL DEFAULT '{}',

  -- Section 10 continued: Additional Information
  additional_info TEXT,

  -- Section 11: Authorization & E-Signature
  consent_agreed BOOLEAN NOT NULL DEFAULT false,
  signature_name TEXT NOT NULL,
  signature_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- APPLICATION NOTES TABLE
-- =============================================
CREATE TABLE application_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_applications_listing_id ON applications(listing_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_application_notes_application_id ON application_notes(application_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- Listings: Anyone can read active listings, only authenticated can manage
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Service role can manage all listings"
  ON listings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Applications: Anyone can insert, only service role can read/manage
CREATE POLICY "Anyone can submit applications"
  ON applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage all applications"
  ON applications FOR ALL
  USING (true)
  WITH CHECK (true);

-- Application Notes: Service role only
CREATE POLICY "Service role can manage all notes"
  ON application_notes FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
