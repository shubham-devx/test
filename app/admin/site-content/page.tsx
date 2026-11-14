"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import type { GlanceMetric, HomepageContent, SiteContent, SiteImageSlot, SiteSection } from "@/lib/siteContent";
import { SITE_THEMES, type SiteTheme } from "@/lib/siteThemes";

type UploadSlot = SiteImageSlot | "news-event" | "homepage-photo" | "centre-photo";

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "9px 11px",
  border: "1px solid #d5ccc4",
  borderRadius: 6,
  background: "#fff",
  color: "#281d19",
  font: "inherit",
  fontSize: 14,
} as const;

const labelStyle = { display: "grid", gap: 6, color: "#51443d", fontSize: 13, fontWeight: 700 } as const;
const panelStyle = { padding: "20px 0", borderBottom: "1px solid #e6ddd5" } as const;
const maximumUploadBytes = 3 * 1024 * 1024;
const supportedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

async function prepareImage(file: File): Promise<Blob> {
  if (!supportedImageTypes.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP or AVIF image.");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 25 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 80_000_000) {
      throw new Error("This image has too many pixels. Choose a smaller image.");
    }

    let scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");

    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not process this image.");

      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const quality = Math.max(0.74, 0.9 - attempt * 0.04);
      const image = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Your browser could not process this image."));
        }, "image/webp", quality);
      });

      if (image.size <= maximumUploadBytes) return image;
      if (attempt % 2 === 1) scale *= 0.9;
    }
  } finally {
    bitmap.close();
  }

  throw new Error("This image could not be reduced below 3 MB. Choose a smaller image.");
}

const buttonStyle = {
  minHeight: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "0 14px",
  border: "1px solid #641c1c",
  borderRadius: 6,
  background: "#641c1c",
  color: "#fff",
  font: "inherit",
  fontSize: 14,
  fontWeight: 750,
  cursor: "pointer",
} as const;

