import { Router, Request, Response } from 'express';
import { db } from '../../db/index';
import { tools, toolExecutions, scraperJobs } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// GET /api/tools/:toolId/history — execution history for a tool
router.get('/:toolId/history', requireAuth, async (req: Request, res: Response) => {
  const { toolId } = req.params;
  const userId = req.session.userId!;
  const isAdmin = req.session.userRole === 'admin';
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;

  try {
    const [tool] = await db.select({ id: tools.id }).from(tools).where(eq(tools.slug, toolId)).limit(1);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });

    const conditions = isAdmin
      ? [eq(toolExecutions.toolId, tool.id)]
      : [eq(toolExecutions.toolId, tool.id), eq(toolExecutions.userId!, userId)];

    const executions = await db
      .select()
      .from(toolExecutions)
      .where(and(...conditions))
      .orderBy(desc(toolExecutions.createdAt))
      .limit(limit)
      .offset(offset);

    return res.json({ executions, limit, offset });
  } catch (err) {
    console.error('[HISTORY]', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/tools/:toolId/history/:executionId — single execution result
router.get('/:toolId/history/:executionId', requireAuth, async (req: Request, res: Response) => {
  const { executionId } = req.params;

  try {
    const [execution] = await db
      .select()
      .from(toolExecutions)
      .where(eq(toolExecutions.id, executionId))
      .limit(1);

    if (!execution) return res.status(404).json({ error: 'Execution not found' });

    // Get scraper job if available
    const [scraperJob] = await db
      .select()
      .from(scraperJobs)
      .where(eq(scraperJobs.executionId, executionId))
      .limit(1);

    return res.json({ execution, scraperJob: scraperJob || null });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

export default router;
