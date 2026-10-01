const express = require('express');
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

    // Map categories names
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

// Update User Role/Department/Store (Admin only)
router.patch('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, store } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        role: role || undefined,
        department: department || undefined,
        store: store || undefined
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
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

// Category Management (List, Create, Delete)
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

module.exports = router;
