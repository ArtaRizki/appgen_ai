import { Router, Request, Response } from 'express';
import { db } from '../../db/index';
import { tools, userToolAccess } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { nanoid } from 'nanoid';

const router = Router();

// GET /api/tools — list tools accessible to current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;
    const isAdmin = req.session.userRole === 'admin';

    // Admin sees all tools; regular users see only tools they have access to
    if (isAdmin) {
      const allTools = await db.select().from(tools);
      return res.json({ tools: allTools });
    }

    const accessible = await db
      .select({ tool: tools })
      .from(userToolAccess)
      .innerJoin(tools, eq(userToolAccess.toolId, tools.id))
      .where(and(eq(userToolAccess.userId, userId), eq(tools.isActive, true)));

    return res.json({ tools: accessible.map((r) => r.tool) });
  } catch (err) {
    console.error('[TOOLS] List error:', err);
    return res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// GET /api/tools/:toolId — get single tool
router.get('/:toolId', requireAuth, async (req: Request, res: Response) => {
  const { toolId } = req.params;
  try {
    const [tool] = await db.select().from(tools).where(eq(tools.slug, toolId)).limit(1);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    return res.json({ tool });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

// POST /api/tools — register new tool (admin only)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  const { name, slug, description, type, icon, config } = req.body;

  if (!name || !slug || !type) {
    return res.status(400).json({ error: 'name, slug, and type are required' });
  }

  try {
    const id = `tool_${nanoid(8)}`;
    const [newTool] = await db
      .insert(tools)
      .values({ id, name, slug, description, type, icon, config })
      .returning();

    return res.status(201).json({ tool: newTool });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    return res.status(500).json({ error: 'Failed to create tool' });
  }
});

export default router;
