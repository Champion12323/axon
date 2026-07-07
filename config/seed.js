// scripts/seed.js

import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const SALT_ROUNDS = 12;

async function seed() {
  const brandPassword = 'brand123456';
  const influencerPassword = 'influencer123456';

  const brandPassword_hash = await bcrypt.hash(brandPassword, SALT_ROUNDS);
  const influencerPassword_hash = await bcrypt.hash(
    influencerPassword,
    SALT_ROUNDS
  );

  await prisma.user.upsert({
    where: { id: 'test-brand-id-001' },
    update: {
      // keep seed idempotent
      password_hash: brandPassword_hash,
      email: 'brand@test.com',
      username: 'testbrand',
      full_name: 'Test Brand',
      role: 'BRAND',
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: 'test-brand-id-001',
      email: 'brand@test.com',
      username: 'testbrand',
      password_hash: brandPassword_hash,
      full_name: 'Test Brand',
      role: 'BRAND',
      status: 'active',
      is_email_verified: true,
    },
  });

  await prisma.user.upsert({
    where: { id: 'test-influencer-id-001' },
    update: {
      password_hash: influencerPassword_hash,
      email: 'influencer@test.com',
      full_name: 'Test Influencer',
      role: 'INFLUENCER',
      status: 'active',
      is_email_verified: true,
    },
    create: {
      id: 'test-influencer-id-001',
      email: 'influencer@test.com',
      username: 'testinfluencer',
      password_hash: influencerPassword_hash,
      full_name: 'Test Influencer',
      role: 'INFLUENCER',
      status: 'active',
      is_email_verified: true,
    },
  });

  console.log('✅ Test users ready!');
  console.log('Brand login:', {
    email: 'brand@test.com',
    username: 'testbrand',
    password: brandPassword,
  });
  console.log('Influencer login:', {
    email: 'influencer@test.com',
    username: 'testinfluencer',
    password: influencerPassword,
  });
}

seed().finally(() => prisma.$disconnect());

