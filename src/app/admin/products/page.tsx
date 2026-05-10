'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Upload,
  Loader2,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Info,
  Star,
  Zap,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  MinusSquare,
  Copy,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductService } from '@/services/product-service';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Toast, ToastType } from '@/components/ui/toast';

// --- Professional Confirmation Modal Component ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmModal = ({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Xác nhận', type = 'danger', isLoading = false 
}: ConfirmModalProps) => {
  if (!isOpen) return null;
  
  const iconMap = {
    danger: <AlertTriangle className="text-red-500" size={32} />,
    warning: <AlertTriangle className="text-amber-500" size={32} />,
    info: <Info className="text-blue-500" size={32} />
  };

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className={cn(
              "p-4 rounded-full",
              type === 'danger' ? "bg-red-50" : type === 'warning' ? "bg-amber-50" : "bg-blue-50"
            )}>
              {iconMap[type]}
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 leading-relaxed text-sm">{message}</p>
        </div>
        <div className="bg-slate-50 p-6 flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button 
            className={cn("flex-1 h-12 rounded-xl font-bold text-white", btnColors[type])}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [userEmail, setUserEmail] = useState<string>('admin');
  const [activeStatus, setActiveStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [activeFeatured, setActiveFeatured] = useState<'all' | 'featured' | 'regular'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Debounce timeout ref
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Notification state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ 
    id: string | string[], 
    type: 'product' | 'category' | 'bulk-product' | 'hide-category',
    extraData?: any 
  } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    discount_price: '',
    category_id: '',
    description: '',
    images: [] as string[],
    status: true,
    is_featured: false,
    specs: {} as any
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    status: true
  });

  const fetchData = useCallback(async (page = currentPage, search = searchTerm) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || 'admin');

      // Xác định giá trị status filter cho query
      let statusFilter: boolean | undefined = undefined;
      if (activeStatus === 'visible') statusFilter = true;
      if (activeStatus === 'hidden') statusFilter = false;

      // Xác định giá trị featured filter cho query
      let featuredFilter: boolean | undefined = undefined;
      if (activeFeatured === 'featured') featuredFilter = true;
      if (activeFeatured === 'regular') featuredFilter = false;

      const [productsResponse, categoriesData] = await Promise.all([
        ProductService.getAll({ 
          all: true, 
          status: activeTab === 'products' ? statusFilter : undefined,
          featured: activeTab === 'products' && activeFeatured !== 'all' ? featuredFilter : undefined,
          category: activeTab === 'products' ? activeCategory : undefined,
          search: activeTab === 'products' ? search : undefined,
          page: activeTab === 'products' ? page : undefined, 
          pageSize: activeTab === 'products' ? pageSize : undefined 
        }),
        ProductService.getCategories({ all: true })
      ]);
      
      setProducts(productsResponse.data || []);
      setTotalCount(productsResponse.count || 0);
      setCategories(categoriesData || []);
      setSelectedIds([]); 
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeStatus, activeFeatured, activeCategory, currentPage, searchTerm]);

  // Tab/Status/Featured/Category change
  useEffect(() => {
    fetchData(1, searchTerm);
    setCurrentPage(1);
  }, [activeTab, activeStatus, activeFeatured, activeCategory]);

  // Page change
  useEffect(() => {
    if (activeTab === 'products') {
      fetchData(currentPage, searchTerm);
    }
  }, [currentPage]);

  // Search effect with debounce
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = setTimeout(() => {
      fetchData(1, searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'name' && !editingId) {
        newData.slug = value.toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/-+/g, '-');
      }
      return newData;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    try {
      setUploadingImage(true);
      showToast(`Đang xử lý ${fileArray.length} ảnh...`, 'info');
      const uploadPromises = fileArray.map(file => ProductService.uploadImage(file));
      const publicUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...publicUrls] }));
      showToast(`Đã tải lên ${publicUrls.length} ảnh thành công`);
    } catch (error: any) {
      showToast(`Lỗi upload ảnh: ${error.message}`, 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        category_id: formData.category_id || null,
        description: formData.description,
        images: formData.images,
        status: formData.status,
        is_featured: formData.is_featured,
        specs: formData.specs || {}
      };
      
      if (editingId) {
        payload.updated_by = userEmail;
        await ProductService.update(editingId, payload);
        showToast('Đã cập nhật sản phẩm thành công');
      } else {
        payload.created_by = userEmail;
        payload.updated_by = userEmail;
        await ProductService.create(payload);
        showToast('Đã thêm sản phẩm mới thành công');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData(currentPage, searchTerm);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu sản phẩm', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: any = { ...categoryFormData };
      
      if (editingCategoryId) {
        payload.updated_by = userEmail;
        await ProductService.updateCategory(editingCategoryId, payload);
        showToast('Đã cập nhật danh mục thành công');
      } else {
        payload.created_by = userEmail;
        payload.updated_by = userEmail;
        await ProductService.createCategory(payload);
        showToast('Đã thêm danh mục mới thành công');
      }
      setIsCategoryModalOpen(false);
      resetCategoryForm();
      fetchData(currentPage, searchTerm);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi lưu danh mục', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleProductStatus = async (p: any) => {
    try {
      const newStatus = !p.status;
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: newStatus } : item));
      await ProductService.update(p.id, { status: newStatus, updated_by: userEmail });
      showToast(`Đã ${newStatus ? 'hiện' : 'ẩn'} sản phẩm`);
    } catch (error) {
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, status: p.status } : item));
      showToast('Lỗi khi thay đổi trạng thái', 'error');
    }
  };

  const handleToggleProductFeatured = async (p: any) => {
    try {
      const newFeatured = !p.is_featured;
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, is_featured: newFeatured } : item));
      await ProductService.update(p.id, { is_featured: newFeatured, updated_by: userEmail });
      showToast(`Đã ${newFeatured ? 'đặt làm sản phẩm nổi bật' : 'bỏ nổi bật'} sản phẩm`);
    } catch (error) {
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, is_featured: p.is_featured } : item));
      showToast('Lỗi khi thay đổi trạng thái nổi bật', 'error');
    }
  };

  const handleToggleCategoryStatus = async (c: any) => {
    const newStatus = !c.status;
    if (!newStatus) {
      const linkedProducts = products.filter(p => p.category_id === c.id);
      if (linkedProducts.length > 0) {
        setConfirmData({ id: c.id, type: 'hide-category', extraData: { category: c, productCount: linkedProducts.length } });
        setIsConfirmOpen(true);
        return;
      }
    }
    executeCategoryToggle(c.id, newStatus);
  };

  const executeCategoryToggle = async (id: string, status: boolean) => {
    try {
      setCategories(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      await ProductService.updateCategory(id, { status, updated_by: userEmail });
      showToast(`Đã ${status ? 'hiện' : 'ẩn'} danh mục`);
      
      if (!status) {
        setProducts(prev => prev.map(p => p.category_id === id ? { ...p, status: false } : p));
        const linkedProducts = products.filter(p => p.category_id === id);
        if (linkedProducts.length > 0) {
          await Promise.all(linkedProducts.map(p => ProductService.update(p.id, { status: false, updated_by: userEmail })));
        }
      }
    } catch (error) {
      fetchData(currentPage, searchTerm);
      showToast('Lỗi khi thay đổi trạng thái', 'error');
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([]);
    else setSelectedIds(products.map(p => p.id));
  };

  const handleBulkStatus = async (status: boolean) => {
    try {
      setIsSubmitting(true);
      showToast(`Đang cập nhật ${selectedIds.length} sản phẩm...`, 'info');
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status } : p));
      await Promise.all(selectedIds.map(id => ProductService.update(id, { status, updated_by: userEmail })));
      showToast(`Đã ${status ? 'hiện' : 'ẩn'} ${selectedIds.length} sản phẩm thành công`);
    } catch (error) {
      showToast('Lỗi khi cập nhật hàng loạt', 'error');
      fetchData(currentPage, searchTerm);
    } finally {
      setIsSubmitting(false);
      setSelectedIds([]);
    }
  };

  const handleDeleteClick = (id: string | string[], type: 'product' | 'category' | 'bulk-product') => {
    setConfirmData({ id, type });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmData) return;
    try {
      setIsSubmitting(true);
      if (confirmData.type === 'product') {
        await ProductService.delete(confirmData.id as string);
        showToast('Đã xóa sản phẩm thành công');
      } else if (confirmData.type === 'bulk-product') {
        await Promise.all((confirmData.id as string[]).map(id => ProductService.delete(id)));
        showToast(`Đã xóa thành công`);
      } else if (confirmData.type === 'hide-category') {
        await executeCategoryToggle(confirmData.id as string, false);
      } else {
        const id = confirmData.id as string;
        const { data: linkedProducts } = await ProductService.getAll({ category: id });
        if (linkedProducts && (linkedProducts as any).data?.length > 0) {
          throw new Error(`Không thể xóa! Danh mục này vẫn đang chứa ${(linkedProducts as any).data.length} sản phẩm.`);
        }
        await ProductService.deleteCategory(id);
        showToast('Đã xóa danh mục thành công');
      }
      await fetchData(currentPage, searchTerm);
      setIsConfirmOpen(false);
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', price: '', discount_price: '', category_id: '', description: '', images: [], status: true, is_featured: false, specs: {} });
    setEditId(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', slug: '', icon: '', status: true });
    setEditingCategoryId(null);
  };

  const handleEditClick = (p: any) => {
    setFormData({ ...p, price: String(p.price), discount_price: String(p.discount_price || ''), category_id: p.category_id || '', status: p.status ?? true, is_featured: p.is_featured ?? false });
    setEditId(p.id);
    setIsModalOpen(true);
  };

  const handleDuplicateClick = (p: any) => {
    setFormData({
      name: `${p.name} (Bản sao)`,
      slug: `${p.slug}-copy-${Math.random().toString(36).substring(2, 7)}`,
      price: String(p.price),
      discount_price: String(p.discount_price || ''),
      category_id: p.category_id || '',
      description: p.description || '',
      images: [...(p.images || [])],
      status: p.status ?? true,
      is_featured: p.is_featured ?? false,
      specs: { ...(p.specs || {}) }
    });
    setEditId(null);
    setIsModalOpen(true);
    showToast('Đã sao chép thông tin. Hãy kiểm tra và Lưu.', 'info');
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)]">
      {/* --- Header & Filters Section (FIXED) --- */}
      <div className="flex-shrink-0 space-y-6 pb-6 border-b border-slate-100 mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-8 border-b border-slate-200 w-full md:w-auto">
            <button onClick={() => setActiveTab('products')} className={cn("pb-4 text-xl font-extrabold transition-all relative", activeTab === 'products' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}>
              Sản phẩm {activeTab === 'products' && <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-600 rounded-full" />}
            </button>
            <button onClick={() => setActiveTab('categories')} className={cn("pb-4 text-xl font-extrabold transition-all relative", activeTab === 'categories' ? "text-slate-900" : "text-slate-400 hover:text-slate-600")}>
              Danh mục {activeTab === 'categories' && <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-600 rounded-full" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeTab === 'categories' && <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl border-slate-200 hover:bg-slate-50 font-bold shadow-sm" onClick={() => { resetCategoryForm(); setIsCategoryModalOpen(true); }}><Tag size={18} /> Thêm danh mục</Button>}
            <Button className="gap-2 h-12 px-6 rounded-xl shadow-lg shadow-sky-600/20 font-bold bg-sky-600 hover:bg-sky-700" onClick={() => { resetForm(); setIsModalOpen(true); }}><Plus size={18} /> Thêm sản phẩm</Button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'visible', label: 'Hiện', icon: <Eye size={12} /> },
                  { id: 'hidden', label: 'Ẩn', icon: <EyeOff size={12} /> },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStatus(s.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                      activeStatus === s.id 
                        ? "bg-white text-sky-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Featured Filter */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {[
                  { id: 'all', label: 'Mọi loại' },
                  { id: 'featured', label: 'Nổi bật', icon: <Star size={12} className="fill-current" /> },
                  { id: 'regular', label: 'Thường', icon: <Zap size={12} /> },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFeatured(f.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                      activeFeatured === f.id 
                        ? "bg-white text-amber-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {f.icon}
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Category Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Danh mục:</span>
                <select 
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="Tất cả">Toàn bộ kho</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-grow max-w-xl">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên sản phẩm..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all text-sm font-medium shadow-inner" 
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 bg-slate-900 text-white p-1 rounded-2xl pl-4 shadow-xl">
                  <span className="text-[10px] font-black uppercase mr-2">{selectedIds.length} mục</span>
                  <Button variant="ghost" size="sm" className="h-10 rounded-xl text-white hover:bg-white/10" onClick={() => handleBulkStatus(true)}><Eye size={14} /></Button>
                  <Button variant="ghost" size="sm" className="h-10 rounded-xl text-white hover:bg-white/10" onClick={() => handleBulkStatus(false)}><EyeOff size={14} /></Button>
                  <Button variant="ghost" size="sm" className="h-10 rounded-xl text-red-400 hover:bg-red-500/20" onClick={() => handleDeleteClick(selectedIds, 'bulk-product')}><Trash2 size={14} /></Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-white/40" onClick={() => setSelectedIds([])}><X size={16} /></Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- Data Section (SCROLLABLE) --- */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {activeTab === 'products' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-white shadow-sm">
                  <tr className="bg-slate-50/80 backdrop-blur-md">
                    <th className="px-6 py-5 w-14">
                      <button onClick={handleSelectAll} className="text-slate-400 hover:text-sky-600 transition-colors">
                        {selectedIds.length === products.length && products.length > 0 ? <CheckSquare className="text-sky-600" size={20} /> : selectedIds.length > 0 ? <MinusSquare className="text-sky-600" size={20} /> : <Square size={20} />}
                      </button>
                    </th>
                    <th className="px-4 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Sản phẩm / Lịch sử</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Danh mục</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Giá niêm yết</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? [1, 2, 3].map(i => (<tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-10 text-center text-slate-300">Đang tải dữ liệu...</td></tr>)) : products.length > 0 ? products.map(p => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <tr key={p.id} className={cn("hover:bg-slate-50/50 transition-colors group cursor-pointer select-none", !p.status && "opacity-60 bg-slate-50/30", isSelected && "bg-sky-50 hover:bg-sky-100/50")} onDoubleClick={() => handleEditClick(p)} onClick={() => handleToggleSelection(p.id)}>
                        <td className="px-6 py-5"><div className={cn("transition-colors", isSelected ? "text-sky-600" : "text-slate-300 group-hover:text-slate-400")}>{isSelected ? <CheckSquare size={20} /> : <Square size={20} />}</div></td>
                        <td className="px-4 py-5 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 relative bg-slate-100 shrink-0 shadow-sm">
                            {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Tag size={20} /></div>}
                            {!p.status && (
                              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                                <EyeOff size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 py-1">
                            <p className="font-extrabold text-slate-900 leading-tight mb-0.5 flex items-center gap-2">{p.name}{p.is_featured && <Star size={12} className="text-yellow-500 fill-current" title="Sản phẩm nổi bật" />}{!p.status && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter font-black">Ẩn</span>}</p>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                <Clock size={10} /> {formatDate(p.created_at)}
                                <span className="text-slate-200">|</span>
                                <User size={10} /> {p.updated_by || p.created_by || 'admin'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5"><span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter border border-slate-200">{p.categories?.name || 'Chưa phân loại'}</span></td>
                        <td className="px-8 py-5"><div className="flex flex-col"><span className="font-black text-sky-600">{(p.discount_price || p.price).toLocaleString()}đ</span>{p.discount_price && <span className="text-[10px] text-slate-400 line-through font-bold">{p.price.toLocaleString()}đ</span>}</div></td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className={cn("w-9 h-9 rounded-xl transition-all shadow-sm", p.is_featured ? "text-yellow-500 hover:bg-yellow-50" : "text-slate-400 hover:bg-slate-100")} onClick={(e) => { e.stopPropagation(); handleToggleProductFeatured(p); }} title={p.is_featured ? "Bỏ nổi bật" : "Đặt làm nổi bật"}><Star size={15} className={p.is_featured ? "fill-current" : ""} /></Button>
                            <Button variant="ghost" size="icon" className={cn("w-9 h-9 rounded-xl transition-all shadow-sm", p.status ? "text-sky-600 hover:bg-sky-50" : "text-slate-400 hover:bg-slate-100")} onClick={(e) => { e.stopPropagation(); handleToggleProductStatus(p); }} title={p.status ? "Ẩn sản phẩm" : "Hiện sản phẩm"}>{p.status ? <Eye size={15} /> : <EyeOff size={15} />}</Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-600 border border-transparent hover:border-slate-100" onClick={(e) => { e.stopPropagation(); handleDuplicateClick(p); }} title="Sao chép"><Copy size={15} /></Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-600 border border-transparent hover:border-slate-100" onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} title="Sửa"><Edit2 size={15} /></Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-red-50 text-red-500 hover:shadow-md transition-all" onClick={(e) => { e.stopPropagation(); handleDeleteClick(p.id, 'product'); }} title="Xóa"><Trash2 size={15} /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (<tr><td colSpan={5} className="px-8 py-20 text-center"><div className="flex flex-col items-center gap-2 text-slate-400"><Search size={40} className="mb-2 opacity-20" /><p className="font-bold uppercase tracking-widest italic text-sm">Không tìm thấy sản phẩm nào</p></div></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className={cn("bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col group hover:shadow-md transition-all relative overflow-hidden", !cat.status && "opacity-60 bg-slate-50/20")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-5">
                    <div className="text-3xl bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-100 relative shadow-inner">
                      {cat.icon || '📦'}
                      {!cat.status && <div className="absolute -top-1 -right-1 bg-slate-500 text-white p-1 rounded-full border-2 border-white shadow-sm"><EyeOff size={10} /></div>}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 italic uppercase">{cat.name}{!cat.status && <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-black">ẨN</span>}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">slug: {cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all", cat.status ? "text-sky-600 hover:bg-sky-50" : "text-slate-400 hover:bg-slate-100")} onClick={() => handleToggleCategoryStatus(cat)}>{cat.status ? <Eye size={18} /> : <EyeOff size={18} />}</Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-50 hover:text-slate-600 transition-all" onClick={() => { setCategoryFormData({ name: cat.name, slug: cat.slug, icon: cat.icon || '', status: cat.status ?? true }); setEditingCategoryId(cat.id); setIsCategoryModalOpen(true); }}><Edit2 size={18} /></Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all" onClick={() => handleDeleteClick(cat.id, 'category')}><Trash2 size={18} /></Button>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
                  <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(cat.created_at)}</span>
                  <span className="flex items-center gap-1"><User size={10} /> {cat.updated_by || 'admin'}</span>
                </div>
              </div>
            ))}
            <button onClick={() => { resetCategoryForm(); setIsCategoryModalOpen(true); }} className="p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-sky-600 hover:text-sky-600 transition-all group bg-slate-50/30 hover:bg-sky-50/50 min-h-[160px]"><div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all shadow-sm"><Plus size={24} /></div><span className="font-black text-xs uppercase tracking-widest">Thêm danh mục mới</span></button>
          </div>
        )}
      </div>

      {/* --- Footer & Pagination Section (FIXED) --- */}
      {activeTab === 'products' && totalPages > 1 && (
        <div className="flex-shrink-0 p-6 border-t border-slate-100 bg-white mt-4 rounded-[2rem] shadow-sm flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị {products.length} / {totalCount} sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="rounded-xl border-slate-200 h-9 font-bold"><ChevronLeft size={16} /> TRƯỚC</Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-9 h-9 rounded-xl text-xs font-black transition-all", page === currentPage ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 scale-105" : "bg-white text-slate-400 border border-slate-100 hover:border-sky-600 hover:text-sky-600")}>{page}</button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="rounded-xl border-slate-200 h-9 font-bold">SAU <ChevronRight size={16} /></Button>
          </div>
        </div>
      )}

      {/* --- Modals --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight tracking-tighter uppercase italic">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                <p className="text-sm text-slate-500 font-medium">Điền đầy đủ thông tin bên dưới</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Tên sản phẩm</label><input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Ví dụ: Máy lạnh Daikin Inverter" className="w-full px-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium text-slate-900" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Đường dẫn (Slug)</label><input required name="slug" value={formData.slug} onChange={handleInputChange} placeholder="may-lanh-daikin-inverter" className="w-full px-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium bg-slate-50 text-slate-600" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Danh mục</label><select required name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full px-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium appearance-none bg-white text-slate-900"><option value="">-- Chọn danh mục --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Giá bán (VNĐ)</label><input required type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0" className="w-full px-5 h-14 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-extrabold text-sky-600 text-lg" /></div>
                <div className="space-y-2 flex items-center gap-4 pt-6"><label className="text-sm font-bold text-slate-700">Hiển thị:</label><button type="button" onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border shadow-sm", formData.status ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-500 border-slate-200")}>{formData.status ? <><Eye size={18}/> Đang hiện</> : <><EyeOff size={18}/> Đang ẩn</>}</button></div>
                <div className="space-y-2 flex items-center gap-4 pt-6"><label className="text-sm font-bold text-slate-700">Nổi bật:</label><button type="button" onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border shadow-sm", formData.is_featured ? "bg-yellow-50 text-yellow-700 border-yellow-100" : "bg-slate-50 text-slate-500 border-slate-200")}>{formData.is_featured ? <><Star size={18} className="fill-current"/> Nổi bật</> : <><Star size={18}/> Không</>}</button></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Mô tả sản phẩm</label><textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Nhập mô tả chi tiết..." className="w-full p-5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium min-h-[140px] text-slate-800 leading-relaxed" /></div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between items-center"><span>Hình ảnh sản phẩm</span><span className="text-sky-600 font-black bg-sky-50 px-3 py-1 rounded-full">{formData.images.length} ảnh</span></label>
                <div className="flex flex-wrap gap-4">
                  {formData.images.map((url, i) => (<div key={i} className="relative w-28 h-28 border border-slate-100 rounded-[1.5rem] overflow-hidden group shadow-sm bg-slate-50"><Image src={url} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><button type="button" onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))} className="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform"><X size={18}/></button></div></div>))}
                  <button type="button" disabled={uploadingImage} onClick={() => fileInputRef.current?.click()} className="w-28 h-28 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 hover:border-sky-600 hover:text-sky-600 transition-all bg-slate-50/50 hover:bg-sky-50/50 group">{uploadingImage ? <Loader2 className="animate-spin text-sky-600" size={32} /> : <><div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:shadow-md transition-all"><Upload size={20} className="group-hover:scale-110 transition-transform" /></div><span className="text-[10px] font-black uppercase tracking-widest">Tải ảnh</span></>}</button>
                  <input type="file" hidden ref={fileInputRef} accept="image/*" multiple onChange={handleImageUpload} />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex gap-4"><Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => setIsModalOpen(false)}>Đóng</Button><Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-sky-600 hover:bg-sky-700"> {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : (editingId ? 'Cập nhật ngay' : 'Thêm sản phẩm')}</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-1 text-slate-900 tracking-tighter uppercase italic">{editingCategoryId ? 'Cập nhật danh mục' : 'Danh mục mới'}</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">Tạo nhóm để phân loại sản phẩm tốt hơn</p>
            <form onSubmit={handleCategorySubmit} className="space-y-5">
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Tên danh mục</label><input required placeholder="Ví dụ: Máy Giặt" className="w-full h-14 px-5 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium text-slate-900" value={categoryFormData.name} onChange={e => { const val = e.target.value; setCategoryFormData({ ...categoryFormData, name: val, slug: val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/-+/g, '-') }); }} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Slug</label><input required placeholder="may-giat" className="w-full h-14 px-5 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all font-medium bg-slate-600 text-slate-600" value={categoryFormData.slug} onChange={e => setCategoryFormData({...categoryFormData, slug: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Biểu tượng (Emoji)</label><input placeholder="Ví dụ: 🧺, ❄️, 📺..." className="w-full h-14 px-5 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-sky-600/10 focus:border-sky-600 transition-all text-2xl text-center" value={categoryFormData.icon} onChange={e => setCategoryFormData({...categoryFormData, icon: e.target.value})} /></div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm"><span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Eye size={16} className="text-slate-400" /> Hiển thị trang chủ</span><button type="button" onClick={() => setCategoryFormData(prev => ({ ...prev, status: !prev.status }))} className={cn("px-5 py-2 rounded-xl font-bold text-[10px] transition-all border shadow-sm", categoryFormData.status ? "bg-sky-600 text-white border-sky-700" : "bg-slate-400 text-white border-slate-500")}>{categoryFormData.status ? 'ĐANG HIỆN' : 'ĐANG ẨN'}</button></div>
              <div className="flex gap-3 pt-4"><Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => { setIsCategoryModalOpen(false); setEditingCategoryId(null); }}>Hủy</Button><Button type="submit" disabled={isSubmitting} className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] bg-sky-600 hover:bg-sky-700"> {isSubmitting ? <Loader2 className="animate-spin" /> : 'Lưu lại'}</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={confirmData?.type === 'product' ? 'Xóa sản phẩm này?' : confirmData?.type === 'bulk-product' ? `Xóa ${Array.isArray(confirmData.id) ? confirmData.id.length : ''} sản phẩm?` : confirmData?.type === 'hide-category' ? 'Ẩn danh mục & sản phẩm?' : 'Xóa danh mục này?'}
        message={confirmData?.type === 'hide-category' ? `Danh mục này đang chứa ${confirmData.extraData?.productCount} sản phẩm. Việc ẩn danh mục đồng nghĩa với việc toàn bộ sản phẩm bên trong cũng sẽ bị ẩn khỏi trang chủ. Bạn vẫn muốn tiếp tục?` : (confirmData?.type === 'product' || confirmData?.type === 'bulk-product' ? 'Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.' : 'Dữ liệu danh mục sẽ bị xóa. Bạn chỉ có thể xóa nếu danh mục này không còn sản phẩm nào.')}
        confirmText={confirmData?.type === 'hide-category' ? "Đồng ý ẩn tất cả" : "Đồng ý xóa"}
        type={confirmData?.type === 'hide-category' ? 'warning' : 'danger'}
        isLoading={isSubmitting}
      />

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
}
