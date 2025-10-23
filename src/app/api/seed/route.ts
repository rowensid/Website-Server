import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Delete all existing data first
    await db.order.deleteMany({})
    await db.service.deleteMany({})
    await db.user.deleteMany({})
    await db.pterodactylServer.deleteMany({})
    
    // Create simple test data
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Create owner account
    const owner = await db.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        isActive: true
      }
    })

    // Create demo member account
    const member = await db.user.create({
      data: {
        email: 'user@example.com',
        name: 'Demo Member',
        password: await bcrypt.hash('user123', 10),
        role: 'USER',
        isActive: true
      }
    })
    
    // Create existing owner account
    const existingOwner = await db.user.create({
      data: {
        email: 'rowensid2802@gmail.com',
        name: 'Rowens ID - Owner',
        password: await bcrypt.hash('Aberzz2802', 10),
        role: 'ADMIN',
        isActive: true
      }
    })
    
    // Create Pterodactyl servers individually
    const pteroServers = [
      {
        pteroId: "1",
        identifier: "99cbffc1",
        name: "AMERTA ROLEPLAY V1.5",
        description: "PAKET II FIVEM SERVER ROLEPLAY'S",
        status: "running",
        suspended: false,
        limits: { memory: 4096, disk: 71680, cpu: 100 },
        featureLimits: { databases: 1, allocations: 0, backups: 1, players: 64 },
        nodeId: "1",
        allocationId: "1",
        nestId: "5",
        eggId: "15",
        container: { environment: { MAX_PLAYERS: "64", SERVER_HOSTNAME: "Amerta Roleplay" } },
        userId: existingOwner.id
      },
      {
        pteroId: "5",
        identifier: "813a90ef",
        name: "FELAVITO ROLEPLAY",
        description: "PAKET 1 FIVEM SERVER ROLEPLAY'S",
        status: "offline",
        suspended: false,
        limits: { memory: 3072, disk: 50000, cpu: 80 },
        featureLimits: { databases: 1, allocations: 0, backups: 1, players: 128 },
        nodeId: "1",
        allocationId: "2",
        nestId: "5",
        eggId: "15",
        container: { environment: { MAX_PLAYERS: "128", SERVER_HOSTNAME: "JAWARA ROLEPLAY" } },
        userId: existingOwner.id
      },
      {
        pteroId: "7",
        identifier: "c88c654c",
        name: "MEDAN CITY ROLEPLAY",
        description: "PAKET II FIVEM SERVER ROLEPLAY'S",
        status: "starting",
        suspended: false,
        limits: { memory: 4096, disk: 60000, cpu: 100 },
        featureLimits: { databases: 1, allocations: 0, backups: 1, players: 128 },
        nodeId: "2",
        allocationId: "3",
        nestId: "5",
        eggId: "15",
        container: { environment: { MAX_PLAYERS: "128", SERVER_HOSTNAME: "MEDAN CITY" } },
        userId: existingOwner.id
      }
    ]
    
    let createdPteroServers = 0
    for (const serverData of pteroServers) {
      try {
        // Try creating with minimal required fields first
        const minimalServer = await db.pterodactylServer.create({
          data: {
            pteroId: serverData.pteroId,
            identifier: serverData.identifier,
            name: serverData.name,
            status: serverData.status,
            suspended: serverData.suspended,
            limits: serverData.limits,
            featureLimits: serverData.featureLimits,
            nodeId: serverData.nodeId,
            allocationId: serverData.allocationId,
            nestId: serverData.nestId,
            eggId: serverData.eggId,
            userId: serverData.userId
          }
        })
        
        // Then update with additional fields
        await db.pterodactylServer.update({
          where: { id: minimalServer.id },
          data: {
            description: serverData.description,
            container: serverData.container
          }
        })
        
        createdPteroServers++
        console.log(`✅ Created Pterodactyl server: ${serverData.name}`)
      } catch (error) {
        console.error(`❌ Failed to create Pterodactyl server ${serverData.name}:`, error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    console.log(`📊 Created ${createdPteroServers} Pterodactyl servers`)
    
    // Create sample services
    await db.service.create({
      data: {
        name: 'Game Hosting Server',
        type: 'GAME_HOSTING',
        status: 'ACTIVE',
        price: 150000,
        userId: member.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        config: {
          slots: 32,
          location: 'Singapore',
          game: 'FiveM'
        }
      }
    })

    await db.service.create({
      data: {
        name: 'RDP Premium',
        type: 'RDP',
        status: 'ACTIVE',
        price: 200000,
        userId: member.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        config: {
          cpu: '4 Cores',
          ram: '8GB',
          storage: '100GB SSD'
        }
      }
    })

    // Create sample orders
    await db.order.createMany({
      data: [
        {
          userId: member.id,
          amount: 150000,
          status: 'COMPLETED',
          paymentMethod: 'TRANSFER'
        },
        {
          userId: member.id,
          amount: 200000,
          status: 'COMPLETED',
          paymentMethod: 'E-WALLET'
        }
      ]
    })

    // Create just 2 additional users
    for (let i = 0; i < 2; i++) {
      await db.user.create({
        data: {
          email: `user${i + 4}@example.com`,
          name: `User ${i + 4}`,
          password: hashedPassword,
          role: 'USER',
          isActive: true,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random within last 7 days
        }
      })
    }

    // Create just 1 additional service
    await db.service.create({
      data: {
        name: 'Additional Service',
        type: 'GAME_HOSTING',
        status: 'ACTIVE',
        price: 250000,
        userId: member.id,
        expiresAt: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      message: 'Demo accounts created successfully',
      accounts: [
        {
          email: 'admin@example.com',
          password: 'admin123',
          role: 'ADMIN',
          access: ['owner-panel', 'manage-server', 'member-dashboard']
        },
        {
          email: 'user@example.com', 
          password: 'user123',
          role: 'USER',
          access: ['member-dashboard']
        },
        {
          email: 'rowensid2802@gmail.com',
          password: 'Aberzz2802',
          role: 'ADMIN',
          access: ['owner-panel', 'manage-server', 'member-dashboard']
        }
      ],
      stats: {
        users: 3,
        services: 2,
        orders: 2,
        pterodactylServers: 3
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}