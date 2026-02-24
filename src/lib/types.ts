export interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  monthly_rent: number;
  security_deposit: number;
  bedrooms: number;
  bathrooms: number;
  square_footage: number | null;
  property_type: string;
  available_date: string;
  pet_policy: string;
  description: string | null;
  utilities_included: string[] | null;
  photos: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Occupant {
  name: string;
  email: string;
  relationship: string;
}

export interface Residence {
  housing_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  date_from: string;
  date_to: string;
  monthly_rent: string;
  landlord_name: string;
  landlord_email: string;
  landlord_phone: string;
}

export interface Employment {
  work_status: string;
  employer_name: string;
  job_title: string;
  gross_monthly_income: string;
  date_from: string;
  date_to: string;
  supervisor_name: string;
  supervisor_phone: string;
  supervisor_email: string;
}

export interface Reference {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  length_of_acquaintance: string;
}

export interface Pet {
  name: string;
  type_breed_size: string;
  sex: string;
  neutered_spayed: string;
  indoor_outdoor: string;
}

export interface ScreeningQuestions {
  evicted: { answer: boolean; details: string };
  broken_lease: { answer: boolean; details: string };
  refused_rent: { answer: boolean; details: string };
  income_interruption: { answer: boolean; details: string };
  outstanding_judgments: { answer: boolean; details: string };
  foreclosure: { answer: boolean; details: string };
  bankruptcy: { answer: boolean; details: string };
  criminal_proceedings: { answer: boolean; details: string };
  felony: { answer: boolean; details: string };
  rent_on_first: { answer: boolean; details: string };
}

export interface Application {
  id: string;
  listing_id: string;
  status: string;
  internal_notes: string | null;
  full_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  desired_move_in: string;
  applying_as: string;
  additional_occupants: Occupant[];
  guarantor_name: string | null;
  guarantor_email: string | null;
  guarantor_phone: string | null;
  current_housing_type: string;
  current_address: string;
  current_city: string;
  current_state: string;
  current_zip: string;
  current_date_from: string;
  current_date_to: string;
  current_monthly_rent: number;
  current_landlord_name: string;
  current_landlord_email: string | null;
  current_landlord_phone: string;
  previous_residences: Residence[];
  work_status: string;
  employer_name: string;
  job_title: string;
  gross_monthly_income: number;
  employment_date_from: string;
  employment_date_to: string;
  supervisor_name: string;
  supervisor_phone: string;
  supervisor_email: string | null;
  previous_employment: Employment[];
  applicant_references: Reference[];
  has_pets: boolean;
  pets: Pet[];
  screening_questions: ScreeningQuestions;
  additional_info: string | null;
  consent_agreed: boolean;
  signature_name: string;
  signature_date: string;
  created_at: string;
  updated_at: string;
  listing?: Listing;
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  note: string;
  created_at: string;
}
