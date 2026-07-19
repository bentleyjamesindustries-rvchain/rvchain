import fs from 'fs';

// rvListings
{
  let s = fs.readFileSync('lib/rvListings.ts', 'utf8');
  if (!s.includes("from './marketplaceImages'")) {
    s = `import { marketplaceRvImageForClass } from './marketplaceImages';\n\n` + s;
  }
  const lines = s.split('\n');
  let lastClass = 'travel-trailer';
  for (let i = 0; i < lines.length; i++) {
    const cm = lines[i].match(/rvClass: '([^']+)'/);
    if (cm) lastClass = cm[1];
    if (lines[i].includes('image: DEFAULT_RV_IMAGE')) {
      lines[i] = lines[i].replace(
        'DEFAULT_RV_IMAGE',
        `marketplaceRvImageForClass('${lastClass}')`
      );
    }
    if (lines[i].includes("image: marketplaceRvImageForClass(STATE_COVERAGE")) {
      // already good
    }
  }
  // Fix state coverage if still picsum
  s = lines.join('\n');
  s = s.replace(
    /image: `https:\/\/picsum\.photos\/seed\/rvchain-\$\{s\.code\}\/800\/500`,/,
    'image: marketplaceRvImageForClass(STATE_COVERAGE_CLASSES[i % STATE_COVERAGE_CLASSES.length], i),'
  );
  fs.writeFileSync('lib/rvListings.ts', s);
}

// gear
{
  let g = fs.readFileSync('lib/gearListings.ts', 'utf8');
  if (!g.includes("from './marketplaceImages'")) {
    g = `import { marketplaceGearImage } from './marketplaceImages';\n\n` + g;
  }
  let gi = 0;
  g = g.replace(/image: 'https:\/\/picsum\.photos\/id\/\d+\/800\/500',/g, () => {
    return `image: marketplaceGearImage(${gi++}),`;
  });
  fs.writeFileSync('lib/gearListings.ts', g);
  console.log('gear images', gi);
}

// parts
{
  let p = fs.readFileSync('lib/partsListings.ts', 'utf8');
  if (!p.includes("from './marketplaceImages'")) {
    p = `import { marketplacePartsImage } from './marketplaceImages';\n\n` + p;
  }
  let pi = 0;
  p = p.replace(/image: 'https:\/\/picsum\.photos\/id\/\d+\/800\/500',/g, () => {
    return `image: marketplacePartsImage(${pi++}),`;
  });
  fs.writeFileSync('lib/partsListings.ts', p);
  console.log('parts images', pi);
}

console.log('done');
