import { Command } from "@oclif/core";
export default class CreatePricing extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
    private handleError;
}
