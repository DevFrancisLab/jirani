interface PageHeaderProps {
  kicker?: string;
  title: string;
  support?: string;
}

export function PageHeader({ kicker, title, support }: PageHeaderProps) {
  return (
    <header className="page-header">
      {kicker ? <p className="page-header__kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      {support ? <p className="page-header__support">{support}</p> : null}
    </header>
  );
}
