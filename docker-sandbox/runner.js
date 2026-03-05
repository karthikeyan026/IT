const { VM } = require('vm2');

/**
 * runner.js - Docker Sandbox Code Execution
 * Uses vm2 inside a Docker container for an extra layer of security.
 * Receives code from stdin, executes it safely, and sends output to stdout.
 */

// Read code from standard input
let codeToExecute = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    codeToExecute += chunk;
});

process.stdin.on('end', () => {
    try {
        // Intercept console.log to capture output
        const capturedLogs = [];
        const customConsole = {
            log: (...args) => {
                capturedLogs.push(args.join(' '));
            },
            error: (...args) => {
                capturedLogs.push(`ERROR: ${args.join(' ')}`);
            },
            warn: (...args) => {
                capturedLogs.push(`WARN: ${args.join(' ')}`);
            }
        };

        const vm = new VM({
            timeout: 3000, // 3 seconds timeout
            sandbox: {
                console: customConsole
            }
        });

        const startTime = process.hrtime();

        // Execute the user's code
        vm.run(codeToExecute);

        const endTime = process.hrtime(startTime);
        const executionTimeMs = (endTime[0] * 1000) + (endTime[1] / 1000000);

        // Output JSON result
        console.log(JSON.stringify({
            success: true,
            logs: capturedLogs,
            executionTimeMs,
            error: null
        }));

    } catch (error) {
        // If execution fails
        console.log(JSON.stringify({
            success: false,
            logs: [],
            executionTimeMs: 0,
            error: error.message || error.toString()
        }));
    }
});
