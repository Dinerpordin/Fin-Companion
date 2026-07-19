"""SQLAlchemy models for the Bangladesh Financial Companion."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, Integer, DateTime, ForeignKey, Enum, JSON, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True) # Matches Supabase auth.users id
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=True)
    api_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class CashbookEntry(Base):
    __tablename__ = "cashbook_entries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    entry_type: Mapped[str] = mapped_column(String(20), nullable=False) # 'income' or 'expense'
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class SavedScenario(Base):
    __tablename__ = "saved_scenarios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    scenario_type: Mapped[str] = mapped_column(String(50), nullable=False)
    input_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    results: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(255), nullable=False)
    institution_type: Mapped[str] = mapped_column(String(50), nullable=False)
    regulator: Mapped[str] = mapped_column(String(100), nullable=True)
    website_url: Mapped[str] = mapped_column(String(500), nullable=True)
    phone_public: Mapped[str] = mapped_column(String(50), nullable=True)
    is_islamic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    products = relationship("Product", back_populates="institution", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="institution", cascade="all, delete-orphan")
    checklists = relationship("DocumentChecklist", back_populates="institution", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(255), nullable=False)
    description_short_bn: Mapped[str] = mapped_column(Text, nullable=True)
    min_amount: Mapped[float] = mapped_column(Float, nullable=True)
    max_amount: Mapped[float] = mapped_column(Float, nullable=True)
    min_tenor_months: Mapped[int] = mapped_column(Integer, nullable=True)
    max_tenor_months: Mapped[int] = mapped_column(Integer, nullable=True)
    islamic_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    official_url: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    institution = relationship("Institution", back_populates="products")
    rates = relationship("ProductRate", back_populates="product", cascade="all, delete-orphan")
    fees = relationship("ProductFee", back_populates="product", cascade="all, delete-orphan")
    leads = relationship("Lead", cascade="all, delete-orphan")


class SourceRecord(Base):
    __tablename__ = "source_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    scraped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    parser_version: Mapped[str] = mapped_column(String(50), nullable=True)
    raw_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    rates = relationship("ProductRate", back_populates="source")
    fees = relationship("ProductFee", back_populates="source")


class ProductRate(Base):
    __tablename__ = "product_rates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), nullable=False)
    rate_type: Mapped[str] = mapped_column(String(50), nullable=False)
    nominal_rate: Mapped[float] = mapped_column(Float, nullable=False)
    effective_notes: Mapped[str] = mapped_column(Text, nullable=True)
    fee_notes: Mapped[str] = mapped_column(Text, nullable=True)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("source_records.id"), nullable=False)
    confidence_flag: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)

    product = relationship("Product", back_populates="rates")
    source = relationship("SourceRecord", back_populates="rates")


class ProductFee(Base):
    __tablename__ = "product_fees"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), nullable=False)
    fee_name: Mapped[str] = mapped_column(String(255), nullable=False)
    fee_amount: Mapped[float] = mapped_column(Float, nullable=True)
    fee_type: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("source_records.id"), nullable=False)

    product = relationship("Product", back_populates="fees")
    source = relationship("SourceRecord", back_populates="fees")


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"), nullable=False)
    location_type: Mapped[str] = mapped_column(String(50), nullable=False)
    branch_name: Mapped[str] = mapped_column(String(255), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    upazila: Mapped[str] = mapped_column(String(100), nullable=True)
    address_text: Mapped[str] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    products_supported: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    phone_public: Mapped[str] = mapped_column(String(50), nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_url: Mapped[str] = mapped_column(String(500), nullable=True)

    institution = relationship("Institution", back_populates="locations")


class DocumentChecklist(Base):
    __tablename__ = "document_checklists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id"), nullable=True)
    product_category: Mapped[str] = mapped_column(String(50), nullable=False)
    checklist_bn: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    checklist_en: Mapped[list[str]] = mapped_column(JSONB, nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("source_records.id"), nullable=True)

    institution = relationship("Institution", back_populates="checklists")
    source = relationship("SourceRecord")


class AnalyticsEventBinned(Base):
    __tablename__ = "analytics_events_binned"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id_rotating: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    tool_name: Mapped[str] = mapped_column(String(50), nullable=False)
    intent_class: Mapped[str] = mapped_column(String(50), nullable=True)
    amount_band: Mapped[str] = mapped_column(String(50), nullable=True)
    purpose_band: Mapped[str] = mapped_column(String(50), nullable=True)
    lender_type: Mapped[str] = mapped_column(String(50), nullable=True)
    cost_band: Mapped[str] = mapped_column(String(50), nullable=True)
    region_type: Mapped[str] = mapped_column(String(50), nullable=True)
    event_month: Mapped[str] = mapped_column(String(7), nullable=False, index=True) # YYYY-MM format
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
