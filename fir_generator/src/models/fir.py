from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date, time
from decimal import Decimal

class FIRSection(BaseModel):
    act: str
    section: str

class Complainant(BaseModel):
    name: str # Mandatory
    relative_name: Optional[str] = None
    birth_date: Optional[date] = None
    nationality: Optional[str] = "Indian"
    uid_number: Optional[str] = None
    passport_no: Optional[str] = None
    occupation: Optional[str] = None
    mobile: Optional[str] = None
    current_address: Optional[str] = None
    permanent_address: Optional[str] = None

class Accused(BaseModel):
    name: str
    alias: Optional[str] = None
    relative_name: Optional[str] = None
    present_address: Optional[str] = None

class Property(BaseModel):
    property_category: Optional[str] = None
    property_type: Optional[str] = None
    description: Optional[str] = None
    value: Optional[Decimal] = None

class FIRReport(BaseModel):
    id: Optional[str] = None
    district: str # Mandatory (e.g., Mumbai City)
    police_station: str # Mandatory (e.g., Colaba)
    year: int = Field(default_factory=lambda: datetime.now().year)
    fir_no: str = "DRAFT"
    fir_datetime: datetime = Field(default_factory=datetime.now)
    
    occurrence_day: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    time_from: Optional[time] = None
    time_to: Optional[time] = None
    
    info_received_date: Optional[date] = None
    gd_entry_no: Optional[str] = None
    gd_datetime: Optional[datetime] = None
    
    info_type: Optional[str] = None
    
    direction_from_ps: Optional[str] = None
    distance_from_ps: Optional[str] = None
    beat_no: Optional[str] = None
    outside_ps_name: Optional[str] = None
    outside_district: Optional[str] = None
    
    delay_reason: Optional[str] = None
    total_property_value: Optional[Decimal] = None
    
    occurrence_address: Optional[str] = None
    first_information_contents: str # Mandatory (The Marathi Narrative)
    
    investigation_officer_name: Optional[str] = None
    investigation_officer_rank: Optional[str] = None
    investigation_officer_number: Optional[str] = None
    
    court_dispatch_datetime: Optional[datetime] = None
    pdf_url: Optional[str] = None
    filling_location: Optional[str] = None
    is_approved: Optional[bool] = False

class FIRDataPayload(BaseModel):
    """Complete payload required to generate a PDF"""
    report: FIRReport
    complainant: Complainant
    sections: List[FIRSection] = []
    accused_list: List[Accused] = []
    properties: List[Property] = []
