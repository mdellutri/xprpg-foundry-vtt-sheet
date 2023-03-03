import { PredicateXPRPG } from "@system/predication";

describe("Predication with string atomics return correct results", () => {
    test("conjunctions of atomic statements", () => {
        const predicate = new PredicateXPRPG("foo", "bar", "baz");
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
    });

    test("disjunctions of atomic statements", () => {
        const predicate = new PredicateXPRPG({ or: ["foo", "bar", "baz"] });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(false);
    });

    test("joint denials of atomic statements", () => {
        const predicate = new PredicateXPRPG({ nor: ["foo", "bar", "baz"] });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(true);
        expect(predicate.test(["bat"])).toEqual(true);
    });
});

describe("Predication with numeric-comparison atomics return correct results", () => {
    test("greater-than, less-than", () => {
        const predicate = new PredicateXPRPG({ gt: ["foo", 2] }, { lt: ["bar", 2] });
        expect(predicate.test(["foo:1", "bar:3"])).toEqual(false);
        expect(predicate.test(["foo:2", "bar:2"])).toEqual(false);
        expect(predicate.test(["foo:3", "bar:1"])).toEqual(true);
    });

    test("greater-than-or-equal-to, less-than-or-equal-to", () => {
        const predicate = new PredicateXPRPG({ gte: ["foo", 3] }, { lte: ["bar", 3] });
        expect(predicate.test(["foo:1", "bar:4"])).toEqual(false);
        expect(predicate.test(["foo:2", "bar:3"])).toEqual(false);
        expect(predicate.test(["foo:3", "bar:3"])).toEqual(true);
        expect(predicate.test(["foo:3", "bar:2"])).toEqual(true);
        expect(predicate.test(["foo:4", "bar:1"])).toEqual(true);
    });

    test("greater-than with two strings", () => {
        const predicate = new PredicateXPRPG({ gt: ["self:level", "target:level"] });
        expect(predicate.test(["self:level:1", "target:level:-1"])).toEqual(true);
        expect(predicate.test(["self:level:1", "target:level:1"])).toEqual(false);
        expect(predicate.test(["self:level:1", "target:level:2"])).toEqual(false);
        expect(predicate.test(["self:level:2", "target:level:1"])).toEqual(true);
    });

    test("less-than-or-equal-to with two strings", () => {
        const predicate = new PredicateXPRPG({ lte: ["self:level", "target:level"] });
        expect(predicate.test(["self:level:1", "target:level:1"])).toEqual(true);
        expect(predicate.test(["self:level:1", "target:level:2"])).toEqual(true);
        expect(predicate.test(["self:level:2", "target:level:1"])).toEqual(false);
    });
});

