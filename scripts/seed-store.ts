import { db } from '../src/lib/db';

async function seedStoreItems() {
  try {
    console.log('🌱 Starting store items seeding...');

    const storeItems = [
      {
        title: 'FiveM Custom Vehicle Pack',
        description: 'Pack berisi 20+ kendaraan custom dengan kualitas tinggi untuk server FiveM Anda. Termasuk supercars, motor, dan kendaraan unik.',
        price: 250000,
        category: 'MOD',
        imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Vehicle+Pack',
        imageLink: 'https://example.com/download/vehicle-pack',
        featured: true,
        metadata: {
          downloadLinks: ['https://example.com/vehicle-pack-1.zip', 'https://example.com/vehicle-pack-2.zip'],
          fileSize: '2.5GB',
          compatibility: ['FiveM', 'RedM'],
          version: '1.2.0'
        }
      },
      {
        title: 'Roblox Game Script - Battle Royale',
        description: 'Script lengkap untuk membuat game battle royale di Roblox. Sudah termasuk UI, gameplay mechanics, dan admin panel.',
        price: 350000,
        category: 'GAME',
        imageUrl: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Battle+Royale',
        imageLink: 'https://example.com/download/battle-royale',
        featured: true,
        metadata: {
          downloadLinks: ['https://example.com/battle-royale-script.zip'],
          fileSize: '1.8GB',
          compatibility: ['Roblox Studio'],
          version: '2.1.0',
          features: ['100 Player Support', 'Custom Weapons', 'Map System']
        }
      },
      {
        title: 'Premium RDP 8GB RAM',
        description: 'Remote Desktop dengan spesifikasi tinggi: 8GB RAM, 4 Core CPU, 100GB SSD. Cocok untuk development dan gaming.',
        price: 150000,
        category: 'HOSTING',
        imageUrl: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=RDP+8GB',
        imageLink: null,
        featured: false,
        metadata: {
          specs: {
            ram: '8GB',
            cpu: '4 Cores',
            storage: '100GB SSD',
            bandwidth: 'Unlimited'
          },
          duration: '1 month',
          setupTime: 'Instant'
        }
      },
      {
        title: 'FiveM MLO - Luxury Mansion',
        description: 'Map Load Object untuk mansion mewah dengan interior lengkap. Pool, garage, dan detail yang sangat realistis.',
        price: 180000,
        category: 'MOD',
        imageUrl: 'https://via.placeholder.com/300x200/FFA07A/FFFFFF?text=Luxury+Mansion',
        imageLink: 'https://example.com/download/luxury-mansion',
        featured: false,
        metadata: {
          downloadLinks: ['https://example.com/luxury-mansion.zip'],
          fileSize: '500MB',
          compatibility: ['FiveM'],
          version: '1.0.0',
          features: ['Custom Interior', 'Working Garage', 'Pool Area']
        }
      },
      {
        title: 'Game Server Hosting - 32 Slots',
        description: 'Hosting server game dengan kapasitas 32 players. DDOS protection, instant setup, 99.9% uptime guarantee.',
        price: 200000,
        category: 'SERVER',
        imageUrl: 'https://via.placeholder.com/300x200/98D8C8/FFFFFF?text=Game+Server',
        imageLink: null,
        featured: true,
        metadata: {
          specs: {
            slots: '32 Players',
            ram: '4GB',
            cpu: '2 Cores',
            storage: '50GB NVMe'
          },
          duration: '1 month',
          features: ['DDoS Protection', 'Auto Backup', '24/7 Support']
        }
      },
      {
        title: 'Roblox Admin Commands V3',
        description: 'Script admin commands yang powerful untuk Roblox. Over 200+ commands dengan GUI yang user-friendly.',
        price: 120000,
        category: 'GAME',
        imageUrl: 'https://via.placeholder.com/300x200/F7DC6F/FFFFFF?text=Admin+Commands',
        imageLink: 'https://example.com/download/admin-commands',
        featured: false,
        metadata: {
          downloadLinks: ['https://example.com/admin-commands.zip'],
          fileSize: '50MB',
          compatibility: ['Roblox Studio'],
          version: '3.2.1',
          features: ['200+ Commands', 'Custom GUI', 'Ban System']
        }
      },
      {
        title: 'FiveM Custom HUD',
        description: 'Custom HUD design untuk FiveM dengan health bar, armor, hunger, thirst system. Fully customizable.',
        price: 95000,
        category: 'MOD',
        imageUrl: 'https://via.placeholder.com/300x200/BB8FCE/FFFFFF?text=Custom+HUD',
        imageLink: 'https://example.com/download/custom-hud',
        featured: false,
        metadata: {
          downloadLinks: ['https://example.com/custom-hud.zip'],
          fileSize: '25MB',
          compatibility: ['FiveM'],
          version: '1.5.0',
          features: ['Health System', 'Custom Animations', 'Configurable']
        }
      },
      {
        title: 'VPS Hosting - 4GB RAM',
        description: 'Virtual Private Server dengan full root access. Perfect untuk hosting aplikasi atau game server.',
        price: 175000,
        category: 'HOSTING',
        imageUrl: 'https://via.placeholder.com/300x200/85C1E2/FFFFFF?text=VPS+4GB',
        imageLink: null,
        featured: false,
        metadata: {
          specs: {
            ram: '4GB',
            cpu: '2 Cores',
            storage: '80GB SSD',
            bandwidth: '5TB/month'
          },
          duration: '1 month',
          features: ['Full Root Access', 'Linux/Windows', 'Instant Setup']
        }
      }
    ];

    // Insert store items
    for (const item of storeItems) {
      await db.storeItem.upsert({
        where: { title: item.title },
        update: item,
        create: item
      });
    }

    console.log('✅ Store items seeded successfully!');
    console.log(`📦 Total items: ${storeItems.length}`);

    // Show summary
    const totalItems = await db.storeItem.count();
    const activeItems = await db.storeItem.count({ where: { isActive: true } });
    const featuredItems = await db.storeItem.count({ where: { featured: true } });

    console.log(`📊 Database Summary:`);
    console.log(`   Total Items: ${totalItems}`);
    console.log(`   Active Items: ${activeItems}`);
    console.log(`   Featured Items: ${featuredItems}`);

  } catch (error) {
    console.error('❌ Error seeding store items:', error);
  } finally {
    await db.$disconnect();
  }
}

seedStoreItems();