// System requirements shown before the pricing on the product pages.
//
// These are NOT benchmarks of Nova Nesting or NOVA Trame themselves. Both tools run inside an Adobe
// application, so the figures are the requirements Adobe publishes for that application, copied from
// Adobe's technical-requirements pages in November 2026. Adobe changes them with each release:
// re-check the source pages below before editing or republishing.
//
// While a value is null the block is not shown. Shape:
// { title, intro, tiers: [{ label, name, items: [[label, value], ...] }, ...], note, source: { label, href } }

// Nova Nesting runs inside Adobe Illustrator (Adobe lists version 31.0 as current).
export const NESTING_REQUIREMENTS = {
  title: "Check your computer before you start.",
  intro: "Nova Nesting runs inside Adobe Illustrator, so these are the requirements Adobe publishes for the current Illustrator (version 31.0). Not sure your computer qualifies? Try the 7-day free trial on your own files.",
  tiers: [
    {
      label: "MINIMUM",
      name: "Minimum",
      items: [
        ["Operating system", "Windows 11 (version 24H2 or later) or Windows 10 v21H2 LTSC, or macOS 14 (Sonoma) or later"],
        ["Processor", "Multicore 64-bit processor with SSE 4.2 or later; Apple silicon is supported"],
        ["Memory", "8 GB"],
        ["Graphics", "1 GB video memory (DirectX 12 or OpenGL 4.0 on Windows, Metal on Mac)"],
        ["Free disk space", "8 GB on Windows, 10 GB on Mac, for installing Illustrator"],
        ["Display", "1024 × 768"]
      ]
    },
    {
      label: "RECOMMENDED",
      name: "Recommended",
      items: [
        ["Operating system", "The latest supported release of Windows 11 or macOS"],
        ["Processor", "Multicore 64-bit processor with SSE 4.2 or later; Apple silicon is supported"],
        ["Memory", "16 GB or more"],
        ["Graphics", "4 GB video memory on Windows, 2 GB on Mac"],
        ["Free disk space", "A solid-state drive (SSD)"],
        ["Display", "1920 × 1080"]
      ]
    }
  ],
  note: "Using an earlier version of Illustrator? Email support@ainovanesting.pro before you buy and we will tell you whether it works. Adobe updates its requirements with each release, so check Adobe’s page for the latest.",
  source: { label: "Adobe: Illustrator technical requirements", href: "https://helpx.adobe.com/illustrator/desktop/get-started/learn-the-basics/technical-requirements.html" }
};

// NOVA Trame runs inside Adobe Photoshop.
export const TRAME_REQUIREMENTS = {
  title: "Check your computer before you start.",
  intro: "NOVA Trame runs inside Adobe Photoshop, so these are the requirements Adobe publishes for the current Photoshop. The 7-day free trial lets you check how it runs on your own computer.",
  tiers: [
    {
      label: "MINIMUM",
      name: "Minimum",
      items: [
        ["Operating system", "Windows 10 (version 21H2 or later) or Windows 11, or macOS 14 or later"],
        ["Processor", "Windows: multicore Intel, AMD or Windows-on-ARM processor. Mac: Apple silicon, or multicore Intel with AVX2"],
        ["Memory", "8 GB"],
        ["Graphics", "1.5 GB video memory (DirectX 12 on Windows, Metal on Mac)"],
        ["Free disk space", "10 GB, for installing Photoshop"]
      ]
    },
    {
      label: "RECOMMENDED",
      name: "Recommended",
      items: [
        ["Operating system", "Windows 11, or macOS 15 (Sequoia) or later"],
        ["Processor", "Windows: multicore Intel, AMD or Windows-on-ARM processor. Mac: Apple silicon, or multicore Intel with AVX2"],
        ["Memory", "16 GB or more"],
        ["Graphics", "2 GB video memory, or 4 GB for 4K and larger displays"],
        ["Free disk space", "A fast internal solid-state drive (SSD)"]
      ]
    }
  ],
  note: "Using an older version of Photoshop? See the installation guide or email support@ainovanesting.pro. Adobe updates its requirements with each release, so check Adobe’s page for the latest.",
  source: { label: "Adobe: Photoshop technical requirements", href: "https://helpx.adobe.com/photoshop/desktop/get-started/technical-requirements-installation/adobe-photoshop-on-desktop-technical-requirements.html" }
};
