import path from 'node:path';
import {
  type FileSystem,
  getCLILogger,
  handleFatalError,
  type Logger,
} from '@ingenyus/swarm';
import ts from 'typescript';
import { getFeatureDir, realFileSystem, TemplateUtility } from '../../common';
import type { ConfigGenerator, SpecDeclaration } from './config-generator';

const SPEC_PKG = '@wasp.sh/spec';
const INDENT = '  ';

/** Group-comment header rendered above the first element of each kind. */
const KIND_COMMENT: Record<string, string> = {
  route: '// Route definitions',
  api: '// Api definitions',
  apiNamespace: '// ApiNamespace definitions',
  crud: '// Crud definitions',
  action: '// Action definitions',
  query: '// Query definitions',
  job: '// Job definitions',
};

interface SpecElement {
  kind: string;
  identity: string;
  text: string;
}

interface ParsedRefImport {
  names: Set<string>;
  from: string;
}

export class WaspConfigGenerator implements ConfigGenerator {
  protected path = path;
  protected templateUtility: TemplateUtility;

  constructor(
    protected logger: Logger = getCLILogger(),
    protected fileSystem: FileSystem = realFileSystem
  ) {
    this.templateUtility = new TemplateUtility(fileSystem);
  }

  /**
   * Gets the template path for feature config templates.
   */
  private getTemplatePath(templateName: string): string {
    return this.templateUtility.resolveTemplatePath(
      templateName,
      'feature',
      import.meta.url
    );
  }

  /**
   * Generate a TypeScript Wasp config file in a feature directory.
   * @param featurePath - The feature directory path
   */
  generate(featurePath: string): void {
    const featureDir = getFeatureDir(this.fileSystem, featurePath);
    if (!this.fileSystem.existsSync(featureDir)) {
      this.fileSystem.mkdirSync(featureDir, { recursive: true });
    }

    const templatePath = this.getTemplatePath('feature.wasp.eta');

    if (!this.fileSystem.existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);
      return;
    }

    const configFilePath = path.join(featureDir, `feature.wasp.ts`);

    if (this.fileSystem.existsSync(configFilePath)) {
      this.logger.warn(`Feature config already exists: ${configFilePath}`);
      return;
    }

