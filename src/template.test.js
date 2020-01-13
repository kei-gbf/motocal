
const {
    _generateCharaFilterFunc,
    _generateArmFilterFunc
} = require("./template.js");

describe("_generateCharaFilterFunc", () => {

    const defaultState = {
        filterText: "",
        filterElement: "all",
        filterSex: "all",
        filterType: "all",
        filterRace: "all",
        filterFav: "all",
    };

    const Chara = (name, element, sex, type, race, fav1="", fav2="") => ({
        ja: name, en: name, zh: name,
        element, sex, type, race,
        fav1: fav1, fav2: fav2,
    });

    const charaData = {
        "A": Chara("A", "fire", "male", "balance", "human", "sword", "dagger"),
        "B": Chara("B", "fire", "female", "balance", "human", "bow", "katana"),
        "C": Chara("C", "fire", "male", "balance", "human", "music", "staff"),
        "D": Chara("D", "dark", "male/female", "attack", "erune", "gun", "sword"),
    };

    const search = (userSelect) => {
        const state = Object.assign({}, defaultState, userSelect);
        const func = _generateCharaFilterFunc(state);
        return Array.from(Object.entries(charaData).filter(func));
    };

    test("filter by name", () => {
        const result = search({filterText: "A"});
        expect(result.length).toBe(1);
    });

    test("filter by fire element", () => {
        const result = search({filterElement: "fire"});
        expect(result.length).toBe(3);
    });

    test("filter by sex", () => {
        expect(search({filterSex: "male"}).length).toBe(3);
        expect(search({filterSex: "female"}).length).toBe(2);
        expect(search({filterSex: "male/female"}).length).toBe(1);
    });

    test("filter by type", () => {
        const result = search({filterType: "balance"});
        expect(result.length).toBe(3);
    });

    test("filter by race", () => {
        const result = search({filterRace: "human"});
        expect(result.length).toBe(3);
    });

    test("filter by favorite weapon", () => {
        const result = search({filterFav: "sword"});
        expect(result.length).toBe(2);
    });
});


describe("_generateArmFilterFunc", () => {

    const defaultState = {
        filterText: "",
        filterElement: "all",
        filterArmType: "all",
        filterSeries: "all",
    };

    // generate arm entry data for this test.
    const Arm = (name, element, series, type) => ({
        ja: name, en: name, zh: name, element, series, type});

    const armData = {
        "A": Arm("A", "dark", "vintage", "sword"),
        "B": Arm("B", "light", "grand", "sword"),
        "C": Arm("C", "dark", "vintage", "sword"),
        "D": Arm("D", "dark", "vintage", "sword"),
        "E": Arm("E", "all", "grand", "sword"),
    };

    test("filter arm by text", () => {
        const state = Object.assign({}, defaultState, {filterText: "A"});
        const func = _generateArmFilterFunc(state);
        const result = Array.from(Object.entries(armData).filter(func));

        expect(result.length).toBe(1);
    });

    test("filter arm by dark element", () => {
        const state = Object.assign({}, defaultState, {filterElement: "dark"});
        const func = _generateArmFilterFunc(state);
        const result = Array.from(Object.entries(armData).filter(func));

        expect(result.length).toBe(4); // 3 dark + 1 all
    });

    test("filter arm by series", () => {
        const state = Object.assign({}, defaultState, {filterSeries: "grand"});
        const func = _generateArmFilterFunc(state);
        const result = Array.from(Object.entries(armData).filter(func));

        expect(result.length).toBe(2);
    });

    test("filter arm by type", () => {
        const state = Object.assign({}, defaultState, {filterArmType: "sword"});
        const func = _generateArmFilterFunc(state);
        const result = Array.from(Object.entries(armData).filter(func));

        expect(result.length).toBe(5);
    });
});
