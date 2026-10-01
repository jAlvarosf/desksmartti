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

  const hardwareCat = await prisma.category.findUnique({ where: { name: 'Hardware & Equipamentos' } });
  const softwareCat = await prisma.category.findUnique({ where: { name: 'Sistemas & Software' } });
  const networkCat = await prisma.category.findUnique({ where: { name: 'Rede & Internet' } });
  const accessCat = await prisma.category.findUnique({ where: { name: 'Acessos & Senhas' } });

  // Seed Default Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@desksmartti.com' },
    update: { active: true },
    create: {
      fullName: 'Administrador TI',
      email: 'admin@desksmartti.com',
      password: adminPassword,
      phone: '(11) 99999-0000',
      department: 'Tecnologia da Informação',
      store: 'Matriz - Central',
      role: 'ADMIN',
      active: true
    }
  });

  // Seed Demo User
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'joao@empresa.com' },
    update: { active: true },
    create: {
      fullName: 'João Silva',
      email: 'joao@empresa.com',
      password: userPassword,
      phone: '(11) 98888-1111',
      department: 'Vendas',
      store: 'Loja 01 - Centro',
      role: 'USER',
      active: true
    }
  });

  // Seed Knowledge Base Articles (Base de Conhecimento)
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
      content: '1. Acesse a tela de login do sistema ou no Windows pressione Ctrl + Alt + Del.\n2. Escolha "Alterar uma Senha".\n3. Digite sua senha atual e em seguida a nova senha (mínimo 8 caracteres, contendo números e letras maiúsculas).\n4. Se esqueceu a senha, abra um chamado solicitando o reset de senha.',
      categoryId: accessCat?.id,
      authorId: admin.id,
      tags: 'senha, acesso, login, reset'
    },
    {
      title: 'Problemas de lentidão no Wi-Fi ou na Internet',
      content: '1. Desconecte e reconecte na rede Wi-Fi corporativa.\n2. Verifique se o cabo de rede está devidamente travado na entrada Ethernet do seu computador.\n3. Reinicie seu navegador de internet.\n4. Se todos os computadores da loja/setor estiverem sem conexão, abra um chamado de prioridade Alta.',
      categoryId: networkCat?.id,
      authorId: admin.id,
      tags: 'internet, wifi, conexao, rede, lentidao'
    },
    {
      title: 'Solução para impressora não imprimindo ou travada',
      content: '1. Verifique se a impressora tem papel na bandeja e se não há luz vermelha piscando.\n2. Desligue e ligue a impressora novamente.\n3. No computador, abra "Impressoras e Escâneres", clique na impressora e cancele documentos pendentes no spooler.\n4. Teste imprimir uma página de teste.',
      categoryId: hardwareCat?.id,
      authorId: admin.id,
      tags: 'impressora, papel, spooler, impressao'
    }
  ];

  for (const art of articles) {
    const existing = await prisma.knowledgeArticle.findFirst({ where: { title: art.title } });
    if (!existing) {
      await prisma.knowledgeArticle.create({ data: art });
    }
  }

  console.log('Seeding complete. Base de Conhecimento e Admin criados!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
