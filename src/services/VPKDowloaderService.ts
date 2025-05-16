import { promisify } from "util";
import vpk from "vpk";
import { CustomSteamUser } from "../models/SteamUserModel";

const delay = promisify(setTimeout);

export class VPKDowloaderService {
    private appId = 730;
    private depotId = 2347770;
    private temp = "./temp";

    constructor(private user: CustomSteamUser) {}

    async downloadVPKDir(manifest: any): Promise<any> {
        const dirFile = manifest.files.find((file: any) => 
            file.filename.endsWith("csgo\\pak01_dir.vpk")
        );

        console.log("⏬ Downloading vpk dir...");
        
        try {
            await this.user.downloadFile(this.appId, this.depotId, dirFile, `${this.temp}/pak01_dir.vpk`);
            console.log("✅ Successfully downloaded pak01_dir.vpk");
            
            const vpkDir = new vpk(`${this.temp}/pak01_dir.vpk`);
            vpkDir.load();
            return vpkDir;
            
        } catch (error) {
            console.error(`❌ Failed to download pak01_dir.vpk: ${error}`);
            return null;
        }
    }

    getRequiredVPKFiles(vpkDir: any): number[] {
        const requiredIndices: number[] = [];
        const vpkFolders = [
            "panorama/images/econ/characters",
            "panorama/images/econ/default_generated",
            "panorama/images/econ/music_kits",
            "panorama/images/econ/patches",
            "panorama/images/econ/season_icons",
            "panorama/images/econ/set_icons",
            "panorama/images/econ/status_icons",
            "panorama/images/econ/stickers",
            "panorama/images/econ/tools",
            "panorama/images/econ/weapons",
            "panorama/images/econ/weapon_cases",
            "panorama/images/econ/tournaments",
            "panorama/images/econ/premier_seasons",
        ];

        for (const fileName of vpkDir.files) {
            if (vpkFolders.some(folder => fileName.startsWith(folder))) {
                const archiveIndex = vpkDir.tree[fileName].archiveIndex;
                if (!requiredIndices.includes(archiveIndex)) {
                    requiredIndices.push(archiveIndex);
                }
            }
        }

        return requiredIndices.sort((a, b) => a - b);
    }

    async downloadVPKArchives(manifest: any, vpkDir: any): Promise<void> {
        if (!vpkDir) return;

        const requiredIndices = this.getRequiredVPKFiles(vpkDir);
        
        for (let i = 0; i < requiredIndices.length; i++) {
            const archiveIndex = requiredIndices[i];
            const fileName = `pak01_${archiveIndex.toString().padStart(3, '0')}.vpk`;
            const file = manifest.files.find((f: any) => f.filename.endsWith(fileName));

            console.log(`[${i + 1}/${requiredIndices.length}] Downloading ${fileName}`);
            
            try {
                await this.user.downloadFile(this.appId, this.depotId, file, `${this.temp}/${fileName}`);
                console.log(`✅ Successfully downloaded ${fileName}`);
                await delay(3000);
            } catch (error) {
                console.error(`❌ Failed to download ${fileName}: ${error}`);
            }
        }
    }
}