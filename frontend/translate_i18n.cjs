const fs = require('fs');
const path = require('path');

const dePath = path.join(__dirname, 'src', 'i18n', 'de.json');
const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const bsPath = path.join(__dirname, 'src', 'i18n', 'bs.json');
const sqPath = path.join(__dirname, 'src', 'i18n', 'sq.json');

const deData = JSON.parse(fs.readFileSync(dePath, 'utf8').replace(/^\uFEFF/, ''));

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function translateText(text, targetLang) {
    if (!text || typeof text !== 'string' || text.trim() === "") return text;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) return text;
        const data = await res.json();
        let translated = '';
        if (data && data[0]) {
            data[0].forEach(part => {
                if (part[0]) translated += part[0];
            });
        }
        
        translated = translated.replace(/\{\s*\{\s*([^}]+?)\s*\}\s*\}/g, '{{$1}}');
        translated = translated.replace(/<\s*(\/?\w+)\s*>/g, '<$1>');

        return translated;
    } catch (e) {
        return text;
    }
}

async function translateObject(obj, targetLang, targetObj = {}) {
    let count = 0;
    for (const key in obj) {
        // Skip already translated keys if we are resuming
        if (targetObj[key] && typeof targetObj[key] === 'string' && targetObj[key] !== obj[key]) {
             continue;
        }

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            targetObj[key] = targetObj[key] || {};
            await translateObject(obj[key], targetLang, targetObj[key]);
        } else if (typeof obj[key] === 'string') {
            if (!targetObj[key] || targetObj[key] === obj[key]) {
                process.stdout.write('.');
                const translated = await translateText(obj[key], targetLang);
                targetObj[key] = translated;
                count++;
                if (count % 10 === 0) {
                     await sleep(500); // Sleep every 10 string to avoid rate limit
                } else {
                     await sleep(50);
                }
            }
        } else {
            targetObj[key] = obj[key];
        }
    }
    return targetObj;
}

async function processLanguage(lang, targetPath) {
    console.log(`\nStarting translation to ${lang}...`);
    let targetData = {};
    if (fs.existsSync(targetPath)) {
        try { targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8')); } catch(e){}
    }
    
    // Save progress periodically by wrapping top level keys
    for (const topKey in deData) {
        console.log(`\nTranslating section: ${topKey}`);
        let tempObj = {};
        tempObj[topKey] = deData[topKey];
        targetData[topKey] = targetData[topKey] || {};
        
        targetData[topKey] = (await translateObject(tempObj, lang, { [topKey]: targetData[topKey] }))[topKey];
        
        // Save after every top level section
        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2));
    }
    console.log(`\nFinished ${lang}`);
}

async function run() {
    await processLanguage('en', enPath);
    await processLanguage('bs', bsPath);
    await processLanguage('sq', sqPath);
    console.log('\nAll translations completed successfully.');
}

run();
