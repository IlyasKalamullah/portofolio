import "server-only";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { CvData } from "./data";

// Jangan memenggal kata (pemenggalan otomatis membuat kata terbaca aneh oleh ATS)
Font.registerHyphenationCallback((word) => [word]);

// Font standar PDF (Helvetica) + satu kolom + tanpa tabel/ikon/gambar = mudah dibaca ATS
const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 48, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#111" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 20, lineHeight: 1.2 },
  title: { fontSize: 11.5, marginTop: 2, color: "#333" },
  contactsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  contacts: { fontSize: 9.5, color: "#333" },
  section: { marginTop: 14 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, paddingBottom: 3, marginBottom: 6, borderBottomWidth: 0.8, borderBottomColor: "#111" },
  item: { marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  heading: { fontFamily: "Helvetica-Bold", fontSize: 10.5, flex: 1, paddingRight: 8 },
  meta: { fontSize: 9.5, color: "#333" },
  sub: { fontSize: 9.5, color: "#333", marginTop: 1 },
  bullet: { flexDirection: "row", marginTop: 2 },
  dot: { width: 10 },
  bulletText: { flex: 1 },
  line: { marginBottom: 2 },
});

export function CvDocument({ data }: { data: CvData }) {
  return (
    <Document title={`CV - ${data.name}`} author={data.name} subject={data.title} language={data.lang}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{data.name}</Text>
        {data.title && <Text style={s.title}>{data.title}</Text>}
        {data.contacts.length > 0 && (
          <View style={s.contactsRow}>
            {data.contacts.map((c, i) => (
              <Text key={i} style={s.contacts}>{c}{i < data.contacts.length - 1 ? "  |  " : ""}</Text>
            ))}
          </View>
        )}

        {data.sections.map((sec) => (
          <View key={sec.key} style={s.section}>
            <Text style={s.h2} minPresenceAhead={40}>{sec.label}</Text>
            {sec.text && <Text>{sec.text}</Text>}
            {sec.lines?.map((l, i) => <Text key={i} style={s.line}>{l}</Text>)}
            {sec.items?.map((it, i) => (
              <View key={i} style={s.item} wrap={it.bullets.length > 4}>
                <View style={s.row}>
                  <Text style={s.heading}>{it.heading}</Text>
                  {it.meta ? <Text style={s.meta}>{it.meta}</Text> : null}
                </View>
                {it.sub ? <Text style={s.sub}>{it.sub}</Text> : null}
                {it.bullets.map((b, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function renderCvPdf(data: CvData) {
  return renderToBuffer(<CvDocument data={data} />);
}
