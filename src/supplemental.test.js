const supplemental = require('./supplemental.js');
//{calcOthersDamage, calcThirdHitDamage, calcSupplementalDamage}
describe("#calcSupplementalDamage", () => {
    // generate temporary vals: [0, 0, 0, 0]
    const INITIAL_VALS = (length=4, value=0) => (new Array(length)).fill(value);

    beforeEach(() => {
        this.supplementalDamageArray = {
            "test-buff-a": {
                damage: 10,
                damageWithoutCritical: 10,
                ougiDamage: 100,
                chainBurst: 200,
                type: "other",
            },
            "test-buff-b": {
                damage: 20,
                damageWithoutCritical: 20,
                ougiDamage: 200,
                chainBurst: 300,
                type: "other",
            },
        };
    });
  
    describe("#calcOthersDamage", () => {
        it("test single hit supplemental damage", () => {
            let {supplementalDamageArray} = this;
            let vals = supplemental.calcOthersDamage(supplementalDamageArray, INITIAL_VALS());
            expect(vals.length).toBe(4);
            expect(vals).toEqual([30, 30, 300, 500]);
        });
  
        it("test hp based supplemental damage", () => {
            let {supplementalDamageArray} = this;
            supplementalDamageArray['test-buff-a']['type'] = 'hp_based';
            supplementalDamageArray['test-buff-a']['threshold'] = 0.80;
            
            let vals = supplemental.calcOthersDamage(supplementalDamageArray, INITIAL_VALS());
            expect(vals).toEqual([30, 30, 300, 500]);
        
            // border check
            //
            // NG: if (! remainHP >= 0.80) ... this expression true in remainHP=0.79
            // OK: if (! (remainHP >= 0.80))
            //
            // Why not (remainHP < 0.80) ... Spec explains it's 80%+
            vals = supplemental.calcOthersDamage(supplementalDamageArray, INITIAL_VALS(), {remainHP:0.80});
            expect(vals).toEqual([30, 30, 300, 500]);
            vals = supplemental.calcOthersDamage(supplementalDamageArray, INITIAL_VALS(), {remainHP:0.79});
            expect(vals).toEqual([20, 20, 200, 300]);
        
            vals = supplemental.calcOthersDamage(supplementalDamageArray, INITIAL_VALS(), {remainHP:0.00});
            expect(vals).toEqual([20, 20, 200, 300]);
        });
      
        it("test unknown type is ignored", () => {
            let {supplementalDamageArray} = this;
            supplementalDamageArray['test-buff-a']['type'] = undefined;
            supplementalDamageArray['test-buff-b']['type'] = 'othr'; // assume typo case       
            
            // I noticed in this test.
            // Switch/Default case DOES NOT report thise typo, because "types" filter them.
            // So It never happen, If bind types parameter and export the partialed functions.
            //
            // Solution:
            //   - Enum in TypeScript can check the typo,
            //     but no Enum in JavaScript. (not run-time syntax emulation, compile/parse time check)
            //   - Flow enum?
            //
            // they are both heavy solution for this small issue.
            // E2E tests can check the typo.
          
            let vals = supplemental.calcOthersDamage(supplementalDamageArray, INITIAL_VALS());
            expect(vals).toEqual([0, 0, 0, 0]);
        });
    });

    describe("#calcThirdHitDamage", () => {
        it("test third hit supplemental damage", () => {
            let {supplementalDamageArray} = this;
            supplementalDamageArray['test-buff-a']['type'] = 'third_hit';
 
            // default expectedTurn: 1
            let vals = supplemental.calcThirdHitDamage(supplementalDamageArray, INITIAL_VALS(2));
            expect(vals).toEqual([10, 10]);

            // safe to pass Infinity
            vals = supplemental.calcThirdHitDamage(supplementalDamageArray, INITIAL_VALS(2), {expectedTurn:Infinity});
            expect(vals).toEqual([10, 10]);

            // but not -Infinity (currently, not happen in actual global_logic.js)
            vals = supplemental.calcThirdHitDamage(supplementalDamageArray, INITIAL_VALS(2), {expectedTurn:-Infinity});
            expect(vals).toEqual([10, -Infinity]);
          
            vals = supplemental.calcThirdHitDamage(supplementalDamageArray, INITIAL_VALS(2), {expectedTurn:3});
            expect(vals).toEqual([10, 30]);
        });
    });
  
    // xit -> Skip test, `test.skip` for Jest
    xit("test unknown report", () => {
        let {supplementalDamageArray} = this;
        supplementalDamageArray["test-buff-a"]["type"] = "unknown";
      
        let vals = supplemental._calcDamage(["unknown"], supplementalDamageArray, INITIAL_VALS());
        expect(vals).toEqual([0, 0, 0, 0]);
      
        // Console will show switch/default case, unknown supplemental damage type.
        // no much chances to typo those types.
    });
});