export default function AdminSiteContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [pendingImageSlots, setPendingImageSlots] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/site-content", { cache: "no-store" });
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load website content.");
        setContent(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load website content.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  function updateSection(section: SiteSection, field: string, value: string) {
    setContent((previous) => previous ? {
      ...previous,
      [section]: { ...previous[section], [field]: value },
    } : previous);
  }

  function updateCentre(index: number, patch: Partial<SiteContent["centresList"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      centresList: previous.centresList.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    } : previous);
  }

  function updateNewsEvent(id: string, patch: Partial<HomepageContent["recentNewsEvents"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      homepage: {
        ...previous.homepage,
        recentNewsEvents: previous.homepage.recentNewsEvents.map((event) =>
          event.id === id ? { ...event, ...patch } : event
        ),
      },
    } : previous);
  }

  function updateIndustryArea(index: number, patch: Partial<SiteContent["industryFocusAreas"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      industryFocusAreas: previous.industryFocusAreas.map((area, areaIndex) => areaIndex === index ? { ...area, ...patch } : area),
    } : previous);
  }

  function updateAboutFocusArea(index: number, patch: Partial<SiteContent["about"]["keyFocusAreas"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      about: {
        ...previous.about,
        keyFocusAreas: previous.about.keyFocusAreas.map((area, areaIndex) => areaIndex === index ? { ...area, ...patch } : area),
      },
    } : previous);
  }

  function updateHomepage<K extends keyof HomepageContent>(field: K, value: HomepageContent[K]) {
    setContent((previous) => previous ? {
      ...previous,
      homepage: { ...previous.homepage, [field]: value },
    } : previous);
  }

  function updateHomepageContact<K extends keyof HomepageContent["contact"]>(
    field: K,
    value: HomepageContent["contact"][K],
  ) {
    setContent((previous) => previous ? {
      ...previous,
      homepage: {
        ...previous.homepage,
        contact: { ...previous.homepage.contact, [field]: value },
      },
    } : previous);
  }

  function updateHomepageFooter<K extends keyof HomepageContent["footer"]>(
    field: K,
    value: HomepageContent["footer"][K],
  ) {
    setContent((previous) => previous ? {
      ...previous,
      homepage: {
        ...previous.homepage,
        footer: { ...previous.homepage.footer, [field]: value },
      },
    } : previous);
  }

  function updateGlanceMetric(index: number, patch: Partial<GlanceMetric>) {
    setContent((previous) => previous ? {
      ...previous,
      homepage: {
        ...previous.homepage,
        glanceMetrics: previous.homepage.glanceMetrics.map((metric, metricIndex) =>
          metricIndex === index ? { ...metric, ...patch } : metric
        ),
      },
    } : previous);
  }

  async function uploadImage(
    slot: UploadSlot,
    file: File,
    onUploaded?: (url: string) => void,
    trackingKey: string = slot,
  ) {
    setUploadingImage(trackingKey);
    setError("");
    setSuccess("");

    try {
      const image = await prepareImage(file);
      const formData = new FormData();
      formData.set("slot", slot);
      formData.set("image", image, `${slot}.webp`);

      const response = await fetch("/api/admin/site-content/image", {
        method: "POST",
        body: formData,
      });
      const data: { error?: string; url?: string } = await response.json();
      const imageUrl = data.url;
      if (!response.ok || typeof imageUrl !== "string") {
        throw new Error(data.error || "Could not upload the image.");
      }

      if (onUploaded) {
        onUploaded(imageUrl);
      } else if (slot === "hero" || slot === "about" || slot === "industry") {
        setContent((previous) => previous ? {
          ...previous,
          images: { ...previous.images, [slot]: imageUrl },
        } : previous);
      } else {
        throw new Error("The uploaded image has no destination.");
      }
      setPendingImageSlots((previous) => previous.includes(trackingKey) ? previous : [...previous, trackingKey]);
      setSuccess(slot === "news-event"
        ? "Event image uploaded. Select Save and publish to put it live."
        : "Image uploaded. Select Save and publish to put it live."
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload the image.");
    } finally {
      setUploadingImage(null);
    }
  }

  async function save() {
    if (!content || uploadingImage) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save website content.");
      setContent(data.content);
      setPendingImageSlots([]);
      setSuccess("Website content saved and published.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save website content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main style={styles.page}><p>Loading website content...</p></main>;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Website Content</h1>
          <p style={styles.subtitle}>Manage homepage images, highlights, news and Centre of Excellence content. Save and publish to make your edits live.</p>
        </div>
        <Link href="/admin" style={styles.backLink}>Dashboard</Link>
      </header>

      <nav aria-label="Website content sections" style={styles.quickLinks}>
        <a href="#website-images" style={styles.quickLink}>Images &amp; highlights</a>
        <a href="#homepage-content" style={styles.quickLink}>Homepage text</a>
        <a href="#recent-news" style={styles.quickLink}>News &amp; events</a>
        <a href="#about-content" style={styles.quickLink}>About &amp; training</a>
        <a href="#centres-content" style={styles.quickLink}>COE / Training</a>
      </nav>

      {error && <p role="alert" style={styles.error}>{error}</p>}
      {success && <p role="status" style={styles.success}>{success}</p>}
      {!content && !error && <p>Website content is unavailable.</p>}

      {content && <>
        <section id="website-images" style={styles.imageManager}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.sectionTitle}>Images &amp; Highlights</h2>
              <p style={styles.themeIntro}>Each image has its own upload control. Images are grouped by where they appear so they are easy to find and update.</p>
            </div>
            <span style={styles.imageCount}>{content.images.heroSlides.length + content.homepage.glanceMetrics.length + content.about.keyFocusAreas.length + content.homepage.recentNewsEvents.length + content.centresList.length + 2} images</span>
          </div>

          <details style={styles.imageGroup} open>
            <summary style={styles.imageGroupTitle}>
              <span>Homepage hero slides</span>
              <span style={styles.imageGroupCount}>{content.images.heroSlides.length}</span>
            </summary>
            <div style={styles.imageGrid}>
              {content.images.heroSlides.map((image, index) => {
                const trackingKey = `hero-slide-${index}`;
                return (
                  <ImageUploadField
                    key={trackingKey}
                    title={`Hero slide ${index + 1}`}
                    trackingKey={trackingKey}
                    src={image}
                    uploading={uploadingImage === trackingKey}
                    disabled={uploadingImage !== null}
                    pendingSave={pendingImageSlots.includes(trackingKey)}
                    onSelect={(file) => {
                      void uploadImage("homepage-photo", file, (url) => {
                        setContent((previous) => previous ? {
                          ...previous,
                          images: {
                            ...previous.images,
                            hero: index === 1 ? url : previous.images.hero,
                            heroSlides: previous.images.heroSlides.map((slide, slideIndex) =>
                              slideIndex === index ? url : slide
                            ),
                          },
                        } : previous);
                      }, trackingKey);
                    }}
                  />
                );
              })}
            </div>
          </details>

          <details style={styles.imageGroup}>
            <summary style={styles.imageGroupTitle}>
              <span>At a Glance highlight cards</span>
              <span style={styles.imageGroupCount}>{content.homepage.glanceMetrics.length}</span>
            </summary>
            <div style={styles.imageGrid}>
              {content.homepage.glanceMetrics.map((metric, index) => {
                const trackingKey = `glance-${index}`;
                return (
                  <ImageUploadField
                    key={trackingKey}
                    title={`Highlight ${String(index + 1).padStart(2, "0")} · ${metric.eyebrow}`}
                    trackingKey={trackingKey}
                    src={metric.image}
                    uploading={uploadingImage === trackingKey}
                    disabled={uploadingImage !== null}
                    pendingSave={pendingImageSlots.includes(trackingKey)}
                    onSelect={(file) => {
                      void uploadImage("homepage-photo", file, (url) => updateGlanceMetric(index, { image: url }), trackingKey);
                    }}
                  />
                );
              })}
            </div>
          </details>

          <details style={styles.imageGroup}>
            <summary style={styles.imageGroupTitle}>
              <span>About Foundation</span>
              <span style={styles.imageGroupCount}>{content.about.keyFocusAreas.length + 1}</span>
            </summary>
            <div style={styles.imageGrid}>
              <ImageUploadField
                title="About Foundation main photo"
                trackingKey="about-main"
                src={content.images.about}
                uploading={uploadingImage === "about-main"}
                disabled={uploadingImage !== null}
                pendingSave={pendingImageSlots.includes("about-main")}
                onSelect={(file) => {
                  void uploadImage("homepage-photo", file, (url) => setContent((previous) => previous ? {
                    ...previous,
                    images: { ...previous.images, about: url },
                  } : previous), "about-main");
                }}
              />
              {content.about.keyFocusAreas.map((area, index) => {
                const trackingKey = `about-focus-${index}`;
                return (
                  <ImageUploadField
                    key={trackingKey}
                    title={`About focus ${String(index + 1).padStart(2, "0")} · ${area.title}`}
                    trackingKey={trackingKey}
                    src={area.image}
                    uploading={uploadingImage === trackingKey}
                    disabled={uploadingImage !== null}
                    pendingSave={pendingImageSlots.includes(trackingKey)}
                    onSelect={(file) => {
                      void uploadImage("homepage-photo", file, (url) => updateAboutFocusArea(index, { image: url }), trackingKey);
                    }}
                  />
                );
              })}
            </div>
          </details>

          <details style={styles.imageGroup}>
            <summary style={styles.imageGroupTitle}>
              <span>Industry engagement</span>
              <span style={styles.imageGroupCount}>1</span>
            </summary>
            <div style={styles.imageGrid}>
              <ImageUploadField
                title="Industry engagement photo"
                trackingKey="industry-main"
                src={content.images.industry}
                uploading={uploadingImage === "industry-main"}
                disabled={uploadingImage !== null}
                pendingSave={pendingImageSlots.includes("industry-main")}
                onSelect={(file) => {
                  void uploadImage("homepage-photo", file, (url) => setContent((previous) => previous ? {
                    ...previous,
                    images: { ...previous.images, industry: url },
                  } : previous), "industry-main");
                }}
              />
            </div>
          </details>

          <details style={styles.imageGroup}>
            <summary style={styles.imageGroupTitle}>
              <span>News &amp; event photos</span>
              <span style={styles.imageGroupCount}>{content.homepage.recentNewsEvents.length}</span>
            </summary>
            {content.homepage.recentNewsEvents.length === 0 ? (
              <p style={styles.imageUploadHint}>Add a story under <a href="#recent-news">News &amp; Events</a>, then choose its image here.</p>
            ) : (
              <div style={styles.imageGrid}>
                {content.homepage.recentNewsEvents.map((event, index) => {
                  const trackingKey = `news-event-${event.id}`;
                  return (
                    <ImageUploadField
                      key={event.id}
                      title={`News ${String(index + 1).padStart(2, "0")} · ${event.title || "Untitled story"}`}
                      trackingKey={trackingKey}
                      src={event.image}
                      uploading={uploadingImage === trackingKey}
                      disabled={uploadingImage !== null}
                      pendingSave={pendingImageSlots.includes(trackingKey)}
                      onSelect={(file) => {
                        void uploadImage("news-event", file, (url) => updateNewsEvent(event.id, { image: url }), trackingKey);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </details>

          <details style={styles.imageGroup}>
            <summary style={styles.imageGroupTitle}>
              <span>COE / Training centre photos</span>
              <span style={styles.imageGroupCount}>{content.centresList.length}</span>
            </summary>
            <div style={styles.imageGrid}>
              {content.centresList.map((centre, index) => {
                const trackingKey = `centre-${index}`;
                return (
                  <ImageUploadField
                    key={centre.name}
                    title={centre.name}
                    trackingKey={trackingKey}
                    src={centre.image}
                    uploading={uploadingImage === trackingKey}
                    disabled={uploadingImage !== null}
                    pendingSave={pendingImageSlots.includes(trackingKey)}
                    onSelect={(file) => {
                      void uploadImage("centre-photo", file, (url) => updateCentre(index, { image: url }), trackingKey);
                    }}
                  />
                );
              })}
            </div>
          </details>
        </section>

        <section style={panelStyle}>
          <h2 style={styles.sectionTitle}>Website Colours</h2>
          <p style={styles.themeIntro}>Choose a professional palette for buttons, headings and accent details across the site.</p>
          <div style={styles.themeGrid}>
            {(Object.keys(SITE_THEMES) as SiteTheme[]).map((theme) => {
              const palette = SITE_THEMES[theme];
              const selected = content.theme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setContent({ ...content, theme })}
                  style={{ ...styles.themeOption, borderColor: selected ? palette.primary : "#e1d8d0" }}
                >
                  <span style={styles.themeSwatches} aria-hidden="true">
                    <span style={{ ...styles.themeSwatch, background: palette.primary }} />
                    <span style={{ ...styles.themeSwatch, background: palette.accent }} />
                    <span style={{ ...styles.themeSwatch, background: palette.dark }} />
                  </span>
                  <strong>{palette.label}</strong>
                  <span style={styles.themeDescription}>{palette.description}</span>
                  <small style={{ ...styles.themeStatus, color: selected ? palette.primary : "#695c53" }}>
                    {selected ? "Selected" : "Select palette"}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={styles.sectionTitle}>Navigation</h2>
          <div style={styles.grid}>
            {content.navigation.map((item, index) => (
              <label key={item.section} style={labelStyle}>
                {item.section === "about" ? "About" : item.section === "centres" ? "Centres of Excellence" : item.section[0].toUpperCase() + item.section.slice(1)}
                <input
                  style={inputStyle}
                  value={item.label}
                  onChange={(event) => setContent((previous) => previous ? {
                    ...previous,
                    navigation: previous.navigation.map((entry, entryIndex) => entryIndex === index ? { ...entry, label: event.target.value } : entry),
                  } : previous)}
                />
              </label>
            ))}
          </div>
        </section>

        <section id="homepage-content" style={panelStyle}>
          <h2 style={styles.sectionTitle}>Homepage Hero &amp; At a Glance</h2>
          <p style={styles.themeIntro}>Change the visible homepage wording, labels, highlight tags and animated metrics. Enter one highlight tag per line.</p>
          <div style={styles.grid}>
            <label style={labelStyle}>Top information strip<textarea style={inputStyle} rows={2} value={content.homepage.topStripMessage} onChange={(event) => updateHomepage("topStripMessage", event.target.value)} /></label>
            <label style={labelStyle}>Top strip contact link label<input style={inputStyle} value={content.homepage.topStripContactLabel} onChange={(event) => updateHomepage("topStripContactLabel", event.target.value)} /></label>
            <label style={labelStyle}>Hero heading<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={content.homepage.heroHeading} onChange={(event) => updateHomepage("heroHeading", event.target.value)} /></label>
            <label style={labelStyle}>Hero description<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={content.homepage.heroDescription} onChange={(event) => updateHomepage("heroDescription", event.target.value)} /></label>
            <label style={labelStyle}>Hero registration button<input style={inputStyle} value={content.homepage.heroRegisterLabel} onChange={(event) => updateHomepage("heroRegisterLabel", event.target.value)} /></label>
            <label style={labelStyle}>Hero footer tags<textarea style={inputStyle} rows={4} value={content.homepage.heroFooterTags.join("\n")} onChange={(event) => updateHomepage("heroFooterTags", event.target.value.split(/\r?\n/).map((tag) => tag.trim()).filter(Boolean))} /></label>
            <label style={labelStyle}>At a Glance eyebrow<input style={inputStyle} value={content.homepage.glanceLabel} onChange={(event) => updateHomepage("glanceLabel", event.target.value)} /></label>
            <label style={labelStyle}>At a Glance heading<input style={inputStyle} value={content.homepage.glanceHeading} onChange={(event) => updateHomepage("glanceHeading", event.target.value)} /></label>
          </div>
          <div style={{ ...styles.sectionHead, marginTop: 22 }}>
            <h3 style={styles.sectionTitle}>At a Glance Cards</h3>
            <button type="button" style={styles.secondaryButton} onClick={() => updateHomepage("glanceMetrics", [...content.homepage.glanceMetrics, { icon: "robotics", eyebrow: "NEW HIGHLIGHT", target: 0, suffix: "", description: "", image: "/images/centres/kuka-training.jpg" }])}>
              <Plus size={16} /> Add highlight
            </button>
          </div>
          <div style={styles.items}>
            {content.homepage.glanceMetrics.map((metric, index) => (
              <article key={index} style={styles.item}>
                <div style={styles.itemHead}>
                  <strong>Highlight {String(index + 1).padStart(2, "0")}</strong>
                  <button
                    type="button"
                    aria-label={`Remove highlight ${index + 1}`}
                    style={styles.deleteButton}
                    disabled={uploadingImage !== null}
                    onClick={() => updateHomepage("glanceMetrics", content.homepage.glanceMetrics.filter((_, metricIndex) => metricIndex !== index))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={styles.grid}>
                  <label style={labelStyle}>Icon<select style={inputStyle} value={metric.icon} onChange={(event) => updateGlanceMetric(index, { icon: event.target.value as GlanceMetric["icon"] })}><option value="robotics">Robotics</option><option value="industry">Industry</option><option value="welding">Welding</option><option value="workshops">Workshops</option></select></label>
                  <label style={labelStyle}>Card label<input style={inputStyle} value={metric.eyebrow} onChange={(event) => updateGlanceMetric(index, { eyebrow: event.target.value })} /></label>
                  <label style={labelStyle}>Animated number<input style={inputStyle} type="number" min="0" value={metric.target} onChange={(event) => updateGlanceMetric(index, { target: Number(event.target.value) || 0 })} /></label>
                  <label style={labelStyle}>Number suffix<input style={inputStyle} value={metric.suffix} onChange={(event) => updateGlanceMetric(index, { suffix: event.target.value })} /></label>
                  <label style={labelStyle}>Card description<textarea style={inputStyle} rows={2} value={metric.description} onChange={(event) => updateGlanceMetric(index, { description: event.target.value })} /></label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="recent-news" style={panelStyle}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.sectionTitle}>Recent News &amp; Events</h2>
              <p style={styles.themeIntro}>
                Add each story&apos;s title and description here, then update its photo separately in
                Images &amp; Highlights. Complete entries appear in the homepage carousel.
              </p>
            </div>
            <button
              type="button"
              style={styles.secondaryButton}
              disabled={uploadingImage !== null}
              onClick={() => updateHomepage("recentNewsEvents", [
                { id: crypto.randomUUID(), title: "", date: "", description: "", image: "" },
                ...content.homepage.recentNewsEvents,
              ])}
            >
              <Plus size={16} /> Add news or event
            </button>
          </div>
          {content.homepage.recentNewsEvents.length === 0 && (
            <p style={styles.imageUploadHint}>No news or events added yet.</p>
          )}
          <div style={styles.items}>
            {content.homepage.recentNewsEvents.map((event, index) => (
              <article key={event.id} style={styles.item}>
                <div style={styles.itemHead}>
                  <strong>News or event {String(index + 1).padStart(2, "0")}</strong>
                  <button
                    type="button"
                    aria-label={`Remove news or event ${index + 1}`}
                    style={styles.deleteButton}
                    disabled={uploadingImage !== null}
                    onClick={() => updateHomepage(
                      "recentNewsEvents",
                      content.homepage.recentNewsEvents.filter((item) => item.id !== event.id),
                    )}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={styles.grid}>
                  <label style={labelStyle}>
                    Title
                    <input
                      style={inputStyle}
                      maxLength={180}
                      value={event.title}
                      onChange={(change) => updateNewsEvent(event.id, { title: change.target.value })}
                    />
                  </label>
                  <label style={labelStyle}>
                    Date or short label (optional)
                    <input
                      style={inputStyle}
                      maxLength={80}
                      placeholder="e.g. 14 November 2026"
                      value={event.date}
                      onChange={(change) => updateNewsEvent(event.id, { date: change.target.value })}
                    />
                  </label>
                  <label style={labelStyle}>
                    Description
                    <textarea
                      style={{ ...inputStyle, minHeight: 88 }}
                      rows={3}
                      maxLength={1200}
                      value={event.description}
                      onChange={(change) => updateNewsEvent(event.id, { description: change.target.value })}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="homepage-details" style={panelStyle}>
          <h2 style={styles.sectionTitle}>Homepage Details, Contact &amp; Footer</h2>
          <p style={styles.themeIntro}>Edit contact information, button labels, footer wording and social links. Enter one address line or phone number per line.</p>
          <div style={styles.grid}>
            <label style={labelStyle}>About image caption<input style={inputStyle} value={content.homepage.aboutImageCaption} onChange={(event) => updateHomepage("aboutImageCaption", event.target.value)} /></label>
            <label style={labelStyle}>About link label<input style={inputStyle} value={content.homepage.aboutLearnMoreLabel} onChange={(event) => updateHomepage("aboutLearnMoreLabel", event.target.value)} /></label>
            <label style={labelStyle}>Industry enquiry button<input style={inputStyle} value={content.homepage.industryContactLabel} onChange={(event) => updateHomepage("industryContactLabel", event.target.value)} /></label>
            <label style={labelStyle}>Contact section label<input style={inputStyle} value={content.homepage.contact.label} onChange={(event) => updateHomepageContact("label", event.target.value)} /></label>
            <label style={labelStyle}>Contact heading<input style={inputStyle} value={content.homepage.contact.heading} onChange={(event) => updateHomepageContact("heading", event.target.value)} /></label>
            <label style={labelStyle}>Contact heading accent<input style={inputStyle} value={content.homepage.contact.accent} onChange={(event) => updateHomepageContact("accent", event.target.value)} /></label>
            <label style={labelStyle}>Address<textarea style={{ ...inputStyle, minHeight: 100 }} rows={4} value={content.homepage.contact.addressLines.join("\n")} onChange={(event) => updateHomepageContact("addressLines", event.target.value.split(/\r?\n/))} /></label>
            <label style={labelStyle}>Phone numbers<textarea style={{ ...inputStyle, minHeight: 100 }} rows={4} value={content.homepage.contact.phoneNumbers.join("\n")} onChange={(event) => updateHomepageContact("phoneNumbers", event.target.value.split(/\r?\n/).map((phone) => phone.trim()).filter(Boolean))} /></label>
            <label style={labelStyle}>Contact email<input style={inputStyle} type="email" value={content.homepage.contact.email} onChange={(event) => updateHomepageContact("email", event.target.value)} /></label>
            <label style={labelStyle}>Admin WhatsApp number (country code, digits only)<input style={inputStyle} inputMode="numeric" value={content.homepage.contact.whatsAppNumber} onChange={(event) => updateHomepageContact("whatsAppNumber", event.target.value.replace(/\D/g, ""))} /></label>
            <label style={labelStyle}>Registration button<input style={inputStyle} value={content.homepage.contact.registrationLabel} onChange={(event) => updateHomepageContact("registrationLabel", event.target.value)} /></label>
            <label style={labelStyle}>Admin contact button<input style={inputStyle} value={content.homepage.contact.adminContactLabel} onChange={(event) => updateHomepageContact("adminContactLabel", event.target.value)} /></label>
            <label style={labelStyle}>Instagram URL<input style={inputStyle} type="url" value={content.homepage.socialLinks.instagram} onChange={(event) => setContent((previous) => previous ? { ...previous, homepage: { ...previous.homepage, socialLinks: { ...previous.homepage.socialLinks, instagram: event.target.value } } } : previous)} /></label>
            <label style={labelStyle}>LinkedIn URL<input style={inputStyle} type="url" value={content.homepage.socialLinks.linkedin} onChange={(event) => setContent((previous) => previous ? { ...previous, homepage: { ...previous.homepage, socialLinks: { ...previous.homepage.socialLinks, linkedin: event.target.value } } } : previous)} /></label>
            <label style={labelStyle}>Footer brand description<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={content.homepage.footer.description} onChange={(event) => updateHomepageFooter("description", event.target.value)} /></label>
            <label style={labelStyle}>Footer legal notice<textarea style={{ ...inputStyle, minHeight: 72 }} rows={2} value={content.homepage.footer.legalNotice} onChange={(event) => updateHomepageFooter("legalNotice", event.target.value)} /></label>
            {Object.entries(content.homepage.footer)
              .filter(([field]) => !["description", "legalNotice"].includes(field))
              .map(([field, value]) => (
                <label key={field} style={labelStyle}>{field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
                  <input style={inputStyle} value={value} onChange={(event) => updateHomepageFooter(field as keyof HomepageContent["footer"], event.target.value)} />
                </label>
              ))}
          </div>
        </section>

        {(["about", "training", "centres", "industry"] as SiteSection[]).map((section) => {
          const fields = content[section];
          return (
            <section id={`${section}-content`} key={section} style={panelStyle}>
              <h2 style={styles.sectionTitle}>{section === "about" ? "About Foundation" : section === "centres" ? "Centres of Excellence" : section[0].toUpperCase() + section.slice(1)}</h2>
              <div style={styles.grid}>
                <label style={labelStyle}>Eyebrow / label<input style={inputStyle} value={fields.label} onChange={(event) => updateSection(section, "label", event.target.value)} /></label>
                <label style={labelStyle}>Section heading<textarea style={inputStyle} rows={2} value={fields.heading} onChange={(event) => updateSection(section, "heading", event.target.value)} /></label>
                {section === "about" && <label style={labelStyle}>Introduction<textarea style={{ ...inputStyle, minHeight: 96 }} rows={4} value={content.about.lead} onChange={(event) => updateSection("about", "lead", event.target.value)} /></label>}
                <label style={labelStyle}>Description<textarea style={{ ...inputStyle, minHeight: 96 }} rows={4} value={fields.description} onChange={(event) => updateSection(section, "description", event.target.value)} /></label>
                {section === "about" && (
                  <>
                    <div style={{ ...styles.grid, gridColumn: "1 / -1" }}>
                      <div style={styles.sectionHead}>
                        <h3 style={styles.sectionTitle}>About Key Focus Areas</h3>
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={() => setContent((previous) => previous ? {
                            ...previous,
                            about: {
                              ...previous.about,
                              keyFocusAreas: [...previous.about.keyFocusAreas, {
                                title: "New focus area",
                                description: "",
                                image: "/images/centres/kuka-training.jpg",
                              }],
                            },
                          } : previous)}
                        >
                          <Plus size={16} /> Add focus area
                        </button>
                      </div>
                      {content.about.keyFocusAreas.map((area, index) => (
                        <article key={index} style={styles.item}>
                          <div style={styles.itemHead}>
                            <strong>Focus area {String(index + 1).padStart(2, "0")}</strong>
                            <button
                              type="button"
                              aria-label={`Remove ${area.title}`}
                              style={styles.deleteButton}
                              disabled={uploadingImage !== null}
                              onClick={() => setContent((previous) => previous ? {
                                ...previous,
                                about: {
                                  ...previous.about,
                                  keyFocusAreas: previous.about.keyFocusAreas.filter((_, areaIndex) => areaIndex !== index),
                                },
                              } : previous)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div style={styles.grid}>
                            <label style={labelStyle}>Title<input style={inputStyle} value={area.title} onChange={(event) => updateAboutFocusArea(index, { title: event.target.value })} /></label>
                            <label style={labelStyle}>Description<textarea style={{ ...inputStyle, minHeight: 72 }} rows={2} value={area.description} onChange={(event) => updateAboutFocusArea(index, { description: event.target.value })} /></label>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}

        <section id="centres-content" style={panelStyle}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Industry Focus Cards</h2>
            <button type="button" style={styles.secondaryButton} onClick={() => setContent({ ...content, industryFocusAreas: [...content.industryFocusAreas, { icon: "automation", name: "New focus area", details: "Add the sector details shown when visitors open this card." }] })}><Plus size={16} /> Add focus area</button>
          </div>
          <div style={styles.items}>
            {content.industryFocusAreas.map((area, index) => (
              <article key={index} style={styles.item}>
                <div style={styles.itemHead}>
                  <strong>Focus area {String(index + 1).padStart(2, "0")}</strong>
                  <button type="button" aria-label={`Remove ${area.name}`} style={styles.deleteButton} onClick={() => setContent({ ...content, industryFocusAreas: content.industryFocusAreas.filter((_, areaIndex) => areaIndex !== index) })}><Trash2 size={16} /></button>
                </div>
                <div style={styles.grid}>
                  <label style={labelStyle}>Title<input style={inputStyle} value={area.name} onChange={(event) => updateIndustryArea(index, { name: event.target.value })} /></label>
                  <label style={labelStyle}>Icon<select style={inputStyle} value={area.icon} onChange={(event) => updateIndustryArea(index, { icon: event.target.value as "automation" | "aerospace" | "healthcare" })}><option value="automation">Automation</option><option value="aerospace">Aerospace & Defence</option><option value="healthcare">Healthcare</option></select></label>
                  <label style={labelStyle}>Details shown when opened<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={area.details} onChange={(event) => updateIndustryArea(index, { details: event.target.value })} /></label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.sectionTitle}>COE / Training Centres ({content.centresList.length})</h2>
              <p style={styles.themeIntro}>Edit centre descriptions, courses, fees-related information, facilities, certifications and recognition. Course prices and durations are managed in Course Catalog.</p>
            </div>
            <button type="button" style={styles.secondaryButton} onClick={() => setContent({ ...content, centresList: [...content.centresList, { name: "New centre", image: "/images/hero/asf-main.jpg", partner: "", focus: "", description: "", itemsTitle: "Programmes and facilities", items: [], recognition: "", details: [] }] })}><Plus size={16} /> Add centre</button>
          </div>
          <div style={{ marginBottom: 18 }}>
            <Link href="/admin/courses" style={styles.backLink}>Manage course prices and durations</Link>
          </div>
          <div style={styles.items}>
            {content.centresList.map((centre, index) => (
              <details key={index} style={styles.item}>
                <summary style={styles.summary}><span>{String(index + 1).padStart(2, "0")} · {centre.name}</span><button type="button" aria-label={`Remove ${centre.name}`} style={styles.deleteButton} disabled={uploadingImage !== null} onClick={(event) => { event.preventDefault(); if (confirm(`Remove ${centre.name}?`)) setContent({ ...content, centresList: content.centresList.filter((_, itemIndex) => itemIndex !== index) }); }}><Trash2 size={16} /></button></summary>
                <div style={styles.grid}>
                  <label style={labelStyle}>Centre name<input style={inputStyle} value={centre.name} onChange={(event) => updateCentre(index, { name: event.target.value })} /></label>
                  <label style={labelStyle}>Industry partner<input style={inputStyle} value={centre.partner} onChange={(event) => updateCentre(index, { partner: event.target.value })} /></label>
                  <label style={labelStyle}>Area of focus<input style={inputStyle} value={centre.focus} onChange={(event) => updateCentre(index, { focus: event.target.value })} /></label>
                  <label style={labelStyle}>Description<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={centre.description} onChange={(event) => updateCentre(index, { description: event.target.value })} /></label>
                  <label style={labelStyle}>List heading<input style={inputStyle} value={centre.itemsTitle} onChange={(event) => updateCentre(index, { itemsTitle: event.target.value })} /></label>
                  <label style={labelStyle}>Programmes or facilities, one per line<textarea style={{ ...inputStyle, minHeight: 120 }} rows={5} value={centre.items.join("\n")} onChange={(event) => updateCentre(index, { items: event.target.value.split("\n") })} /></label>
                  <label style={labelStyle}>Centre overview, one paragraph per line<textarea style={{ ...inputStyle, minHeight: 120 }} rows={5} value={(centre.details ?? []).join("\n")} onChange={(event) => updateCentre(index, { details: event.target.value.split("\n") })} /></label>
                  <label style={labelStyle}>Certifications and recognition<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={centre.recognition} onChange={(event) => updateCentre(index, { recognition: event.target.value })} /></label>
                </div>
              </details>
            ))}
          </div>
        </section>

        <div style={styles.saveBar}>
          <span>Changes go live on the website after saving.</span>
          <button type="button" style={buttonStyle} onClick={save} disabled={saving || uploadingImage !== null}><Save size={16} /> {saving ? "Saving..." : "Save and publish"}</button>
        </div>
      </>}
    </main>
  );
}

function ImageUploadField({
  title,
  trackingKey,
  src,
  uploading,
  disabled,
  pendingSave,
  onSelect,
}: {
  title: string;
  trackingKey: string;
  src: string;
  uploading: boolean;
  disabled: boolean;
  pendingSave: boolean;
  onSelect: (file: File) => void;
}) {
  return (
    <div style={styles.imageUpload} data-image-key={trackingKey}>
      <span style={styles.imageUploadLabel}>{title}</span>
      <div style={styles.imageUploadRow}>
        {src ? (
          <Image
            src={src}
            alt={`Current image for ${title}`}
            width={600}
            height={280}
            unoptimized
            style={styles.imagePreview}
          />
        ) : (
          <div style={styles.imagePlaceholder}>No image uploaded yet</div>
        )}
        <label style={{ ...styles.secondaryButton, ...(disabled ? styles.disabledUpload : {}) }}>
          <ImagePlus size={16} />
          {uploading ? "Uploading..." : "Choose image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={disabled}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) onSelect(file);
            }}
            style={styles.hiddenFileInput}
          />
        </label>
      </div>
      <span style={styles.imageUploadHint}>
        Select a JPEG, PNG, WebP or AVIF. Images are optimized for the website before uploading.
        {pendingSave ? " Save and publish to apply this image." : ""}
      </span>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 1120, margin: "0 auto", padding: "28px 24px 100px", color: "#281d19", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, paddingBottom: 20, borderBottom: "1px solid #e6ddd5" },
  title: { margin: 0, fontSize: 30, lineHeight: 1.2 },
  subtitle: { margin: "8px 0 0", color: "#695c53", fontSize: 14 },
  quickLinks: { display: "flex", flexWrap: "wrap", gap: 8, padding: "16px 0", borderBottom: "1px solid #e6ddd5" },
  quickLink: { padding: "8px 11px", border: "1px solid #e1d8d0", borderRadius: 999, color: "#641c1c", background: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" },
  backLink: { color: "#641c1c", fontSize: 14, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 },
  sectionTitle: { margin: 0, fontSize: 19, lineHeight: 1.3 },
  themeIntro: { margin: "7px 0 0", color: "#695c53", fontSize: 14 },
  imageManager: { ...panelStyle, padding: "22px 0" },
  imageCount: { flex: "0 0 auto", padding: "6px 10px", borderRadius: 999, background: "#f5f0ec", color: "#641c1c", fontSize: 12, fontWeight: 800 },
  imageGroup: { marginTop: 14, border: "1px solid #e1d8d0", borderRadius: 8, background: "#fff" },
  imageGroupTitle: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 15px", color: "#35241d", cursor: "pointer", fontSize: 14, fontWeight: 750, listStylePosition: "inside" },
  imageGroupCount: { minWidth: 26, padding: "3px 8px", borderRadius: 999, background: "#f5f0ec", color: "#641c1c", textAlign: "center", fontSize: 12, fontWeight: 800 },
  imageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 12, padding: "0 12px 12px" },
  themeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 12, marginTop: 16 },
  themeOption: { minHeight: 132, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 14, border: "2px solid", borderRadius: 7, background: "#fff", color: "#281d19", font: "inherit", textAlign: "left", cursor: "pointer" },
  themeSwatches: { display: "flex", gap: 6, marginBottom: 4 },
  themeSwatch: { width: 26, height: 26, display: "block", borderRadius: 5 },
  themeDescription: { color: "#695c53", fontSize: 12 },
  themeStatus: { marginTop: "auto", fontSize: 12, fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 14, marginTop: 16 },
  imageUpload: { display: "grid", alignContent: "start", gap: 9, minWidth: 0, padding: 11, border: "1px solid #e6ddd5", borderRadius: 7, background: "#fffdfa" },
  imageUploadLabel: { minHeight: 34, color: "#51443d", fontSize: 13, fontWeight: 700, lineHeight: 1.35 },
  imageUploadRow: { display: "grid", alignContent: "start", gap: 9 },
  imagePreview: { width: "100%", height: 128, objectFit: "cover", border: "1px solid #e1d8d0", borderRadius: 6, background: "#f5f0ec" },
  imagePlaceholder: { width: "100%", height: 128, display: "grid", placeItems: "center", border: "1px dashed #bcae9f", borderRadius: 6, background: "#f5f0ec", color: "#695c53", fontSize: 13 },
  imageUploadHint: { color: "#695c53", fontSize: 12, fontWeight: 400 },
  hiddenFileInput: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap" },
  disabledUpload: { opacity: 0.6, cursor: "wait" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 },
  secondaryButton: { minHeight: 38, display: "inline-flex", alignItems: "center", gap: 7, padding: "0 12px", border: "1px solid #bcae9f", borderRadius: 6, background: "#fff", color: "#641c1c", font: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  items: { display: "grid", gap: 12, marginTop: 14 },
  item: { padding: 14, border: "1px solid #e1d8d0", borderRadius: 6, background: "#fff" },
  itemHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, color: "#51443d", fontSize: 14 },
  summary: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer", fontSize: 15, fontWeight: 750 },
  deleteButton: { width: 36, height: 36, display: "grid", placeItems: "center", border: "1px solid #e4c9c4", borderRadius: 5, background: "#fff", color: "#982f25", cursor: "pointer" },
  saveBar: { position: "sticky", bottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 24, padding: 12, border: "1px solid #ddd2ca", borderRadius: 8, background: "rgba(255,253,249,.97)", boxShadow: "0 4px 20px rgba(40,25,20,.12)", fontSize: 13 },
  error: { padding: 12, borderRadius: 6, background: "#fff1ee", color: "#8a291f", fontWeight: 700 },
  success: { padding: 12, borderRadius: 6, background: "#edf7ef", color: "#28643a", fontWeight: 700 },
};
