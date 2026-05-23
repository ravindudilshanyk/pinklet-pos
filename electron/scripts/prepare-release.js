const fs = require("fs");
const path = require("path");

const serverDir = path.join(__dirname, "../../server");
const distDir = path.join(serverDir, "dist");

// Copy .env template to dist
const envTemplate = `DATABASE_URL=file:./pinklet.db
JWT_SECRET=pinklet-pos-production-secret-2024
PORT=3001
NODE_ENV=production
`;

fs.writeFileSync(path.join(distDir, ".env.template"), envTemplate);
console.log("✓ Created .env template");

// Verify server dist exists
if (!fs.existsSync(distDir)) {
  console.error("❌ Server dist not found. Run: cd server && pnpm build");
  process.exit(1);
}

console.log("✓ Server dist verified");
console.log("✓ Ready for packaging");
