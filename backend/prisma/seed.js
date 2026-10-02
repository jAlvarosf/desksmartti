const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Seed Companies
  const initialCompanies = [
    { name: 'Matriz - Central', code: 'MAT-01' },
    { name: 'Loja 01 - Centro', code: 'LOJ-01' },
    { name: 'Loja 02 - Shopping', code: 'LOJ-02' },
    { name: 'Filial São Paulo', code: 'FIL-SP' }
  ];

  for (const comp of initialCompanies) {
    await prisma.company.upsert({
      where: { name: comp.name },
      update: {},
      create: comp
    });
  }

  const matrizCompany = await prisma.company.findUnique({ where: { name: 'Matriz - Central' } });
  const loja1Company = await prisma.company.findUnique({ where: { name: 'Loja 01 - Centro' } });

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

  const hardwareCat = await prisma.category.findUnique({ where: { name: 'Hardware & Equipamentos' } });
  const softwareCat = await prisma.category.findUnique({ where: { name: 'Sistemas & Software' } });
  const networkCat = await prisma.category.findUnique({ where: { name: 'Rede & Internet' } });
  const accessCat = await prisma.category.findUnique({ where: { name: 'Acessos & Senhas' } });

  // Seed Default Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@desksmartti.com' },
    update: { active: true, companyId: matrizCompany?.id },
    create: {
      fullName: 'Administrador TI',
      email: 'admin@desksmartti.com',
      password: adminPassword,
      phone: '(11) 99999-0000',
      department: 'Tecnologia da Informação',
      store: 'Matriz - Central',
      companyId: matrizCompany?.id,
      role: 'ADMIN',
      active: true
    }
  });

  // Seed Demo User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'joao@empresa.com' },
    update: { active: true, companyId: loja1Company?.id },
    create: {
      fullName: 'João Silva',
      email: 'joao@empresa.com',
      password: userPassword,
      phone: '(11) 98888-1111',
      department: 'Vendas',
      store: 'Loja 01 - Centro',
      companyId: loja1Company?.id,
      role: 'USER',
      active: true
    }
  });

  // Seed Sample Resolved Ticket with Rating
  const sampleTicketCode = 'TCK-20261001-001';
  const existingSample = await prisma.ticket.findUnique({ where: { code: sampleTicketCode } });
  if (!existingSample) {
    await prisma.ticket.create({
      data: {
        code: sampleTicketCode,
        title: 'Troca de teclado e mouse com defeito',
        description: 'Solicito a substituição do teclado que apresenta teclas falhando.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        categoryId: hardwareCat.id,
        userId: user.id,
        companyId: loja1Company?.id,
        department: 'Vendas',
        store: 'Loja 01 - Centro',
        rating: 5,
        feedback: 'Atendimento muito rápido e eficiente! Parabéns à equipe de TI.',
        ratedAt: new Date()
      }
    });
  }

  // Seed Knowledge Base Articles
  const articles = [
    {
      title: 'O que fazer se o computador não ligar',
      content: '1. Verifique se os cabos de energia do computador e do monitor estão firmemente encaixados na tomada.\n2. Verifique se a régua de energia ou estabilizador está ligado.\n3. Teste ligar outro equipamento na mesma tomada.\n4. Caso persista sem nenhum sinal de luz ou som, abra um chamado para a TI.',
      categoryId: hardwareCat?.id,
      authorId: admin.id,
      tags: 'computador, energia, hardware, pc'
    },
    {
      title: 'Como alterar ou redefinir sua senha corporativa',
      content: '1. Acesse a tela de login do sistema ou no Windows pressione Ctrl + Alt + Del.\n2. Escolha "Alterar uma Senha".\n3. Digite sua senha atual e em seguida a nova senha.\n4. Se esqueceu a senha, abra um chamado solicitando o reset de senha.',
      categoryId: accessCat?.id,
      authorId: admin.id,
      tags: 'senha, acesso, login, reset'
    },
    {
      title: 'Problemas de lentidão no Wi-Fi ou na Internet',
      content: '1. Desconecte e reconecte na rede Wi-Fi corporativa.\n2. Verifique se o cabo de rede está devidamente travado na entrada Ethernet.\n3. Reinicie seu navegador de internet.\n4. Se a lentidão for geral na loja, abra um chamado de prioridade Alta.',
      categoryId: networkCat?.id,
      authorId: admin.id,
      tags: 'internet, wifi, conexao, rede, lentidao'
    }
  ];

  for (const art of articles) {
    const existing = await prisma.knowledgeArticle.findFirst({ where: { title: art.title } });
    if (!existing) {
      await prisma.knowledgeArticle.create({ data: art });
    }
  }

  console.log('Seeding complete. Empresas, Base de Conhecimento e Admin criados!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
