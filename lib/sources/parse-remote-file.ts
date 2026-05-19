import 'server-only';

import mammoth from 'mammoth';

function filenameFromUrl(url: string): { name: string; ext: string } {
    try {
        const pathname = new URL(url).pathname;
        const base = pathname.split('/').pop() ?? '';
        const parts = base.split('.');
        const ext = parts.length > 1 ? (parts.pop() ?? '').toLowerCase() : '';
        return { name: base, ext };
    } catch {
        return { name: '', ext: '' };
    }
}

export async function extractTextFromRemoteFile(fileUrl: string): Promise<{ text: string; title: string }> {
    const res = await fetch(fileUrl);
    if (!res.ok) {
        throw new Error(`Failed to fetch file (${res.status})`);
    }
    const { name: filename, ext } = filenameFromUrl(fileUrl);
    const buf = Buffer.from(await res.arrayBuffer());

    if (ext === 'txt' || ext === 'text') {
        const text = buf.toString('utf8');
        return { text, title: filename || 'Uploaded text' };
    }

    if (ext === 'docx' || ext === 'doc') {
        const { value } = await mammoth.extractRawText({ buffer: buf });
        return { text: value.trim(), title: filename || 'Uploaded document' };
    }

    throw new Error(`Unsupported file type: .${ext || 'unknown'}`);
}
