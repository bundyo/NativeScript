import * as common from "./color-common";

export class Color extends common.Color {
    get desktop(): string {
        return this.hex;
    }
}
