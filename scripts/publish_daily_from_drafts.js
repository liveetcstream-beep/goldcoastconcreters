const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCHEDULE = [
    { date: '2026-09-03', slug: 'clean-concrete-driveway-gold-coast', file: 'clean-concrete-driveway-gold-coast.html', title: 'Clean Concrete Driveway Guide' },
    { date: '2026-09-04', slug: 'concrete-efflorescence-removal', file: 'concrete-efflorescence-removal.html', title: 'Concrete Efflorescence Removal Guide' },
    { date: '2026-09-05', slug: 'concrete-mpa-strength-slump-test-guide', file: 'concrete-mpa-strength-slump-test-guide.html', title: 'Concrete MPa Strength & Slump Test Guide' },
    { date: '2026-09-06', slug: 'driveway-drainage-gold-coast', file: 'driveway-drainage-gold-coast.html', title: 'Driveway Drainage & Council Guidelines' },
    { date: '2026-09-07', slug: 'steep-driveway-concreting-gold-coast', file: 'steep-driveway-concreting-gold-coast.html', title: 'Steep Driveway Concreting & Finishes' },
    { date: '2026-09-08', slug: 'coloured-concrete-gold-coast', file: 'coloured-concrete-gold-coast.html', title: 'Coloured Concrete Palettes & Oxides' },
    { date: '2026-09-09', slug: 'how-long-until-you-can-drive-on-new-concrete', file: 'how-long-until-you-can-drive-on-new-concrete.html', title: 'How Long to Drive on New Concrete' }
];

function getQueenslandDate() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Australia/Brisbane',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(now);
}

function formatDateString(dateStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [y, m, d] = dateStr.split('-');
    return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function publishDaily() {
    const today = getQueenslandDate();
    console.log(`[Daily Publisher] Today in Queensland: ${today}`);

    const baseDir = path.resolve(__dirname, '..');
    const draftsDir = path.join(baseDir, 'drafts');
    const sitemapPath = path.join(baseDir, 'sitemap.xml');
    const topicalMapPath = path.join(baseDir, 'SEO_Topical_Map_Slugs.md');
    const llmsPath = path.join(baseDir, 'llms.txt');

    // Find the item scheduled for today
    const item = SCHEDULE.find(s => s.date === today);
    if (!item) {
        console.log(`[Daily Publisher] No post scheduled for today (${today}).`);
        return;
    }

    const draftFile = path.join(draftsDir, item.file);
    const liveFile = path.join(baseDir, item.file);

    if (!fs.existsSync(draftFile) && fs.existsSync(liveFile)) {
        console.log(`[Daily Publisher] ${item.file} is already published.`);
        return;
    }

    if (!fs.existsSync(draftFile)) {
        console.log(`[Daily Publisher] Draft file ${draftFile} not found.`);
        return;
    }

    // 1. Move file from drafts to root
    fs.copyFileSync(draftFile, liveFile);
    fs.unlinkSync(draftFile);
    console.log(`[Daily Publisher] Moved ${item.file} from drafts/ to root directory.`);

    // 2. Update sitemap.xml
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const canonical = `https://goldcoastconcretersqld.com.au/${item.slug}`;
    if (!sitemap.includes(canonical)) {
        const entry = `\n  <url>\n    <loc>${canonical}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
        sitemap = sitemap.replace('</urlset>', `${entry}\n\n</urlset>`);
        fs.writeFileSync(sitemapPath, sitemap, 'utf8');
        console.log(`[Daily Publisher] Added ${canonical} to sitemap.xml.`);
    }

    // 3. Update SEO_Topical_Map_Slugs.md
    let topical = fs.readFileSync(topicalMapPath, 'utf8');
    const lines = topical.split('\n');
    const dateBadge = `**LIVE (${formatDateString(item.date)})**`;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`/${item.slug}`)) {
            const parts = lines[i].split('|');
            if (parts.length >= 6) {
                parts[5] = ` ${dateBadge} `;
                lines[i] = parts.join('|').trimEnd();
                if (!lines[i].endsWith('|')) lines[i] += ' |';
            }
        }
    }
    fs.writeFileSync(topicalMapPath, lines.join('\n'), 'utf8');
    console.log(`[Daily Publisher] Updated topical map for ${item.slug}.`);

    // 4. Update llms.txt
    let llms = fs.readFileSync(llmsPath, 'utf8');
    const llmsEntry = `- [${item.title}](${canonical}): Technical resource guide.`;
    if (!llms.includes(canonical)) {
        llms = llms.replace('## Frequently Asked Questions', `${llmsEntry}\n\n---\n\n## Frequently Asked Questions`);
        fs.writeFileSync(llmsPath, llms, 'utf8');
        console.log(`[Daily Publisher] Added ${canonical} to llms.txt.`);
    }

    // 5. Commit and push ONLY today's single article
    try {
        execSync(`git add "${item.file}" sitemap.xml SEO_Topical_Map_Slugs.md llms.txt`, { cwd: baseDir, stdio: 'inherit' });
        execSync(`git commit -m "Publish daily scheduled post: ${item.slug} (${item.date})"`, { cwd: baseDir, stdio: 'inherit' });
        execSync('git push origin main', { cwd: baseDir, stdio: 'inherit' });
        console.log(`[Daily Publisher] Successfully pushed ${item.file} to GitHub!`);
    } catch (err) {
        console.error(`[Daily Publisher] Error pushing to git:`, err.message);
    }
}

publishDaily();
