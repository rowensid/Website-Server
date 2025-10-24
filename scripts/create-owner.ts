import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function createOwner() {
  try {
    const ownerEmail = 'rowensid2802@gmail.com';
    const ownerPassword = 'Aberzz2802';
    const ownerName = 'Owner';

    // Check if owner already exists
    const existingOwner = await db.user.findUnique({
      where: { email: ownerEmail }
    });

    if (existingOwner) {
      console.log('✅ Owner account already exists');
      console.log(`📧 Email: ${ownerEmail}`);
      console.log(`👤 Name: ${existingOwner.name}`);
      console.log(`🔑 Role: ${existingOwner.role}`);
      console.log(`🟢 Active: ${existingOwner.isActive}`);
      return;
    }

    // Hash password and create owner
    const hashedPassword = await bcrypt.hash(ownerPassword, 12);
    const owner = await db.user.create({
      data: {
        email: ownerEmail,
        password: hashedPassword,
        name: ownerName,
        role: 'ADMIN', // Using ADMIN role for owner privileges
        isActive: true
      }
    });

    console.log('✅ Owner account created successfully!');
    console.log(`📧 Email: ${owner.email}`);
    console.log(`👤 Name: ${owner.name}`);
    console.log(`🔑 Role: ${owner.role}`);
    console.log(`🟢 Active: ${owner.isActive}`);
    console.log(`🆔 ID: ${owner.id}`);

  } catch (error) {
    console.error('❌ Error creating owner account:', error);
  } finally {
    await db.$disconnect();
  }
}

createOwner();