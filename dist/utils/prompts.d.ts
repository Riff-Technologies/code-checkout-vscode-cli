import { QuestionCollection, Answers } from "inquirer";
import { PricingModel } from "../types";
/**
 * Login prompt questions
 */
export interface LoginAnswers extends Answers {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    company?: string;
    publisher?: string;
    confirmationCode?: string;
}
export declare const loginPrompts: QuestionCollection<LoginAnswers>;
export declare const confirmationPrompt: QuestionCollection<LoginAnswers>;
/**
 * Pricing model prompt questions
 */
export interface PricingAnswers extends Answers {
    model: PricingModel;
    price: string;
    customPrice?: string;
}
export declare const pricingPrompts: QuestionCollection<PricingAnswers>;
/**
 * License creation prompts
 */
export interface LicenseAnswers extends Answers {
    maxMachines: number;
    expirationDate: string;
}
export declare const licensePrompts: QuestionCollection<LicenseAnswers>;
/**
 * License revocation prompts
 */
export interface RevokeAnswers extends Answers {
    reason: string;
}
export declare const revokePrompts: QuestionCollection<RevokeAnswers>;
/**
 * Generic prompt wrapper
 */
export declare function prompt<T extends Answers>(questions: QuestionCollection<T>): Promise<T>;
