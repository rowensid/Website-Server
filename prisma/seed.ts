import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data to avoid conflicts
  await prisma.order.deleteMany()
  await prisma.service.deleteMany()
  await prisma.storeItem.deleteMany()
  await prisma.loginHistory.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create owner user
  const ownerEmail = 'owner@example.com'
  const ownerPassword = 'owner123'
  
  const hashedOwnerPassword = await bcrypt.hash(ownerPassword, 10)
  
  const owner = await prisma.user.create({
    data: {
      email: ownerEmail,
      name: 'Owner User',
      password: hashedOwnerPassword,
      role: 'OWNER',
      isActive: true
    }
  })
  
  console.log('Created owner user:', owner.email)
  console.log('Login credentials:')
  console.log('Email:', ownerEmail)
  console.log('Password:', ownerPassword)

  // Create admin user
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'
  
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
  
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'ADMIN',
      isActive: true
    }
  })
  
  console.log('Created admin user:', admin.email)
  console.log('Login credentials:')
  console.log('Email:', adminEmail)
  console.log('Password:', adminPassword)

  // Create regular users
  const regularUsers = [
    {
      email: 'user1@example.com',
      name: 'John Doe',
      password: 'user123'
    },
    {
      email: 'user2@example.com', 
      name: 'Jane Smith',
      password: 'user123'
    },
    {
      email: 'user3@example.com',
      name: 'Bob Johnson',
      password: 'user123'
    }
  ]

  const createdUsers = []
  for (const userData of regularUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: 'USER',
        isActive: true
      }
    })
    createdUsers.push(user)
    console.log('Created regular user:', user.email)
  }

  // Create Store Items
  const storeItems = [
    // MOD Category
    {
      title: 'FiveM Police EUP Pack',
      description: 'Complete Emergency Uniforms Pack for FiveM police roleplay',
      price: 150000,
      category: 'MOD',
      imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Police+EUP',
      imageLink: 'https://example.com/eup-pack.zip',
      featured: true,
      metadata: {
        type: 'FiveM MOD',
        size: '250MB',
        version: '1.0.0',
        downloadLink: 'https://example.com/download/eup-pack',
        installation: 'Drag and drop to resources folder'
      }
    },
    {
      title: 'FiveM Luxury Cars Pack',
      description: '20+ luxury cars with custom sounds and handling',
      price: 200000,
      category: 'MOD',
      imageUrl: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Luxury+Cars',
      imageLink: 'https://example.com/luxury-cars.zip',
      featured: true,
      metadata: {
        type: 'FiveM MOD',
        size: '1.2GB',
        version: '2.1.0',
        downloadLink: 'https://example.com/download/luxury-cars',
        installation: 'Requires custom cars framework'
      }
    },
    {
      title: 'Roblox Blox Fruits Script',
      description: 'Auto farm and GUI script for Blox Fruits',
      price: 75000,
      category: 'MOD',
      imageUrl: 'https://via.placeholder.com/300x200/95E77E/FFFFFF?text=Blox+Fruits',
      imageLink: 'https://example.com/blox-fruits.zip',
      featured: false,
      metadata: {
        type: 'Roblox Script',
        size: '15MB',
        version: '3.2.1',
        downloadLink: 'https://example.com/download/blox-fruits',
        installation: 'Requires script executor'
      }
    },

    // GAME Category
    {
      title: 'Minecraft Premium Account',
      description: 'Premium Minecraft account with full access',
      price: 100000,
      category: 'GAME',
      imageUrl: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Minecraft',
      imageLink: null,
      featured: true,
      metadata: {
        type: 'Game Account',
        accountType: 'Premium',
        delivery: 'Instant delivery via email'
      }
    },
    {
      title: 'GTA V License Key',
      description: 'Original GTA V PC license key',
      price: 300000,
      category: 'GAME',
      imageUrl: 'https://via.placeholder.com/300x200/F7B731/FFFFFF?text=GTA+V',
      imageLink: null,
      featured: true,
      metadata: {
        type: 'Game License',
        platform: 'PC',
        delivery: 'Digital delivery'
      }
    },

    // HOSTING Category
    {
      title: 'Minecraft Server 1GB RAM',
      description: '1 month hosting for Minecraft server with 1GB RAM',
      price: 50000,
      category: 'HOSTING',
      imageUrl: 'https://via.placeholder.com/300x200/5F27CD/FFFFFF?text=Minecraft+Hosting',
      imageLink: null,
      featured: false,
      metadata: {
        type: 'Game Hosting',
        ram: '1GB',
        slots: '10 players',
        duration: '30 days',
        location: 'Singapore'
      }
    },
    {
      title: 'FiveM Server 2GB RAM',
      description: '1 month hosting for FiveM server with 2GB RAM',
      price: 75000,
      category: 'HOSTING',
      imageUrl: 'https://via.placeholder.com/300x200/00D2D3/FFFFFF?text=FiveM+Hosting',
      imageLink: null,
      featured: false,
      metadata: {
        type: 'Game Hosting',
        ram: '2GB',
        slots: '32 players',
        duration: '30 days',
        location: 'Singapore'
      }
    },

    // SERVER Category
    {
      title: 'Windows VPS 2GB RAM',
      description: 'Windows VPS with 2GB RAM, 50GB SSD',
      price: 150000,
      category: 'SERVER',
      imageUrl: 'https://via.placeholder.com/300x200/EE5A24/FFFFFF?text=Windows+VPS',
      imageLink: null,
      featured: true,
      metadata: {
        type: 'VPS',
        os: 'Windows Server 2019',
        ram: '2GB',
        storage: '50GB SSD',
        cpu: '1 core',
        duration: '30 days'
      }
    },
    {
      title: 'Linux VPS 4GB RAM',
      description: 'Ubuntu VPS with 4GB RAM, 100GB SSD',
      price: 200000,
      category: 'SERVER',
      imageUrl: 'https://via.placeholder.com/300x200/10AC84/FFFFFF?text=Linux+VPS',
      imageLink: null,
      featured: false,
      metadata: {
        type: 'VPS',
        os: 'Ubuntu 22.04',
        ram: '4GB',
        storage: '100GB SSD',
        cpu: '2 cores',
        duration: '30 days'
      }
    }
  ]

  for (const itemData of storeItems) {
    const storeItem = await prisma.storeItem.create({
      data: itemData
    })
    console.log('Created store item:', storeItem.title)
  }

  // Create Services for users
  const services = [
    {
      name: 'Minecraft Server - John Doe',
      type: 'GAME_HOSTING',
      status: 'ACTIVE',
      price: 50000,
      description: 'Minecraft server hosting',
      ip: '192.168.1.100',
      port: 25565,
      config: {
        ram: '2GB',
        cpu: '2 cores',
        storage: '50GB SSD',
        version: '1.20.1'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'FiveM Development - Jane Smith',
      type: 'FIVEM_DEVELOPMENT',
      status: 'ACTIVE',
      price: 75000,
      description: 'FiveM server for development',
      ip: '192.168.1.101',
      port: 30120,
      config: {
        ram: '4GB',
        cpu: '3 cores',
        storage: '100GB SSD',
        framework: 'QB-Core'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Windows RDP - Bob Johnson',
      type: 'RDP',
      status: 'ACTIVE',
      price: 100000,
      description: 'Windows Remote Desktop',
      ip: '192.168.1.102',
      port: 3389,
      config: {
        ram: '4GB',
        cpu: '2 cores',
        storage: '80GB SSD',
        os: 'Windows 10 Pro'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  ]

  for (let i = 0; i < services.length; i++) {
    const service = await prisma.service.create({
      data: {
        ...services[i],
        userId: createdUsers[i].id
      }
    })
    console.log('Created service:', service.name)
  }

  // Create Orders connected to users and services
  const orders = [
    {
      amount: 50000,
      status: 'COMPLETED',
      paymentMethod: 'TRANSFER',
      serviceId: null // Store item purchase
    },
    {
      amount: 75000,
      status: 'COMPLETED',
      paymentMethod: 'E-WALLET',
      serviceId: null // Store item purchase
    },
    {
      amount: 150000,
      status: 'PENDING',
      paymentMethod: 'CREDIT_CARD',
      serviceId: null // Store item purchase
    }
  ]

  for (let i = 0; i < orders.length; i++) {
    const order = await prisma.order.create({
      data: {
        ...orders[i],
        userId: createdUsers[i].id
      }
    })
    console.log('Created order:', order.id)
  }

  // Create some login history
  const loginHistoryData = [
    {
      ip: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Jakarta, Indonesia',
      device: 'Desktop',
      browser: 'Chrome',
      isActive: true
    },
    {
      ip: '192.168.1.11',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      location: 'Surabaya, Indonesia',
      device: 'Mobile',
      browser: 'Safari',
      isActive: false
    }
  ]

  for (let i = 0; i < loginHistoryData.length; i++) {
    const loginHistory = await prisma.loginHistory.create({
      data: {
        ...loginHistoryData[i],
        userId: createdUsers[i].id
      }
    })
    console.log('Created login history for:', createdUsers[i].name)
  }

  // Create sessions for active users
  for (const user of [owner, admin, ...createdUsers.slice(0, 2)]) {
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: 'sample-token-' + Math.random().toString(36).substring(7),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })
    console.log('Created session for:', user.email)
  }

  console.log('\n=== Database Seeding Complete ===')
  console.log('Total Users:', await prisma.user.count())
  console.log('Total Store Items:', await prisma.storeItem.count())
  console.log('Total Services:', await prisma.service.count())
  console.log('Total Orders:', await prisma.order.count())
  console.log('Total Sessions:', await prisma.session.count())
  console.log('Total Login History:', await prisma.loginHistory.count())
  console.log('\n=== Login Credentials ===')
  console.log('Owner:', ownerEmail, '/', ownerPassword)
  console.log('Admin:', adminEmail, '/', adminPassword)
  console.log('Users:')
  regularUsers.forEach(user => {
    console.log(`  ${user.email} / ${user.password}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })