"use client";

import { Plus, Search, Edit2, Trash2, Image as ImageIcon, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct, ProductItem } from '@/lib/api';

const CATEGORY_OPTIONS = [
  { id: 1, name: 'Trái cây tươi', slug: 'trai-cay' },
  { id: 2, name: 'Rau củ hữu cơ', slug: 'rau-cu' },
  { id: 3, name: 'Nấm sạch VietGAP', slug: 'nam' },
  { id: 4, name: 'Trà & Cà phê', slug: 'tra-ca-phe' },
  { id: 5, name: 'Gạo & Nông sản khô', slug: 'gao-ngu-coc' },
  { id: 6, name: 'Gia vị truyền thống', slug: 'gia-vi' },
  { id: 7, name: 'Đặc sản vùng miền', slug: 'dac-san' },
];

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    price: '',
    stock: '50',
    unit: '1kg',
    description: '',
    image_url: ''
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({ limit: 100 });
      if (data && Array.isArray(data)) {
        const mapped = data.map((p: ProductItem) => {
          const defaultVariant = p.variants?.[0];
          return {
            id: p.id,
            name: p.name,
            category: p.categoryName || 'Nông sản',
            categorySlug: p.categorySlug || 'trai-cay',
            priceNum: defaultVariant?.price || 50000,
            price: `${(defaultVariant?.price || 50000).toLocaleString('vi-VN')}đ`,
            stock: 45, // default
            unit: defaultVariant?.unit || '1kg',
            image_url: p.images?.[0] || '',
            description: p.description || ''
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách sản phẩm từ máy chủ!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: string | number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nông sản: "${name}"?`)) return;

    try {
      const res = await deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success(`Đã xóa sản phẩm: ${name}`);
      } else {
        toast.error(res.message || 'Không thể xóa sản phẩm!');
      }
    } catch (err) {
      toast.error('Lỗi khi xóa sản phẩm!');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const cat = CATEGORY_OPTIONS.find(c => c.slug === product.categorySlug || c.name === product.category);
    setFormData({
      name: product.name,
      category_id: cat ? cat.id : 1,
      price: product.priceNum ? String(product.priceNum) : product.price.replace(/\D/g, ''),
      stock: String(product.stock || 50),
      unit: product.unit || '1kg',
      description: product.description || '',
      image_url: product.image_url || ''
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: 1,
      price: '',
      stock: '50',
      unit: '1kg',
      description: '',
      image_url: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast.error('Tên sản phẩm không được để trống!');
      return;
    }
    if (trimmedName.length > 255) {
      toast.error('Tên sản phẩm quá dài!');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Giá bán phải là số dương lớn hơn 0!');
      return;
    }

    const stockNum = Number(formData.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Số lượng tồn kho không được là số âm!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // Cập nhật sản phẩm
        const res = await updateProduct(editingProduct.id, {
          name: trimmedName,
          category_id: Number(formData.category_id),
          price: priceNum,
          stock: stockNum,
          unit: formData.unit.trim() || '1kg',
          description: formData.description.trim(),
          image_url: formData.image_url.trim() || undefined
        });

        if (res.success) {
          toast.success('Cập nhật nông sản thành công!');
          const cat = CATEGORY_OPTIONS.find(c => c.id === Number(formData.category_id));
          setProducts(prev => prev.map(p => {
            if (p.id === editingProduct.id) {
              return {
                ...p,
                name: trimmedName,
                category: cat?.name || p.category,
                categorySlug: cat?.slug || p.categorySlug,
                priceNum: priceNum,
                price: `${priceNum.toLocaleString('vi-VN')}đ`,
                stock: stockNum,
                unit: formData.unit.trim() || '1kg',
                description: formData.description.trim(),
                image_url: formData.image_url.trim() || p.image_url
              };
            }
            return p;
          }));
          setIsModalOpen(false);
        } else {
          toast.error(res.message || 'Cập nhật thất bại!');
        }
      } else {
        // Tạo mới sản phẩm
        const res = await createProduct({
          name: trimmedName,
          category_id: Number(formData.category_id),
          price: priceNum,
          stock: stockNum,
          unit: formData.unit.trim() || '1kg',
          description: formData.description.trim(),
          image_url: formData.image_url.trim() || undefined
        });

        if (res.success && res.data) {
          toast.success('Thêm nông sản mới thành công!');
          const cat = CATEGORY_OPTIONS.find(c => c.id === Number(formData.category_id));
          const newProd = {
            id: res.data.id || Date.now(),
            name: trimmedName,
            category: cat?.name || 'Nông sản',
            categorySlug: cat?.slug || 'trai-cay',
            priceNum: priceNum,
            price: `${priceNum.toLocaleString('vi-VN')}đ`,
            stock: stockNum,
            unit: formData.unit.trim() || '1kg',
            image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e',
            description: formData.description.trim()
          };
          setProducts(prev => [newProd, ...prev]);
          setIsModalOpen(false);
        } else {
          toast.error(res.message || 'Không thể thêm sản phẩm!');
        }
      }
    } catch (err: any) {
      toast.error('Lỗi kết nối máy chủ!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || p.categorySlug === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Quản lý Kho Nông Sản & Biến Thể Giá</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {products.length} sản phẩm
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Phân hệ quản trị kho hàng, giá bán và thông tin sản phẩm chuẩn VietGAP.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              disabled={loading}
              className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-emerald-200"
            >
              <Plus size={18} />
              Thêm nông sản mới
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên nông sản..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Danh mục:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
            >
              <option value="all">Tất cả danh mục</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Tên nông sản</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Quy cách / Đơn vị</th>
                <th className="p-4 font-semibold">Giá bán</th>
                <th className="p-4 font-semibold">Tồn kho</th>
                <th className="p-4 font-semibold">Trạng thái kho</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
                    Đang tải dữ liệu nông sản từ hệ thống...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không tìm thấy nông sản nào phù hợp!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockNum = Number(product.stock) || 0;
                  const isOutOfStock = stockNum <= 0;
                  const isLowStock = stockNum > 0 && stockNum <= 10;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block">{product.name}</span>
                            <span className="text-xs text-gray-400 font-mono">ID: {String(product.id).slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {product.unit}
                      </td>
                      <td className="p-4 text-sm font-bold text-emerald-700">
                        {product.price}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-800">
                        {product.stock}
                      </td>
                      <td className="p-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                            <XCircle size={13} /> Hết hàng
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            <AlertTriangle size={13} /> Sắp hết ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={13} /> Còn hàng
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Xóa nông sản"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Sản Phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-gray-100 bg-emerald-50/70 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingProduct ? 'Chỉnh sửa nông sản' : 'Thêm nông sản mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nông sản <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ví dụ: Bưởi Da Xanh Ruột Hồng"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={formData.category_id} 
                    onChange={e => setFormData({...formData, category_id: Number(e.target.value)})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quy cách / Đơn vị
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: 1kg, Hộp 500g, Trái"
                    value={formData.unit} 
                    onChange={e => setFormData({...formData, unit: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="number" 
                    placeholder="Ví dụ: 85000"
                    min="1000"
                    step="1000"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tồn kho (Số lượng) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="number" 
                    placeholder="Ví dụ: 50"
                    min="0"
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn hình ảnh (URL)
                </label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả nông sản
                </label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả tiêu chuẩn VietGAP, nguồn gốc xuất xứ, hương vị..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu nông sản'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
