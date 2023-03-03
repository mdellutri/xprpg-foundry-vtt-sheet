import { ItemXPRPG } from "@item";
import { EffectContextData } from "@item/abstract-effect";

export type DropCanvasItemDataXPRPG = DropCanvasData<"Item", ItemXPRPG> & {
    value?: number;
    level?: number;
    context?: EffectContextData;
};

export type DropCanvasDataXPRPG<T extends string = string, D extends object = object> = T extends "Item"
    ? DropCanvasItemDataXPRPG
    : DropCanvasData<T, D>;
