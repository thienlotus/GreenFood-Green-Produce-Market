"use client";

import { Plus, Search, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const mockProducts = [
  { id: 1, name: 'Sầu riêng Ri6', category: 'Trái cây', price: '120.000đ', stock: 45, status: 'Còn hàng' },
  { id: 2, name: 'Bưởi da xanh Bến Tre', category: 'Trái cây', price: '85.000đ', stock: 120, status: 'Còn hàng' },
  { id: 3, name: 'Trà Ô long Mộc Châu', category: 'Trà - Cà phê', price: '250.000đ', stock: 0, status: 'Hết hàng' },
  { id: 4, name: 'Mật ong rừng Tràm', category: 'Đặc sản', price: '320.000đ', stock: 15, status: 'Còn hàng' },
];

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState(mockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Trái cây', price: '', stock: '' });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${name}?`)) {
      setProducts(products.filter(p => p.id !== id));
      toast.success(`Đã xóa sản phẩm: ${name}`);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.replace('đ', '').replace('.', ''),
      stock: product.stock.toString()
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Trái cây', price: '', stock: '' });
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
    if (priceNum < 0) {
      toast.error('Giá bán không được là số âm!');
      return;
    }

    const stockNum = Number(formData.stock);
    if (stockNum < 0) {
      toast.error('Số lượng tồn kho không được là số âm!');
      return;
    }

    // Check duplicate name
    const isDuplicate = products.some(p => p.name.toLowerCase() === trimmedName.toLowerCase() && p.id !== editingProduct?.id);
    if (isDuplicate) {
      toast.error('Tên sản phẩm đã tồn tại!');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const formattedPrice = `${priceNum.toLocaleString('vi-VN')}đ`;
    const status = stockNum > 0 ? 'Còn hàng' : 'Hết hàng';

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData, name: trimmedName, price: formattedPrice, stock: stockNum, status } : p));
      toast.success('Đã cập nhật sản phẩm!');
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        name: trimmedName,
        price: formattedPrice,
        stock: stockNum,
        status
      };
      setProducts([newProduct, ...products]);
      toast.success('Đã thêm sản phẩm mới!');
    }
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý danh sách nông sản và đặc sản trên hệ thống.</p>
          </div>
          <button 
            onClick={handleAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus size={18} />
            Thêm sản phẩm mới
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-semibold">Tên sản phẩm</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Giá bán</th>
                <th className="p-4 font-semibold">Kho</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.category}</td>
                  <td className="p-4 text-sm font-medium text-amber-600">{product.price}</td>
                  <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.filter(p => p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500">
                  <option>Trái cây</option>
                  <option>Trà - Cà phê</option>
                  <option>Đặc sản</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
