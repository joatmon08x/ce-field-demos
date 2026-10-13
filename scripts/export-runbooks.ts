import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { STATIC_RUNBOOKS_PATH, renderRunbooksHtml } from "@/lib/runbooks/static-page";

const target = join(process.cwd(), STATIC_RUNBOOKS_PATH);
writeFileSync(target, renderRunbooksHtml());
console.log(`Wrote ${STATIC_RUNBOOKS_PATH}`);
