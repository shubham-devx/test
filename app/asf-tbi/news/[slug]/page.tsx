import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import "../../asf-tbi.css";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import { getAsfTbiContent } from "@/lib/asfTbiContent";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = (await getAsfTbiContent()).articles.find((entry) => entry.slug === slug);
  return article
    ? { title: `${article.title} | ASF-TBI`, description: article.excerpt }
    : { title: "Article not found | ASF-TBI" };
}

export default async function AsfTbiArticlePage({ params }: Props) {
  const { slug } = await params;
  const content = await getAsfTbiContent();
  const article = content.articles.find((entry) => entry.slug === slug);
  if (!article) notFound();

  return (
    <main className="tbi-article-page">
      <header className="tbi-article-header">
        <Link href="/asf-tbi" className="tbi-article-brand">
          <Image src="/logo/asf-logo.png" alt="AKGEC Skills Foundation" width={52} height={52} />
          <span><strong>ASF-TBI</strong><small>AKGEC Skills Foundation</small></span>
        </Link>
        <Link href="/asf-tbi#news" className="tbi-article-back"><ArrowLeft size={17} /> All insights</Link>
      </header>
      <article className="tbi-article">
        <span className="tbi-eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <p className="tbi-article-excerpt">{article.excerpt}</p>
        <div className="tbi-article-meta">
          <span><CalendarDays size={16} />{new Date(`${article.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span><Clock3 size={16} />{article.readTime}</span>
        </div>
        <div className="tbi-article-body">
          {article.body.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <Link href="/asf-tbi#news" className="tbi-button tbi-button-outline"><ArrowLeft size={17} /> Explore more insights</Link>
      </article>
      <footer className="tbi-article-footer">AKGEC Skills Foundation · Technology Business Incubator <ArrowUpRight size={15} /></footer>
    </main>
  );
}
