import { useMemo, useState } from 'react';
import { CODE_SNIPPETS, tokenizeCode } from '../data/codeSnippets';
import { useLanguage } from '../i18n/LanguageContext';
import { SystemsSandbox, type EngineeringLabTab } from './SystemsSandbox';

interface DevelopmentSectionProps {
  activeLab: EngineeringLabTab;
  onSelectLab: (lab: EngineeringLabTab) => void;
}

export function DevelopmentSection({ activeLab, onSelectLab }: DevelopmentSectionProps) {
  const { t } = useLanguage();
  const [selectedTech, setSelectedTech] = useState<string>(t.development.techStack[0]?.name ?? 'React');
  const [copied, setCopied] = useState(false);

  const snippet = CODE_SNIPPETS[selectedTech] ?? CODE_SNIPPETS.React;
  const activeTechObj =
    t.development.techStack.find((item) => item.name === selectedTech) ?? t.development.techStack[0];

  const lines = useMemo(() => snippet.code.split('\n'), [snippet.code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <section id="development" className="band" data-theme="ink">
      <div className="wrap">
        <div className="chapter-head">
          <div className="chapter-head__left">
            <span className="chapter-tag">{t.development.index}</span>
            <h2 className="display-h2">{t.development.title}</h2>
            <p className="chapter-intro">{t.development.intro}</p>
          </div>

          <div className="chapter-metric" aria-label={`${t.development.yearsNum} ${t.development.yearsLabel}`}>
            <span className="chapter-metric__num">{t.development.yearsNum}</span>
            <span className="chapter-metric__label">{t.development.yearsLabel}</span>
          </div>
        </div>

        <SystemsSandbox activeLab={activeLab} onSelectLab={onSelectLab} />

        <div className="dev-workbench">
          <div className="dev-workbench__list">
            <div className="ledger-block__header">
              <span className="micro-label">{t.development.stackLabel}</span>
              <span className="mono-meta">{t.development.stackHint}</span>
            </div>

            <div className="tech-selector-list" role="tablist" aria-label={t.development.stackLabel}>
              {t.development.techStack.map((tech, idx) => {
                const isSelected = tech.name === selectedTech;
                return (
                  <button
                    key={tech.name}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`tech-selector-row ${isSelected ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedTech(tech.name);
                      setCopied(false);
                    }}
                  >
                    <span className="tech-selector-row__num">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="tech-selector-row__main">
                      <strong className="tech-selector-row__name">{tech.name}</strong>
                      <span className="tech-selector-row__layer">{tech.layer}</span>
                    </div>
                    <span className="tech-selector-row__cat">{tech.category}</span>
                    <span className="tech-selector-row__arrow" aria-hidden="true">
                      {isSelected ? '●' : '→'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="code-panel" role="tabpanel" aria-label={snippet.fileName}>
            <div className="code-panel__header">
              <div className="code-panel__meta">
                <span className="code-panel__file">{snippet.fileName}</span>
                <span className="code-panel__lang">{snippet.languageLabel}</span>
                <span className="code-panel__complexity">{snippet.complexityTag}</span>
              </div>
              <button type="button" className="code-panel__copy" onClick={handleCopyCode}>
                {copied ? `${t.development.copiedCode} ✓` : t.development.copyCode}
              </button>
            </div>

            <div className="code-panel__body">
              <pre className="code-pre">
                <code>
                  {lines.map((line, idx) => {
                    const tokens = tokenizeCode(line);
                    return (
                      <div key={idx} className="code-line">
                        <span className="code-line__num" aria-hidden="true">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="code-line__text">
                          {tokens.length === 0
                            ? ' '
                            : tokens.map((tok, tIdx) => (
                                <span key={tIdx} className={`tok tok--${tok.type}`}>
                                  {tok.value}
                                </span>
                              ))}
                        </span>
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>

            <div className="code-panel__footer">
              <div className="code-panel__footer-top">
                <span className="mono-meta">{t.development.codeHeaderLabel}</span>
                {activeTechObj && (
                  <a href={activeTechObj.liveAnchor} className="code-panel__proof-link">
                    <span>●</span>
                    <span>{activeTechObj.liveProof}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
              <span className="code-panel__focus">{activeTechObj?.architectureNote}</span>
            </div>
          </div>
        </div>

        <div className="dev-footer-split">
          <div className="dev-competencies">
            <span className="micro-label">{t.development.competenciesLabel}</span>
            <ol className="numbered-list">
              {t.development.competencies.map((item, idx) => (
                <li key={item} className="numbered-list__item">
                  <span className="mono-index">{String(idx + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <aside className="dev-note-col">
            <blockquote className="editorial-quote">{t.development.closingNote}</blockquote>
          </aside>
        </div>
      </div>
    </section>
  );
}
