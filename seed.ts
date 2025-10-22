import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const users = await Promise.all([
      db.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      }),
      db.user.create({
        data: {
          email: 'user1@example.com',
          name: 'Regular User',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      }),
      db.user.create({
        data: {
          email: 'user2@example.com',
          name: 'Another User',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      })
    ])

    // Create sample services
    await Promise.all([
      db.service.create({
        data: {
          name: 'FiveM Server Hosting',
          type: 'GAME_HOSTING',
          status: 'ACTIVE',
          price: 150000,
          description: 'Premium FiveM server hosting',
          userId: users[1].id,
          ip: '192.168.1.100',
          port: 30120,
          config: {
            maxPlayers: 64,
            location: 'Indonesia'
          }
        }
      }),
      db.service.create({
        data: {
          name: 'RDP Premium',
          type: 'RDP',
          status: 'ACTIVE',
          price: 200000,
          description: 'High performance RDP',
          userId: users[2].id,
          ip: '192.168.1.101',
          port: 3389,
          config: {
            ram: '8GB',
            cpu: '4 Cores'
          }
        }
      }),
      db.service.create({
        data: {
          name: 'FiveM Development',
          type: 'FIVEM_DEVELOPMENT',
          status: 'ACTIVE',
          price: 500000,
          description: 'Custom FiveM script development',
          userId: users[1].id,
          config: {
            projectType: 'Roleplay',
            duration: '2 weeks'
          }
        }
      })
    ])

    // Create sample orders
    await Promise.all([
      db.order.create({
        data: {
          userId: users[1].id,
          amount: 150000,
          status: 'COMPLETED',
          paymentMethod: 'Transfer Bank'
        }
      }),
      db.order.create({
        data: {
          userId: users[2].id,
          amount: 200000,
          status: 'COMPLETED',
          paymentMethod: 'E-Wallet'
        }
      }),
      db.order.create({
        data: {
          userId: users[1].id,
          amount: 500000,
          status: 'COMPLETED',
          paymentMethod: 'Transfer Bank'
        }
      })
    ])

    console.log('Database seeded successfully!')
    console.log(`Created ${users.length} users`)
    console.log('Created 3 services')
    console.log('Created 3 orders')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await db.$disconnect()
  }
}

seedDatabase()