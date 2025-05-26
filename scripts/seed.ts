import { PrismaClient } from '../generated/prisma';
import type { Prisma } from '../generated/prisma';
import stations from '../data/stations.json';
import posts from '../data/posts.json';
import oaps from '../data/oaps.json';
import categories from '../data/categories.json';
import schedules from '../data/schedules.json';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Seed stations
  for (const station of stations) {
    await prisma.station.upsert({
      where: { id: station.id },
      update: {},
      create: station
    });
  }

  const validStationIds = new Set(stations.map((s) => s.id));

  // Seed posts
  const postData = posts as Record<string, any[]>;
  for (const [stationId, postList] of Object.entries(postData)) {
    if (!validStationIds.has(stationId)) {
      console.warn(`⚠️ Skipping posts for unknown stationId: ${stationId}`);
      continue;
    }
    for (const post of postList) {
      if (!post.id || typeof post.id !== 'string') {
        post.id = randomUUID();
      }
      await prisma.post.upsert({
        where: { id: post.id },
        update: {
          ...post,
          stationId
        },
        create: {
          ...post,
          stationId
        }
      });
    }
  }

  // Seed categories
  const categoryData = categories as Record<string, any[]>;
  for (const [stationId, categoryList] of Object.entries(categoryData)) {
    if (!validStationIds.has(stationId)) {
      console.warn(`⚠️ Skipping categories for unknown stationId: ${stationId}`);
      continue;
    }
    for (const category of categoryList) {
      if (!category.id || typeof category.id !== 'string') {
        console.warn(`⚠️ Skipping category with invalid id`, category);
        continue;
      }

      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          ...category,
          stationId
        },
        create: {
          ...category,
          stationId
        }
      });
    }
  }

  // Seed OAPs
  for (const oap of oaps) {
    if (!oap.id || typeof oap.id !== 'string') {
      oap.id = randomUUID();
    }
    await prisma.oAP.upsert({
      where: { id: oap.id },
      update: oap,
      create: oap
    });
  }

  // Seed schedules
  const scheduleData = schedules as Record<string, any[]>;
  for (const [stationId, scheduleList] of Object.entries(scheduleData)) {
    if (!validStationIds.has(stationId)) {
      console.warn(`⚠️ Skipping schedules for unknown stationId: ${stationId}`);
      continue;
    }
    for (const schedule of scheduleList) {
      if (!schedule.id || typeof schedule.id !== 'string') {
        schedule.id = randomUUID();
      }
      await prisma.schedule.upsert({
        where: { id: schedule.id },
        update: {
          ...schedule,
          stationId
        },
        create: {
          ...schedule,
          stationId
        }
      });
    }
  }
}

main().finally(() => prisma.$disconnect());