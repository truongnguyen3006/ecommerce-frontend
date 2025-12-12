'use client';

import { useState } from 'react';
import { Form, Input, InputNumber, Button, Card, Select, message, Modal, Row, Col, Divider, Tag, Table, Space, Typography, Tooltip } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, RobotOutlined, DeleteOutlined, CloudUploadOutlined, BarcodeOutlined, InboxOutlined, DollarOutlined, FileImageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table'; // ✅ Import Type cho Table Columns
import { useRouter } from 'next/navigation';
import { productApi } from '@/services/productApi';
import Link from 'next/link';
import { CreateProductRequest, CreateVariantRequest } from '@/types';

// ✅ SỬA LỖI: Xóa 'isListField' vì FormListFieldData của Antd không trả về thuộc tính này
interface FormListField {
  key: number;
  name: number;
  fieldKey?: number;
}

const { TextArea } = Input;
const { Title } = Typography;

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  // --- STATE CHO MODAL TẠO NHANH ---
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  const [genModelCode, setGenModelCode] = useState<string>(''); 
  const [genColor, setGenColor] = useState<string>('');
  const [genSizes, setGenSizes] = useState<string[]>([]);
  const [genPrice, setGenPrice] = useState<number | null>(null);
  const [genImage, setGenImage] = useState<string>(''); 
  const [genGallery, setGenGallery] = useState<string[]>(['', '', '', '']); 

  const handleFinish = async (values: CreateProductRequest) => {
    // Ép kiểu tường minh cho variants lấy từ form
    const formVariants = form.getFieldValue('variants') as CreateVariantRequest[];

    if (!formVariants || formVariants.length === 0) {
      message.error('Cần ít nhất 1 biến thể sản phẩm!');
      return;
    }
    
    setLoading(true);
    try {
      let mainImage = values.imageUrl;
      const mainGallery = values.galleryImages || [];

      if (!mainImage && formVariants[0].imageUrl) {
          mainImage = formVariants[0].imageUrl;
      }

      const payload: CreateProductRequest = { 
        ...values,
        imageUrl: mainImage,
        galleryImages: mainGallery,
        variants: formVariants.map(v => ({
            ...v,
            initialQuantity: v.initialQuantity || 0,
            price: v.price || values.basePrice,
            galleryImages: v.galleryImages || []
        }))
      };
      
      await productApi.create(payload);
      message.success('Tạo sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error: unknown) {
      console.error(error);
      message.error('Lỗi khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = () => {
    if (!genModelCode || !genColor || genSizes.length === 0) {
      message.warning('Vui lòng nhập Mã dòng SP, tên Màu và chọn Size');
      return;
    }

    const validGallery = genGallery.filter(url => url.trim() !== '');
    const currentVariants: CreateVariantRequest[] = form.getFieldValue('variants') || [];
    
    const newVariants: CreateVariantRequest[] = genSizes.map(size => ({
      skuCode: `${genModelCode.toUpperCase().trim()}-${genColor.toUpperCase().trim()}-${size}`, 
      color: genColor,
      size: size,
      initialQuantity: 100, 
      price: genPrice ?? 0, 
      imageUrl: genImage, 
      galleryImages: validGallery 
    }));

    form.setFieldsValue({
      variants: [...currentVariants, ...newVariants]
    });

    setIsGeneratorOpen(false);
    setGenColor('');
    setGenSizes([]);
    message.success(`Đã thêm ${genSizes.length} biến thể màu ${genColor}!`);
  };

  const updateGenGallery = (index: number, value: string) => {
      const newGallery = [...genGallery];
      newGallery[index] = value;
      setGenGallery(newGallery);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8">
      {/* HEADER PAGE */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <Link href="/admin/products" className="text-gray-500 hover:text-black flex items-center gap-2 mb-1 transition-colors">
              <ArrowLeftOutlined /> Quay lại danh sách
           </Link>
           <Title level={2} style={{ margin: 0 }}>Thêm Sản Phẩm Mới</Title>
        </div>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish} 
        initialValues={{ category: 'Giày Nam' }}
        size="large"
      >
        <Row gutter={24}>
            {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
            <Col xs={24} lg={16}>
                <Card title="Thông tin chung" bordered={false} className="shadow-sm rounded-lg mb-6">
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="VD: Nike Air Jordan 1 Low" className="font-medium" />
                    </Form.Item>
                    
                    <Form.Item label="Mô tả sản phẩm" name="description">
                        <TextArea rows={5} placeholder="Nhập mô tả chi tiết, chất liệu, công nghệ..." showCount maxLength={2000} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                             <Form.Item label="Giá niêm yết (Base Price)" name="basePrice" rules={[{ required: true }]}>
                                <InputNumber<number>
                                    className="w-full"
                                    addonAfter="VND"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    // Parser nhận string | undefined và trả về number
                                    parser={(value: string | undefined) => {
                                        if (!value) return 0;
                                        return parseFloat(value.replace(/\$\s?|(,*)/g, ''));
                                    }}
                                    placeholder="0"
                                />
                             </Form.Item>
                        </Col>
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
                </Card>

                {/* KHU VỰC BIẾN THỂ */}
                <Card 
                  title={
                      <div className="flex items-center gap-2">
                          <span>Danh sách Phiên bản</span>
                          <Tag color="blue">Màu & Size</Tag>
                      </div>
                  } 
                  bordered={false} 
                  className="shadow-sm rounded-lg"
                  extra={
                     <Button type="primary" className="bg-black hover:bg-gray-800 shadow-none" icon={<RobotOutlined />} onClick={() => setIsGeneratorOpen(true)}>
                       Tạo Nhanh (Bulk Add)
                     </Button>
                  }
                >
                  <Form.List name="variants">
                    {(fields, { remove }) => {
                        // ✅ ĐỊNH NGHĨA COLUMNS BÊN TRONG ĐỂ CÓ QUYỀN TRUY CẬP 'remove' VÀ 'form'
                        // ✅ KHÔNG DÙNG 'ANY' -> DÙNG ColumnsType<FormListField>
                        const columns: ColumnsType<FormListField> = [
                            {
                                title: 'Thông tin SKU',
                                key: 'sku',
                                width: '35%',
                                render: (_, field) => (
                                    <div className="flex flex-col gap-1">
                                        <Form.Item name={[field.name, 'skuCode']} noStyle>
                                            <Input prefix={<BarcodeOutlined className="text-gray-400"/>} className="bg-gray-50 border-none text-xs font-mono" readOnly />
                                        </Form.Item>
                                        
                                        <Space size={4}>
                                            <Tag color="geekblue">{form.getFieldValue(['variants', field.name, 'color']) as string}</Tag>
                                            <Tag className="font-bold">{form.getFieldValue(['variants', field.name, 'size']) as string}</Tag>
                                        </Space>

                                        {/* Chỉ giữ hidden input cho ImageUrl (string), bỏ galleryImages (array) để tránh lỗi render */}
                                        <Form.Item name={[field.name, 'imageUrl']} hidden><Input /></Form.Item>
                                    </div>
                                )
                            },
                            {
                                title: 'Giá bán lẻ',
                                key: 'price',
                                width: '25%',
                                render: (_, field) => (
                                    <Form.Item name={[field.name, 'price']} style={{ marginBottom: 0 }}>
                                        <InputNumber<number>
                                            className="w-full" 
                                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(v: string | undefined) => {
                                                if (!v) return 0;
                                                return parseFloat(v.replace(/\$\s?|(,*)/g, ''));
                                            }}
                                            controls={false}
                                            addonAfter="đ"
                                        />
                                    </Form.Item>
                                )
                            },
                            {
                                title: 'Tồn kho',
                                key: 'stock',
                                width: '20%',
                                render: (_, field) => (
                                    <Form.Item name={[field.name, 'initialQuantity']} style={{ marginBottom: 0 }}>
                                        <InputNumber className="w-full" placeholder="0" />
                                    </Form.Item>
                                )
                            },
                            {
                                title: '',
                                key: 'action',
                                width: '10%',
                                align: 'center',
                                render: (_, field) => (
                                     <Tooltip title="Xóa biến thể này">
                                         <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                     </Tooltip>
                                )
                            }
                        ];

                        return (
                          <>
                            {fields.length > 0 ? (
                               <Table<FormListField>
                                    dataSource={fields}
                                    pagination={false}
                                    rowKey={(record) => record.key}
                                    size="middle"
                                    className="border rounded-md overflow-hidden"
                                    columns={columns}
                               />
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <RobotOutlined className="text-4xl text-gray-300 mb-3" />
                                    <p className="text-gray-500 mb-4">Chưa có phiên bản nào được tạo.</p>
                                    <Button type="dashed" onClick={() => setIsGeneratorOpen(true)}>Mở công cụ tạo nhanh</Button>
                                </div>
                            )}
                          </>
                        );
                    }}
                  </Form.List>
                </Card>
            </Col>

            {/* CỘT PHẢI: GHI CHÚ */}
            <Col xs={24} lg={8}>
                <Card title="Lưu ý hình ảnh" bordered={false} className="shadow-sm rounded-lg h-full bg-blue-50/50">
                    <div className="space-y-4 text-gray-600">
                        <div className="flex items-start gap-3">
                            <CloudUploadOutlined className="text-xl text-blue-500 mt-1" />
                            <div>
                                <span className="font-semibold text-gray-800 block">Tự động hóa</span>
                                <span className="text-sm">Hệ thống sẽ tự động lấy ảnh của <strong>biến thể đầu tiên</strong> làm ảnh đại diện chính (Thumbnail) cho sản phẩm ngoài trang chủ.</span>
                            </div>
                        </div>
                        <Divider style={{ margin: '12px 0' }} />
                        <div className="flex items-start gap-3">
                            <FileImageOutlined className="text-xl text-green-500 mt-1" />
                            <div>
                                <span className="font-semibold text-gray-800 block">URL Hình ảnh</span>
                                <span className="text-sm">Hiện tại hệ thống hỗ trợ nhập Link ảnh trực tiếp. Hãy đảm bảo link ảnh public và có độ phân giải tốt.</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>

        {/* FOOTER ACTIONS */}
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md px-8 py-4 border-t border-gray-200 shadow-xl flex justify-end gap-3 z-50">
           <Button size="large" onClick={() => router.back()} className="min-w-[100px]">Hủy bỏ</Button>
           <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" className="bg-black min-w-[150px] shadow-lg shadow-black/20">
             Lưu Sản Phẩm
           </Button>
        </div>
      </Form>

      {/* === MODAL TẠO NHANH === */}
      <Modal 
        title={<div className="flex items-center gap-2"><RobotOutlined className="text-blue-600"/> <span className="font-bold">Công cụ tạo SKU hàng loạt</span></div>}
        open={isGeneratorOpen} 
        onCancel={() => setIsGeneratorOpen(false)} 
        onOk={handleBulkGenerate} 
        okText="Tạo Biến thể"
        cancelText="Đóng"
        width={720}
        centered
        maskClosable={false}
      >
         <Form layout="vertical" className="mt-4">
            {/* 1. MÃ DÒNG SẢN PHẨM */}
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-5">
                <Form.Item 
                    label={<span className="font-bold text-blue-900">Mã Model (Model Code)</span>}
                    required
                    style={{ marginBottom: 0 }}
                    tooltip="Mã định danh duy nhất cho dòng sản phẩm này. Ví dụ: JD1, AF1, YZ350"
                >
                    <Input 
                        value={genModelCode} 
                        onChange={e => setGenModelCode(e.target.value)} 
                        placeholder="VD: JD1" 
                        size="large"
                        className="font-black text-blue-900 uppercase tracking-widest" 
                        prefix={<BarcodeOutlined />}
                        suffix={<span className="text-xs text-gray-400 uppercase">{genModelCode || 'CODE'}</span>}
                    />
                </Form.Item>
                <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <span>Preview SKU:</span>
                    <Tag className="m-0 font-mono bg-white border-blue-200">{genModelCode ? genModelCode.toUpperCase() : 'CODE'} - {genColor ? genColor.toUpperCase() : 'COLOR'} - SIZE</Tag>
                </div>
            </div>

            {/* 2. MÀU VÀ SIZE */}
            <Row gutter={16}>
                <Col span={10}>
                    <Form.Item label="Tên Màu" tooltip="Ví dụ: Red, Black White, Panda...">
                        <Input 
                            value={genColor} 
                            onChange={e => setGenColor(e.target.value)} 
                            placeholder="Nhập tên màu..." 
                            prefix={<div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border border-gray-300"></div>}
                        />
                    </Form.Item>
                </Col>
                <Col span={14}>
                    <Form.Item label="Chọn Size (Nhập nhiều)" tooltip="Gõ số rồi ấn Enter">
                        <Select 
                            mode="tags" 
                            style={{ width: '100%' }} 
                            placeholder="VD: 39, 40, 41, 42" 
                            value={genSizes} 
                            onChange={setGenSizes} 
                            tokenSeparators={[',', ' ']} 
                            suffixIcon={<InboxOutlined />}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Divider style={{ margin: '12px 0 24px 0' }} />

            {/* 3. HÌNH ẢNH */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-5">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-700 flex items-center gap-2"><FileImageOutlined /> Hình ảnh cho màu này</span>
                </div>
                
                <Form.Item label="Ảnh đại diện (Thumbnail)" style={{ marginBottom: 12 }}>
                    <Input 
                        value={genImage} 
                        onChange={e => setGenImage(e.target.value)} 
                        placeholder="Paste URL ảnh đại diện tại đây..." 
                        addonBefore="URL"
                    />
                </Form.Item>

                <div className="mb-2 text-sm font-medium text-gray-600">Bộ sưu tập (Gallery):</div>
                <div className="grid grid-cols-2 gap-3">
                    {genGallery.map((url, idx) => (
                        <Input 
                            key={idx} 
                            value={url} 
                            onChange={e => updateGenGallery(idx, e.target.value)} 
                            placeholder={`Ảnh chi tiết ${idx + 1}`} 
                            size="small"
                            prefix={<span className="text-gray-400 text-xs">#{idx+1}</span>}
                        />
                    ))}
                </div>
            </div>

            {/* 4. GIÁ RIÊNG */}
            <Form.Item label="Giá bán lẻ riêng (Tùy chọn)">
               <InputNumber 
                    style={{ width: '100%' }} 
                    value={genPrice} 
                    onChange={setGenPrice} 
                    placeholder="Để trống nếu muốn dùng giá gốc của sản phẩm" 
                    addonBefore={<DollarOutlined />}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
               />
            </Form.Item>
         </Form>
      </Modal>
    </div>
  );
}