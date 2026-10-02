const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Multer storage setup
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Helper to generate Unique Code e.g. TCK-20261001-001
async function generateTicketCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await prisma.ticket.count({
    where: {
      code: {
        startsWith: `TCK-${dateStr}`
      }
    }
  });
  const seq = String(countToday + 1).padStart(3, '0');
  return `TCK-${dateStr}-${seq}`;
}

// Create Ticket
router.post('/', authenticateToken, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, categoryId, priority, department, store, companyId, requesterFullName, requesterEmail, requesterPhone } = req.body;

    if (!title || !description || !categoryId) {
      return res.status(400).json({ error: 'Título, descrição e categoria são obrigatórios.' });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Categoria não encontrada.' });
    }

    let targetUserId = req.user.id;

    if (req.user.role === 'ADMIN' && requesterEmail && requesterEmail.trim() !== req.user.email) {
      let existingUser = await prisma.user.findUnique({ where: { email: requesterEmail.trim() } });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            fullName: requesterFullName || 'Usuário Solicitante',
            email: requesterEmail.trim(),
            password: 'temp_' + Date.now(),
            phone: requesterPhone || '(00) 00000-0000',
            department: department || 'Geral',
            store: store || 'Matriz',
            companyId: companyId || null,
            role: 'USER',
            active: true
          }
        });
      }
      targetUserId = existingUser.id;
    }

    const code = await generateTicketCode();

    const ticket = await prisma.ticket.create({
      data: {
        code,
        title,
        description,
        categoryId,
        priority: priority || 'MEDIUM',
        department: department || req.user.department,
        store: store || req.user.store,
        companyId: companyId || req.user.companyId || null,
        userId: targetUserId,
        status: 'OPEN'
      },
      include: {
        category: true,
        company: true,
        user: {
          select: { id: true, fullName: true, email: true, department: true, store: true, phone: true }
        }
      }
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await prisma.attachment.create({
          data: {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            ticketId: ticket.id
          }
        });
      }
    }

    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'CREATED',
        newValue: 'Chamado Aberto',
        performedBy: req.user.fullName
      }
    });

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          ticketId: ticket.id,
          title: 'Novo Chamado Criado',
          message: `Novo chamado #${ticket.code} - "${ticket.title}" por ${req.user.fullName}.`
        }
      });
    }

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        ticketId: ticket.id,
        title: 'Chamado Registrado',
        message: `Seu chamado #${ticket.code} foi aberto com sucesso!`
      }
    });

    const fullTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        category: true,
        company: true,
        user: { select: { id: true, fullName: true, email: true, phone: true, department: true, store: true } },
        attachments: true
      }
    });

    res.status(201).json({ message: 'Chamado criado com sucesso!', ticket: fullTicket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Erro ao criar chamado.' });
  }
});

// Rate / Evaluate Ticket (1 to 5 stars + feedback comment)
router.patch('/:id/rating', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5 estrelas.' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    // Only ticket creator or admin can rate
    if (ticket.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas o solicitante do chamado pode avaliá-lo.' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        rating: Number(rating),
        feedback: feedback ? feedback.trim() : null,
        ratedAt: new Date()
      }
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: 'RATED',
        newValue: `Avaliado com ${rating} estrelas`,
        performedBy: req.user.fullName
      }
    });

    res.json({ message: 'Obrigado por avaliar nosso atendimento!', ticket: updatedTicket });
  } catch (error) {
    console.error('Rating ticket error:', error);
    res.status(500).json({ error: 'Erro ao registrar avaliação.' });
  }
});

// List Tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, categoryId, store, companyId, search, startDate, endDate } = req.query;

    const where = {};

    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (companyId) where.companyId = companyId;
    if (store) where.store = store;

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        company: true,
        user: {
          select: { id: true, fullName: true, email: true, phone: true, department: true, store: true }
        },
        assignedTo: {
          select: { id: true, fullName: true, email: true }
        },
        attachments: true,
        _count: {
          select: { comments: true, attachments: true }
        }
      }
    });

    res.json({ tickets });
  } catch (error) {
    console.error('List tickets error:', error);
    res.status(500).json({ error: 'Erro ao buscar chamados.' });
  }
});

