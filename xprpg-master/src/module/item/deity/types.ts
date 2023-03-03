import enJSON from "../../../../static/lang/en.json";

type DeityDomain = Lowercase<keyof (typeof enJSON)["XPRPG"]["Item"]["Deity"]["Domain"]>;

export { DeityDomain };
