/**
 * This code was originally created by CSFloat and ByMykel. 
 * I made small changes to TS.
 * https://github.com/ByMykel/counter-strike-image-tracker
 * https://github.com/csfloat/cs-files/blob/5ff0f212ff0dc2b6f6380fc6d1a93121c2b9c2cd/index.js
*/

import SteamUser from "steam-user";
import { CustomSteamUser } from "./models/SteamUserModel";
import { SteamService } from "./services/SteamService";
import { VPKDowloaderService } from "./services/VPKDowloaderService";
import { FileUtils } from "./utils/FileUtils";

if (process.argv.length < 4 || process.argv.length > 5) {
    console.error("Usage: ts-node index.ts <username> <password> [--force]");
    process.exit(1);
}

FileUtils.createDirectories(["./public/static", "./temp"]);

const user = new SteamUser() as CustomSteamUser;
const steamService = new SteamService(user, new VPKDowloaderService(user));

steamService.login(process.argv[2], process.argv[3], process.argv[4] === "--force");
