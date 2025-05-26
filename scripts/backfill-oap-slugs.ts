//scripts/backfill-oap-slugs.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function backfillSlugs() {
  const oaps = await prisma.oAP.findMany();

  for (const oap of oaps) {
    const slug = oap.name.toLowerCase().replace(/\s+/g, "-");

    await prisma.oAP.update({
      where: { id: oap.id },
      data: {
        ...(oap as any),
        slug: slug
      },
    });

    console.log(`Updated ${oap.name} → ${slug}`);
  }
}

backfillSlugs().finally(() => prisma.$disconnect());