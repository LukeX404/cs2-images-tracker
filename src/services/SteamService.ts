import { CustomSteamUser } from "../models/SteamUserModel";
import { VPKDowloaderService } from "./VPKDowloaderService";
import fs from "fs";

export class SteamService {
    private appId = 730;
    private depotId = 2347770;
    private dir = "./public/static";
    private manifestIdFile = `${this.dir}/manifestId.txt`;

    constructor(
        private user: CustomSteamUser,
        private vpkDownloader: VPKDowloaderService
    ) {}

    async login(accountName: string, password: string, force = false): Promise<void> {
        console.log("🔑 Logging into Steam...");

        this.user.logOn({ accountName, password, logonID: 2121 });

        this.user.once("loggedOn", async () => {
            try {
                const productInfo = await this.user.getProductInfo([this.appId], [], true);
                const latestManifestId = productInfo.apps[this.appId].appinfo.depots[this.depotId].manifests.public.gid;
                console.log(`📦 Latest manifest ID: ${latestManifestId}`);

                let existingManifestId = "";
                try {
                    existingManifestId = fs.readFileSync(this.manifestIdFile, "utf8");
                } catch (err) {
                    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
                }

                if (existingManifestId === latestManifestId && !force) {
                    console.log("⚠️ No manifest changes detected");
                    process.exit(0);
                }

                const manifest = await this.user.getManifest(this.appId, this.depotId, latestManifestId, "public");
                const vpkDir = await this.vpkDownloader.downloadVPKDir(manifest);
                await this.vpkDownloader.downloadVPKArchives(manifest, vpkDir);

                fs.writeFileSync(this.manifestIdFile, latestManifestId);
                console.log("🎉 Done!");
                process.exit(0);

            } catch (error) {
                console.error(`❌ Error: ${error}`);
                process.exit(1);
            }
        });
    }
}