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
  const specter = await prisma.user.create({
    data: {
      username: 'specter',
      password: hashedPassword,
      role: 'MASTER',
      organizationId: null,
      memo: '총판 관리자',
    },
  });

  const alpha = await prisma.user.create({
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
        productName: '상품A',
        productId: 'P001',
        quantity: 100,
        workingDays: 30,
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
        productName: '상품B',
        productId: 'P002',
        quantity: 50,
        workingDays: 14,
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
        productName: '상품C',
        productId: 'P003',
        quantity: 20,
        workingDays: 7,
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
        productName: '상품D',
        productId: 'P004',
        quantity: 80,
        workingDays: 21,
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
        productName: '상품E',
        productId: 'P005',
        quantity: 30,
        workingDays: 10,
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
        productName: '상품F',
        productId: 'P006',
        quantity: 60,
        workingDays: 30,
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
        productName: '상품G',
        productId: 'P007',
        quantity: 10,
        workingDays: 5,
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
