import { DigitPopIn } from '../shared/DigitPopIn';
import { StaggerReveal } from '../shared/StaggerReveal';
import { useAnimateWhenVisible } from '../../hooks/use-animate-when-visible';
import { cn } from '../../lib/utils';
import { SparkleIcon } from './SparkleIcon';

/** Posición horizontal de la línea vertical del timeline (rem). */
const TIMELINE_LEFT = '4.5rem';

export type LoginChangelogUpdate = {
  version: string;
  date: string;
  title: string;
  summary: string;
  highlights?: string[];
};

function ChangelogArticle({ update }: { update: LoginChangelogUpdate }) {
  const [articleRef, animateVersion] = useAnimateWhenVisible<HTMLElement>();
  const articleId = update.version.replace(/\./g, '-');

  return (
    <article ref={articleRef} id={articleId} className="relative pb-12 last:pb-2">
      <div
        className="absolute top-1.5 size-1.5 rounded-full bg-brand-soft ring-[3px] ring-brand-ghost dark:ring-[#0C0D0F]"
        style={{ left: TIMELINE_LEFT, transform: 'translateX(-50%)' }}
        aria-hidden
      />

      <time
        dateTime={update.date}
        className="absolute top-0.5 block w-[3.75rem] text-right text-[0.6875rem] leading-4 font-medium text-muted-foreground dark:text-brand-lavender/80"
        style={{ left: 0 }}
      >
        {update.date}
      </time>

      <div
        className="absolute top-2 h-px w-2.5 bg-border/70 dark:bg-white/15"
        style={{ left: '3.85rem' }}
        aria-hidden
      />

      <div
        className="login-changelog-typography min-w-0"
        style={{ paddingLeft: `calc(${TIMELINE_LEFT} + 1.25rem)` }}
      >
        <DigitPopIn
          text={update.version}
          animate={animateVersion}
          className="mb-2 inline-flex rounded-sm bg-brand-soft/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-soft uppercase"
        />
        <StaggerReveal show={animateVersion}>
          <StaggerReveal.Line as="h2" line={1}>
            {update.title}
          </StaggerReveal.Line>
          <h3>
            <SparkleIcon />
            Funcionalidades y mejoras
          </h3>
          <StaggerReveal.Line as="p" line={2}>
            {update.summary}
          </StaggerReveal.Line>
        </StaggerReveal>
        {update.highlights && update.highlights.length > 0 ? (
          <ul>
            {update.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export function LoginChangelogTimeline({
  updates,
  className,
}: {
  updates: LoginChangelogUpdate[];
  className?: string;
}) {
  return (
    <div className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative py-2 pr-1">
          <div
            className="pointer-events-none absolute inset-y-0 w-px border-l border-dashed border-brand-soft/40 dark:border-white/15"
            style={{ left: TIMELINE_LEFT }}
            aria-hidden
          />

          {updates.map((update) => (
            <ChangelogArticle key={update.version} update={update} />
          ))}
        </div>
      </div>
    </div>
  );
}
