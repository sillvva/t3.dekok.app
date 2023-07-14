import { existsSync } from "fs";
import path from "path";

export const getContentDir = () => {
	// Local directory
	let dirPath = path.join(process.cwd(), "content");
	// Vercel directory, because the cwd() directory is read-only
	if (!existsSync(dirPath) && existsSync("/tmp")) dirPath = "/tmp";
	return dirPath;
};
