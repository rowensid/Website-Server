import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create owner user
  const ownerEmail = 'owner@example.com'
  const ownerPassword = 'owner123'
  
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail }
  })

  if (!existingOwner) {
    const hashedPassword = await bcrypt.hash(ownerPassword, 10)
    
    const owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: 'Owner User',
        password: hashedPassword,
        role: 'OWNER',
        isActive: true
      }
    })
    
    console.log('Created owner user:', owner.email)
    console.log('Login credentials:')
    console.log('Email:', ownerEmail)
    console.log('Password:', ownerPassword)
  } else {
    console.log('Owner user already exists:', existingOwner.email)
  }

  // Create admin user
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log('Created admin user:', admin.email)
    console.log('Login credentials:')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
  } else {
    console.log('Admin user already exists:', existingAdmin.email)
  }

  // Create some sample services
  const sampleServices = [
    {
      name: 'Minecraft Server',
      type: 'GAME_HOSTING',
      status: 'ACTIVE',
      price: 50000,
      description: 'High performance Minecraft hosting',
      ip: '192.168.1.100',
      port: 25565,
      config: {
        ram: '4GB',
        cpu: '2 cores',
        storage: '50GB SSD'
      }
    },
    {
      name: 'FiveM Development',
      type: 'FIVEM_DEVELOPMENT',
      status: 'ACTIVE',
      price: 75000,
      description: 'FiveM server for development',
      ip: '192.168.1.101',
      port: 30120,
      config: {
        ram: '6GB',
        cpu: '3 cores',
        storage: '100GB SSD'
      }
    },
    {
      name: 'Windows RDP',
      type: 'RDP',
      status: 'ACTIVE',
      price: 100000,
      description: 'Windows Remote Desktop',
      ip: '192.168.1.102',
      port: 3389,
      config: {
        ram: '8GB',
        cpu: '4 cores',
        storage: '200GB SSD'
      }
    }
  ]

  for (const serviceData of sampleServices) {
    const existingService = await prisma.service.findFirst({
      where: { name: serviceData.name }
    })

    if (!existingService) {
      const owner = await prisma.user.findFirst({
        where: { role: 'OWNER' }
      })

      if (owner) {
        const service = await prisma.service.create({
          data: {
            ...serviceData,
            userId: owner.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        })
        
        console.log('Created sample service:', service.name)
      }
    }
  }

  // Create some sample orders
  const sampleOrders = [
    {
      amount: 50000,
      status: 'COMPLETED',
      paymentMethod: 'TRANSFER'
    },
    {
      amount: 75000,
      status: 'COMPLETED',
      paymentMethod: 'E-WALLET'
    },
    {
      amount: 100000,
      status: 'PENDING',
      paymentMethod: 'CREDIT_CARD'
    }
  ]

  const owner = await prisma.user.findFirst({
    where: { role: 'OWNER' }
  })

  if (owner) {
    for (const orderData of sampleOrders) {
      const order = await prisma.order.create({
        data: {
          ...orderData,
          userId: owner.id
        }
      })
      
      console.log('Created sample order:', order.id)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })