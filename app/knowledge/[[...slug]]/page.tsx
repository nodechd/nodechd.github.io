import fs from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import styles from "../page.module.css";

type RouteParams = {
  slug?: string[];
};

type MarkdownNode = {
  type: "file";
  label: string;
  fileSegments: string[];
  routePath: string;
};

type DirectoryNode = {
  type: "directory";
  label: string;
  children: NavNode[];
};

type NavNode = MarkdownNode | DirectoryNode;

const KNOWLEDGE_ROOT = path.join(process.cwd(), "public", "knowledge");
const MAX_KNOWLEDGE_ROUTE_SEGMENTS = 3;

export const dynamicParams = false;

function isSafeSegment(segment: string): boolean {
  return !segment.includes("..") && !segment.includes("/") && !segment.includes("\\");
}

function isValidDirName(name: string): boolean {
  return /^(?:\d{3}-)?[a-z0-9-]+$/.test(name);
}

function isValidFileName(name: string): boolean {
  return /^(?:\d{3}-)?(?:index|[a-z0-9-]+)\.md$/.test(name);
}

function splitKnowledgeName(name: string): { order: number | null; cleanName: string } {
  const baseName = name.replace(/\.md$/i, "");
  const match = baseName.match(/^(\d{3})-(.+)$/);

  if (!match) {
    return { order: null, cleanName: baseName };
  }

  return { order: Number(match[1]), cleanName: match[2] };
}

function cleanKnowledgeSegment(segment: string): string {
  return splitKnowledgeName(segment).cleanName;
}

function compareKnowledgeEntries(a: Dirent, b: Dirent): number {
  const aMeta = splitKnowledgeName(a.name);
  const bMeta = splitKnowledgeName(b.name);

  const aOrder = aMeta.order ?? Number.POSITIVE_INFINITY;
  const bOrder = bMeta.order ?? Number.POSITIVE_INFINITY;

  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }

  if (aMeta.order === null && bMeta.order !== null) {
    return 1;
  }

  if (aMeta.order !== null && bMeta.order === null) {
    return -1;
  }

  if (a.isDirectory() !== b.isDirectory()) {
    return a.isDirectory() ? -1 : 1;
  }

  return aMeta.cleanName.localeCompare(bMeta.cleanName);
}

function titleFromName(name: string): string {
  const withoutExt = cleanKnowledgeSegment(name);
  return withoutExt
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function routeFromFileSegments(fileSegments: string[]): string {
  const parts = fileSegments.map(cleanKnowledgeSegment);
  const last = parts[parts.length - 1];

  if (last.toLowerCase() === "index") {
    const dirParts = parts.slice(0, -1);
    return dirParts.length > 0 ? `/knowledge/${dirParts.join("/")}` : "/knowledge";
  }

  return `/knowledge/${parts.join("/")}`;
}

async function buildTree(dir: string, baseSegments: string[] = []): Promise<NavNode[]> {
  const entries = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith("."))
    .sort(compareKnowledgeEntries);

  const nodes: NavNode[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (baseSegments.length >= MAX_KNOWLEDGE_ROUTE_SEGMENTS) {
        continue;
      }

      if (!isValidDirName(entry.name)) {
        continue;
      }

      const children = await buildTree(fullPath, [...baseSegments, entry.name]);
      if (children.length > 0) {
        nodes.push({
          type: "directory",
          label: titleFromName(entry.name),
          children,
        });
      }
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      if (!isValidFileName(entry.name)) {
        continue;
      }

      const fileSegments = [...baseSegments, entry.name];
      nodes.push({
        type: "file",
        label: titleFromName(entry.name),
        fileSegments,
        routePath: routeFromFileSegments(fileSegments),
      });
    }
  }

  return nodes;
}

