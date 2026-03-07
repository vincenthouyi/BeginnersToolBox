import type { ToolMeta } from '../registry/tools';
import './ToolCard.css';

interface Props {
  tool: ToolMeta;
  onClick?: () => void;
}

const statusLabel: Record<ToolMeta['status'], string> = {
  planned: 'Coming soon',
  wip: 'In progress',
  ready: 'Ready',
};

export function ToolCard({ tool, onClick }: Props) {
  return (
    <button className={`tool-card tool-card--${tool.status}`} onClick={onClick} disabled={tool.status !== 'ready'}>
      <span className="tool-card__icon" aria-hidden="true">{tool.icon}</span>
      <div className="tool-card__body">
        <h3 className="tool-card__name">{tool.name}</h3>
        <p className="tool-card__desc">{tool.description}</p>
      </div>
      <span className="tool-card__badge">{statusLabel[tool.status]}</span>
    </button>
  );
}
