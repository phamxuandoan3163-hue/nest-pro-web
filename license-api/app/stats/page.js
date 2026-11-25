import { loadStats, PLAN_LABEL, PLAN_PRICE, TZ } from "../../lib/stats-query";
import { CSS, FONTS } from "./stats-style";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata = { title: "Thống kê Nova Nesting", robots: { index: false, follow: false } };

const RANGES = [7, 30, 90];
const num = (n) => new Intl.NumberFormat("vi-VN").format(n || 0);
const usd = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const regionName = (() => {
  let dn = null;
  try { dn = new Intl.DisplayNames(["vi"], { type: "region" }); } catch { /* old runtime */ }
  return (code) => { if (!code) return "Không rõ"; try { return (dn && dn.of(code)) || code; } catch { return code; } };
})();
const shortDay = (d) => d.slice(8, 10) + "/" + d.slice(5, 7);
const dateTime = (v) => new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, dateStyle: "short", timeStyle: "short" }).format(new Date(v));
const timeOnly = (v) => new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, timeStyle: "short" }).format(new Date(v));
const pct = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "–");
const DEVICE = { desktop: "Máy tính", mobile: "Điện thoại", tablet: "Máy tính bảng" };

function niceMax(v) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return v;
}

// Daily bars on one scale; the y-axis label is the top of that scale.
function DayBars({ series, field, tone, label }) {
  const W = 360, H = 140, L = 30, B = 20, T = 8;
  const max = niceMax(Math.max(...series.map((s) => s[field])));
  const slot = (W - L) / series.length;
  const bw = Math.max(1.5, Math.min(14, slot * 0.7));
  const y = (v) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, Math.floor((series.length - 1) / 2), series.length - 1];
  const sum = series.reduce((s, r) => s + r[field], 0);
  return (
    <figure className="chart">
      <figcaption><span>{label}</span><b>{num(sum)}</b></figcaption>
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} theo ngày`}>
          {[0, max / 2, max].map((v) => (
            <g key={v}>
              <line x1={L} x2={W} y1={y(v)} y2={y(v)} className="grid" />
              <text x={L - 6} y={y(v) + 4} className="axis" textAnchor="end">{num(v)}</text>
            </g>
          ))}
          {series.map((s, i) => s[field] > 0 && (
            <rect key={s.d} x={L + i * slot + (slot - bw) / 2} y={y(s[field])} width={bw} height={Math.max(1, H - B - y(s[field]))} rx="2" className={"bar " + tone}>
              <title>{shortDay(s.d)}: {num(s[field])}</title>
            </rect>
          ))}
          {ticks.map((i) => (
            <text key={i} x={L + i * slot + slot / 2} y={H - 6} className="axis" textAnchor="middle">{shortDay(series[i].d)}</text>
          ))}
        </svg>
      </div>
    </figure>
  );
}

function RankList({ rows, value, name, extra, empty }) {
  const max = Math.max(1, ...rows.map(value));
  if (!rows.length) return <p className="empty">{empty}</p>;
  return (
    <ol className="rank">
      {rows.map((r, i) => (
        <li key={i}>
          <div className="rank-row"><span className="rank-name">{name(r)}</span><span className="rank-val">{num(value(r))}{extra ? <small>{extra(r)}</small> : null}</span></div>
          <div className="rank-track"><div className="rank-fill" style={{ width: (value(r) / max) * 100 + "%" }} /></div>
        </li>
      ))}
    </ol>
  );
}

export default async function StatsPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
  let s;
  try {
    s = await loadStats(days, { fresh: sp.fresh === "1" });
  } catch (e) {
    return <main className="wrap"><style>{CSS}</style><h1>Thống kê</h1><p className="empty">Không đọc được dữ liệu: {String(e && e.message)}</p></main>;
  }
  const t = s.totals;
  const opened = s.checkouts.filter((r) => r.type === "checkout_open").reduce((a, r) => a + r.n, 0);
  const done = s.checkouts.filter((r) => r.type === "checkout_done").reduce((a, r) => a + r.n, 0);
  const tramePv = s.pages.filter((p) => p.path.startsWith("/trame-preview")).reduce((a, p) => a + p.v, 0);

  return (
    <main className="wrap">
      <link rel="stylesheet" href={FONTS} />
      <style>{CSS}</style>
      <header className="top">
        <div>
          <p className="eyebrow">ainovanesting.pro</p>
          <h1>Thống kê website &amp; bán hàng</h1>
          <p className="sub">
            {s.firstEventAt ? <>Bắt đầu ghi nhận từ {dateTime(s.firstEventAt)}. </> : <>Chưa có lượt truy cập nào được ghi nhận. </>}
            Giờ Việt Nam · số liệu lúc {timeOnly(s.computedAt)} · <a className="refresh" href={`?days=${days}&fresh=1`}>Làm mới</a>
          </p>
        </div>
        <nav className="range" aria-label="Khoảng thời gian">
          {RANGES.map((r) => <a key={r} href={`?days=${r}`} aria-current={r === days ? "page" : undefined}>{r} ngày</a>)}
        </nav>
      </header>

      <section className="kpis" aria-label="Tổng quan">
        <div className="kpi"><span>Lượt truy cập</span><b>{num(t.visitors)}</b><small>khách mỗi ngày, cộng dồn</small></div>
        <div className="kpi"><span>Lượt xem trang</span><b>{num(t.pageviews)}</b><small>{t.visitors ? (t.pageviews / t.visitors).toFixed(1) : "0"} trang / lượt truy cập</small></div>
        <div className="kpi"><span>Bấm tải plugin</span><b>{num(t.downloads)}</b><small>{num(t.downloaders)} người · {pct(t.downloaders, t.visitors)} lượt truy cập</small></div>
        <div className="kpi accent"><span>Lượt mua</span><b>{num(t.purchases)}</b><small>≈ {usd(t.revenue)} theo giá niêm yết</small></div>
        <div className="kpi"><span>Dùng thử 7 ngày</span><b>{num(t.trials)}</b><small>kích hoạt trong plugin</small></div>
      </section>

      <section className="charts">
        <DayBars series={s.series} field="visitors" tone="a" label="Lượt truy cập theo ngày" />
        <DayBars series={s.series} field="downloads" tone="b" label="Bấm tải plugin theo ngày" />
        <DayBars series={s.series} field="purchases" tone="c" label="Lượt mua theo ngày" />
      </section>

      <section className="grid2">
        <div className="panel">
          <h2>Vị trí truy cập: quốc gia</h2>
          <RankList rows={s.countries} value={(r) => r.v} name={(r) => <><code>{r.country || "??"}</code> {regionName(r.country)}</>} extra={(r) => ` · ${num(r.n)} trang`} empty="Chưa có dữ liệu." />
        </div>
        <div className="panel">
          <h2>Vị trí truy cập: thành phố</h2>
          <RankList rows={s.cities} value={(r) => r.v} name={(r) => <>{r.city}<small className="muted"> · {regionName(r.country)}</small></>} empty="Chưa có dữ liệu." />
        </div>
      </section>

      <section className="grid3">
        <div className="panel">
          <h2>Trang được xem nhiều</h2>
          <RankList rows={s.pages} value={(r) => r.n} name={(r) => <code className="path">{r.path}</code>} empty="Chưa có dữ liệu." />
        </div>
        <div className="panel">
          <h2>Nguồn truy cập</h2>
          <RankList rows={s.referrers} value={(r) => r.v} name={(r) => r.host} empty="Chưa có ai đến từ trang khác (chỉ vào thẳng)." />
        </div>
        <div className="panel">
          <h2>Thiết bị</h2>
          <RankList rows={s.devices} value={(r) => r.v} name={(r) => DEVICE[r.device] || r.device} empty="Chưa có dữ liệu." />
          <h2 className="gap">Bấm tải ở trang</h2>
          <RankList rows={s.downloads} value={(r) => r.n} name={(r) => <code className="path">{r.path}</code>} empty="Chưa có lượt tải." />
        </div>
      </section>

      <section className="grid2">
        <div className="panel">
          <h2>Phễu mua NOVA Trame</h2>
          <ol className="funnel">
            <li><span>Người xem trang Trame</span><b>{num(tramePv)}</b></li>
            <li><span>Bấm tải bản dùng thử</span><b>{num(t.downloaders)}</b></li>
            <li><span>Mở trang thanh toán</span><b>{num(opened)}</b></li>
            <li><span>Thanh toán xong (trình duyệt báo)</span><b>{num(done)}</b></li>
            <li><span>License đã cấp (Paddle xác nhận)</span><b>{num(t.purchases)}</b></li>
          </ol>
          <h2 className="gap">Theo gói</h2>
          <table className="tbl">
            <thead><tr><th>Gói</th><th className="r">Lượt mua</th><th className="r">Ước tính</th></tr></thead>
            <tbody>{s.byPlan.map((p) => <tr key={p.plan}><td>{PLAN_LABEL[p.plan]}</td><td className="r">{num(p.n)}</td><td className="r">{usd(p.n * PLAN_PRICE[p.plan])}</td></tr>)}</tbody>
          </table>
          {t.sandboxPurchases ? <p className="note">Không tính {num(t.sandboxPurchases)} lượt mua thử (sandbox).</p> : null}
        </div>
        <div className="panel">
          <h2>Lượt mua gần đây</h2>
          {s.recent.length ? (
            <div className="tbl-scroll"><table className="tbl">
              <thead><tr><th>Thời gian</th><th>Gói</th><th>Khách</th><th>Trạng thái</th></tr></thead>
              <tbody>{s.recent.map((r, i) => (
                <tr key={i}><td>{dateTime(r.at)}</td><td>{PLAN_LABEL[r.plan] || r.plan}{r.sandbox ? <span className="pill warn">thử</span> : null}</td><td className="mono">{r.email}</td><td><span className={"pill " + (r.status === "revoked" || r.status === "canceled" ? "bad" : "ok")}>{r.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          ) : <p className="empty">Chưa có lượt mua nào.</p>}
        </div>
      </section>

      <footer className="foot">
        Lượt truy cập đếm mỗi người một lần mỗi ngày, không dùng cookie và không lưu địa chỉ IP. Vị trí lấy theo IP lúc truy cập (do Vercel cung cấp), chỉ chính xác đến thành phố. Lượt mua lấy từ license do Paddle cấp; doanh thu là ước tính theo giá niêm yết, chưa trừ thuế và phí.
      </footer>
    </main>
  );
}
