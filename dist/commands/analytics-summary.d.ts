import { Command } from "@oclif/core";
export default class AnalyticsSummary extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        startTime: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
        endTime: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser").CustomOptions>;
    };
    run(): Promise<void>;
}
