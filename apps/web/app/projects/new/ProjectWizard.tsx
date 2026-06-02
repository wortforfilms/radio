"use client";

import { useMemo, useState } from "react";
import type { AyodhyaProjectStage, AyodhyaProjectTemplate } from "@shared/ayodhya-project-templates";

type IncomingProject = {
  description: string;
  language: string;
  source: string;
  title: string;
  transliteration: string;
  type: string;
};

type Props = {
  incoming: IncomingProject;
  stages: Array<{ key: AyodhyaProjectStage; label: string; description: string }>;
  templates: AyodhyaProjectTemplate[];
};

export default function ProjectWizard({ incoming, stages, templates }: Props) {
  const incomingTemplate = templates.find((template) => template.name.toLowerCase() === incoming.type.toLowerCase());
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(incomingTemplate?.key ?? "devotional-song");
  const [selectedStage, setSelectedStage] = useState<AyodhyaProjectStage>("brief");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("name");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const selectedTemplate = templates.find((template) => template.key === selectedTemplateKey) ?? templates[0];
  const categories = useMemo(() => ["All", ...Array.from(new Set(templates.map((template) => template.category))).sort()], [templates]);
  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = templates.filter((template) => {
      const categoryMatches = category === "All" || template.category === category;
      const queryMatches = normalizedQuery
        ? [template.name, template.category, template.description, template.defaultLanguage].join(" ").toLowerCase().includes(normalizedQuery)
        : true;
      return categoryMatches && queryMatches;
    });
    return matches.sort((left, right) => {
      if (sortMode === "category") {
        return `${left.category} ${left.name}`.localeCompare(`${right.category} ${right.name}`);
      }
      if (sortMode === "stage-count") {
        return right.stages.length - left.stages.length || left.name.localeCompare(right.name);
      }
      return left.name.localeCompare(right.name);
    });
  }, [category, query, sortMode, templates]);
  const importableStages = stages.filter((stage) => selectedTemplate.stages.includes(stage.key));

  return (
    <section className="project-wizard" aria-label="Ayodhya AI project wizard">
      <div className="reference-feed-head">
        <div>
          <p className="section-kicker">Import Wizard</p>
          <h2>Import at Any Stage</h2>
        </div>
        <span>{filteredTemplates.length} / {templates.length} templates</span>
      </div>
      <p className="reference-feed-note">
        Choose a project template, then import text, files, assets, or PHKD evidence into any supported stage. This wizard is intake-only until project persistence is enabled.
      </p>

      <div className="project-wizard-controls">
        <label>
          <span>Search templates</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="devotional, film, voice, archive..." />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="stage-count">Most stages</option>
          </select>
        </label>
        <label>
          <span>Stage</span>
          <select value={selectedStage} onChange={(event) => setSelectedStage(event.target.value as AyodhyaProjectStage)}>
            {stages.map((stage) => (
              <option key={stage.key} value={stage.key}>{stage.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="project-template-grid">
        {filteredTemplates.map((template) => (
          <button
            className={template.key === selectedTemplate.key ? "is-active" : ""}
            key={template.key}
            onClick={() => {
              setSelectedTemplateKey(template.key);
              if (!template.stages.includes(selectedStage)) {
                setSelectedStage(template.stages[0]);
              }
            }}
            type="button"
          >
            <span>{template.category}</span>
            <strong>{template.name}</strong>
            <small>{template.defaultLanguage} / {template.stages.length} stages</small>
          </button>
        ))}
      </div>

      <div className="project-stage-grid">
        {stages.map((stage) => {
          const supported = selectedTemplate.stages.includes(stage.key);
          return (
            <button
              className={`${selectedStage === stage.key ? "is-active" : ""} ${supported ? "" : "is-disabled"}`}
              disabled={!supported}
              key={stage.key}
              onClick={() => setSelectedStage(stage.key)}
              type="button"
            >
              <span>{stage.label}</span>
              <small>{supported ? "Import enabled" : "Not in template"}</small>
            </button>
          );
        })}
      </div>

      <div className="project-import-summary">
        <div>
          <p className="section-kicker">Selected Template</p>
          <h3>{selectedTemplate.name}</h3>
          <p>{selectedTemplate.description}</p>
          <dl>
            <div><dt>Category</dt><dd>{selectedTemplate.category}</dd></div>
            <div><dt>Default language</dt><dd>{selectedTemplate.defaultLanguage}</dd></div>
            <div><dt>Import stages</dt><dd>{importableStages.map((stage) => stage.label).join(", ")}</dd></div>
          </dl>
        </div>
        <button onClick={() => setIsImportModalOpen(true)} type="button">Open Import Modal</button>
      </div>

      {isImportModalOpen ? (
        <div className="project-modal-layer" role="presentation">
          <div className="project-modal-backdrop" onClick={() => setIsImportModalOpen(false)} />
          <section
            aria-labelledby="project-import-modal-title"
            aria-modal="true"
            className="project-modal"
            role="dialog"
          >
            <div className="project-modal-head">
              <div>
                <p className="section-kicker">Stage Import</p>
                <h3 id="project-import-modal-title">{selectedTemplate.name}</h3>
              </div>
              <button aria-label="Close import modal" onClick={() => setIsImportModalOpen(false)} type="button">Close</button>
            </div>
            <p>
              Import into <b>{stages.find((stage) => stage.key === selectedStage)?.label}</b>. This modal remains PHKD intake-only until verified project persistence is enabled.
            </p>
            <form className="project-import-form">
              <label>
                <span>Import target</span>
                <select value={selectedStage} onChange={(event) => setSelectedStage(event.target.value as AyodhyaProjectStage)}>
                  {importableStages.map((stage) => (
                    <option key={stage.key} value={stage.key}>{stage.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Project title</span>
                <input defaultValue={incoming.title === "NULL" ? "" : incoming.title} placeholder="Project title" />
              </label>
              <label>
                <span>Source</span>
                <input defaultValue={incoming.source === "NULL" ? "" : incoming.source} placeholder="Source or import origin" />
              </label>
              <label>
                <span>Import file</span>
                <input type="file" />
              </label>
              <label className="wide">
                <span>Paste/import content</span>
                <textarea defaultValue={incoming.description === "NULL" ? "" : incoming.description} placeholder="Paste lyrics, script, storyboard notes, asset manifest, PHKD evidence, or release notes..." />
              </label>
              <button type="button">Stage Import</button>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
