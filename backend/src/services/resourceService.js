const prisma = require('../db/prisma');

class ResourceService {
  async getAllResources() {
    return prisma.resource.findMany({
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            learningPathId: true,
            learningPath: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addResource(topicId, { title, type, url, filePath }) {
    if (!title || !title.trim()) {
      const error = new Error('Resource title is required');
      error.status = 400;
      throw error;
    }

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      const error = new Error(`Topic with id ${topicId} not found`);
      error.status = 404;
      throw error;
    }

    const validTypes = ['PDF', 'DOCUMENT', 'VIDEO', 'WEBSITE'];
    const normalizedType = type ? type.toUpperCase() : 'DOCUMENT';
    const finalType = validTypes.includes(normalizedType) ? normalizedType : 'DOCUMENT';

    return prisma.resource.create({
      data: {
        title: title.trim(),
        type: finalType,
        url: url ? url.trim() : null,
        filePath: filePath ? filePath.trim() : null,
        topicId,
      },
      include: {
        topic: {
          select: { id: true, title: true, learningPathId: true },
        },
      },
    });
  }

  async updateResource(id, { title, type, url, filePath }) {
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error(`Resource with id ${id} not found`);
      error.status = 404;
      throw error;
    }

    const validTypes = ['PDF', 'DOCUMENT', 'VIDEO', 'WEBSITE'];
    const normalizedType = type ? type.toUpperCase() : undefined;
    const finalType = normalizedType && validTypes.includes(normalizedType) ? normalizedType : undefined;

    return prisma.resource.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(finalType !== undefined && { type: finalType }),
        ...(url !== undefined && { url: url ? url.trim() : null }),
        ...(filePath !== undefined && { filePath: filePath ? filePath.trim() : null }),
      },
      include: {
        topic: {
          select: { id: true, title: true, learningPathId: true },
        },
      },
    });
  }

  async deleteResource(id) {
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error(`Resource with id ${id} not found`);
      error.status = 404;
      throw error;
    }
    return prisma.resource.delete({ where: { id } });
  }

  async importBatch(items) {
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error('No items provided for import');
      error.status = 400;
      throw error;
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const validTypes = ['PDF', 'DOCUMENT', 'VIDEO', 'WEBSITE'];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = item.title?.trim();
      const pathTitle = (item.learningPath || item.learningPathTitle || 'Imported Learning Path').trim();
      const topicTitle = (item.topic || item.topicTitle || 'General Resources').trim();
      const rawType = (item.type || 'DOCUMENT').toUpperCase().trim();
      const type = validTypes.includes(rawType) ? rawType : 'DOCUMENT';
      const url = item.url?.trim() || null;
      const filePath = item.filePath?.trim() || null;

      if (!title) {
        errors.push(`Row ${i + 1}: Missing resource title`);
        skippedCount++;
        continue;
      }

      try {
        // 1. Find or create LearningPath
        let path = await prisma.learningPath.findFirst({
          where: { title: { equals: pathTitle } },
        });
        if (!path) {
          path = await prisma.learningPath.create({
            data: {
              title: pathTitle,
              description: `Learning path created from resource import`,
            },
          });
        }

        // 2. Find or create Topic under this path
        let topic = await prisma.topic.findFirst({
          where: {
            learningPathId: path.id,
            title: { equals: topicTitle },
          },
        });
        if (!topic) {
          const currentCount = await prisma.topic.count({ where: { learningPathId: path.id } });
          topic = await prisma.topic.create({
            data: {
              title: topicTitle,
              description: `Imported topic for ${title}`,
              learningPathId: path.id,
              order: currentCount + 1,
              estimatedDuration: 30,
              progress: { create: { isCompleted: false } },
            },
          });
        }

        // 3. Check for duplicates in topic
        const duplicate = await prisma.resource.findFirst({
          where: {
            topicId: topic.id,
            OR: [
              { title: { equals: title } },
              ...(url ? [{ url: { equals: url } }] : []),
            ],
          },
        });

        if (duplicate) {
          skippedCount++;
          continue; // skip duplicate
        }

        // 4. Create resource
        await prisma.resource.create({
          data: {
            title,
            type,
            url,
            filePath,
            topicId: topic.id,
          },
        });

        importedCount++;
      } catch (rowErr) {
        errors.push(`Row ${i + 1} (${title}): ${rowErr.message}`);
        skippedCount++;
      }
    }

    return {
      importedCount,
      skippedCount,
      totalProcessed: items.length,
      errors,
    };
  }
}

module.exports = new ResourceService();
