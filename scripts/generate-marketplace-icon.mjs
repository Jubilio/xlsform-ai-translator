import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "assets", "icon-64.png");
const iconBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAB2UlEQVR4nO1byU0EMRCsRSSAtAHwIoUNgC9hEBZh8CURYkAihOVlCVm+Xd097XE9Z3Y8VdXtq71zuT7f7jgxHqwJWGMbYE3AGqc34HH0wafXTyYPCn6/3rqfufTOAkcUHqPHiGYDPAiP0WJE0xjgUTzQxrtqgFfxATX+RQO8iw8o6Tj9NJg1YJXoB+T07AxIXVwt+gEpXTsDpBr+/rgeur0AEQMCWRZpdnv/QTcgJjlLmt1eDKoBOXKjpNntpUAzQKqPSr+PZsDL+0/xfi/h2u9r72sFtQuwTNASDwgMgrMmaIoHjBZCGoNbK0QMaInSyPTGjj4gmAE9JliJB4S7AIu0lHhAYQyYHRQlxQNKg+CoCGnxgOIs0CtGQzyw6wG6BrRGVSv6gLIBrKUwE7sLaL2IvRtkQcUAdkGECXEDZhc60iaIGsAuikrAtCweoj+ye2RBtCxeQizaygSTaTAnVnMBFCB+LhCjJlJ7UFQ5FwhgLYVdnguwd4PuzgXYcHUuwC6IuDoXmCXLbi+GaFmcXRRdrixu2V7ArgekLo7869oDUrp2BuRurJYFOT07A0o3V8mCko5qBng3oca/qQt4NaGF9/5maPTT2SMaofLV2GrY06A1AWuc3oA/fzXI+TrqaKwAAAAASUVORK5CYII=";

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, Buffer.from(iconBase64, "base64"));
console.log(`Marketplace icon generated: ${outputPath}`);
