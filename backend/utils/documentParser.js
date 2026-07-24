const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function parseHtmlToBlocks(html) {
  const blocks = [];
  let title = '';
  let excerpt = '';

  // Use regex to match HTML tags: h1, h2, h3, p, blockquote, ul, ol, img, hr
  const tagRegex = /<(h1|h2|h3|p|blockquote|ul|ol|img|hr)[^>]*>(.*?)<\/\1>|<img[^>]+src="([^">]+)"[^>]*>|<hr\s*\/?>/gis;

  let match;
  let blockIdCounter = 1;

  // Simple string-based tag parser
  const cleanHtml = html.replace(/\r\n/g, '\n');
  const elements = cleanHtml.split(/(?=<h[1-3]|<p|<blockquote|<ul|<ol|<img|<hr)/gi);

  for (let elem of elements) {
    elem = elem.trim();
    if (!elem) continue;

    if (elem.match(/^<h1/i)) {
      const text = elem.replace(/<[^>]+>/g, '').trim();
      if (!title) title = text;
      else blocks.push({ id: `b_${blockIdCounter++}`, type: 'h2', content: text });
    } else if (elem.match(/^<h2/i)) {
      const text = elem.replace(/<[^>]+>/g, '').trim();
      if (!title) title = text;
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'h2', content: text });
    } else if (elem.match(/^<h3/i)) {
      const text = elem.replace(/<[^>]+>/g, '').trim();
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'h3', content: text });
    } else if (elem.match(/^<blockquote/i)) {
      const text = elem.replace(/<[^>]+>/g, '').trim();
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'quote', content: text });
    } else if (elem.match(/^<ul/i)) {
      const items = elem.match(/<li[^>]*>(.*?)<\/li>/gis);
      const text = items ? items.map(i => i.replace(/<[^>]+>/g, '').trim()).join('\n') : elem.replace(/<[^>]+>/g, '').trim();
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'ul', content: text });
    } else if (elem.match(/^<ol/i)) {
      const items = elem.match(/<li[^>]*>(.*?)<\/li>/gis);
      const text = items ? items.map(i => i.replace(/<[^>]+>/g, '').trim()).join('\n') : elem.replace(/<[^>]+>/g, '').trim();
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'ol', content: text });
    } else if (elem.match(/^<img/i)) {
      const srcMatch = elem.match(/src="([^">]+)"/i);
      if (srcMatch && srcMatch[1]) {
        blocks.push({ id: `b_${blockIdCounter++}`, type: 'img', url: srcMatch[1] });
      }
    } else if (elem.match(/^<hr/i)) {
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'hr', content: '' });
    } else {
      // Paragraph or general text
      const cleanText = elem.replace(/<(?!\/?(b|i|u|s|a|mark)\b)[^> animate-]+>/gi, '').trim();
      const plainText = elem.replace(/<[^>]+>/g, '').trim();
      if (plainText) {
        if (!excerpt) excerpt = plainText.slice(0, 160) + '...';
        blocks.push({ id: `b_${blockIdCounter++}`, type: 'p', content: cleanText });
      }
    }
  }

  return { title, excerpt, blocks };
}

async function parseDocx(fileBuffer) {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'blog');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const options = {
    convertImage: mammoth.images.imgElement(function(image) {
      return image.read("base64").then(function(imageBuffer) {
        const extension = image.contentType.split("/")[1] || "png";
        const filename = `doc_img_${uuidv4()}.${extension}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, Buffer.from(imageBuffer, 'base64'));
        const imageUrl = `http://localhost:5000/uploads/blog/${filename}`;
        return { src: imageUrl };
      });
    })
  };

  const result = await mammoth.convertToHtml({ buffer: fileBuffer }, options);
  return parseHtmlToBlocks(result.value);
}

