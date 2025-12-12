'use client';

import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/productApi';
import { inventoryApi } from '@/services/inventoryApi';
import { useParams } from 'next/navigation';
import { Spin, message, Skeleton, InputNumber } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@/types'; 

// --- CẬP NHẬT INTERFACE ---
interface ProductVariant {
  skuCode: string;
  color: string;
  size: string;
  price: number;
  imageUrl: string;
  galleryImages?: string[];
  isActive?: boolean; // ✅ THÊM TRƯỜNG NÀY ĐỂ NHẬN BIẾT ẨN/HIỆN
}

interface ProductLocal {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  variants?: ProductVariant[];
  skuCode?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const addToCart = useCartStore((state) => state.addToCart);

  // State
  const [selectedColorState, setSelectedColorState] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. Fetch Product
  const { data: product, isLoading: loadingProduct } = useQuery<ProductLocal>({
    queryKey: ['product', productId],
    queryFn: async () => {
        const res = await productApi.getById(productId);
        return res as unknown as ProductLocal;
    }
  });

  // ✅ LOGIC QUAN TRỌNG NHẤT: LỌC BIẾN THỂ ĐANG HOẠT ĐỘNG
  // Chỉ lấy những variant có isActive là true (hoặc undefined/null thì coi như true)
  const activeVariants = useMemo(() => {
      if (!product?.variants) return [];
      return product.variants.filter(v => v.isActive !== false);
  }, [product]);

  // 2. Logic Reset State khi đổi sản phẩm
  const [prevId, setPrevId] = useState(productId);
  if (productId !== prevId) {
    setPrevId(productId);
    setSelectedColorState(null);
    setSelectedSize(null);
    setBuyQuantity(1);
    setCurrentImageIndex(0);
  }

  // 3. Logic màu hiển thị (Dựa trên activeVariants)
  const effectiveColor = useMemo(() => {
      if (selectedColorState) return selectedColorState;
      // ✅ Fix: Chỉ lấy màu của biến thể đang hiện
      if (activeVariants.length > 0) return activeVariants[0].color;
      return null;
  }, [activeVariants, selectedColorState]);

  // 4. Logic tìm Variant hiện tại (Dựa trên activeVariants)
  const currentVariant = useMemo(() => {
    if (!product || !effectiveColor || !selectedSize) return null;
    // ✅ Fix: Tìm trong danh sách active
    return activeVariants.find(
      v => v.color === effectiveColor && v.size === selectedSize
    );
  }, [activeVariants, effectiveColor, selectedSize]);

  // 5. Fetch Stock
  const { data: inventory, isLoading: loadingInventory } = useQuery({
    queryKey: ['inventory', currentVariant?.skuCode],
    queryFn: () => inventoryApi.getStock(currentVariant!.skuCode),
    enabled: !!currentVariant, 
  });

  // --- LOGIC GALLERY ẢNH ---
  const galleryImages = useMemo(() => {
      // ✅ Fix: Tìm trong activeVariants
      const variantWithColor = activeVariants.find(v => v.color === effectiveColor);

      if (variantWithColor?.galleryImages && variantWithColor.galleryImages.length > 0) {
          return variantWithColor.galleryImages;
      }

      const mainImg = product?.imageUrl || "";
      const variantImg = variantWithColor?.imageUrl || mainImg;
      return Array.from(new Set([variantImg, mainImg])).filter(img => img);
  }, [product, activeVariants, effectiveColor]);

  const currentDisplayImage = galleryImages[currentImageIndex] || galleryImages[0];
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  // --- UI DATA HELPERS ---
  const colorVariants = useMemo(() => {
    // ✅ Fix: Dùng activeVariants để chỉ hiện màu đang bán
    const uniqueMap = new Map();
    activeVariants.forEach(v => {
        if(!uniqueMap.has(v.color)) uniqueMap.set(v.color, v);
    });
    return Array.from(uniqueMap.values());
  }, [activeVariants]);

  const availableSizes = useMemo(() => {
    if (!activeVariants || !effectiveColor) return [];
    // ✅ Fix: Dùng activeVariants để chỉ hiện size đang bán
    return activeVariants
      .filter(v => v.color === effectiveColor)
      .map(v => v.size)
      .sort();
  }, [activeVariants, effectiveColor]);

  const displayPrice = currentVariant?.price || product?.price;
  const stock = inventory?.quantity || 0;
  const isOutOfStock = stock <= 0;

