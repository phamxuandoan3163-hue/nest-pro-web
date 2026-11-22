// "System requirements" block with two columns: Minimum and Recommended.
// It renders nothing until real figures are filled in app/system-requirements-data.js,
// so no placeholder numbers can reach the site.
export default function SystemRequirements({ data }) {
  if (!data || !data.tiers || data.tiers.length === 0) return null;
  return (
    <section id="requirements" className="shell" style={{ padding: "70px 0 20px" }}>
      <div className="tool-section-head">
        <p className="eyebrow">SYSTEM REQUIREMENTS</p>
        <h2>{data.title || "Check your computer before you start."}</h2>
        {data.intro && <p>{data.intro}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 36 }}>
        {data.tiers.map((tier) => (
          <article className="tool-feature-card" key={tier.name} style={{ minHeight: 0 }}>
            <span>{tier.label}</span>
            <h3>{tier.name}</h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 14 }}>
              {tier.items.map(([label, value]) => (
                <li key={label} style={{ display: "grid", gap: 3, paddingTop: 14, borderTop: "1px solid #2a3031" }}>
                  <span style={{ fontSize: 11, letterSpacing: ".4px", color: "#8a9292" }}>{label}</span>
                  <b style={{ fontSize: 14, fontWeight: 600, color: "#f2f2ef", lineHeight: 1.5 }}>{value}</b>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {data.note && <p style={{ margin: "18px 0 0", fontSize: 12, lineHeight: 1.8, color: "#939a9a", maxWidth: 760 }}>{data.note}</p>}
    </section>
  );
}