    this.fileSystem.copyFileSync(templatePath, configFilePath);
    this.logger.success(`Generated feature config: ${configFilePath}`);
  }

  /**
   * Inserts or replaces a declaration in a feature's `spec` array, keeping the
   * `@wasp.sh/spec` named imports and the `with { type: "ref" }` imports in sync.
   * @param featurePath - The path to the feature
   * @param declaration - The native spec declaration to add or update
   * @returns The path to the updated feature configuration file
   */
  update(featurePath: string, declaration: SpecDeclaration): string {
    const configDir = getFeatureDir(this.fileSystem, featurePath);
    const configFilePath = path.join(configDir, `feature.wasp.ts`);

    if (!this.fileSystem.existsSync(configFilePath)) {
      const templatePath = this.getTemplatePath('feature.wasp.eta');

      if (!this.fileSystem.existsSync(templatePath)) {
        handleFatalError(`Feature config template not found: ${templatePath}`);
      }

      this.fileSystem.copyFileSync(templatePath, configFilePath);
    }

    const content = this.fileSystem.readFileSync(configFilePath, 'utf8');
    const updated = this.applyDeclaration(content, declaration);

    this.fileSystem.writeFileSync(configFilePath, updated);

    return configFilePath;
  }

  /* ---------------------------------------------------------------------- */
  /*  Spec-file editing (AST-located, text-spliced)                         */
  /* ---------------------------------------------------------------------- */

  /**
   * Returns `content` with `declaration` inserted into (or replacing a
   * same-identity element within) the `export const spec` array, coordinating
   * the three edit sites: the array element, the `with { type: "ref" }`
   * imports, and the `@wasp.sh/spec` named-import list. Idempotent.
   */
  private applyDeclaration(content: string, decl: SpecDeclaration): string {
    const sf = this.parse(content);
    const arr = this.findSpecArray(sf);

    if (!arr) {
      handleFatalError(
        'Could not find an `export const spec` array in the feature config'
      );
      return content;
    }

    // 1. Element list: drop same-identity, add the new declaration.
    const identity = this.identityOf(decl.kind, decl.call);
    const elements = this.extractElements(sf, arr).filter(
      (element) =>
        !(element.kind === decl.kind && element.identity === identity)
    );
    elements.push({ kind: decl.kind, identity, text: decl.call.trim() });
    const newArrayText = this.renderArray(elements);

    // 2. `@wasp.sh/spec` import rebuilt from the kinds actually used.
    const newSpecImport = this.renderSpecImport(newArrayText);

    // 3. Ref imports: merge the declaration's, evict re-homed identifiers, prune.
    const refs = this.extractRefImports(sf);
    for (const ri of decl.refImports ?? []) {
      let existing = refs.find((ref) => ref.from === ri.from);
      if (!existing) {
        existing = { names: new Set<string>(), from: ri.from };
        refs.push(existing);
      }
      for (const name of ri.names) {
        // An identifier can only be imported once — evict it from other paths.
        for (const other of refs) {
          if (other !== existing) other.names.delete(name);
        }
        existing.names.add(name);
      }
    }
    for (const ref of refs) {
      for (const name of [...ref.names]) {
        if (!new RegExp(`\\b${name}\\b`).test(newArrayText)) {
          ref.names.delete(name);
        }
      }
    }
    const newRefImports = this.renderRefImports(refs);

    // Apply edits bottom-to-top so offsets stay valid.
    const edits: Array<{ start: number; end: number; text: string }> = [];

    const specImportNode = sf.statements.find(
      (st): st is ts.ImportDeclaration =>
        ts.isImportDeclaration(st) &&
        ts.isStringLiteral(st.moduleSpecifier) &&
        st.moduleSpecifier.text === SPEC_PKG
    );
    if (specImportNode) {
      edits.push({
        start: specImportNode.getStart(sf),
        end: specImportNode.getEnd(),
        text: `${newSpecImport}\n${newRefImports}`,
      });
    }

    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !this.isRefImport(st, sf)) continue;
      let end = st.getEnd();
      if (content[end] === '\n') end += 1;
      edits.push({ start: st.getStart(sf), end, text: '' });
    }

    edits.push({
      start: arr.getStart(sf),
      end: arr.getEnd(),
      text: newArrayText,
    });

    edits.sort((a, b) => b.start - a.start);

    let out = content;
    for (const edit of edits) {
      out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    }

    return out.replace(/\n{3,}/g, '\n\n');
  }

  private parse(content: string): ts.SourceFile {
    return ts.createSourceFile(
      'feature.wasp.ts',
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );
  }

  /**
   * The stable identity of a spec element, keyed by constructor kind. Used to
   * detect the same declaration for replacement and to sort within a group.
   */
  private identityOf(kind: string, call: string): string {
    const sf = this.parse(`const _ = ${call};`);
    const decl = sf.statements[0];
    if (!ts.isVariableStatement(decl)) return call;
    const init = decl.declarationList.declarations[0]?.initializer;
    if (!init || !ts.isCallExpression(init)) return call;

    const args = init.arguments;
    const str = (n: ts.Node | undefined) =>
      n && ts.isStringLiteral(n) ? n.text : undefined;
    const id = (n: ts.Node | undefined) =>
      n && ts.isIdentifier(n) ? n.text : undefined;

    switch (kind) {
      case 'route':
      case 'crud':
      case 'apiNamespace':
        return str(args[0]) ?? call;
      case 'api':
        return id(args[2]) ?? call;
      default:
        return id(args[0]) ?? str(args[0]) ?? call;
    }
  }

  private findSpecArray(sf: ts.SourceFile): ts.ArrayLiteralExpression | null {
    for (const st of sf.statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const decl of st.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.name.text === 'spec' &&
          decl.initializer &&
          ts.isArrayLiteralExpression(decl.initializer)
        ) {
          return decl.initializer;
        }
      }
    }
    return null;
  }

  private extractElements(
    sf: ts.SourceFile,
    arr: ts.ArrayLiteralExpression
  ): SpecElement[] {
    return arr.elements.map((element) => {
      const kind =
        ts.isCallExpression(element) && ts.isIdentifier(element.expression)
          ? element.expression.text
          : '?';

      return {
        kind,
        identity: this.identityOf(kind, element.getText(sf)),
        text: element.getText(sf),
      };
    });
  }

  private renderArray(elements: SpecElement[]): string {
    if (elements.length === 0) return '[]';

    const sorted = [...elements].sort(
      (a, b) =>
        a.kind.localeCompare(b.kind) ||
        String(a.identity).localeCompare(String(b.identity))
    );

    const lines: string[] = [];
    let lastKind: string | null = null;

    for (const element of sorted) {
      if (element.kind !== lastKind) {
        lines.push(
          `${INDENT}${KIND_COMMENT[element.kind] ?? `// ${element.kind}`}`
        );
        lastKind = element.kind;
      }
      lines.push(`${INDENT}${element.text},`);
    }

    return `[\n${lines.join('\n')}\n]`;
  }

  /** Rebuilds the `@wasp.sh/spec` import from the constructors used in the array. */
  private renderSpecImport(arrayText: string): string {
    const kinds = new Set<string>();
    for (const kind of Object.keys(KIND_COMMENT)) {
      if (new RegExp(`\\b${kind}\\s*\\(`).test(arrayText)) kinds.add(kind);
    }
    if (/\bpage\s*\(/.test(arrayText)) kinds.add('page');

    const names = ['type Spec', ...[...kinds].sort()];

    return `import { ${names.join(', ')} } from '${SPEC_PKG}';`;
  }

  private isRefImport(node: ts.ImportDeclaration, sf: ts.SourceFile): boolean {
    const attributes = node.attributes;
    return Boolean(
      attributes?.elements.some(
        (attr) =>
          attr.name.getText(sf) === 'type' &&
          ts.isStringLiteral(attr.value) &&
          attr.value.text === 'ref'
      )
    );
  }

  private extractRefImports(sf: ts.SourceFile): ParsedRefImport[] {
    const refs: ParsedRefImport[] = [];

    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !this.isRefImport(st, sf)) continue;
      if (!ts.isStringLiteral(st.moduleSpecifier)) continue;

      const bindings = st.importClause?.namedBindings;
      const names =
        bindings && ts.isNamedImports(bindings)
          ? bindings.elements.map((element) => element.name.text)
          : [];

      refs.push({ names: new Set(names), from: st.moduleSpecifier.text });
    }

    return refs;
  }

  private renderRefImports(refs: ParsedRefImport[]): string {
    return refs
      .filter((ref) => ref.names.size > 0)
      .sort((a, b) => a.from.localeCompare(b.from))
      .map(
        (ref) =>
          `import { ${[...ref.names].sort().join(', ')} } from '${ref.from}' with { type: 'ref' };`
      )
      .join('\n');
  }
}