  // --- ACTION MUA HÀNG ---
  const handleAddToCart = () => {
    if (!selectedSize) {
      message.warning('Vui lòng chọn Size!');
      return;
    }
    if (!currentVariant || !product) {
        message.error('Dữ liệu sản phẩm chưa sẵn sàng');
        return;
    }
    if (isOutOfStock) {
      message.error('Biến thể này đã hết hàng!');
      return;
    }

    const itemToAdd = {
        id: product.id || 0,
        skuCode: currentVariant.skuCode,
        name: `${product.name} (${effectiveColor} - Size ${selectedSize})`,
        price: currentVariant.price,
        imageUrl: currentVariant.imageUrl || product.imageUrl || "",
        category: product.category,
        quantity: buyQuantity,
        selectedColor: effectiveColor || "",
        selectedSize: selectedSize || ""
    };

    addToCart(itemToAdd as unknown as CartItem, buyQuantity); 
    message.success(`Đã thêm ${buyQuantity} sản phẩm vào giỏ!`);
  };

  if (loadingProduct) return <div className="h-screen flex justify-center items-center"><Spin size="large" /></div>;
  
  // Nếu sản phẩm không có, hoặc tất cả biến thể đều bị ẩn -> Báo lỗi hoặc ẩn luôn
  if (!product || (product.variants && product.variants.length > 0 && activeVariants.length === 0)) {
      return <div className="text-center mt-20 text-gray-500 text-lg">Sản phẩm này hiện đang tạm ngừng kinh doanh.</div>;
  }

  return (
    <main className="min-h-screen bg-white pb-20 pt-10 px-4 lg:px-12 animate-fade-in">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* CỘT TRÁI: GALLERY ẢNH */}
        <div className="lg:col-span-8 flex gap-4 sticky top-24 self-start h-[500px] lg:h-[600px]">
           <div className="hidden md:flex flex-col gap-3 overflow-y-auto no-scrollbar w-20">
              {galleryImages.map((img, idx) => (
                  <div 
                    key={idx}
                    onMouseEnter={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all
                        ${currentImageIndex === idx ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100 bg-gray-100'}
                    `}
                  >
                      <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
                  </div>
              ))}
           </div>

           <div className="flex-1 relative bg-[#F6F6F6] rounded-xl overflow-hidden flex items-center justify-center group">
              {galleryImages.length > 1 && (
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all z-10">
                      <LeftOutlined />
                  </button>
              )}
              <img
                src={currentDisplayImage || "https://via.placeholder.com/800"}
                alt={product.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105 cursor-zoom-in"
              />
              {galleryImages.length > 1 && (
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all z-10">
                      <RightOutlined />
                  </button>
              )}
           </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-medium text-[#111] mb-1">{product.name}</h1>
              <p className="text-[#111] font-medium">{product.category}</p>
              <p className="text-lg font-medium mt-2">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice || 0)}
              </p>
            </div>

            {/* CHỌN MẪU (ẢNH) */}
            {colorVariants.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-500">Chọn Màu Sắc</span>
                        <span className="text-black font-medium">{effectiveColor}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {colorVariants.map((v) => (
                            <div
                                key={v.skuCode}
                                onClick={() => { setSelectedColorState(v.color); setSelectedSize(null); setCurrentImageIndex(0); }}
                                className={`aspect-square rounded-md overflow-hidden cursor-pointer border hover:border-black transition-all bg-[#F6F6F6]
                                    ${effectiveColor === v.color ? 'border-black ring-1 ring-black' : 'border-transparent'}
                                `}
                            >
                                <img src={v.imageUrl || product.imageUrl} alt={v.color} className="w-full h-full object-contain mix-blend-multiply p-1"/>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CHỌN SIZE */}
            {availableSizes.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-500">Chọn Size</span>
                        <span className="text-gray-400 text-sm cursor-pointer hover:text-black">Size Guide</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {availableSizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`py-3 border rounded-md font-medium transition-all text-center hover:border-black
                                    ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-black'}
                                `}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* MUA HÀNG */}
            <div className="pt-4 border-t border-gray-100">
                {selectedSize && (
                    <div className="mb-4">
                        {loadingInventory ? <Skeleton.Button active size="small" /> : (
                            <div className={`flex items-center gap-2 font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                {isOutOfStock ? <><CloseCircleOutlined /> Hết hàng</> : <><CheckCircleOutlined /> Còn hàng (Kho: {stock})</>}
                            </div>
                        )}
                        {!isOutOfStock && (
                             <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm font-bold">Số lượng:</span>
                                <InputNumber min={1} max={stock} value={buyQuantity} onChange={(v) => setBuyQuantity(v || 1)} />
                             </div>
                        )}
                    </div>
                )}

                <button 
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isOutOfStock}
                    className="nike-btn shadow-lg w-full py-4 rounded-full bg-black text-white font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                >
                    {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                </button>
                
                <button className="w-full mt-3 py-4 rounded-full border border-gray-300 font-bold hover:border-black transition-colors flex justify-center items-center gap-2">
                    Yêu thích <span className="text-xl">♡</span>
                </button>
            </div>

            <div className="text-gray-600 text-base leading-relaxed mt-4">
                {product.description}
            </div>
        </div>
      </div>
    </main>
  );
}