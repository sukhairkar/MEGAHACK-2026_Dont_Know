-- JusticeRoute Database Schema

create table fir_reports (
  id uuid primary key default gen_random_uuid(),

  district text,
  fir_no text,
  fir_datetime timestamp,
  police_station text,
  year integer,

  info_type text,

  occurrence_day text,
  date_from date,
  date_to date,
  time_from time,
  time_to time,

  info_received_date date,

  gd_entry_no text,
  gd_datetime timestamp,

  direction_from_ps text,
  distance_from_ps text,
  beat_no text,
  occurrence_address text,

  outside_ps_name text,
  outside_district text,

  delay_reason text,

  total_property_value numeric,

  first_information_contents text,

  investigation_officer_name text,
  investigation_officer_rank text,
  investigation_officer_number text,

  court_dispatch_datetime timestamp,

  created_at timestamp default now()
);

create table fir_sections (
  id uuid primary key default gen_random_uuid(),

  fir_id uuid references fir_reports(id) on delete cascade,

  act text,
  section text
);

create table complainants (
  id uuid primary key default gen_random_uuid(),

  fir_id uuid references fir_reports(id) on delete cascade,

  name text,
  relative_name text,
  birth_date date,
  nationality text,

  uid_number text,
  passport_number text,
  passport_issue_date date,
  passport_issue_place text,

  occupation text,
  mobile text,

  current_address text,
  permanent_address text
);

create table complainant_ids (
  id uuid primary key default gen_random_uuid(),

  complainant_id uuid references complainants(id) on delete cascade,

  id_type text,
  id_number text
);

create table accused (
  id uuid primary key default gen_random_uuid(),

  fir_id uuid references fir_reports(id) on delete cascade,

  name text,
  alias text,
  relative_name text,
  present_address text
);

create table properties (
  id uuid primary key default gen_random_uuid(),

  fir_id uuid references fir_reports(id) on delete cascade,

  property_category text,
  property_type text,
  description text,
  value numeric
);

create table inquest_reports (
  id uuid primary key default gen_random_uuid(),

  fir_id uuid references fir_reports(id) on delete cascade,

  uidb_number text
);
