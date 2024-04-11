import fs from "fs";
import path from "path"; // Import the 'path' module

const filename = path.join(process.cwd(), 'public', 'pff_sunburts.html');

export default async function api(req: any, res: { setHeader: (arg0: string, arg1: string) => void; write: (arg0: string) => void; end: () => void; }) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.write(await fs.readFileSync(filename, "utf-8"));
    res.end();
}