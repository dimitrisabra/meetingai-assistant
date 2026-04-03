import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-foreground',
        'prose-p:my-0 prose-p:text-inherit',
        'prose-strong:text-foreground',
        'prose-ul:my-1 prose-ol:my-1',
        'prose-li:my-0 prose-li:text-inherit',
        className,
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
