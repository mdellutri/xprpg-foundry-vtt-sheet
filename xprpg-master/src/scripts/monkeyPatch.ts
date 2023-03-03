import { TextEditorXPRPG } from "@system/text-editor";

export function monkeyPatchFoundry(): void {
    TextEditor.enrichHTML = TextEditorXPRPG.enrichHTML;
    TextEditor._createInlineRoll = TextEditorXPRPG._createInlineRoll;
    TextEditor._onClickInlineRoll = TextEditorXPRPG._onClickInlineRoll;
}
