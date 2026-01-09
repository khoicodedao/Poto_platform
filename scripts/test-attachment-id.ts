/**
 * Script để test Attachment ID
 * Usage: npx tsx scripts/test-attachment-id.ts
 */

import "dotenv/config";

const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
};

const log = {
    success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    title: (msg: string) => console.log(`\n${colors.cyan}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${colors.reset}\n`),
};

async function testAttachmentId() {
    log.title("🧪 TEST ZALO ATTACHMENT ID");

    // Check environment variables
    const accessToken = process.env.ZALO_ACCESS_TOKEN;
    const defaultAttachmentId = process.env.ZALO_DEFAULT_ATTACHMENT_ID;
    const reminderAttachmentId = process.env.ZALO_REMINDER_ATTACHMENT_ID;
    const assignmentAttachmentId = process.env.ZALO_ASSIGNMENT_ATTACHMENT_ID;

    log.info("Checking environment variables...\n");

    // Check Access Token
    if (!accessToken) {
        log.error("ZALO_ACCESS_TOKEN is not set!");
        process.exit(1);
    }
    log.success(`ZALO_ACCESS_TOKEN: ${accessToken.substring(0, 20)}...`);

    // Check Attachment IDs
    const attachments = [
        { name: "ZALO_DEFAULT_ATTACHMENT_ID", value: defaultAttachmentId },
        { name: "ZALO_REMINDER_ATTACHMENT_ID", value: reminderAttachmentId },
        { name: "ZALO_ASSIGNMENT_ATTACHMENT_ID", value: assignmentAttachmentId },
    ];

    let hasAttachment = false;
    for (const att of attachments) {
        if (att.value) {
            log.success(`${att.name}: ${att.value}`);
            hasAttachment = true;
        } else {
            log.warning(`${att.name}: Not set`);
        }
    }

    if (!hasAttachment) {
        log.error("\nNo attachment IDs configured!");
        log.info("\nPlease add to .env.local:");
        console.log(`
${colors.cyan}ZALO_DEFAULT_ATTACHMENT_ID=your_attachment_id_here
ZALO_REMINDER_ATTACHMENT_ID=your_attachment_id_here
ZALO_ASSIGNMENT_ATTACHMENT_ID=your_attachment_id_here${colors.reset}
    `);
        log.info("See docs/FIX_ATTACHMENT_ID.md for instructions");
        process.exit(1);
    }

    // Test by fetching articles from Zalo
    log.title("📚 Fetching Articles from Zalo OA");

    try {
        const response = await fetch(
            "https://openapi.zalo.me/v2.0/oa/article/getslice?offset=0&limit=10",
            {
                method: "GET",
                headers: {
                    "access_token": accessToken,
                },
            }
        );

        const data = await response.json();

        if (!response.ok || data.error !== 0) {
            log.error(`Failed to fetch articles: ${data.message}`);
            console.log(JSON.stringify(data, null, 2));
            process.exit(1);
        }

        const articles = data.data?.articles || [];

        if (articles.length === 0) {
            log.warning("No articles found in your OA!");
            log.info("\nYou need to create at least one article:");
            log.info("1. Go to https://oa.zalo.me/");
            log.info("2. Quản lý nội dung → Bài viết");
            log.info("3. Create a new article");
            log.info("4. Copy the Article ID");
            process.exit(1);
        }

        log.success(`Found ${articles.length} articles:\n`);

        articles.forEach((article: any, index: number) => {
            console.log(`${index + 1}. ${colors.cyan}ID: ${article.id}${colors.reset}`);
            console.log(`   Title: ${article.title}`);
            console.log(`   Description: ${article.description || "N/A"}`);
            console.log(`   Cover: ${article.cover || "N/A"}`);
            console.log();
        });

        // Validate configured attachment IDs
        log.title("🔍 Validating Configured Attachment IDs");

        const configuredIds = [
            defaultAttachmentId,
            reminderAttachmentId,
            assignmentAttachmentId,
        ].filter(Boolean);

        const articleIds = articles.map((a: any) => a.id);

        for (const id of configuredIds) {
            if (articleIds.includes(id)) {
                log.success(`${id} - Valid ✅`);
            } else {
                log.warning(`${id} - Not found in available articles ⚠️`);
            }
        }

        // Summary
        log.title("📊 Summary");

        console.log(`Available Articles: ${articles.length}`);
        console.log(`Configured Attachment IDs: ${configuredIds.length}`);
        console.log();

        if (defaultAttachmentId) {
            log.success("Ready to use Smart Messaging! 🚀");
            console.log();
            log.info("Next steps:");
            console.log("1. Test with: npm run dev");
            console.log("2. Send a reminder from your app");
            console.log("3. Check console logs for quota tracking");
        } else {
            log.error("ZALO_DEFAULT_ATTACHMENT_ID is required!");
            log.info("\nAdd one of these IDs to .env.local:");
            articles.forEach((article: any) => {
                console.log(`${colors.cyan}ZALO_DEFAULT_ATTACHMENT_ID=${article.id}${colors.reset}`);
            });
        }
    } catch (error) {
        log.error(`Exception: ${error}`);
        process.exit(1);
    }
}

// Run
testAttachmentId().catch((error) => {
    log.error(`Fatal error: ${error}`);
    process.exit(1);
});