async function collectMarkdownFileSegments(
  dir: string,
  baseSegments: string[] = [],
): Promise<string[][]> {
  const entries = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith("."))
    .sort(compareKnowledgeEntries);
  const files: string[][] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (baseSegments.length >= MAX_KNOWLEDGE_ROUTE_SEGMENTS) {
        continue;
      }

      if (!isValidDirName(entry.name)) {
        continue;
      }

      const nested = await collectMarkdownFileSegments(fullPath, [...baseSegments, entry.name]);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      if (!isValidFileName(entry.name)) {
        continue;
      }

      const routeSegments = slugFromFileSegments([...baseSegments, entry.name]);
      if (routeSegments.length <= MAX_KNOWLEDGE_ROUTE_SEGMENTS) {
        files.push([...baseSegments, entry.name]);
      }
    }
  }

  files.sort((a, b) => a.join("/").localeCompare(b.join("/")));
  return files;
}

function slugFromFileSegments(fileSegments: string[]): string[] {
  const parts = fileSegments.map(cleanKnowledgeSegment);
  const last = parts[parts.length - 1];

  if (last.toLowerCase() === "index") {
    return parts.slice(0, -1);
  }

  return parts;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const markdownFiles = await collectMarkdownFileSegments(KNOWLEDGE_ROOT);
  return markdownFiles.map((fileSegments) => {
    const slug = slugFromFileSegments(fileSegments);
    return slug.length > 0 ? { slug } : { slug: [] };
  });
}

function buildBreadcrumbs(fileSegments: string[]): { label: string; href: string }[] {
  const crumbs: { label: string; href: string }[] = [
    { label: "Index", href: "/knowledge" },
  ];

  const accumulated: string[] = [];
  const cleanSegments = fileSegments.map(cleanKnowledgeSegment);

  for (let i = 0; i < cleanSegments.length; i++) {
    const part = cleanSegments[i];
    const isLast = i === cleanSegments.length - 1;

    if (isLast && part.toLowerCase() === "index") {
      break;
    }

    accumulated.push(part);

    const route = `/knowledge/${accumulated.join("/")}`;
    crumbs.push({ label: titleFromName(part), href: route });
  }

  return crumbs;
}

async function resolveMarkdownFile(slug: string[] | undefined): Promise<string[]> {
  const cleanSlug = (slug ?? []).filter((part) => part.length > 0);

  if (!cleanSlug.every(isSafeSegment)) {
    notFound();
  }

  if (cleanSlug.length > MAX_KNOWLEDGE_ROUTE_SEGMENTS) {
    notFound();
  }

  const resolved = await findMarkdownFileBySlug(KNOWLEDGE_ROOT, cleanSlug);

  if (!resolved) {
    notFound();
  }

  return resolved;
}

async function findMarkdownFileBySlug(
  dir: string,
  slug: string[],
  baseSegments: string[] = [],
): Promise<string[] | null> {
  const entries = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith("."))
    .sort(compareKnowledgeEntries);

  if (slug.length === 0) {
    const indexFile = entries.find(
      (entry) => entry.isFile() && isValidFileName(entry.name) && cleanKnowledgeSegment(entry.name).toLowerCase() === "index",
    );

    return indexFile ? [...baseSegments, indexFile.name] : null;
  }

  const [head, ...tail] = slug;

  for (const entry of entries) {
    if (entry.isDirectory() && isValidDirName(entry.name) && cleanKnowledgeSegment(entry.name) === head) {
      const nested = await findMarkdownFileBySlug(path.join(dir, entry.name), tail, [...baseSegments, entry.name]);
      if (nested) {
        return nested;
      }
    }
  }

  if (tail.length === 0) {
    const fileEntry = entries.find(
      (entry) =>
        entry.isFile() &&
        isValidFileName(entry.name) &&
        cleanKnowledgeSegment(entry.name) === head &&
        cleanKnowledgeSegment(entry.name).toLowerCase() !== "index",
    );

    if (fileEntry) {
      return [...baseSegments, fileEntry.name];
    }
  }

  return null;
}

