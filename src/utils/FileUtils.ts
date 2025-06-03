import fs from "fs";

export class FileUtils {
    static createDirectories(directories: string[]): void {
        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
}
