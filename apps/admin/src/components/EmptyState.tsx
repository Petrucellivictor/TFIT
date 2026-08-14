export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="state-block">
      <span className="state-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="state-title">{title}</span>
      {description ? <span className="state-description">{description}</span> : null}
    </div>
  );
}
