import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'rowensid2802@gmail.com' }
    })

    if (existingAdmin) {
      console.log('Admin account already exists!')
      return
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('Aberzz2802', 10)
    
    const admin = await db.user.create({
      data: {
        email: 'rowensid2802@gmail.com',
        name: 'Rowens Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ Admin account created successfully!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Name: ${admin.name}`)
    console.log(`🔑 Role: ${admin.role}`)
    console.log(`✅ Status: ${admin.isActive ? 'Active' : 'Inactive'}`)

  } catch (error) {
    console.error('❌ Error creating admin account:', error)
  } finally {
    await db.$disconnect()
  }
}

createAdmin()