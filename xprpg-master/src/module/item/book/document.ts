import { PhysicalItemXPRPG } from "@item";
import { BookData } from "./data";

class BookXPRPG extends PhysicalItemXPRPG {}

interface BookXPRPG extends PhysicalItemXPRPG {
    readonly data: BookData;
}

export { BookXPRPG };
