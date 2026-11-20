// Main navigation tabs shared by every page except NOVA Trame (which has its own in-page tabs).
// Each tab points at its own tab on the home page; Guides is its own page.
const TABS = [
  ["Tools", "/#tools"],
  ["Features", "/#features"],
  ["Workflow", "/#workflow"],
  ["Resources", "/#resources"],
  ["Guides", "/guides"]
];

export default function NavLinks() {
  return (
    <div className="nav-links">
      {TABS.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
    </div>
  );
}
