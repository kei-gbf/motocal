'use strict';

const React = require('react');
const intl = require('./translate');
const {skilltypes, skillAmounts} = require('./global_const');


// XXX: Patch, there was no boukun amount key.
// XXX: This code break original "skilltypes", do not impoprt this module in main.
//      the side effect is only within storybook.
// TODO: deepCopy skilltypes to avoid the side effects.

skilltypes["normalBoukunL"].type = "normal"; // XXX
skilltypes["normalBoukunLLL"].type = "normal"; // XXX


const SKILL_SECTIONS = [
    [
        "normalS", "normalM", "normalL", "normalLL", "normalLLM",
        "normalBoukunL", "normalBoukunLLL",
        "normalHPS", "normalHPM", "normalHPL"
    ],
    [
        "magnaM", "magnaL",
        "magnaHPS", "magnaHPM", "magnaHPL"
    ],
    [
        "strengthS", "strengthM", "strengthL", "strengthLL"
    ],

    // TODO: add more skill types
    // XXX: not support composite skill.
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

    function tableRow(key, item) {
        return <tr key={key}>
                <th key="skill-name">{intl.translate(item.name, locale)}</th>
                {Array.from(withPrev(data[item.type][item.amount])).map(([prev, val]) =>
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
            {section.map(key => tableRow(key, type[key]))}
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
