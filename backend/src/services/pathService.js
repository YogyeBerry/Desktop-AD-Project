const prisma = require('../db/prisma');

class PathService {
  async getAllPaths() {
    return prisma.learningPath.findMany({
      include: {
        topics: {
          orderBy: { order: 'asc' },
          include: {
            resources: true,
            progress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPathById(id) {
    return prisma.learningPath.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { order: 'asc' },
          include: {
            resources: true,
            progress: true,
            studySessions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }

  async createPath({ title, description }) {
    if (!title || !title.trim()) {
      const error = new Error('Title is required');
      error.status = 400;
      throw error;
    }
    return prisma.learningPath.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
      },
      include: {
        topics: true,
      },
    });
  }

  async updatePath(id, { title, description }) {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error(`Learning path with id ${id} not found`);
      error.status = 404;
      throw error;
    }

    return prisma.learningPath.createOrUpdate ? null : prisma.learningPath.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      include: {
        topics: {
          include: { resources: true, progress: true },
        },
      },
    });
  }

  async deletePath(id) {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error(`Learning path with id ${id} not found`);
      error.status = 404;
      throw error;
    }
    return prisma.learningPath.delete({ where: { id } });
  }
}

module.exports = new PathService();
