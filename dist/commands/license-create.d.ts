import { Command } from "@oclif/core";
export default class LicenseCreate extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        maxMachines: import("@oclif/core/lib/interfaces").OptionFlag<number | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        expirationDate: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
