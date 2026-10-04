export type Role = 'customer' | 'admin';

export interface Variant {
  id: string;
  label: string; // e.g. "500 g"
  sku: string;
  price: number; // selling price (₹)
  mrp: number; // maximum retail price (₹)
  stock: number;
  costPrice: number; // product cost per unit (₹) — used for profit analytics
  packagingCost: number; // packaging cost per unit (₹)
}

export interface NutritionRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryIds: string[];
  images: string[];
  variants: Variant[];
  ingredients: string;
  storage: string;
  shelfLife: string;
  nutrition: NutritionRow[];
  highlights: string[];
  tags: string[];
  bestSeller: boolean;
  newArrival: boolean;
  featured: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  sold: number;
  views: number;
  lowStockThreshold: number;
  boughtTogether: string[]; // product ids
  legal: { fssaiLicense: string; manufacturer: string; countryOfOrigin: string; veg: boolean };
  seo: { title: string; description: string };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string;
  order: number;
  visible: boolean;
  /** smart categories are computed from product flags instead of assignment */
  smart?: 'bestSeller' | 'newArrival';
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
}

export interface Address {
  id: string;
  label: string; // Home / Office / Other
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  altPhone: string;
  role: Role;
  createdAt: string;
  addresses: Address[];
  wishlist: string[];
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Failed'
  | 'Refunded';

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'COD';
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD';

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  image: string;
  price: number;
  mrp: number;
  qty: number;
  costPrice: number;
  packagingCost: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  email: string;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  deliveryCost: number; // what delivery actually costs MILKYARD (rider payout)
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  status: OrderStatus;
  zoneName: string;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  reviewed?: string[]; // productIds reviewed
}

export interface DeliveryZone {
  id: string;
  name: string;
  area: string; // human description
  /** list of pincodes or ranges like "700001-700020" */
  pincodes: string[];
  charge: number;
  freeAbove: number;
  minOrder: number;
  riderCost: number;
  eta: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount: number; // 0 = no cap
  startsAt: string;
  endsAt: string;
  usageLimit: number; // 0 = unlimited
  used: number;
  scope: 'all' | 'category' | 'product';
  scopeIds: string[];
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  image?: string;
  createdAt: string;
  verified: boolean;
  status: 'approved' | 'pending' | 'hidden';
}

export interface PromoBanner {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  tone: 'yellow' | 'ink' | 'cream';
  active: boolean;
}

export interface HomeContent {
  announcements: string[];
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    image: string;
  };
  promoBanners: PromoBanner[];
  featuredIds: string[];
  showBestSellers: boolean;
  showNewArrivals: boolean;
  offerStrip: string;
}

export interface StoreSettings {
  storeName: string;
  phones: string[];
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  fssai: string;
  gstin: string;
  hours: string;
  lowStockAlerts: boolean;
  notify: { sms: boolean; email: boolean; whatsapp: boolean };
}

export interface AppNotification {
  id: string;
  audience: 'admin' | 'customer';
  channel: 'in-app' | 'sms' | 'email' | 'whatsapp';
  type: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  link?: string;
}

export interface TrafficDay {
  date: string; // yyyy-mm-dd
  sessions: number;
  visitors: number;
  pageViews: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
}
