import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.ad.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create organization
  const org = await prisma.organization.create({
    data: { name: '알파' },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash('0000', 10);

  // Create users
  await prisma.user.create({
    data: {
      username: 'specter',
      password: hashedPassword,
      role: 'MASTER',
      organizationId: null,
      memo: '총판 관리자',
    },
  });

  await prisma.user.create({
    data: {
      username: 'alpha',
      password: hashedPassword,
      role: 'AGENCY',
      organizationId: org.id,
      memo: '알파 대행사',
    },
  });

  const yellow = await prisma.user.create({
    data: {
      username: 'yellow',
      password: hashedPassword,
      role: 'ADVERTISER',
      organizationId: org.id,
      memo: '알파 광고주',
    },
  });

  // Create ads (7+)
  await prisma.ad.createMany({
    data: [
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'PAID',
        status: 'ACTIVE',
        keyword: '키워드A',
        rank: 1,
        productName: 'https://example.com/product-a',
        productId: 'P001',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
      },
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'PAID',
        status: 'ACTIVE',
        keyword: '키워드B',
        rank: 3,
        productName: 'https://example.com/product-b',
        productId: 'P002',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-01-24'),
      },
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'TEST',
        status: 'WAITING',
        keyword: '키워드C',
        rank: null,
        productName: 'https://example.com/product-c',
        productId: 'P003',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-08'),
      },
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'PAID',
        status: 'ERROR',
        keyword: '키워드D',
        rank: 5,
        productName: 'https://example.com/product-d',
        productId: 'P004',
        startDate: new Date('2026-01-05'),
        endDate: new Date('2026-01-26'),
      },
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'TEST',
        status: 'ENDING_SOON',
        keyword: '키워드E',
        rank: 2,
        productName: 'https://example.com/product-e',
        productId: 'P005',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-25'),
      },
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'PAID',
        status: 'ENDED',
        keyword: '키워드F',
        rank: 4,
        productName: 'https://example.com/product-f',
        productId: 'P006',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
      },
      {
        organizationId: org.id,
        advertiserId: yellow.id,
        kind: 'TEST',
        status: 'WAITING',
        keyword: '키워드G',
        rank: null,
        productName: 'https://example.com/product-g',
        productId: 'P007',
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-15'),
      },
    ],
  });

  console.log('Seed completed:');
  console.log(`  - Organization: ${org.name}`);
  console.log(`  - Users: specter (MASTER), alpha (AGENCY), yellow (ADVERTISER)`);
  console.log(`  - Ads: 7 created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
