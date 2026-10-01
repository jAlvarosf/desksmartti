const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get Admin Dashboard Overview Statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, store, categoryId } = req.query;

    const where = {};
    if (store) where.store = store;
    if (categoryId) where.categoryId = categoryId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [
      total,
      open,
      inProgress,
      waitingUser,
      resolved,
      closed,
      byPriorityRaw,
      byCategoryRaw,
      byStoreRaw
    ] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...where, status: 'WAITING_USER' } }),
      prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.ticket.groupBy({
        by: ['priority'],
        where,
        _count: { id: true }
      }),
      prisma.ticket.groupBy({
        by: ['categoryId'],
        where,
        _count: { id: true }
      }),
      prisma.ticket.groupBy({
        by: ['store'],
        where,
        _count: { id: true }
      })
    ]);

    const categories = await prisma.category.findMany();
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    const byCategory = byCategoryRaw.map(item => ({
      category: categoryMap[item.categoryId] || 'Desconhecida',
      count: item._count.id
    }));

    const byPriority = byPriorityRaw.map(item => ({
      priority: item.priority,
      count: item._count.id
    }));

    const byStore = byStoreRaw.map(item => ({
      store: item.store || 'Não informada',
      count: item._count.id
    }));

    const totalUsers = await prisma.user.count();

    res.json({
      summary: {
        total,
        open,
        inProgress,
        waitingUser,
        resolved,
        closed,
        totalUsers
      },
      byPriority,
      byCategory,
      byStore
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar dados estatísticos.' });
  }
});

// List all Users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        department: true,
        store: true,
        role: true,
        active: true,
        createdAt: true,
        _count: { select: { tickets: true } }
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro ao buscar lista de usuários.' });
  }
});

// Create User (Admin)
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, password, phone, department, store, role, active } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ error: 'Nome, e-mail, telefone e senha são obrigatórios.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone,
        department: department || 'Geral',
        store: store || 'Matriz',
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        active: active !== undefined ? Boolean(active) : true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        department: true,
        store: true,
        role: true,
        active: true
      }
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// Edit / Deactivate User (Admin)
router.patch('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, department, store, active, password } = req.body;

    const dataToUpdate = {};
    if (fullName) dataToUpdate.fullName = fullName;
    if (email) dataToUpdate.email = email;
    if (phone) dataToUpdate.phone = phone;
    if (role) dataToUpdate.role = role;
    if (department) dataToUpdate.department = department;
    if (store) dataToUpdate.store = store;
    if (active !== undefined) dataToUpdate.active = Boolean(active);
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        active: true,
        department: true,
        store: true
      }
    });

    res.json({ message: 'Usuário atualizado com sucesso!', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// Category Management (List, Create, Update, Delete)
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { tickets: true } }
      }
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar categorias.' });
  }
});

router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

    const category = await prisma.category.create({
      data: { name, description }
    });

    res.status(201).json({ message: 'Categoria criada com sucesso.', category });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar categoria ou nome já existente.' });
  }
});

router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { name, description }
    });

    res.json({ message: 'Categoria atualizada com sucesso.', category });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
});

router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has tickets
    const ticketCount = await prisma.ticket.count({ where: { categoryId: id } });
    if (ticketCount > 0) {
      return res.status(400).json({ error: `Não é possível excluir esta categoria pois ela possui ${ticketCount} chamado(s) vinculado(s).` });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoria excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir categoria.' });
  }
});

// Knowledge Base Routes (Base de Conhecimento)
router.get('/knowledge', authenticateToken, async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        author: { select: { fullName: true } }
      }
    });

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar artigos da base de conhecimento.' });
  }
});

router.post('/knowledge', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, categoryId, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
    }

    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        categoryId: categoryId || null,
        tags: tags || '',
        authorId: req.user.id
      },
      include: {
        category: true,
        author: { select: { fullName: true } }
      }
    });

    res.status(201).json({ message: 'Artigo publicado com sucesso!', article });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar artigo.' });
  }
});

module.exports = router;