// Get Single Ticket Details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
        user: {
          select: { id: true, fullName: true, email: true, phone: true, department: true, store: true, role: true }
        },
        assignedTo: {
          select: { id: true, fullName: true, email: true }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, fullName: true, role: true, avatar: true } }
          }
        },
        attachments: true,
        history: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para visualizar este chamado.' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do chamado.' });
  }
});

// Full Edit Ticket (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, priority, department, store, companyId } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        title: title || ticket.title,
        description: description || ticket.description,
        categoryId: categoryId || ticket.categoryId,
        priority: priority || ticket.priority,
        department: department || ticket.department,
        store: store || ticket.store,
        companyId: companyId || ticket.companyId
      },
      include: {
        category: true,
        company: true,
        user: { select: { id: true, fullName: true, email: true, phone: true, department: true, store: true } },
        attachments: true
      }
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: 'EDITED_BY_ADMIN',
        newValue: 'Informações do chamado editadas pelo administrador',
        performedBy: req.user.fullName
      }
    });

    res.json({ message: 'Chamado editado com sucesso!', ticket: updatedTicket });
  } catch (error) {
    console.error('Edit ticket error:', error);
    res.status(500).json({ error: 'Erro ao editar chamado.' });
  }
});

// Update Status / Priority / Assignment
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (req.user.role !== 'ADMIN' && status && !['CLOSED', 'OPEN'].includes(status)) {
      return res.status(403).json({ error: 'Usuários apenas podem fechar ou reabrir seus próprios chamados.' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority && req.user.role === 'ADMIN') updateData.priority = priority;
    if (assignedToId !== undefined && req.user.role === 'ADMIN') updateData.assignedToId = assignedToId;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        user: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true } }
      }
    });

    if (status && status !== ticket.status) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: id,
          action: 'STATUS_CHANGED',
          oldValue: ticket.status,
          newValue: status,
          performedBy: req.user.fullName
        }
      });

      if (ticket.userId !== req.user.id) {
        const statusLabels = {
          OPEN: 'Aberto',
          IN_PROGRESS: 'Em Atendimento',
          WAITING_USER: 'Aguardando Usuário',
          RESOLVED: 'Resolvido',
          CLOSED: 'Fechado'
        };

        await prisma.notification.create({
          data: {
            userId: ticket.userId,
            ticketId: ticket.id,
            title: 'Status Alterado',
            message: `O chamado #${ticket.code} mudou de status para "${statusLabels[status] || status}".`
          }
        });
      }
    }

    res.json({ message: 'Chamado atualizado com sucesso!', ticket: updatedTicket });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Erro ao atualizar chamado.' });
  }
});

// Add Comment
router.post('/:id/comments', authenticateToken, upload.array('attachments', 3), async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo da resposta não pode estar vazio.' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        ticketId: id,
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, fullName: true, role: true, avatar: true } }
      }
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await prisma.attachment.create({
          data: {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            ticketId: id
          }
        });
      }
    }

    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: 'COMMENT_ADDED',
        newValue: content.substring(0, 50),
        performedBy: req.user.fullName
      }
    });

    if (req.user.role === 'ADMIN') {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          ticketId: ticket.id,
          title: 'Nova Resposta da TI',
          message: `A equipe de TI respondeu no chamado #${ticket.code}.`
        }
      });
    } else {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            ticketId: ticket.id,
            title: 'Nova Resposta de Usuário',
            message: `${req.user.fullName} respondeu no chamado #${ticket.code}.`
          }
        });
      }
    }

    res.status(201).json({ message: 'Resposta enviada com sucesso!', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Erro ao enviar resposta.' });
  }
});

module.exports = router;
