import { Command } from "@oclif/core";
export default class LicenseRevoke extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        licenseId: import("@oclif/core/lib/interfaces").OptionFlag<string, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        reason: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
