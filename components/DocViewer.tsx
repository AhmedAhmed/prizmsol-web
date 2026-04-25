import { useState, useEffect } from "react";
import mammoth from "mammoth";
import JSZip from "jszip";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
//
//   <DocxViewer
//     src="data:application/vnd.openxmlformats...;base64,AAAA..."
//     fileName="report.docx"
//   />
//
//   <DocxViewer
//     src="https://storage.example.com/doc.docx"
//     fileName="report.docx"
//   />
//
//   <DocxViewer
//     src={rawBase64String}   // plain base64, no data-URI prefix
//     fileName="report.docx"
//   />
//
// Re-renders automatically whenever `src` changes.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Resolve `src` → ArrayBuffer
// ---------------------------------------------------------------------------

async function srcToArrayBuffer(src) {
  if (!src) throw new Error("No src provided");

  // data-URI
  if (src.startsWith("data:")) {
    const base64 = src.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  // HTTP/S URL
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.arrayBuffer();
  }

  // Raw base64 string
  try {
    const binary = atob(src);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch {
    throw new Error("Could not decode src — expected a base64 string or URL.");
  }
}

// ---------------------------------------------------------------------------
// Theme extraction
// ---------------------------------------------------------------------------

async function extractDocxTheme(arrayBuffer) {
  const theme = {
    bodyFont: null,
    headingFont: null,
    colors: {},
    defaultFontSizePt: 11,
  };

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);

    const themeFile =
      zip.file("word/theme/theme1.xml") ||
      zip.file("word/theme/Theme1.xml");

    if (themeFile) {
      const xml = await themeFile.async("text");

      const colorMap = {
        dk1: "dark1", dk2: "dark2",
        lt1: "light1", lt2: "light2",
        acc1: "accent1", acc2: "accent2",
        acc3: "accent3", acc4: "accent4",
        acc5: "accent5", acc6: "accent6",
        hlink: "hyperlink",
      };

      for (const [tag, name] of Object.entries(colorMap)) {
        const m = xml.match(new RegExp(`<a:${tag}[^>]*>\\s*<a:srgbClr val="([A-Fa-f0-9]{6})"`, "i"));
        if (m) theme.colors[name] = `#${m[1]}`;
        const ms = xml.match(new RegExp(`<a:${tag}[^>]*>\\s*<a:sysClr[^>]*lastClr="([A-Fa-f0-9]{6})"`, "i"));
        if (ms && !theme.colors[name]) theme.colors[name] = `#${ms[1]}`;
      }

      const bodyM = xml.match(/<a:latin typeface="([^"]+)"[^/]*\/>[\s\S]*?<\/a:minorFont>/);
      const headM = xml.match(/<a:latin typeface="([^"]+)"[^/]*\/>[\s\S]*?<\/a:majorFont>/);
      if (bodyM) theme.bodyFont = bodyM[1];
      if (headM) theme.headingFont = headM[1];
    }

    const stylesFile = zip.file("word/styles.xml");
    if (stylesFile) {
      const xml = await stylesFile.async("text");
      if (!theme.bodyFont) {
        const m = xml.match(/w:styleId="Normal"[\s\S]*?<w:rFonts[^>]*w:ascii="([^"]+)"/);
        if (m) theme.bodyFont = m[1];
      }
      const sizeM = xml.match(/<w:sz w:val="(\d+)"\s*\/>/);
      if (sizeM) theme.defaultFontSizePt = parseInt(sizeM[1], 10) / 2;
    }
  } catch (_) {}

  return theme;
}

// ---------------------------------------------------------------------------
// Google Fonts loader
// ---------------------------------------------------------------------------

const SYSTEM_FONTS = ["Arial", "Times New Roman", "Courier New", "Georgia",
  "Verdana", "Trebuchet MS", "Impact", "Calibri", "Cambria", "Comic Sans MS"];

