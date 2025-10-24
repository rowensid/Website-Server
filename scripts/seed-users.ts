import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...')

    // Create Owner user
    const ownerPassword = await bcrypt.hash('owner123', 10)
    const owner = await prisma.user.upsert({
      where: { email: 'owner@example.com' },
      update: {},
      create: {
        email: 'owner@example.com',
        name: 'System Owner',
        password: ownerPassword,
        role: 'OWNER',
        isActive: true
      }
    })
    console.log('✅ Created owner:', owner.email)

    // Create Admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'System Admin',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    console.log('✅ Created admin:', admin.email)

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10)
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Regular User',
        password: userPassword,
        role: 'USER',
        isActive: true
      }
    })
    console.log('✅ Created regular user:', regularUser.email)

    console.log('🎉 User seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()