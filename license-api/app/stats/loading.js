import { CSS, FONTS } from "./stats-style";

// Shown immediately while the numbers load, so the page never sits blank.
export default function Loading() {
  const block = (h) => <div className="skel" style={{ height: h }} />;
  return (
    <main className="wrap" aria-busy="true">
      <link rel="stylesheet" href={FONTS} />
      <style>{CSS}</style>
      <header className="top">
        <div>
          <p className="eyebrow">ainovanesting.pro</p>
          <h1>Thống kê website &amp; bán hàng</h1>
          <p className="sub">Đang tải số liệu…</p>
        </div>
      </header>
      <section className="kpis" aria-label="Tổng quan">
        {["Lượt truy cập", "Lượt xem trang", "Bấm tải plugin", "Lượt mua", "Dùng thử 7 ngày"].map((t) => (
          <div className="kpi" key={t}><span>{t}</span>{block(34)}{block(12)}</div>
        ))}
      </section>
      <section className="charts">
        {[1, 2, 3].map((i) => <div className="chart" key={i}>{block(150)}</div>)}
      </section>
      <section className="grid2">
        {[1, 2].map((i) => <div className="panel" key={i}>{block(180)}</div>)}
      </section>
    </main>
  );
}
