const fs = require('fs');
const path = require('path');

// Schedule Master Table
const SCHEDULE = [
    { date: '2026-08-29', slug: 'palm-beach', file: 'palm-beach.html', title: 'Palm Beach (4221)', type: 'location' },
    { date: '2026-08-30', slug: 'mudgeeraba', file: 'mudgeeraba.html', title: 'Mudgeeraba (4213)', type: 'location' },
    { date: '2026-08-31', slug: 'tamborine-mountain', file: 'tamborine-mountain.html', title: 'Tamborine Mountain (4272)', type: 'location' },
    { date: '2026-09-01', slug: 'coolangatta', file: 'coolangatta.html', title: 'Coolangatta (4225)', type: 'location' },
    { date: '2026-09-02', slug: 'faq', file: 'faq.html', title: 'FAQ Hub', type: 'guide' },
    { date: '2026-09-03', slug: 'clean-concrete-driveway-gold-coast', file: 'clean-concrete-driveway-gold-coast.html', title: 'Clean Concrete Driveway', type: 'guide' },
    { date: '2026-09-04', slug: 'concrete-efflorescence-removal', file: 'concrete-efflorescence-removal.html', title: 'Efflorescence Removal Guide', type: 'guide' },
    { date: '2026-09-05', slug: 'concrete-mpa-strength-slump-test-guide', file: 'concrete-mpa-strength-slump-test-guide.html', title: 'Concrete MPa Strength & Slump Guide', type: 'guide' },
    { date: '2026-09-06', slug: 'driveway-drainage-gold-coast', file: 'driveway-drainage-gold-coast.html', title: 'Driveway Drainage Guide', type: 'guide' },
    { date: '2026-09-07', slug: 'steep-driveway-concreting-gold-coast', file: 'steep-driveway-concreting-gold-coast.html', title: 'Steep Driveway Concreting', type: 'guide' },
    { date: '2026-09-08', slug: 'coloured-concrete-gold-coast', file: 'coloured-concrete-gold-coast.html', title: 'Coloured Concrete Guide', type: 'guide' },
    { date: '2026-09-09', slug: 'how-long-until-you-can-drive-on-new-concrete', file: 'how-long-until-you-can-drive-on-new-concrete.html', title: 'How Long to Drive on New Concrete', type: 'guide' }
];

function getQueenslandDate() {
    // Returns YYYY-MM-DD in Australia/Brisbane timezone
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

function runPublisher() {
    const today = getQueenslandDate();
    console.log(`[Auto-Publisher] Current Queensland Date: ${today}`);

    const baseDir = path.resolve(__dirname, '..');
    const topicalMapPath = path.join(baseDir, 'SEO_Topical_Map_Slugs.md');
    const sitemapPath = path.join(baseDir, 'sitemap.xml');

    let topicalContent = fs.readFileSync(topicalMapPath, 'utf8');
    let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    let hasChanges = false;
    let publishedSlugs = [];

    for (const item of SCHEDULE) {
        if (item.date <= today) {
            const dateLabel = formatDateString(item.date);
            const liveBadge = `**LIVE (${dateLabel})**`;

            // 1. Check & Update SEO_Topical_Map_Slugs.md
            const lines = topicalContent.split('\n');
            let mapUpdated = false;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(`/${item.slug}`) && !lines[i].includes('LIVE')) {
                    const parts = lines[i].split('|');
                    if (parts.length >= 6) {
                        parts[5] = ` ${liveBadge} `;
                        if (parts.length === 6) {
                            parts.push('');
                        }
                        lines[i] = parts.join('|').trimEnd();
                        if (!lines[i].endsWith('|')) {
                            lines[i] += ' |';
                        }
                        mapUpdated = true;
                        publishedSlugs.push(item.slug);
                        console.log(`[Auto-Publisher] Marked /${item.slug} as ${liveBadge} in topical map.`);
                    }
                }
            }
            if (mapUpdated) {
                topicalContent = lines.join('\n');
                hasChanges = true;
            }

            // 2. Check & Update sitemap.xml
            const canonicalUrl = `https://goldcoastconcretersqld.com.au/${item.slug}`;
            if (!sitemapContent.includes(canonicalUrl)) {
                const sitemapEntry = `\n  <url>\n    <loc>${canonicalUrl}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
                const insertAnchor = '</urlset>';
                sitemapContent = sitemapContent.replace(insertAnchor, `${sitemapEntry}\n\n${insertAnchor}`);
                hasChanges = true;
                console.log(`[Auto-Publisher] Added ${canonicalUrl} to sitemap.xml.`);
            }

            // 3. Update Suburb Tags in HTML files if Location Page
            if (item.type === 'location') {
                const tagHtml = `<a href="${item.slug}" class="area-tag">${item.title}</a>`;
                const htmlFiles = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));

                for (const htmlFile of htmlFiles) {
                    const filePath = path.join(baseDir, htmlFile);
                    let htmlContent = fs.readFileSync(filePath, 'utf8');
                    const areaRegex = /(<div class="areas-list[^"]*">)([\s\S]*?)(<\/div>)/i;
                    const areaMatch = htmlContent.match(areaRegex);

                    if (areaMatch && !areaMatch[2].includes(`href="${item.slug}"`)) {
                        const newInner = areaMatch[2].trimEnd() + `\n            ${tagHtml}\n        `;
                        htmlContent = htmlContent.replace(areaRegex, `$1${newInner}$3`);
                        fs.writeFileSync(filePath, htmlContent, 'utf8');
                        hasChanges = true;
                    }
                }
            }
        }
    }

    if (hasChanges) {
        fs.writeFileSync(topicalMapPath, topicalContent, 'utf8');
        fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
        console.log(`[Auto-Publisher] Success: Updated ${publishedSlugs.length} scheduled articles.`);
    } else {
        console.log(`[Auto-Publisher] Everything up-to-date. No scheduled publications required today.`);
    }
}

runPublisher();