function toPublicAssetSrc(source: string, fileSegments: string[]): string {
  if (
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:") ||
    source.startsWith("/")
  ) {
    return source;
  }

  const currentDir = fileSegments.slice(0, -1).map(cleanKnowledgeSegment).join("/");
  const resolved = path.posix.normalize(path.posix.join("/knowledge", currentDir, source));
  return resolved;
}

function toKnowledgeHref(href: string, fileSegments: string[]): string {
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#")) {
    return href;
  }

  if (!href.toLowerCase().endsWith(".md")) {
    return href;
  }

  const currentDir = fileSegments.slice(0, -1).map(cleanKnowledgeSegment).join("/");
  const resolved = path.posix.normalize(path.posix.join("/", currentDir, href));
  const routeSegments = resolved.split("/").filter(Boolean).map(cleanKnowledgeSegment);

  return routeFromFileSegments(routeSegments.map((segment) => `${segment}.md`));
}

function nodeContainsPath(node: NavNode, activePath: string): boolean {
  if (node.type === "file") {
    return node.routePath === activePath;
  }

  return node.children.some((child) => nodeContainsPath(child, activePath));
}

function renderTree(nodes: NavNode[], activePath: string): React.ReactNode {
  return (
    <ul className={styles.treeList}>
      {nodes.map((node) => {
        if (node.type === "directory") {
          const isOpen = nodeContainsPath(node, activePath);

          return (
            <li key={`dir-${node.label}`}>
              <details className={styles.treeDirectory} open={isOpen}>
                <summary className={styles.treeHeading}>{node.label}</summary>
                {renderTree(node.children, activePath)}
              </details>
            </li>
          );
        }

        const isActive = node.routePath === activePath;

        return (
          <li key={`file-${node.fileSegments.join("/")}`}>
            <Link className={isActive ? styles.treeLinkActive : styles.treeLink} href={node.routePath}>
              {node.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const fileSegments = await resolveMarkdownFile(slug);
  const markdownPath = path.join(KNOWLEDGE_ROOT, ...fileSegments);
  const markdown = await fs.readFile(markdownPath, "utf8");
  const tree = await buildTree(KNOWLEDGE_ROOT);
  const activePath = routeFromFileSegments(fileSegments);
  const rootIndex = tree.find(
    (node): node is MarkdownNode => node.type === "file" && node.routePath === "/knowledge",
  );
  const treeWithoutRootIndex = tree.filter(
    (node) => !(node.type === "file" && node.routePath === "/knowledge"),
  );
  const breadcrumbs = buildBreadcrumbs(fileSegments);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>Knowledge Base</h1>
        {rootIndex ? (
          <Link
            className={activePath === "/knowledge" ? styles.rootIndexActive : styles.rootIndexLink}
            href="/knowledge"
          >
            Index
          </Link>
        ) : null}
        {treeWithoutRootIndex.length > 0 ? renderTree(treeWithoutRootIndex, activePath) : <p>No markdown files found.</p>}
      </aside>

      <section className={styles.contentPane}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((c, i) => (
            <span key={c.href}>
              <Link className={styles.breadcrumbLink} href={c.href}>
                {c.label}
              </Link>
              {i < breadcrumbs.length - 1 ? " / " : null}
            </span>
          ))}
        </nav>
        <article className={styles.markdown}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              img: ({ src, alt }) => {
                if (!src) {
                  return null;
                }
                return <img src={toPublicAssetSrc(src, fileSegments)} alt={alt ?? ""} loading="lazy" />;
              },
              a: ({ href, children }) => {
                if (!href) {
                  return <>{children}</>;
                }

                const resolvedHref = toKnowledgeHref(href, fileSegments);
                const isInternal = resolvedHref.startsWith("/knowledge");

                if (isInternal) {
                  return <Link href={resolvedHref}>{children}</Link>;
                }

                return (
                  <a href={resolvedHref} target={resolvedHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {children}
                  </a>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </section>
    </main>
  );
}
