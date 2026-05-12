import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from '../../db/index';
import { tools, toolExecutions, scraperJobs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';
import { nanoid } from 'nanoid';
import { ScraperService } from '../../services/tools/scraper/index';
import { VendingFinderService } from '../../services/tools/vending-finder/index';
import { AiGeneratorService } from '../../services/tools/generator/ai';
import { SeoAuditorService } from '../../services/tools/auditor/seo';
import { MessengerService } from '../../services/tools/messenger/sender';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/tools/:toolId/execute
router.post('/:toolId/execute', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  const { toolId } = req.params;
  const userId = req.session.userId!;

  try {
    // Validate tool exists
    const [tool] = await db.select().from(tools).where(eq(tools.slug, toolId)).limit(1);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    if (!tool.isActive) return res.status(400).json({ error: 'Tool is not active' });

    const executionId = `exec_${nanoid(12)}`;
    const startTime = Date.now();

    // Create execution record
    await db.insert(toolExecutions).values({
      id: executionId,
      userId,
      toolId: tool.id,
      input: req.body,
      status: 'processing',
    });

    // Route to correct tool service
    if (tool.type === 'scraper') {
      const { sourceType, sourceUrl, mappingConfig, selectors } = req.body;

      if (!sourceType) {
        await db.update(toolExecutions)
          .set({ status: 'error', error: 'sourceType is required' })
          .where(eq(toolExecutions.id, executionId));
        return res.status(400).json({ error: 'sourceType is required (csv | api | web)' });
      }

      const scraperService = new ScraperService();
      let result;

      try {
        result = await scraperService.execute({
          sourceType,
          sourceUrl,
          file: req.file,
          mappingConfig: mappingConfig ? JSON.parse(mappingConfig) : undefined,
          selectors: selectors ? JSON.parse(selectors) : undefined,
        });
      } catch (scraperErr: any) {
        const duration = Date.now() - startTime;
        await db.update(toolExecutions)
          .set({ status: 'error', error: scraperErr.message, duration })
          .where(eq(toolExecutions.id, executionId));

        return res.status(422).json({
          executionId,
          status: 'error',
          error: scraperErr.message,
        });
      }

      const duration = Date.now() - startTime;
      const jobId = `job_${nanoid(12)}`;

      // Save scraper job details
      await db.insert(scraperJobs).values({
        id: jobId,
        executionId,
        sourceType,
        sourceUrl: sourceUrl || null,
        fileName: req.file?.originalname || null,
        rowsImported: result.rowsImported,
        rowsFailed: result.rowsFailed,
        totalRows: result.totalRows,
        mappingConfig: result.mappingConfig || null,
        previewData: result.previewData || null,
      });

      // Update execution as success
      await db.update(toolExecutions)
        .set({ status: 'success', output: result, duration })
        .where(eq(toolExecutions.id, executionId));

      return res.json({
        executionId,
        status: 'success',
        result,
        duration,
      });
    }

    // Vending Finder Tool
    if (tool.slug === 'vending-finder') {
      const { location, category, pushToDataBridge } = req.body;

      if (!location || !category) {
        await db.update(toolExecutions)
          .set({ status: 'error', error: 'Location and category are required' })
          .where(eq(toolExecutions.id, executionId));
        return res.status(400).json({ error: 'Location and category are required' });
      }

      const finderService = new VendingFinderService();
      let result;

      try {
        result = await finderService.execute({
          location,
          category,
          pushToDataBridge: pushToDataBridge === 'true' || pushToDataBridge === true,
        });
      } catch (finderErr: any) {
        const duration = Date.now() - startTime;
        await db.update(toolExecutions)
          .set({ status: 'error', error: finderErr.message, duration })
          .where(eq(toolExecutions.id, executionId));

        return res.status(422).json({
          executionId,
          status: 'error',
          error: finderErr.message,
        });
      }

      const duration = Date.now() - startTime;
      
      // Update execution as success
      await db.update(toolExecutions)
        .set({ status: 'success', output: result, duration })
        .where(eq(toolExecutions.id, executionId));

      return res.json({
        executionId,
        status: 'success',
        result,
        duration,
      });
    }

    // AI Content Generator
    if (tool.slug === 'ai-content') {
      const { prompt, type, tone, length, language } = req.body;
      const aiService = new AiGeneratorService();
      const result = await aiService.execute({ prompt, type, tone, length, language });
      const duration = Date.now() - startTime;
      await db.update(toolExecutions).set({ status: 'success', output: result, duration }).where(eq(toolExecutions.id, executionId));
      return res.json({ executionId, status: 'success', result, duration });
    }

    // Site Auditor
    if (tool.slug === 'site-auditor') {
      const { url } = req.body;
      const auditorService = new SeoAuditorService();
      const result = await auditorService.execute({ url });
      const duration = Date.now() - startTime;
      await db.update(toolExecutions).set({ status: 'success', output: result, duration }).where(eq(toolExecutions.id, executionId));
      return res.json({ executionId, status: 'success', result, duration });
    }

    // Lead Messenger
    if (tool.slug === 'lead-messenger') {
      const { platform, recipients, subject, message } = req.body;
      const messengerService = new MessengerService();
      const result = await messengerService.execute({ platform, recipients, subject, message });
      const duration = Date.now() - startTime;
      await db.update(toolExecutions).set({ status: 'success', output: result, duration }).where(eq(toolExecutions.id, executionId));
      return res.json({ executionId, status: 'success', result, duration });
    }


    // For future tools — generic response
    await db.update(toolExecutions)
      .set({ status: 'error', error: 'Tool execution not implemented yet' })
      .where(eq(toolExecutions.id, executionId));

    return res.status(501).json({ error: 'Tool execution not implemented' });

  } catch (err: any) {
    console.error('[EXECUTE] Error:', err);
    return res.status(500).json({ error: 'Execution failed' });
  }
});

export default router;