describe("Predication with conjunction and negation return correct results", () => {
    test("conjunction operator", () => {
        const predicate = new PredicateXPRPG({ and: ["foo", "bar", "baz"] });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(false);
        expect(predicate.test(["baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
    });

    test("negation operator nested in conjunction operator", () => {
        const predicate = new PredicateXPRPG({ and: ["foo", "bar", { not: "baz" }] });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(false);
        expect(predicate.test(["baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
    });

    test("conjunction operator nested in disjunction operator", () => {
        const predicate = new PredicateXPRPG({ or: ["foo", { and: ["bar", "baz"] }] });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
        expect(predicate.test(["bar"])).toEqual(false);
        expect(predicate.test(["baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
    });

    test("conjunction and negation operators nested in joint-denial operator", () => {
        const predicate = new PredicateXPRPG({ nor: ["foo", { and: ["bar", "baz"] }] });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["baz"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(false);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(false);
    });
});

describe("simple disjunction return correct results", () => {
    test("single disjunction operator", () => {
        const predicate = new PredicateXPRPG({ or: ["foo", "bar", "baz"] });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(true);
        expect(predicate.test(["baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(false);
    });

    test("conjunction of disjunction and negation", () => {
        const predicate = new PredicateXPRPG({ and: [{ or: ["foo", "bar", { not: "baz" }] }] });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["bar", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
        expect(predicate.test(["baz"])).toEqual(false);
        expect(predicate.test(["baz", "bat"])).toEqual(false);
        expect(predicate.test([])).toEqual(true);
    });

    test("disjunction of disjunctions", () => {
        // same as { any: ["foo", "bar", "baz"] };
        const predicate = new PredicateXPRPG({ or: ["foo", { or: ["bar", "baz"] }] });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(true);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(false);
    });

    test("joint denial of disjunction", () => {
        // same as { not: ["foo", "bar", "baz"] };
        const predicate = new PredicateXPRPG({ nor: [{ or: ["foo", "bar", "baz"] }] });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(true);
    });
});

describe("Predication with joint denial return correct results", () => {
    test("conjunction of joint denial", () => {
        const predicate = new PredicateXPRPG({ and: [{ nor: ["foo", "bar", "baz"] }] });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["foo", "bar", "baz"])).toEqual(false);
        expect(predicate.test(["bar", "baz"])).toEqual(false);
        expect(predicate.test(["baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(true);
        expect(predicate.test(["bat"])).toEqual(true);
    });

    test("joint denial is equivalent to negated disjunction", () => {
        const joinDenial = new PredicateXPRPG({ nor: ["foo", "bar"] });
        const negatedDisjunction = new PredicateXPRPG({ not: { or: ["foo", "bar"] } });
        expect(joinDenial.test(["foo"])).toEqual(negatedDisjunction.test(["foo"]));
        expect(joinDenial.test(["foo", "bar"])).toEqual(negatedDisjunction.test(["foo", "bar"]));
        expect(joinDenial.test(["foo", "bar", "baz"])).toEqual(negatedDisjunction.test(["foo", "bar", "baz"]));
        expect(joinDenial.test(["baz"])).toEqual(negatedDisjunction.test(["baz"]));
        expect(joinDenial.test(["baz", "bat"])).toEqual(negatedDisjunction.test(["baz", "bat"]));
        expect(joinDenial.test([])).toEqual(negatedDisjunction.test([]));
    });
});

describe("Predication with material conditional and negation return correct results", () => {
    test("material conditional with the `all` quantifier", () => {
        const predicate = new PredicateXPRPG({ if: "foo", then: "bar" });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test(["foo", "bar"])).toEqual(true);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
    });

    test("material conditional and negation with the `all` quantifier", () => {
        const predicate = new PredicateXPRPG({ if: "foo", then: { not: "bar" } });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
    });

    test("dijunction of material conditional and negation", () => {
        const predicate = new PredicateXPRPG({
            or: [
                { if: "foo", then: { not: "bar" } },
                { if: "bar", then: { not: "foo" } },
            ],
        });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test(["foo", "bar"])).toEqual(false);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
    });
});

describe("Tautological propositions pass all predicate tests", () => {
    test("p or not p", () => {
        const predicate = new PredicateXPRPG({ or: ["foo", { not: "foo" }] });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
    });

    test("if p then p", () => {
        const predicate = new PredicateXPRPG({ if: "foo", then: "foo" });
        expect(predicate.test(["foo"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
        expect(predicate.test(["bar"])).toEqual(true);
        expect(predicate.test(["bar", "baz"])).toEqual(true);
        expect(predicate.test([])).toEqual(true);
    });
});

describe("Contradictory propositions fail all predicate tests", () => {
    test("p and not p", () => {
        const predicate = new PredicateXPRPG("foo", { not: "foo" });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
        expect(predicate.test(["bar"])).toEqual(false);
        expect(predicate.test(["bar", "baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
    });

    test("p; if p then not p", () => {
        const predicate = new PredicateXPRPG("foo", { if: "foo", then: { not: "foo" } });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
        expect(predicate.test(["bar"])).toEqual(false);
        expect(predicate.test(["bar", "baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
    });

    test("p; if p then q; if q then not p", () => {
        const predicate = new PredicateXPRPG("foo", { if: "foo", then: "bar" }, { if: "bar", then: { not: "foo" } });
        expect(predicate.test(["foo"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
        expect(predicate.test(["bar"])).toEqual(false);
        expect(predicate.test(["bar", "baz"])).toEqual(false);
        expect(predicate.test([])).toEqual(false);
    });
});
