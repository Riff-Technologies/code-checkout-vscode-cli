import { Command } from "@oclif/core";
export default class Init extends Command {
    static description: string;
    static examples: string[];
    static aliases: string[];
    run(): Promise<void>;
    private handleLogin;
    private handleStripeLink;
    private handleSoftwareCreation;
    private handlePricingCreation;
    private handleInitScript;
    private readPackageJson;
}
