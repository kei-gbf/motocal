'use strict';

const React = require('react');
const intl = require('./translate');
const {skilltypes, skillAmounts} = require('./global_const');


const SKILL_SECTIONS = [
    [
        "normalS", "normalM", "normalL", "normalLL", "normalLLM",
        {key: "normalBoukunL", type: "normal"},
        {key: "normalBoukunLLL", type: "normal"},
        "normalHPS", "normalHPM", "normalHPL"
    ],
    [
        "magnaM", "magnaL",
        "magnaHPS", "magnaHPM", "magnaHPL"
    ],
    [
        "strengthS", "strengthM", "strengthL", "strengthLL"
    ],
    [
        // TODO: add name for composite skill
        {types: [
            {key: "bahaFUAT", name: "bahaFU AT", type: "bahaFUATHP", amount: "AT"},
            {key: "bahaFUHP", name: "bahaFU HP", type: "bahaFUATHP", amount: "HP"},
        ]}
    ]

    // TODO: add more skill types
];

const headerStyle = {
    backgroundColor: "#eeeeff",
};

const invalidStyle = {
    color: "#aaaaaa",
}

/**
 * SkillAmountTable component
 */
function SkillAmountTable(props) {

    const {type, data, sections, locale} = props;

    // lodash.range
    function *range(start, stop, step=1) {
        for (let num = start; num < stop; num += step) {
            yield num;
        }
    }

    // Check slv16-20 filled useless values.
    // withPrev([1,2,3]) => [[null,1], [1,2], [2,3]]
    function *withPrev(iterable) {
        let prev = null;
        for (const val of iterable) {
            yield [prev, val];
            prev = val;
        }
    }

    function *eachSection(section) {
        for (const entry of section) {
            if (typeof entry === "string") {
                yield Object.assign({}, type[entry], {key:entry});
            }
            else if (entry.type) {
                yield Object.assign({}, type[entry.key], entry);
            }
            else if (entry.types) {
                yield *entry.types;
            }
        }
    }

    function tableRow({key, name, type, amount}) {
        return <tr key={key}>
                <th key="skill-name">{intl.translate(name, locale) || name}</th>
                {Array.from(withPrev(data[type][amount])).map(([prev, val]) =>
                    <td key={val} {...(prev === val ? {style: invalidStyle} : {})}>
                         {val}
                    </td>)
                }
            </tr>;
    }

    return sections.map(section => 
        <table className="table">
        <thead>
            <tr key="thread" style={headerStyle}>
                <th key="skill-name">{intl.translate("スキル", locale)} Lv</th>
                {Array.from(range(1,21)).map(num => <th key={num}>{num}</th>)}
            </tr>
        </thead>
        <tbody>
            {Array.from(eachSection(section)).map(tableRow)}
        </tbody>
        </table>
    );
}
 
SkillAmountTable.defaultProps = {
    type: skilltypes,
    data: skillAmounts,
    sections: SKILL_SECTIONS,
};


export default SkillAmountTable;
