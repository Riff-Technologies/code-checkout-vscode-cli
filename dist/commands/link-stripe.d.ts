import { Command } from "@oclif/core";
export default class LinkStripe extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
    private handleError;
}
