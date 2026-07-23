const { execSync } = require('child_process');

const scripts = [
    'fix_canva2.js',
    'fix_contact_logic.js',
    'final_contact_fix.js',
    'restore_elit_fixes.js',
    'fix_canva4_final.js',
    'fix_canva3_left.js',
    'fix_canva3_left2.js',
    'fix_canva5.js',
    'fix_canva5_2.js',
    'fix_canva5_overflow.js',
    'fix_all_contacts.js',
    'fix_canva6710.js',
    'fix_align_6710.js',
    'fix_line_canva10.js',
    'fix_canva6_gap.js',
    'fix_vert_center_6710.js',
    'fix_canva9_feats.js',
    'fix_canva8_layout.js',
    'fix_canva8_v2.js',
    'apply_all_fixes.js',
    'restore_user_logo.js'
];

for (const script of scripts) {
    try {
        console.log(`Running ${script}...`);
        const output = execSync(`node ${script}`, { encoding: 'utf8' });
        console.log(output);
    } catch (e) {
        console.error(`Error running ${script}:`, e.message);
    }
}
console.log("All scripts executed successfully!");