async function parsePdf(fileBuffer) {
  // Use pdfjs-dist directly for coordinate-aware text extraction
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'blog');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let allTextItems = []; // { text, x, y, fontSize, pageNum }
  let blockIdCounter = 1;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;
    const pageWidth = viewport.width;
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if (!item.str || !item.str.trim()) continue;
      const x = item.transform[4];
      // Flip y so top-of-page = 0 (PDF has y=0 at bottom)
      const y = pageHeight - item.transform[5];
      const fontSize = Math.abs(item.transform[0]); // scaleX approximates font size
      allTextItems.push({
        text: item.str.trim(),
        x,
        y: y + (pageNum - 1) * pageHeight * 1.1, // offset pages vertically
        fontSize,
        pageNum,
        pageWidth
      });
    }
  }

  if (allTextItems.length === 0) {
    return { title: 'Imported PDF', excerpt: '', blocks: [] };
  }

  // Detect if multi-column: check if significant text exists in both halves of the page
  const avgPageWidth = allTextItems.reduce((s, i) => s + i.pageWidth, 0) / allTextItems.length;
  const midX = avgPageWidth / 2;
  const leftItems = allTextItems.filter(i => i.x < midX);
  const rightItems = allTextItems.filter(i => i.x >= midX);
  const isMultiColumn = leftItems.length > 10 && rightItems.length > 10;

  let sortedItems;
  if (isMultiColumn) {
    // Sort left column top-to-bottom, then right column top-to-bottom
    leftItems.sort((a, b) => a.y - b.y || a.x - b.x);
    rightItems.sort((a, b) => a.y - b.y || a.x - b.x);
    sortedItems = [...leftItems, ...rightItems];
  } else {
    // Single column: sort by y (top-to-bottom), then x (left-to-right)
    sortedItems = allTextItems.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  // Group items into lines (items within 3 units vertically are on the same line)
  const lines = [];
  let currentLine = [sortedItems[0]];
  for (let i = 1; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const lastItem = currentLine[currentLine.length - 1];
    if (Math.abs(item.y - lastItem.y) < 3 && item.pageNum === lastItem.pageNum) {
      currentLine.push(item);
    } else {
      // Sort current line left-to-right and join
      currentLine.sort((a, b) => a.x - b.x);
      lines.push({
        text: currentLine.map(i => i.text).join(' '),
        fontSize: Math.max(...currentLine.map(i => i.fontSize)),
        y: currentLine[0].y
      });
      currentLine = [item];
    }
  }
  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.x - b.x);
    lines.push({
      text: currentLine.map(i => i.text).join(' '),
      fontSize: Math.max(...currentLine.map(i => i.fontSize)),
      y: currentLine[0].y
    });
  }

  // Determine average and max font sizes for heading detection
  const fontSizes = lines.map(l => l.fontSize).filter(f => f > 0);
  const avgFontSize = fontSizes.reduce((s, f) => s + f, 0) / fontSizes.length || 12;
  const maxFontSize = Math.max(...fontSizes);

  // Build blocks from lines
  let title = '';
  let excerpt = '';
  const blocks = [];

  // Merge consecutive paragraph lines into single paragraph blocks
  let pendingParagraph = '';

  const flushParagraph = () => {
    if (pendingParagraph.trim()) {
      if (!excerpt) excerpt = pendingParagraph.trim().slice(0, 160) + '...';
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'p', content: pendingParagraph.trim() });
      pendingParagraph = '';
    }
  };

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    // Skip page numbers and tiny fragments
    if (/^\d+$/.test(text) && text.length < 4) continue;
    if (text.length < 3) continue;

    const isLargeFont = line.fontSize > avgFontSize * 1.25;
    const isVeryLarge = line.fontSize >= maxFontSize * 0.85 && maxFontSize > avgFontSize * 1.3;
    const looksLikeHeading = (text.length < 80 && (isLargeFont || text === text.toUpperCase())) || isVeryLarge;

    // Detect bullet points
    const isBullet = /^[\u2022\u2023\u25E6\u2013\u2014\-\*]\s/.test(text) || /^[a-z]\)\s/i.test(text);

    if (isVeryLarge && !title) {
      flushParagraph();
      title = text;
    } else if (looksLikeHeading) {
      flushParagraph();
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'h2', content: text });
    } else if (isBullet) {
      flushParagraph();
      // Collect consecutive bullet items
      blocks.push({ id: `b_${blockIdCounter++}`, type: 'ul', content: text.replace(/^[\u2022\u2023\u25E6\u2013\u2014\-\*]\s*/, '') });
    } else {
      // Accumulate into a paragraph - join with space
      pendingParagraph += (pendingParagraph ? ' ' : '') + text;
      
      // Flush paragraph if it ends with sentence-ending punctuation and is long enough
      if (pendingParagraph.length > 200 && /[.!?]$/.test(text)) {
        flushParagraph();
      }
    }
  }
  flushParagraph();

  // Merge consecutive ul blocks into a single ul block
  const mergedBlocks = [];
  for (const block of blocks) {
    const last = mergedBlocks[mergedBlocks.length - 1];
    if (block.type === 'ul' && last && last.type === 'ul') {
      last.content += '\n' + block.content;
    } else {
      mergedBlocks.push({ ...block });
    }
  }

  if (!title && mergedBlocks.length > 0) {
    title = mergedBlocks[0].content.slice(0, 100);
  }

  return { title, excerpt, blocks: mergedBlocks };
}

module.exports = {
  parseDocx,
  parsePdf
};
