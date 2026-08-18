import { PrismaClient, Zone, Tier, Role, ProductStatus, TransactionType, OrderStatus, PaymentMethod, PaymentStatus, CouponType, BlogCategory, BlogStatus, BannerPosition } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed data cho GreenFood...');

  // 1. Regions
  const regionNorth = await prisma.region.upsert({
    where: { slug: 'mien-bac' },
    update: {},
    create: {
      name: 'Miền Bắc',
      slug: 'mien-bac',
      zone: Zone.NORTH,
      provinceCodes: ['01', '02', '04', '06', '08', '10', '11', '12', '14', '15', '17', '19', '20', '22', '24', '25', '26', '27', '30', '31', '33', '34', '35', '36', '37'],
      description: 'Đặc sản xứ Bắc với khí hậu ôn đới và cận nhiệt đới.',
    },
  });

  const regionCentral = await prisma.region.upsert({
    where: { slug: 'mien-trung' },
    update: {},
    create: {
      name: 'Miền Trung',
      slug: 'mien-trung',
      zone: Zone.CENTRAL,
      provinceCodes: ['38', '40', '42', '44', '45', '46', '48', '49', '51', '52', '54', '56', '58', '60', '62', '64', '66', '67', '68'],
      description: 'Đặc sản nắng gió miền Trung và Tây Nguyên.',
    },
  });

  const regionSouth = await prisma.region.upsert({
    where: { slug: 'mien-nam' },
    update: {},
    create: {
      name: 'Miền Nam',
      slug: 'mien-nam',
      zone: Zone.SOUTH,
      provinceCodes: ['70', '72', '74', '75', '77', '79', '80', '82', '83', '84', '86', '87', '89', '91', '92', '93', '94', '95', '96'],
      description: 'Nông sản trù phú miệt vườn châu thổ sông Cửu Long.',
    },
  });

  // 2. Categories
  const catTraiCay = await prisma.category.upsert({
    where: { slug: 'trai-cay-tuoi' },
    update: {},
    create: {
      name: 'Trái Cây Tươi',
      slug: 'trai-cay-tuoi',
      displayOrder: 1,
    },
  });

  const catDacSan = await prisma.category.upsert({
    where: { slug: 'dac-san-vung-mien' },
    update: {},
    create: {
      name: 'Đặc Sản Vùng Miền',
      slug: 'dac-san-vung-mien',
      displayOrder: 2,
    },
  });

  // 3. User & Farmer
  const farmerUser = await prisma.user.upsert({
    where: { phone: '0901234567' },
    update: {},
    create: {
      phone: '0901234567',
      email: 'nongho@greenfood.vn',
      fullName: 'Nguyễn Văn Nông',
      role: Role.VENDOR,
    },
  });

  const farmer = await prisma.farmer.create({
    data: {
      userId: farmerUser.id,
      farmName: 'Vườn Trái Cây Chú Ba',
      ownerName: 'Nguyễn Văn Nông',
      phone: '0901234567',
      regionId: regionSouth.id,
      province: 'Bến Tre',
      district: 'Chợ Lách',
      fullAddress: 'Ấp Phú Phụng, Xã Vĩnh Bình, Huyện Chợ Lách, Bến Tre',
      farmAreaHectare: 2.5,
      specialties: ['Sầu riêng', 'Bưởi da xanh'],
      isVerified: true,
      certifications: {
        vietGap: true,
        globalGap: false,
      },
      story: 'Hơn 20 năm gắn bó với cây ăn trái miền Tây...',
    },
  });

  // 4. Products & Variants
  const product1 = await prisma.product.upsert({
    where: { sku: 'SR-R6-BT-01' },
    update: {},
    create: {
      farmerId: farmer.id,
      categoryId: catTraiCay.id,
      regionId: regionSouth.id,
      name: 'Sầu Riêng Ri6 Bến Tre Chín Cây',
      slug: 'sau-rieng-ri6-ben-tre-chin-cay',
      sku: 'SR-R6-BT-01',
      shortDescription: 'Sầu riêng Ri6 Bến Tre bao ăn, múi vàng ươm, hạt lép.',
      origin: 'Bến Tre, Việt Nam',
      cultivationMethod: 'VietGAP',
      harvestMonths: [5, 6, 7], // Mùa sầu riêng
      basePrice: 150000,
      salePrice: 135000,
      unit: 'kg',
      weightGram: 1000,
      thumbnailUrl: 'https://example.com/sau-rieng.jpg',
      isSeasonal: true,
      status: ProductStatus.ACTIVE,
      variants: {
        create: [
          {
            name: 'Trái 2-3kg',
            sku: 'SR-R6-BT-01-V1',
            price: 135000,
            weightGram: 1000,
            stockQuantity: 50,
            isDefault: true,
          },
          {
            name: 'Trái 3-4kg',
            sku: 'SR-R6-BT-01-V2',
            price: 130000,
            weightGram: 1000,
            stockQuantity: 30,
          }
        ]
      }
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'BDX-BT-01' },
    update: {},
    create: {
      farmerId: farmer.id,
      categoryId: catTraiCay.id,
      regionId: regionSouth.id,
      name: 'Bưởi Da Xanh Ruột Hồng Bến Tre',
      slug: 'buoi-da-xanh-ruot-hong-ben-tre',
      sku: 'BDX-BT-01',
      shortDescription: 'Bưởi da xanh ruột hồng chuẩn vị ngọt thanh, tép mọng nước.',
      origin: 'Bến Tre, Việt Nam',
      cultivationMethod: 'Hữu cơ',
      harvestMonths: [1, 2, 8, 9, 10, 11, 12],
      basePrice: 85000,
      salePrice: 75000,
      unit: 'kg',
      weightGram: 1000,
      thumbnailUrl: 'https://example.com/buoi.jpg',
      status: ProductStatus.ACTIVE,
      variants: {
        create: [
          {
            name: 'Loại 1 (Từ 1.2kg - 1.5kg/trái)',
            sku: 'BDX-BT-01-V1',
            price: 75000,
            weightGram: 1000,
            stockQuantity: 100,
            isDefault: true,
          }
        ]
      }
    },
  });

  console.log('Seed data thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
