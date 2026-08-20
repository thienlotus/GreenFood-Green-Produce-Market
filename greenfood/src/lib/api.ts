import { 
  ALL_PRODUCTS, 
  CATEGORIES, 
  ProductItem, 
  CategoryInfo,
  getProductBySlug as getMockProductBySlug,
  getProductsByCategory as getMockProductsByCategory,
  getCategoryBySlug as getMockCategoryBySlug
} from '@/data/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Generic Fetch Wrapper
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      cache: 'no-store', // Always get latest data
    });

    if (!res.ok) {
      console.warn(`[API] ${endpoint} returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`[API] Fetch failed for ${endpoint}:`, error);
    return null;
  }
}

// 1. CATEGORIES API
export async function getCategories(): Promise<CategoryInfo[]> {
  const res = await fetchApi<{ success: boolean; data: any[] }>('/categories');
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map(c => ({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      icon: c.icon || '🌿',
      bannerImage: c.banner_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop'
    }));
  }
  return CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | undefined> {
  const res = await fetchApi<{ success: boolean; data: any }>(`/categories/${slug}`);
  if (res && res.success && res.data) {
    const c = res.data;
    return {
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      icon: c.icon || '🌿',
      bannerImage: c.banner_image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920&auto=format&fit=crop'
    };
  }
  return getMockCategoryBySlug(slug);
}

// 2. PRODUCTS API
function mapProduct(p: any): ProductItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categorySlug: p.category?.slug || 'trai-cay',
    categoryName: p.category?.name || 'Trái cây tươi',
    description: p.description || '',
    images: p.image_url ? [p.image_url] : [
      'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=800&auto=format&fit=crop'
    ],
    variants: (p.variants && p.variants.length > 0) 
      ? p.variants.map((v: any) => ({
          id: v.id,
          unit: v.unit,
          price: Number(v.price),
          comparePrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
        }))
      : [{ id: 'v1', unit: '1kg', price: 100000 }],
    farmer: {
      name: p.farmer?.farm_name || 'Nông Hộ GreenFood',
      region: p.farmer?.region?.name || p.farmer?.address || 'Việt Nam',
      rating: p.farmer?.rating ? Number(p.farmer.rating) : 4.8,
      address: p.farmer?.address || '',
      story: p.farmer?.story || 'Nông sản hữu cơ sạch chuẩn VietGAP.'
    },
    badge: p.badge || undefined,
    soldCount: p.sold_count ? Number(p.sold_count) : 0,
    rating: p.rating ? Number(p.rating) : 5.0,
    isSeasonal: Boolean(p.is_seasonal)
  };
}

export async function getProducts(params?: { category?: string; search?: string; region?: string; sort?: string; limit?: number }): Promise<ProductItem[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.set('category', params.category);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.region && params.region !== 'all') queryParams.set('region', params.region);
  if (params?.sort) queryParams.set('sort', params.sort);
  if (params?.limit) queryParams.set('limit', String(params.limit));

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await fetchApi<{ success: boolean; data: any[] }>(`/products${queryStr}`);

  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map(mapProduct);
  }

  // Fallback to local mock data
  if (params?.category) {
    return getMockProductsByCategory(params.category);
  }
  return ALL_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<ProductItem | undefined> {
  const res = await fetchApi<{ success: boolean; data: any }>(`/products/${slug}`);
  if (res && res.success && res.data) {
    return mapProduct(res.data);
  }
  return getMockProductBySlug(slug);
}

// 3. FARMERS API (GIS Map)
export interface FarmerData {
  id: string;
  name: string;
  owner: string;
  region: string;
  zone: 'north' | 'central' | 'south';
  address: string;
  lat: number;
  lng: number;
  rating: number;
  products: number;
  specialty: string;
  isVerified: boolean;
  image: string;
}

export async function getFarmers(params?: { zone?: string; search?: string }): Promise<FarmerData[]> {
  const queryParams = new URLSearchParams();
  if (params?.zone && params.zone !== 'all') queryParams.set('zone', params.zone);
  if (params?.search) queryParams.set('search', params.search);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await fetchApi<{ success: boolean; data: any[] }>(`/farmers${queryStr}`);

  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((f: any) => ({
      id: f.id,
      name: f.farm_name,
      owner: f.user?.full_name || 'Chủ vườn',
      region: f.region?.name || 'Việt Nam',
      zone: f.region?.zone || 'south',
      address: f.address,
      lat: Number(f.latitude || 10.7769),
      lng: Number(f.longitude || 106.7009),
      rating: Number(f.rating || 4.8),
      products: f.products ? f.products.length : 5,
      specialty: f.specialty || 'Nông sản sạch',
      isVerified: Boolean(f.is_verified),
      image: f.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'
    }));
  }

  return [];
}

// 4. SHIPPING ZONES API (CRUD)
export interface ShippingZoneItem {
  id: string;
  name: string;
  provinces: string;
  baseFee: number;
  extraFeePerKg: number;
  freeShipMinimum: number;
  estimatedDays: string;
  isActive: boolean;
}

export async function getShippingZones(): Promise<ShippingZoneItem[]> {
  const res = await fetchApi<{ success: boolean; data: any[] }>('/shipping-zones');
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((z: any) => ({
      id: z.id,
      name: z.name,
      provinces: z.provinces,
      baseFee: Number(z.base_fee),
      extraFeePerKg: Number(z.extra_fee_per_kg),
      freeShipMinimum: Number(z.free_ship_minimum),
      estimatedDays: z.estimated_days,
      isActive: Boolean(z.is_active),
    }));
  }
  return [];
}

export async function createShippingZone(data: Omit<ShippingZoneItem, 'id'>): Promise<{ success: boolean; message: string; data?: ShippingZoneItem }> {
  const res = await fetchApi<{ success: boolean; message: string; data?: any }>('/shipping-zones', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      provinces: data.provinces,
      base_fee: data.baseFee,
      extra_fee_per_kg: data.extraFeePerKg,
      free_ship_minimum: data.freeShipMinimum,
      estimated_days: data.estimatedDays,
      is_active: data.isActive,
    })
  });

  if (res && res.success && res.data) {
    return {
      success: true,
      message: res.message || 'Thêm thành công!',
      data: {
        id: res.data.id,
        name: res.data.name,
        provinces: res.data.provinces,
        baseFee: Number(res.data.base_fee),
        extraFeePerKg: Number(res.data.extra_fee_per_kg),
        freeShipMinimum: Number(res.data.free_ship_minimum),
        estimatedDays: res.data.estimated_days,
        isActive: Boolean(res.data.is_active),
      }
    };
  }
  return { success: false, message: res?.message || 'Có lỗi xảy ra khi tạo vùng' };
}

export async function updateShippingZone(id: string, data: Partial<ShippingZoneItem>): Promise<{ success: boolean; message: string }> {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.provinces !== undefined) payload.provinces = data.provinces;
  if (data.baseFee !== undefined) payload.base_fee = data.baseFee;
  if (data.extraFeePerKg !== undefined) payload.extra_fee_per_kg = data.extraFeePerKg;
  if (data.freeShipMinimum !== undefined) payload.free_ship_minimum = data.freeShipMinimum;
  if (data.estimatedDays !== undefined) payload.estimated_days = data.estimatedDays;
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  const res = await fetchApi<{ success: boolean; message: string }>(`/shipping-zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  return { success: res?.success || false, message: res?.message || 'Cập nhật thất bại' };
}

export async function deleteShippingZone(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetchApi<{ success: boolean; message: string }>(`/shipping-zones/${id}`, {
    method: 'DELETE'
  });
  return { success: res?.success || false, message: res?.message || 'Xóa thất bại' };
}

// 5. ORDERS API
export interface OrderItemPayload {
  productId?: string;
  variantId?: string;
  productName: string;
  unit: string;
  quantity: number;
  price: number;
}

export interface AdminOrderItemDetail {
  id: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string; // #GF284910
  order_uuid: string;
  tracking_number: string;
  customer: string;
  phone: string;
  email?: string;
  address: string;
  shipping_zone: string;
  shipping_fee: number;
  date: string;
  total: string;
  total_raw: number;
  status: string; // 'pending' | 'processing' | 'completed' | 'cancelled'
  raw_status: string;
  payment_method: string;
  note?: string;
  items: number;
  item_details: AdminOrderItemDetail[];
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_farmers: number;
  total_users: number;
  recent_orders: any[];
}

export async function createOrder(payload: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingZoneId: string;
  paymentMethod: string;
  note?: string;
  items: OrderItemPayload[];
}): Promise<{ success: boolean; message: string; trackingNumber?: string; orderId?: string }> {
  try {
    const url = `${API_BASE_URL}/orders`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        customer_email: payload.customerEmail,
        shipping_address: payload.shippingAddress,
        shipping_zone_id: payload.shippingZoneId,
        payment_method: payload.paymentMethod,
        note: payload.note,
        items: payload.items.map(it => ({
          product_id: it.productId,
          variant_id: it.variantId,
          product_name: it.productName,
          unit: it.unit,
          quantity: it.quantity,
          price: it.price
        }))
      })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.success && data.data) {
      return {
        success: true,
        message: data.message || 'Đặt hàng thành công!',
        trackingNumber: data.data.tracking_number,
        orderId: data.data.order_id
      };
    }

    return {
      success: false,
      message: data?.message || `Lỗi đặt hàng (mã lỗi ${res.status})`
    };
  } catch (error: any) {
    console.error('[API] createOrder error:', error);
    return { success: false, message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!' };
  }
}

export async function getAdminOrders(params?: { status?: string; search?: string }): Promise<AdminOrder[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await fetchApi<{ success: boolean; data: AdminOrder[] }>(`/admin/orders${queryStr}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
  const cleanId = orderId.replace('#', '');
  const res = await fetchApi<{ success: boolean; message: string }>(`/admin/orders/${cleanId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });

  return { success: res?.success || false, message: res?.message || 'Cập nhật thất bại' };
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const res = await fetchApi<{ success: boolean; data: DashboardStats }>('/admin/dashboard');
  if (res && res.success && res.data) {
    return res.data;
  }
  return null;
}

export async function trackOrder(trackingNumber: string): Promise<any | null> {
  const res = await fetchApi<{ success: boolean; data: any }>(`/orders/tracking/${trackingNumber}`);
  if (res && res.success && res.data) {
    return res.data;
  }
  return null;
}

