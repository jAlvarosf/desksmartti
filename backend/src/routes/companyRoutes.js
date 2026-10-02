const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Public route to list active companies (for Registration dropdown)
router.get('/public/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true }
    });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar empresas.' });
  }
});

// Admin Companies CRUD
router.get('/companies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, tickets: true } }
      }
    });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
});

router.post('/companies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, code, active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório.' });
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        code: code ? code.trim() : null,
        active: active !== undefined ? Boolean(active) : true
      }
    });

    res.status(201).json({ message: 'Empresa criada com sucesso!', company });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar empresa. Verifique se o nome já existe.' });
  }
});

router.put('/companies/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, active } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        code: code !== undefined ? code.trim() : undefined,
        active: active !== undefined ? Boolean(active) : undefined
      }
    });

    res.json({ message: 'Empresa atualizada com sucesso!', company });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar empresa.' });
  }
});

router.delete('/companies/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const ticketCount = await prisma.ticket.count({ where: { companyId: id } });
    const userCount = await prisma.user.count({ where: { companyId: id } });

    if (ticketCount > 0 || userCount > 0) {
      return res.status(400).json({
        error: `Não é possível excluir esta empresa pois possui ${userCount} usuário(s) e ${ticketCount} chamado(s) vinculados.`
      });
    }

    await prisma.company.delete({ where: { id } });
    res.json({ message: 'Empresa excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir empresa.' });
  }
});

module.exports = router;