describe("#collectSkillInfo", () => {
    beforeEach(() => {
        this.supplementalDamageArray = {
            "D": { // for checking sort headers
                damage: 10,
                type: "other", 
            },
            "B": {
                damage: 20,
                type: "hp_based",
                threshold: 0.80,
            },
            "E": {
                damage: 20,
                type: "on_critical",
                additionalVal: 50.0
            },
            "C": {
                damage: 30,
                type: "third_hit",
            },
            // for damage=0 case
            // 1. Add this test data first
            // 2. Run test to confirm it's failed at keys() check
            // 3. Add `&& (val.damage != 0)` to isAvailable
            // 4. Run test to check pass
            "A": {
                damage: 0,
                type: "other",
            },
        };
    });
  
    it("test empty damageArray", () => {
        let supplementalInfo = supplemental.collectSkillInfo({});
 
        // This test show no chances supplementalInfo missing those headers.
        expect(supplementalInfo.headers).toEqual([]);
        expect(supplementalInfo.values).toEqual([]);
        expect(supplementalInfo.total).toEqual(0);
      
        // XXX: but not for collectSkillInfo(undefined), it throws TypeError
        // Lodash library has _.castArray function, that can ensure any object as array.
        // then omit the undefined check.
    });
  
    // TODO:
    // Jest has `test.each` to test similar cases for different data set.
    // https://jestjs.io/docs/ja/api#testeachtable-name-fn-timeout
    // (Jasmine in codepen.io did not support the same method)
    it("test damageArray remainHP 100%,50%", () => {
        let {supplementalDamageArray} = this;
      
        let supplementalInfo = supplemental.collectSkillInfo(supplementalDamageArray, {remainHP: 1.00});
        expect(supplementalInfo.total).toEqual(80);
        expect(supplementalInfo.headers).toEqual([
            ["B", "hp_based", null],
            ["C", "third_hit", null],
            ["D", "other", null],
            ["E", "on_critical", 50]
        ]);
        expect(supplementalInfo.values).toEqual([20, 30, 10, 20]);
      
        supplementalInfo = supplemental.collectSkillInfo(supplementalDamageArray, {remainHP: 0.50});
        expect(supplementalInfo.total).toEqual(60);
        expect(supplementalInfo.headers).toEqual([
            ["C", "third_hit", null],
            ["D", "other", null],
            ["E", "on_critical", 50]
        ]);
        expect(supplementalInfo.values).toEqual([30, 10, 20]);
    });
});

describe("#tableHeader", () => {

    it("test empty head", () => {
        let head = supplemental.tableHeader([], "en");
 
        expect(head).toEqual("");
      
    });
  
    test('test head locale:en', () => {
        expect(supplemental.tableHeader(["バフ", undefined, 10], "en")).toEqual("Buff");
        expect(supplemental.tableHeader(["修羅の誓約", "third_hit", undefined], "en")).toEqual("Contentious Covenant (Applies to third hit)");
        expect(supplemental.tableHeader(["致命の誓約", "on_critical", 50], "en")).toEqual("Deleterious Covenant (Applies to critical hit, 50%)");
    });
  
    test('test head locale:ja', () => {
        expect(supplemental.tableHeader(["バフ", undefined, 10], "ja")).toEqual("バフ");
        expect(supplemental.tableHeader(["修羅の誓約", "third_hit", undefined], "ja")).toEqual("修羅の誓約 (3回目の攻撃に)");
        expect(supplemental.tableHeader(["致命の誓約", "on_critical", 50], "ja")).toEqual("致命の誓約 (クリティカル攻撃に、 50%)");
    });
});
