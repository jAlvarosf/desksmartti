const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get Notifications for Logged-In User
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false }
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
});

// Mark Single Notification as Read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { read: true }
    });

    res.json({ message: 'Notificação marcada como lida.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificação.' });
  }
});

// Mark All Notifications as Read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    });

    res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar notificações.' });
  }
});

module.exports = router;
