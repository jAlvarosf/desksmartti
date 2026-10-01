const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Seed Categories
  const categories = [
    { name: 'Hardware & Equipamentos', description: 'Problemas com computadores, monitores, impressoras, periféricos' },
    { name: 'Sistemas & Software', description: 'Erros em programas, ERP, e-mail, licenças, instalação' },
    { name: 'Rede & Internet', description: 'Lentidão, falha de conexão, Wi-Fi, VPN, cabos' },
    { name: 'Acessos & Senhas', description: 'Reset de senha, permissões de acesso, criação de usuário' },
    { name: 'Telefonia & Comunicação', description: 'Telefonia IP, ramais, mensagens' },
    { name: 'Outros', description: 'Outras solicitações de TI' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }

  // Seed Default Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@desksmartti.com' },
    update: {},
    create: {
      fullName: 'Administrador TI',
      email: 'admin@desksmartti.com',
      password: adminPassword,
      phone: '(11) 99999-0000',
      department: 'Tecnologia da Informação',
      store: 'Matriz - Central',
      role: 'ADMIN'
    }
  });

  // Seed Demo User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'joao@empresa.com' },
    update: {},
    create: {
      fullName: 'João Silva',
      email: 'joao@empresa.com',
      password: userPassword,
      phone: '(11) 98888-1111',
      department: 'Vendas',
      store: 'Loja 01 - Centro',
      role: 'USER'
    }
  });

  console.log('Seeding complete. Admin created: admin@desksmartti.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
