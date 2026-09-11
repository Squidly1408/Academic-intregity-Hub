export function AppFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-6 text-xs text-[var(--text-faint)] sm:flex-row sm:justify-between sm:px-8">
        <div>Academic Integrity Hub · free to use · no account required</div>
        <div className="flex items-center gap-5">
          <a href="#/privacy" className="hover:text-[var(--text-secondary)] hover:underline">
            Privacy Policy
          </a>
          <a href="#/terms" className="hover:text-[var(--text-secondary)] hover:underline">
            Terms &amp; Conditions
          </a>
          <a href="https://github.com/Squidly1408/Academic-intregity-Hub" target="_blank" rel="noreferrer" className="hover:text-[var(--text-secondary)] hover:underline">
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}
