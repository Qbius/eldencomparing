export const damage_types = ['physical', 'magic', 'fire', 'lightning', 'holy'];
export const attributes = ['str', 'dex', 'int', 'fth', 'arc'];

const calcid_data = {
    0: {0: [0, 25, 17], 18: [25, 50, 42], 60: [75, 15, 20], 80: [90, 20, 70]},
    1: {0: [0, 35, 19], 20: [35, 40, 40], 60: [75, 15, 20], 80: [90, 20, 70]},
    2: {0: [0, 35, 19], 20: [35, 40, 40], 60: [75, 15, 20], 80: [90, 20, 70]},
    4: {0: [0, 40, 19], 20: [40, 40, 30], 50: [80, 15, 30], 80: [95, 5, 19]},
    7: {0: [0, 35, 19], 20: [35, 40, 40], 60: [75, 15, 20], 80: [90, 20, 70]},
    8: {0: [0, 25, 15], 16: [25, 50, 44], 60: [75, 15, 20], 80: [90, 20, 70]},
    12: {0: [0, 10, 14], 15: [10, 45, 15], 30: [55, 20, 15], 45: [75, 25, 54]},
    14: {0: [0, 40, 19], 20: [40, 20, 20], 40: [60, 25, 40], 80: [85, 15, 19]},
    15: {0: [0, 25, 24], 25: [25, 40, 35], 60: [65, 30, 20], 80: [95, 5, 19]},
    16: {0: [0, 20, 17], 18: [20, 55, 42], 60: [75, 15, 20], 80: [90, 10, 19]},
    'status': {0: [0, 10, 24], 25: [10, 65, 20], 45: [75, 15, 15], 60: [90, 10, 39]},
}
const minus_indices = [0, 1];
const minus_calcids = [0, 1, 2, 7, 8];

function saturation(calcid, stat) {
    if (stat === 0) return 0;

    const keys = Object.keys(calcid_data[calcid]);
    const index = keys.indexOf(String(keys.map(Number).sort((a, b) => b - a).find(thr => thr < stat)));
    const threshold = keys[index];
    const [add, mul, div] = calcid_data[calcid][threshold];
    
    let sat_base = ((stat - Math.max(threshold, 1)) / div);
    if (minus_indices.includes(index) && minus_calcids.includes(calcid)) {
        sat_base = (index === 0) ? Math.pow(sat_base, 1.2) : (1 - Math.pow((1 - sat_base), 1.2));
    }
    return (add + mul * sat_base) / 100;
}

export function damage(weapon, level, stats) {
    const basedmg = weapon.basedmg[level];
    const scaling = weapon.scaling[level];
    
    let totals = damage_types.reduce((obj, typ, i) => Object.assign(obj, {[typ]: basedmg[i]}), {});
    weapon.scalinglist.forEach(([typ, attr]) => {
        const ityp = damage_types.indexOf(typ);
        const iatt = attributes.indexOf(attr);
        totals[typ] += basedmg[ityp] * scaling[iatt] * saturation(weapon.calcids[ityp], stats[iatt]);
    });
    return Object.entries(totals).filter(([_typ, val]) => val > 0).map(([typ, val]) => [typ, Math.floor(val)]).reduce((obj, [typ, val]) => Object.assign(obj, {[typ]: val}), {});
}

export function recommended(weapon, level, twohanding) {
    const wbasedmg = weapon.basedmg[level];
    const wscaling = weapon.scaling[level];

    const rec_list = attributes.map((att, iatt) => {
        const twohanding_coeff = (twohanding && att === 'str') ? 1.5 : 1
        const scaling = wscaling[iatt];
        const relevant_types = weapon.scalinglist.filter(([typ, ps_att]) => ps_att === att && wbasedmg[damage_types.indexOf(typ)] > 0 && wscaling[iatt] > 0).map(([typ, _]) => typ);
        const relevant_thresholds = Array.from(new Set(relevant_types.map(typ => weapon.calcids[damage_types.indexOf(typ)]).map(calcid => Object.keys(calcid_data[calcid])).flat())).map(Number).sort((a, b) => a - b);
        if (relevant_thresholds.length === 0) return [];

        const range = n => [...Array(n).keys()];
        return range(relevant_thresholds.length - 1).map(i => {
            const thr_start = relevant_thresholds[i];
            const thr_end = relevant_thresholds[i + 1];

            const saturation_diff = (calcid, stat) => saturation(calcid, stat + 1) - saturation(calcid, stat);
            const average = l => (l.length > 0) ? l.reduce((a, b) => a + b) / l.length : 0;
            const type2avgs = relevant_types.map(typ => [typ, range(thr_end - thr_start).map(statincrease => saturation_diff(weapon.calcids[damage_types.indexOf(typ)], thr_start + statincrease))]);
            const damage_increase = type2avgs.map(([typ, incs]) => average(incs) * wbasedmg[damage_types.indexOf(typ)] * scaling * twohanding_coeff).reduce((a, b) => a + b);
            return [att, Math.floor(thr_end / twohanding_coeff), damage_increase];
        });
    }).flat().sort(([_att1, _attval1, dmginc1], [_att2, _attval2, dmginc2]) => dmginc2 - dmginc1).map(([att, attval, _dmginc]) => [att, attval]);
    return rec_list.filter(([att, attval], i) => i === 0 || rec_list.slice(0, i).every(([att_temp, attval_temp]) => att_temp !== att || attval_temp < attval));    
}