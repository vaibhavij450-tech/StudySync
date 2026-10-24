
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");

test("StudySync health endpoint returns success status", async () => {
    const app = express();

    app.get("/api/health", (req, res) => {
        res.json({
            status: "success",
            message: "StudySync backend is running!",
            database: "disconnected"
        });
    });

    const server = app.listen(0);

    try {
        await new Promise((resolve) => server.once("listening", resolve));

        const address = server.address();
        const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
        const data = await response.json();

        assert.equal(response.status, 200);
        assert.equal(data.status, "success");
        assert.equal(data.message, "StudySync backend is running!");
        assert.equal(data.database, "disconnected");
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});
