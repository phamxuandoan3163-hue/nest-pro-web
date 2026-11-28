// Renders structured data (schema.org JSON-LD). Server component: the data is in the HTML Googlebot reads.
export default function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
