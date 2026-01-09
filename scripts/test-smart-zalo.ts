/**
 * Test suite for Smart Zalo Messaging
 * Run: node --loader ts-node/esm test-smart-zalo.ts
 */

import { sendSmartZaloMessage, batchSmartSend } from "./lib/zalo-integration";

// Test configuration
const TEST_CONFIG = {
    // Replace with your test Zalo User IDs
    testUserId: "YOUR_TEST_ZALO_USER_ID",
    testUserIds: [
        "YOUR_TEST_USER_1",
        "YOUR_TEST_USER_2",
        "YOUR_TEST_USER_3",
    ],

    // Replace with your Attachment ID
    attachmentId: process.env.ZALO_DEFAULT_ATTACHMENT_ID || "YOUR_ATTACHMENT_ID",

    // Test messages
    testMessage: "🧪 Test message from smart send system",
    testBatchMessage: "🧪 Batch test message from smart send system",
};

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
};

const log = {
    success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    section: (msg: string) => console.log(`\n${colors.magenta}${"=".repeat(60)}\n${msg}\n${"=".repeat(60)}${colors.reset}\n`),
};

/**
 * Test 1: Single message send
 */
async function testSingleSend() {
    log.section("TEST 1: Single Message Send");

    try {
        log.info(`Sending to user: ${TEST_CONFIG.testUserId}`);
        log.info(`Message: ${TEST_CONFIG.testMessage}`);
        log.info(`Attachment ID: ${TEST_CONFIG.attachmentId}`);

        const result = await sendSmartZaloMessage(
            TEST_CONFIG.testUserId,
            TEST_CONFIG.testMessage,
            TEST_CONFIG.attachmentId
        );

        if (result.success) {
            log.success("Message sent successfully!");
            console.log("\nResult details:");
            console.log(`  - Message ID: ${result.messageId}`);
            console.log(`  - Message Type: ${result.messageType}`);
            console.log(`  - Used Quota: ${result.usedQuota ? "YES ❌" : "NO ✅"}`);

            if (result.messageType === "consultation") {
                log.success("Sent via Consultation (FREE) - No quota used! 🎉");
            } else {
                log.warning("Sent via Promotion (PAID) - Quota used ⚠️");
            }
        } else {
            log.error("Message send failed!");
            console.log(`  - Error: ${result.error}`);
            console.log(`  - Error Code: ${result.errorCode}`);
        }

        return result;
    } catch (error) {
        log.error(`Exception: ${error}`);
        throw error;
    }
}

/**
 * Test 2: Batch message send
 */
async function testBatchSend() {
    log.section("TEST 2: Batch Message Send");

    try {
        log.info(`Sending to ${TEST_CONFIG.testUserIds.length} users`);
        log.info(`Message: ${TEST_CONFIG.testBatchMessage}`);
        log.info(`Attachment ID: ${TEST_CONFIG.attachmentId}`);

        const result = await batchSmartSend(
            TEST_CONFIG.testUserIds,
            TEST_CONFIG.testBatchMessage,
            TEST_CONFIG.attachmentId
        );

        console.log("\n📊 Summary:");
        console.log(`  - Total: ${result.total}`);
        console.log(`  - Success: ${result.success} ✅`);
        console.log(`  - Failed: ${result.failed} ❌`);
        console.log(`  - Consultation (FREE): ${result.consultationCount} 🎉`);
        console.log(`  - Promotion (PAID): ${result.promotionCount} 💸`);
        console.log(`  - Quota Used: ${result.quotaUsed}/${2000}`);

        console.log("\n📝 Detailed Results:");
        result.results.forEach((r, i) => {
            const status = r.success ? "✅" : "❌";
            const type = r.messageType || "N/A";
            const quota = r.usedQuota ? "💸" : "🆓";
            console.log(`  ${i + 1}. ${status} ${r.userId}: ${type} ${quota}`);
            if (r.error) {
                console.log(`     Error: ${r.error}`);
            }
        });

        // Calculate savings
        const saved = result.consultationCount;
        const paid = result.promotionCount;
        if (saved > 0) {
            log.success(`Saved ${saved} quota by using Consultation! 🎉`);
        }
        if (paid > 0) {
            log.warning(`Used ${paid} quota for Promotion 💸`);
        }

        return result;
    } catch (error) {
        log.error(`Exception: ${error}`);
        throw error;
    }
}

/**
 * Test 3: API endpoint test
 */
