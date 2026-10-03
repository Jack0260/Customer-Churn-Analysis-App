import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}
