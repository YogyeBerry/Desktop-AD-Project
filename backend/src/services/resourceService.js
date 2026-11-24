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
}

module.exports = new ResourceService();
