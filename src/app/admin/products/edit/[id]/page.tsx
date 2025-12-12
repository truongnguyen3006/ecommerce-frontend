'use client';

import { useEffect, useState } from 'react';
import { 
  Form, Input, Button, Card, message, InputNumber, Skeleton, Tabs, 
  Row, Col, Tag, Table, Modal, Space, Image, Tooltip, Select, Divider, Switch 
} from 'antd';
import { 
  SaveOutlined, ArrowLeftOutlined, SyncOutlined, CheckCircleOutlined, 
  EditOutlined, FileImageOutlined, DeleteOutlined, RobotOutlined 
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { productApi } from '@/services/productApi';
import { Product, CreateProductRequest } from '@/types'; 
import Link from 'next/link';
import axiosClient from '@/lib/axiosClient';
import type { ColumnsType } from 'antd/es/table';
import { AxiosError } from 'axios';

// Định nghĩa Types
type VariantItem = NonNullable<Product['variants']>[number] & { isActive?: boolean };
interface InventoryGetResponse { skuCode: string; quantity: number; }
interface InventoryAdjustResponse { skuCode: string; newQuantity?: number; status?: string; }
interface ApiErrorResponse { error: string; message?: string; }

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form] = Form.useForm();          
  const [modalForm] = Form.useForm();     
  
  const [messageApi, contextHolder] = message.useMessage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [stockLoading, setStockLoading] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // --- STATE MODAL ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantItem | null>(null);
  const [originalColor, setOriginalColor] = useState<string>(''); 

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genModelCode, setGenModelCode] = useState<string>(''); 
  const [genColor, setGenColor] = useState<string>('');
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genPrice, setGenPrice] = useState<number | null>(null);
  const [genImage, setGenImage] = useState<string>(''); 
  const [genGallery, setGenGallery] = useState<string[]>(['', '', '', '']); 

  const fetchProduct = async () => {
    try {
      const data = await productApi.getById(Number(id)) as unknown as Product;
      setProduct(data);
      form.setFieldsValue({
          name: data.name, 
          description: data.description,
          basePrice: data.price, 
          imageUrl: data.imageUrl,
          category: data.category // Populate category
      });

      if (data.variants && data.variants.length > 0) {
          const firstSku = data.variants[0].skuCode;
          const prefix = firstSku.split('-')[0];
          setGenModelCode(prefix); 
          fetchQuantities(data.variants);
      } else if (data.name) {
             const suggest = data.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3);
             setGenModelCode(suggest);
      }
    } catch (error: unknown) {
      router.push('/admin/products');
    }
  };

  const fetchQuantities = async (variants: VariantItem[]) => {
      const newQuantities: Record<string, number> = {};
      await Promise.all(variants.map(async (v) => {
          try {
              const res = await axiosClient.get(`/api/inventory/${v.skuCode}`) as InventoryGetResponse;
              newQuantities[v.skuCode] = (res && typeof res.quantity === 'number') ? res.quantity : 0;
          } catch (err: unknown) { newQuantities[v.skuCode] = 0; }
      }));
      setQuantities(newQuantities);
  };

  useEffect(() => { if (id) fetchProduct(); }, [id]);

  // --- LOGIC 0: CẬP NHẬT THÔNG TIN CHUNG ---
  const handleUpdateInfo = async (values: Partial<CreateProductRequest>) => {
    setLoading(true);
    try {
      await productApi.update(Number(id), values);
      messageApi.success('Đã lưu thông tin chung!');
      fetchProduct();
    } catch (error: unknown) { 
        messageApi.error('Lỗi lưu thông tin'); 
        console.error(error);
    } finally { 
        setLoading(false); 
    }
  };

  const handleAdjustStock = async (skuCode: string) => {
    const quantity = stockInputs[skuCode];
    if (!quantity) return;
    setStockLoading(prev => ({ ...prev, [skuCode]: true }));
    try {
        const payload = { skuCode, adjustmentQuantity: quantity, reason: 'Admin Edit' };
        const res = await axiosClient.post('/api/inventory/adjust', payload) as InventoryAdjustResponse;
        
        if (res.newQuantity !== undefined) {
            messageApi.open({ type: 'success', content: `Kho mới: ${res.newQuantity}`, icon: <CheckCircleOutlined style={{color:'#52c41a'}}/> });
            setQuantities(prev => ({ ...prev, [skuCode]: res.newQuantity! }));
        }
        setStockInputs(prev => { const n = {...prev}; delete n[skuCode]; return n; });
    } catch (e: unknown) { 
        const err = e as AxiosError<ApiErrorResponse>;
        messageApi.error(err.response?.data?.error || 'Lỗi cập nhật kho'); 
    } 
    finally { setStockLoading(prev => ({ ...prev, [skuCode]: false })); }
  };

  // --- LOGIC 1: SỬA BIẾN THỂ LẺ ---
  const openEditModal = (variant: VariantItem) => {
      setEditingVariant(variant);
      setOriginalColor(variant.color); 
      
      modalForm.setFieldsValue({
          skuCode: variant.skuCode,
          color: variant.color, 
          size: variant.size, 
          price: variant.price, 
          imageUrl: variant.imageUrl,
          galleryImages: variant.galleryImages || ['', '', '', '']
      });
      setIsEditModalOpen(true);
  };

  const handleSaveSingleVariant = async () => {
      try {
          const values = await modalForm.validateFields();
          let updatedVariants = product?.variants ? [...product.variants] : [];
          const cleanGallery = (values.galleryImages as string[]).filter(img => img && img.trim() !== '');
          const newColorClean = values.color.trim().toUpperCase().replace(/[^a-zA-Z0-9]/g, '');

          const generateNewSku = (oldSku: string, newColorPart: string) => {
              const parts = oldSku.split('-');
              if (parts.length >= 2) {
                  const prefix = parts[0];
                  const size = parts[parts.length - 1]; 
                  return `${prefix}-${newColorPart}-${size}`;
              }
              return oldSku; 
          };

          updatedVariants = updatedVariants.map((v) => {
              if (v.skuCode === editingVariant?.skuCode) {
                  const isColorChanged = v.color.toLowerCase() !== values.color.trim().toLowerCase();
                  const finalSku = isColorChanged ? generateNewSku(v.skuCode, newColorClean) : v.skuCode;
                  return { ...v, ...values, skuCode: finalSku, galleryImages: cleanGallery }; 
              }
              if (v.color.toLowerCase() === originalColor.toLowerCase()) {
                  const newSkuForOther = generateNewSku(v.skuCode, newColorClean);
                  return { ...v, skuCode: newSkuForOther, color: values.color, imageUrl: values.imageUrl, galleryImages: cleanGallery }; 
              }
              return v;
          });

          await productApi.update(Number(id), { ...product, variants: updatedVariants } as unknown as CreateProductRequest);

          if (originalColor.toLowerCase() !== values.color.trim().toLowerCase()) {
             messageApi.success(`Đã cập nhật màu và tạo lại SKU mới!`);
          } else {
             messageApi.success('Cập nhật thành công!');
          }
          setIsEditModalOpen(false);
          fetchProduct();
      } catch (e: unknown) { messageApi.error('Lỗi khi lưu biến thể'); }
  };

  // --- LOGIC 2: TẠO HÀNG LOẠT (BULK ADD) ---
  const handleBulkGenerate = async () => {
    if (!genColor || genSizes.length === 0) {
      messageApi.warning('Vui lòng nhập Màu và ít nhất 1 Size!'); return;
    }
    const currentVariants = product?.variants ? [...product.variants] : [];
    const validGallery = genGallery.filter(url => url.trim() !== '');
    
    const effectivePrice = (genPrice !== null && genPrice > 0) 
                            ? genPrice 
                            : (product?.price || 0);

    const newVariants = genSizes.map(size => ({
      skuCode: `${genModelCode.toUpperCase().trim()}-${genColor.toUpperCase().trim()}-${size}`, 
      color: genColor, 
      size: size, 
      initialQuantity: 0, 
      price: effectivePrice,
      imageUrl: genImage, 
      galleryImages: validGallery,
      isActive: true
    }));

    const duplicate = newVariants.find(nv => currentVariants.some(cv => cv.skuCode === nv.skuCode));
    if (duplicate) { messageApi.error(`SKU ${duplicate.skuCode} đã tồn tại!`); return; }

    try {
        await productApi.update(Number(id), { ...product, variants: [...currentVariants, ...newVariants] } as unknown as CreateProductRequest);
        messageApi.success(`Đã thêm mới ${genSizes.length} size!`);
        setIsGeneratorOpen(false);
        setGenColor(''); setGenSizes([]); setGenImage(''); setGenGallery(['','','','']);
        fetchProduct();
    } catch (e: unknown) { messageApi.error('Lỗi khi thêm biến thể'); }
  };

  // --- LOGIC 3: TOGGLE ẨN/HIỆN ---
  const handleToggleStatus = async (skuCode: string, checked: boolean) => {
      if (!product || !product.variants) return;
      const updatedVariants = product.variants.map(v => 
          v.skuCode === skuCode ? { ...v, isActive: checked } : v
      );
      try {
          setProduct({ ...product, variants: updatedVariants });
          await productApi.update(Number(id), { ...product, variants: updatedVariants } as unknown as CreateProductRequest);
          messageApi.success(checked ? `Đã hiện ${skuCode}` : `Đã ẩn ${skuCode}`);
      } catch (e) {
          messageApi.error('Lỗi cập nhật trạng thái');
          fetchProduct(); 
      }
  };

  // --- LOGIC 4: XÓA VĨNH VIỄN ---
  const handleDeleteVariant = async (skuCode: string) => {
      Modal.confirm({
          title: 'Xóa vĩnh viễn biến thể?',
          content: (
              <div>
                  <p>Bạn đang xóa SKU: <b>{skuCode}</b></p>
                  <p className="text-red-500 text-xs">Lưu ý: Dữ liệu sẽ mất hoàn toàn.</p>
              </div>
          ),
          okText: 'Xóa Vĩnh Viễn', okButtonProps: { danger: true }, cancelText: 'Hủy',
          onOk: async () => {
              const updatedVariants = product?.variants?.filter(v => v.skuCode !== skuCode);
              await productApi.update(Number(id), { ...product, variants: updatedVariants } as unknown as CreateProductRequest);
              messageApi.success('Đã xóa biến thể khỏi hệ thống');
              fetchProduct();
          }
      });
  };

  const updateGenGallery = (index: number, value: string) => {
      const newGallery = [...genGallery]; newGallery[index] = value; setGenGallery(newGallery);
  };

  // --- COLUMNS ---
  const variantColumns: ColumnsType<VariantItem> = [
    {
        title: 'Ảnh', dataIndex: 'imageUrl', key: 'imageUrl', width: 60, align: 'center',
        render: (url: string) => <Image src={url} width={40} height={40} className="rounded border" fallback="https://via.placeholder.com/40" />
    },
    {
        title: 'SKU & Màu', key: 'info',
        render: (_, record) => (
            <div className={record.isActive === false ? 'opacity-50' : ''}>
                <div className="font-bold text-xs text-gray-700">{record.skuCode}</div>
                <Tag color="geekblue" className="mt-1">{record.color}</Tag>
                {record.isActive === false && <Tag color="error">Đang ẩn</Tag>}
            </div>
        )
    },
    { title: 'Size', dataIndex: 'size', width: 60, render: (s: string) => <b className="text-base">{s}</b> },
    {
        title: 'Giá', dataIndex: 'price', width: 100, 
        render: (p) => p ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p) : '0 ₫'
    },
    {
        title: 'Tồn kho', key: 'stock', width: 80, align: 'center',
        render: (_, r) => {
            const q = quantities[r.skuCode];
            return q === undefined ? '...' : <span className={q>0?'text-blue-600 font-bold':'text-red-500'}>{q}</span>
        }
    },
    {
        title: 'Nhập/Xuất Kho', key: 'adj', width: 160,
        render: (_, r) => (
            <Space.Compact style={{width:'100%'}}>
                <InputNumber placeholder="+/-" value={stockInputs[r.skuCode]} onChange={v=>setStockInputs(p=>({...p,[r.skuCode]:v||0}))} onPressEnter={()=>handleAdjustStock(r.skuCode)}/>
                <Button type="primary" icon={<SyncOutlined/>} loading={stockLoading[r.skuCode]} onClick={()=>handleAdjustStock(r.skuCode)}/>
            </Space.Compact>
        )
    },
    {
        title: 'Trạng thái', key: 'status', width: 100, align: 'center',
        render: (_, r) => (
            <Switch 
                checkedChildren="Hiện" 
                unCheckedChildren="Ẩn" 
                checked={r.isActive !== false} 
                onChange={(checked) => handleToggleStatus(r.skuCode, checked)}
            />
        )
    },
    {
        key: 'act', width: 80, align: 'center',
        render: (_, r) => (
            <Space size="small">
                <Tooltip title="Sửa chi tiết"><Button type="text" icon={<EditOutlined/>} onClick={()=>openEditModal(r)}/></Tooltip>
                <Tooltip title="Xóa vĩnh viễn"><Button type="text" danger icon={<DeleteOutlined/>} onClick={()=>handleDeleteVariant(r.skuCode)}/></Tooltip>
            </Space>
        )
    }
  ];

  if (!product) return <div className="p-12"><Skeleton active paragraph={{rows:6}}/></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
       {contextHolder}
       <div className="py-6"><Link href="/admin/products" className="text-gray-500 hover:text-black flex items-center gap-2 mb-2"><ArrowLeftOutlined/> Quay lại</Link><h1 className="text-3xl font-bold m-0">{product.name}</h1></div>

       <Row gutter={24}>
          <Col xs={24} lg={16}>
             <Tabs defaultActiveKey="2" type="card" items={[
                 {
                     key: '1', label: 'Thông tin chung',
                     children: (
                         <Card bordered={false} className="shadow-sm rounded-b-lg border border-gray-100">
                             <Form form={form} layout="vertical" onFinish={handleUpdateInfo}>
                                 <Form.Item label="Tên SP" name="name"><Input/></Form.Item>
                                 <Row gutter={16}>
                                     <Col span={12}><Form.Item label="Giá gốc" name="basePrice"><InputNumber style={{width:'100%'}} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} addonAfter="VND"/></Form.Item></Col>
                                     <Col span={12}><Form.Item label="Thumbnail" name="imageUrl"><Input/></Form.Item></Col>
                                 </Row>
                                 <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Danh mục" name="category">
                                            <Select>
                                                <Select.Option value="Giày Nam">Giày Nam</Select.Option>
                                                <Select.Option value="Giày Nữ">Giày Nữ</Select.Option>
                                                <Select.Option value="Trẻ Em">Trẻ Em</Select.Option>
                                                <Select.Option value="Phụ Kiện">Phụ Kiện</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                 </Row>
                                 <Form.Item label="Mô tả" name="description"><Input.TextArea rows={4}/></Form.Item>
                                 <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined/>} className="bg-black">Lưu thay đổi</Button>
                             </Form>
                         </Card>
                     )
                 },
                 {
                     key: '2', label: `Biến thể (${product.variants?.length||0})`,
                     children: (
                         <Card bordered={false} className="shadow-sm rounded-b-lg p-0 border border-gray-100" bodyStyle={{padding:0}}
                            title={
                                <Button type="dashed" icon={<RobotOutlined />} onClick={()=>setIsGeneratorOpen(true)} block className="text-blue-600 border-blue-200 bg-blue-50 h-10 font-medium">
                                    Thêm Màu/Size Mới Hàng Loạt (Bulk Add)
                                </Button>
                            }
                         >
                             {/* ✅ ĐÃ THÊM PAGINATION VÀO TABLE */}
                             <Table 
                                dataSource={product.variants} 
                                columns={variantColumns} 
                                rowKey="skuCode" 
                                scroll={{x:750}}
                                pagination={{
                                    defaultPageSize: 5,
                                    showSizeChanger: true, 
                                    pageSizeOptions: ['5', '10', '20', '50'],
                                    showTotal: (total) => `Tổng ${total} biến thể`,
                                    position: ['bottomRight']
                                }}
                             />
                         </Card>
                     )
                 }
             ]} />
          </Col>
          <Col xs={24} lg={8}>
              <Card title="Ảnh đại diện" bordered={false} className="shadow-sm border"><img src={product.imageUrl} className="w-full rounded" alt="Preview"/></Card>
          </Col>
       </Row>

       {/* MODAL EDIT */}
       <Modal title={<span>Sửa biến thể <Tag color="orange">{editingVariant?.skuCode}</Tag></span>} open={isEditModalOpen} onOk={handleSaveSingleVariant} onCancel={()=>setIsEditModalOpen(false)} destroyOnClose width={650}>
           <Form form={modalForm} layout="vertical" className="mt-4">
               <Row gutter={16}>
                   <Col span={12}><Form.Item label="Màu sắc" name="color" rules={[{required: true}]} help="Sửa tên màu sẽ cập nhật cho cả nhóm size cùng màu."><Input /></Form.Item></Col>
                   <Col span={12}><Form.Item label="Size" name="size"><Input disabled className="bg-gray-100 text-gray-500"/></Form.Item></Col>
               </Row>
               <Form.Item label="Giá bán riêng" name="price"><InputNumber style={{width:'100%'}} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} addonAfter="VND"/></Form.Item>
               <Divider>Hình ảnh & Gallery</Divider>
               <Form.Item label="Ảnh đại diện (Thumbnail)" name="imageUrl"><Input prefix={<FileImageOutlined/>} allowClear/></Form.Item>
               <div className="bg-gray-50 p-4 rounded border">
                   <div className="mb-2 text-sm font-semibold text-gray-700">Bộ sưu tập ảnh (Gallery)</div>
                   <Form.List name="galleryImages">
                       {(fields) => (<div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((idx) => (<Form.Item key={idx} name={idx} noStyle><Input placeholder={`Link ảnh chi tiết ${idx + 1}`} size="small" prefix={<span className="text-gray-400 text-xs">#{idx+1}</span>} /></Form.Item>))}</div>)}
                   </Form.List>
               </div>
           </Form>
       </Modal>

       {/* MODAL GENERATOR */}
       <Modal title={<div className="flex items-center gap-2"><RobotOutlined className="text-blue-600"/> <b>Thêm Biến Thể Hàng Loạt</b></div>} open={isGeneratorOpen} onCancel={()=>setIsGeneratorOpen(false)} onOk={handleBulkGenerate} okText="Tạo & Lưu Ngay" width={700} destroyOnClose>
           <Form layout="vertical" className="mt-4">
                <div className="bg-gray-100 p-4 rounded mb-4 border cursor-not-allowed">
                    <Form.Item label="Mã Model (Cố định)" required style={{marginBottom:0}}><Input value={genModelCode} disabled className="bg-gray-200 text-gray-500 font-bold"/></Form.Item>
                </div>
                <Row gutter={16}>
                    <Col span={10}><Form.Item label="Tên Màu" required><Input value={genColor} onChange={e=>setGenColor(e.target.value)} placeholder="VD: White"/></Form.Item></Col>
                    <Col span={14}><Form.Item label="Các Size" required><Select mode="tags" value={genSizes} onChange={setGenSizes} placeholder="VD: 39, 40, 41" tokenSeparators={[',',' ']}/></Form.Item></Col>
                </Row>
                <Divider style={{margin:'12px 0'}}/>
                <Form.Item label="Thumbnail"><Input value={genImage} onChange={e=>setGenImage(e.target.value)} addonBefore="URL"/></Form.Item>
                <div className="grid grid-cols-4 gap-2">{genGallery.map((url,i)=><Input key={i} size="small" value={url} onChange={e=>updateGenGallery(i,e.target.value)} placeholder={`Img ${i+1}`}/>)}</div>
                
                <Form.Item label="Giá bán riêng (Bỏ trống sẽ lấy giá gốc)" style={{marginTop: 10}}>
                    <InputNumber 
                        style={{width: '100%'}} 
                        value={genPrice} 
                        onChange={setGenPrice}
                        formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} 
                        addonAfter="VND"
                        placeholder={`${new Intl.NumberFormat('vi-VN').format(product?.price || 0)} (Mặc định)`}
                    />
                </Form.Item>
           </Form>
       </Modal>
    </div>
  );
}