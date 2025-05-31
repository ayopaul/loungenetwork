import { PrismaClient } from "@prisma/client";
import schedules from '../data/schedules.json';
import stations from '../data/stations.json';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const validStationIds = new Set(stations.map((s) => s.id));

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

      console.log(`✅ Seeded show: ${schedule.showTitle} (${stationId})`);
    }
  }

  console.log('✅ Schedules seeded successfully!');
}

main().finally(() => prisma.$disconnect());