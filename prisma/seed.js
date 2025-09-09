import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tags = [
        { name: "work" },
        { name: "personal" },
        { name: "urgent" },
        { name: "learning" },
        { name: "health" }
    ];

    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag.name },
            update: {},
            create: tag
        });
    }

    console.log("✅ Tags seeded!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
