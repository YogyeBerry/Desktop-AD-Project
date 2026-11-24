const prisma = require('../db/prisma');

class TopicService {
  async addTopicToPath(pathId, { title, description, estimatedDuration, order }) {
    if (!title || !title.trim()) {
      const error = new Error('Topic title is required');
      error.status = 400;
      throw error;
    }

    const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) {
      const error = new Error(`Learning path with id ${pathId} not found`);
      error.status = 404;
      throw error;
    }

    const topicCount = await prisma.topic.count({ where: { learningPathId: pathId } });
    const topicOrder = order !== undefined ? Number(order) : topicCount + 1;

    const topic = await prisma.topic.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        estimatedDuration: estimatedDuration ? Math.max(1, Number(estimatedDuration)) : 30,
        order: topicOrder,
        learningPathId: pathId,
        progress: {
          create: { isCompleted: false },
        },
      },
      include: {
        resources: true,
        progress: true,
      },
    });

    return topic;
  }

  async updateTopic(id, { title, description, estimatedDuration, order }) {
    const existing = await prisma.topic.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error(`Topic with id ${id} not found`);
      error.status = 404;
      throw error;
    }

    return prisma.topic.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(estimatedDuration !== undefined && { estimatedDuration: Math.max(1, Number(estimatedDuration)) }),
        ...(order !== undefined && { order: Number(order) }),
      },
      include: {
        resources: true,
        progress: true,
      },
    });
  }

  async deleteTopic(id) {
    const existing = await prisma.topic.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error(`Topic with id ${id} not found`);
      error.status = 404;
      throw error;
    }
    return prisma.topic.delete({ where: { id } });
  }

  async updateTopicProgress(id, { isCompleted }) {
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      const error = new Error(`Topic with id ${id} not found`);
      error.status = 404;
      throw error;
    }

    const completed = Boolean(isCompleted);

    // Update topic and upsert progress record atomically
    const [updatedTopic] = await prisma.$transaction([
      prisma.topic.update({
        where: { id },
        data: { isCompleted: completed },
      }),
      prisma.progress.upsert({
        where: { topicId: id },
        create: {
          topicId: id,
          isCompleted: completed,
          completedAt: completed ? new Date() : null,
        },
        update: {
          isCompleted: completed,
          completedAt: completed ? new Date() : null,
        },
      }),
    ]);

    return prisma.topic.findUnique({
      where: { id },
      include: { resources: true, progress: true },
    });
  }
}

module.exports = new TopicService();
