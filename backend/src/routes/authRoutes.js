const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, department, store, role } = req.body;

    if (!fullName || !email || !password || !phone || !department || !store) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone,
        department,
        store,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        active: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        department: true,
        store: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe o e-mail e a senha.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Sua conta de usuário está desativada. Entre em contato com a TI.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const userWithoutPassword = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      store: user.store,
      role: user.role,
      active: user.active,
      avatar: user.avatar
    };

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// Get current logged-in user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Update logged-in user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, department, store } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: fullName || req.user.fullName,
        phone: phone || req.user.phone,
        department: department || req.user.department,
        store: store || req.user.store
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        department: true,
        store: true,
        role: true,
        active: true,
        avatar: true
      }
    });

    res.json({ message: 'Perfil atualizado com sucesso.', user: updatedUser });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

module.exports = router;
