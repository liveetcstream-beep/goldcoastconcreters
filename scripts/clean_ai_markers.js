const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const draftsDir = path.join(rootDir, 'drafts');

function cleanHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = content;

            // Remove ⚡ 
            updated = updated.replace(/⚡\s*/g, '');
            // Remove AEO Executive Summary Box comment or similar
            updated = updated.replace(/<!-- AEO Executive Summary Box -->/g, '<!-- Summary Highlight Box -->');
            // Remove any raw LaTeX math patterns if any
            updated = updated.replace(/\(\$CO_2\$\)/g, 'carbon dioxide');
            updated = updated.replace(/\$CO_2\$/g, 'CO₂');
            updated = updated.replace(/\(\$CaCO_3\$\)/g, 'calcium carbonate');
            updated = updated.replace(/\$CaCO_3\$/g, 'calcium carbonate');
            updated = updated.replace(/\(\$Ca\(OH\)_2\$\)/g, 'calcium hydroxide');
            updated = updated.replace(/\$Ca\(OH\)_2\$/g, 'calcium hydroxide');
            updated = updated.replace(/\(\$w\/c\s*<\s*0\.45\$\)/g, '(water-to-cement ratio under 0.45)');

            if (updated !== content) {
                fs.writeFileSync(filePath, updated, 'utf8');
                console.log(`Cleaned: ${file}`);
            }
        }
    }
}

cleanHtmlFiles(rootDir);
if (fs.existsSync(draftsDir)) {
    cleanHtmlFiles(draftsDir);
}
console.log('Finished cleaning all HTML files.');
