import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 检查现有用户
    const users = await db.user.findMany()
    console.log('Existing users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })))
    
    // 检查管理员账户
    const adminUser = await db.user.findUnique({
      where: { email: 'rowensid2802@gmail.com' }
    })
    
    if (adminUser) {
      console.log('Admin user found:', { id: adminUser.id, email: adminUser.email, role: adminUser.role })
      
      // 验证密码
      const isValidPassword = await bcrypt.compare('Aberzz2802', adminUser.password)
      console.log('Password validation:', isValidPassword)
      
      if (!isValidPassword) {
        // 更新密码
        const hashedPassword = await bcrypt.hash('Aberzz2802', 12)
        await db.user.update({
          where: { email: 'rowensid2802@gmail.com' },
          data: { password: hashedPassword }
        })
        console.log('Admin password updated')
      }
    } else {
      // 创建管理员账户
      const hashedPassword = await bcrypt.hash('Aberzz2802', 12)
      const newAdmin = await db.user.create({
        data: {
          email: 'rowensid2802@gmail.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'ADMIN'
        }
      })
      console.log('Admin user created:', { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role })
    }
    
    return NextResponse.json({ 
      message: 'Admin account checked/updated successfully',
      users: users.map(u => ({ id: u.id, email: u.email, role: u.role }))
    })
  } catch (error) {
    console.error('Error checking admin account:', error)
    return NextResponse.json({ error: 'Failed to check admin account' }, { status: 500 })
  }
}