function loadGoogleFont(family) {
  if (!family || typeof document === "undefined") return;
  if (SYSTEM_FONTS.some(f => f.toLowerCase() === family.toLowerCase())) return;
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// Mammoth style map
// ---------------------------------------------------------------------------

const STYLE_MAP = [
  "p[style-name='Title'] => h1.doc-title:fresh",
  "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
  "p[style-name='List Paragraph'] => p.list-paragraph:fresh",
  "p[style-name='Quote'] => blockquote:fresh",
  "p[style-name='Intense Quote'] => blockquote.intense:fresh",
  "r[style-name='Strong'] => strong",
  "r[style-name='Emphasis'] => em",
  "r[style-name='Code'] => code",
];

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function FileWordIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 13l1.5 4 1.5-3 1.5 3L15 13"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width={14} height={14} viewBox="0 0 24 24" fill="none"
      style={{ animation: "docx-spin 0.8s linear infinite", display: "block" }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"
        strokeDasharray="44" strokeDashoffset="30" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DocxViewer
// ---------------------------------------------------------------------------

export default function DocxViewer({ src, fileName = "document.docx" }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [html, setHtml] = useState("");
  const [theme, setTheme] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setHtml("");
    setTheme(null);

    (async () => {
      try {
        const arrayBuffer = await srcToArrayBuffer(src);
        if (cancelled) return;

        const [extractedTheme, mammothResult] = await Promise.all([
          extractDocxTheme(arrayBuffer.slice(0)),
          mammoth.convertToHtml({ arrayBuffer }, { styleMap: STYLE_MAP }),
        ]);
        if (cancelled) return;

        if (extractedTheme.bodyFont) loadGoogleFont(extractedTheme.bodyFont);
        if (extractedTheme.headingFont) loadGoogleFont(extractedTheme.headingFont);

        setTheme(extractedTheme);
        setHtml(mammothResult.value);
        setWordCount(
          mammothResult.value
            .replace(/<[^>]+>/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean).length
        );
        setStatus("done");
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e.message);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  // CSS vars derived from the document theme
  const cssVars = theme
    ? {
        "--doc-body-font": theme.bodyFont
          ? `"${theme.bodyFont}", Georgia, serif`
          : "Georgia, serif",
        "--doc-heading-font": theme.headingFont
          ? `"${theme.headingFont}", var(--doc-body-font)`
          : "var(--doc-body-font)",
        "--doc-font-size": `${theme.defaultFontSizePt}pt`,
        "--doc-accent": theme.colors.accent1 || "#4472c4",
        "--doc-dark1": theme.colors.dark1 || "#000000",
        "--doc-dark2": theme.colors.dark2 || "#44546a",
        "--doc-hyperlink": theme.colors.hyperlink || "#0563c1",
      }
    : {};

  const pageCount = wordCount ? Math.max(1, Math.round(wordCount / 250)) : null;

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        background: "var(--color-background-secondary)",
      }}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-primary)",
        }}
      >
        <span
          style={{
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {status === "loading" ? <SpinnerIcon /> : <FileWordIcon />}
        </span>

        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            maxWidth: 320,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fileName}
        </span>

        {status === "done" && (
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
            {wordCount.toLocaleString()} words
            {pageCount ? ` · ~${pageCount} page${pageCount !== 1 ? "s" : ""}` : ""}
            {theme?.bodyFont ? ` · ${theme.bodyFont}` : ""}
          </span>
        )}

        {status === "loading" && (
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
            Rendering…
          </span>
        )}

        {status === "error" && (
          <span style={{ fontSize: 12, color: "var(--color-text-danger)" }}>
            {errorMsg}
          </span>
        )}
      </div>

      {/* ── Document surface ─────────────────────────────────────────────────── */}
      <div style={{ padding: 16, background: "var(--color-background-secondary)" }}>
        <div
          style={{
            background: "#ffffff",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            padding: "48px 64px",
            maxHeight: 600,
            overflowY: "auto",
            minHeight: status !== "done" ? 100 : undefined,
            display: "flex",
            alignItems: status !== "done" ? "center" : "flex-start",
            justifyContent: status !== "done" ? "center" : "flex-start",
            boxSizing: "border-box",
            ...cssVars,
          }}
        >
          <style>{`
            @keyframes docx-spin { to { transform: rotate(360deg); } }
            .docx-body { font-family: var(--doc-body-font); font-size: var(--doc-font-size); line-height: 1.8; color: var(--doc-dark1, #000); width: 100%; }
            .docx-body h1, .docx-body h2, .docx-body h3,
            .docx-body h4, .docx-body h5, .docx-body h6 { font-family: var(--doc-heading-font); color: var(--doc-dark2, #333); font-weight: 600; margin: 1.4em 0 0.5em; line-height: 1.3; }
            .docx-body h1.doc-title { font-size: 2em; color: var(--doc-dark1); border-bottom: 2px solid var(--doc-accent); padding-bottom: 0.3em; margin-bottom: 0.2em; }
            .docx-body p.doc-subtitle { font-size: 1.1em; color: var(--doc-dark2); margin-top: 0; margin-bottom: 1.5em; }
            .docx-body h1 { font-size: 1.7em; }
            .docx-body h2 { font-size: 1.35em; }
            .docx-body h3 { font-size: 1.15em; }
            .docx-body h4 { font-size: 1.05em; }
            .docx-body p { margin: 0 0 0.9em; }
            .docx-body ul, .docx-body ol { margin: 0 0 0.9em; padding-left: 1.6em; }
            .docx-body li { margin-bottom: 0.3em; }
            .docx-body table { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 0.94em; }
            .docx-body td, .docx-body th { border: 1px solid #d0d0d0; padding: 8px 12px; vertical-align: top; }
            .docx-body th { font-weight: 600; background: color-mix(in srgb, var(--doc-accent) 10%, white); }
            .docx-body tr:nth-child(even) td { background: #f9f9f9; }
            .docx-body a { color: var(--doc-hyperlink); text-decoration: none; }
            .docx-body a:hover { text-decoration: underline; }
            .docx-body strong { font-weight: 700; }
            .docx-body em { font-style: italic; }
            .docx-body code { font-family: "Courier New", monospace; background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 0.88em; }
            .docx-body blockquote { margin: 1em 0; padding: 0.4em 1.2em; border-left: 3px solid var(--doc-accent); color: #555; font-style: italic; }
            .docx-body blockquote.intense { background: color-mix(in srgb, var(--doc-accent) 8%, white); border-left: 4px solid var(--doc-accent); border-radius: 0 4px 4px 0; }
            .docx-body img { max-width: 100%; }
            .docx-body p.list-paragraph { padding-left: 1.5em; }
            .docx-body hr { border: none; border-top: 1px solid #e0e0e0; margin: 1.5em 0; }
          `}</style>

          {status === "idle" && (
            <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: 0 }}>
              No document provided.
            </p>
          )}
          {status === "loading" && (
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
              Parsing document…
            </p>
          )}
          {status === "error" && (
            <p style={{ fontSize: 13, color: "var(--color-text-danger)", margin: 0 }}>
              {errorMsg}
            </p>
          )}
          {status === "done" && (
            <div className="docx-body" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </div>
  );
}
