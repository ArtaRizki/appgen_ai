import { Router, Request, Response } from 'express';
import { db } from '../db/index';
import { managedSites } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { nanoid } from 'nanoid';
import { WordPressPublisher } from '../services/tools/publisher/wordpress';

const router = Router();

// GET /api/sites
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const sites = await db.select().from(managedSites);
    // Remove app passwords from response for security
    const sanitizedSites = sites.map(s => {
      const { credentials, ...rest } = s;
      return { 
        ...rest, 
        hasCredentials: !!credentials 
      };
    });
    res.json(sanitizedSites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// POST /api/sites
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, url, type, username, appPassword } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  try {
    const id = `site_${nanoid(12)}`;
    await db.insert(managedSites).values({
      id,
      name,
      url,
      type: type || 'wordpress',
      credentials: { username, appPassword },
    });

    res.json({ id, message: 'Site added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add site' });
  }
});

// DELETE /api/sites/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await db.delete(managedSites).where(eq(managedSites.id, req.params.id));
    res.json({ message: 'Site deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// POST /api/sites/:id/publish
router.post('/:id/publish', requireAuth, async (req: Request, res: Response) => {
  const { title, content, status } = req.body;

  try {
    const [site] = await db.select().from(managedSites).where(eq(managedSites.id, req.params.id)).limit(1);
    if (!site) return res.status(404).json({ error: 'Site not found' });
    if (!site.credentials) return res.status(400).json({ error: 'Site has no credentials' });

    const { username, appPassword } = site.credentials as any;
    const publisher = new WordPressPublisher();

    const result = await publisher.publish({
      siteUrl: site.url,
      username,
      appPassword,
      title,
      content,
      status: status || 'draft',
    });

    res.json({ message: 'Published successfully', result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