async function testAPIEndpoint() {
    log.section("TEST 3: API Endpoint Test");

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        log.info(`Testing API: ${apiUrl}/api/zalo/smart-send`);

        // Test single mode
        log.info("Testing single mode...");
        const singleResponse = await fetch(`${apiUrl}/api/zalo/smart-send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mode: "single",
                userId: TEST_CONFIG.testUserId,
                textContent: TEST_CONFIG.testMessage,
                promotionAttachmentId: TEST_CONFIG.attachmentId,
            }),
        });

        const singleData = await singleResponse.json();

        if (singleResponse.ok) {
            log.success("API single mode works!");
            console.log(JSON.stringify(singleData, null, 2));
        } else {
            log.error("API single mode failed!");
            console.log(JSON.stringify(singleData, null, 2));
        }

        // Test batch mode
        log.info("\nTesting batch mode...");
        const batchResponse = await fetch(`${apiUrl}/api/zalo/smart-send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mode: "batch",
                userIds: TEST_CONFIG.testUserIds,
                textContent: TEST_CONFIG.testBatchMessage,
                promotionAttachmentId: TEST_CONFIG.attachmentId,
            }),
        });

        const batchData = await batchResponse.json();

        if (batchResponse.ok) {
            log.success("API batch mode works!");
            console.log(JSON.stringify(batchData, null, 2));
        } else {
            log.error("API batch mode failed!");
            console.log(JSON.stringify(batchData, null, 2));
        }
    } catch (error) {
        log.error(`Exception: ${error}`);
        throw error;
    }
}

/**
 * Test 4: Error handling
 */
async function testErrorHandling() {
    log.section("TEST 4: Error Handling");

    try {
        // Test with invalid user ID
        log.info("Testing with invalid user ID...");
        const result1 = await sendSmartZaloMessage(
            "invalid_user_id_12345",
            "Test message",
            TEST_CONFIG.attachmentId
        );

        if (!result1.success) {
            log.success("Error handling works correctly for invalid user!");
            console.log(`  Error: ${result1.error}`);
        } else {
            log.warning("Expected error but got success?");
        }

        // Test without attachment ID (should fail on fallback)
        log.info("\nTesting without attachment ID...");
        const result2 = await sendSmartZaloMessage(
            TEST_CONFIG.testUserId,
            "Test message",
            undefined // No attachment ID
        );

        // This might succeed if Consultation works, or fail if it tries to fallback
        if (result2.success && result2.messageType === "consultation") {
            log.success("Sent via Consultation without attachment ID");
        } else if (!result2.success) {
            log.success("Error handling works for missing attachment ID");
            console.log(`  Error: ${result2.error}`);
        }
    } catch (error) {
        log.error(`Exception: ${error}`);
    }
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.clear();
    log.section("🧪 SMART ZALO MESSAGING TEST SUITE");

    // Validate configuration
    if (TEST_CONFIG.testUserId === "YOUR_TEST_ZALO_USER_ID") {
        log.error("Please configure TEST_CONFIG.testUserId in this file!");
        process.exit(1);
    }

    if (TEST_CONFIG.attachmentId === "YOUR_ATTACHMENT_ID") {
        log.warning("No attachment ID configured - some tests may fail");
    }

    log.info("Starting tests...\n");

    const results = {
        passed: 0,
        failed: 0,
    };

    // Run tests
    const tests = [
        { name: "Single Send", fn: testSingleSend },
        { name: "Batch Send", fn: testBatchSend },
        { name: "Error Handling", fn: testErrorHandling },
        // Uncomment if you have API running
        // { name: "API Endpoint", fn: testAPIEndpoint },
    ];

    for (const test of tests) {
        try {
            await test.fn();
            results.passed++;
        } catch (error) {
            log.error(`Test "${test.name}" failed with exception`);
            results.failed++;
        }
    }

    // Summary
    log.section("📊 TEST SUMMARY");
    console.log(`Total Tests: ${tests.length}`);
    console.log(`${colors.green}Passed: ${results.passed} ✅${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed} ❌${colors.reset}`);

    if (results.failed === 0) {
        log.success("\nAll tests passed! 🎉");
    } else {
        log.error("\nSome tests failed. Please check the output above.");
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch((error) => {
        log.error(`Fatal error: ${error}`);
        process.exit(1);
    });
}

export { runAllTests, testSingleSend, testBatchSend, testAPIEndpoint, testErrorHandling };
