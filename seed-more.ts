import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function addMoreData() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Add more users
    const additionalUsers = await Promise.all([
      db.user.create({
        data: {
          email: 'rowens@example.com',
          name: 'Rowens ID',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      }),
      db.user.create({
        data: {
          email: 'amerta@example.com',
          name: 'Amerta Roleplay',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      }),
      db.user.create({
        data: {
          email: 'mylo@example.com',
          name: 'Mylo Developer',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      }),
      db.user.create({
        data: {
          email: 'client1@example.com',
          name: 'Client One',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      }),
      db.user.create({
        data: {
          email: 'client2@example.com',
          name: 'Client Two',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      })
    ])

    // Add more services
    await Promise.all([
      db.service.create({
        data: {
          name: 'Minecraft Server Hosting',
          type: 'GAME_HOSTING',
          status: 'ACTIVE',
          price: 100000,
          description: 'Premium Minecraft server hosting',
          userId: additionalUsers[0].id,
          ip: '192.168.1.102',
          port: 25565,
          config: {
            maxPlayers: 32,
            location: 'Indonesia'
          }
        }
      }),
      db.service.create({
        data: {
          name: 'RDP Business',
          type: 'RDP',
          status: 'ACTIVE',
          price: 350000,
          description: 'Business grade RDP with high specs',
          userId: additionalUsers[1].id,
          ip: '192.168.1.103',
          port: 3389,
          config: {
            ram: '16GB',
            cpu: '8 Cores'
          }
        }
      }),
      db.service.create({
        data: {
          name: 'Roblox Development',
          type: 'ROBLOX_DEVELOPMENT',
          status: 'ACTIVE',
          price: 750000,
          description: 'Custom Roblox game development',
          userId: additionalUsers[2].id,
          config: {
            projectType: 'Adventure Game',
            duration: '1 month'
          }
        }
      })
    ])

    // Add more orders
    await Promise.all([
      db.order.create({
        data: {
          userId: additionalUsers[0].id,
          amount: 100000,
          status: 'COMPLETED',
          paymentMethod: 'E-Wallet'
        }
      }),
      db.order.create({
        data: {
          userId: additionalUsers[1].id,
          amount: 350000,
          status: 'COMPLETED',
          paymentMethod: 'Transfer Bank'
        }
      }),
      db.order.create({
        data: {
          userId: additionalUsers[2].id,
          amount: 750000,
          status: 'COMPLETED',
          paymentMethod: 'Credit Card'
        }
      }),
      db.order.create({
        data: {
          userId: additionalUsers[3].id,
          amount: 150000,
          status: 'COMPLETED',
          paymentMethod: 'E-Wallet'
        }
      }),
      db.order.create({
        data: {
          userId: additionalUsers[4].id,
          amount: 200000,
          status: 'COMPLETED',
          paymentMethod: 'Transfer Bank'
        }
      })
    ])

    console.log('Additional data seeded successfully!')
    console.log(`Added ${additionalUsers.length} more users`)
    console.log('Added 3 more services')
    console.log('Added 5 more orders')

  } catch (error) {
    console.error('Error seeding additional data:', error)
  } finally {
    await db.$disconnect()
  }
}

addMoreData()