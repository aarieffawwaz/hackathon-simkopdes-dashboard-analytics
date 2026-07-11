import { useMemo, useRef, useState } from "react";
import {
    Boxes,
    PackagePlus,
    TrendingUp,
    Rocket,
    Lightbulb,
    ArrowUpRight,
    Sparkles,
    ShieldCheck,
    MapPin,
    Users,
    Feather,
    Gauge,
    Info,
    ChevronLeft,
    ChevronRight,
    Award,
    Target,
    Flame,
} from "lucide-react";
import { StatWidget } from "../Components/StatWidget";
import { DashboardProps } from "../type";
import { AiTag } from "./TabPetaPotensi";

type Tingkat = "ringan" | "advance";

/* Skala label kualitatif buat Skor Sinergi -- sengaja dibikin beda gaya
   bahasa (lebih santai) dari skala KELAS di Peta Potensi, karena ini
   "rapor gabungan" buat pengurus, bukan skor teknis per-desa.

   Catatan: label utamanya sengaja dibikin MEMOTIVASI, bukan menghakimi --
   skor rendah bukan berarti gagal, tapi titik berangkat buat eksekusi
   rekomendasi di bawah. */
const SINERGI_KELAS = [
    {
        min: 85,
        label: "Gaspol, siap ekspansi",
        hex: "#1e5b65",
        bg: "#e0f2fe",
    },
    {
        min: 70,
        label: "Solid, tinggal dorong dikit",
        hex: "#2b7a86",
        bg: "#ecfeff",
    },
    {
        min: 55,
        label: "On track, terus digenjot",
        hex: "#9bba4b",
        bg: "#f7fee7",
    },
    {
        min: 0,
        label: "Titik berangkat yang bagus",
        hex: "#f5b931",
        bg: "#fffbeb",
    },
] as const;

const kelasSinergi = (skor: number) =>
    SINERGI_KELAS.find((k) => skor >= k.min) ??
    SINERGI_KELAS[SINERGI_KELAS.length - 1];

function RingSkor({
    skor,
    warna,
    besar = false,
}: {
    skor: number;
    warna: string;
    besar?: boolean;
}) {
    const size = besar ? 176 : 140;
    const r = besar ? 72 : 56;
    const stroke = besar ? 15 : 12;
    const terisi = (Math.min(skor, 100) / 100) * (2 * Math.PI * r);
    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
                flexShrink: 0,
            }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={warna}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${terisi} ${2 * Math.PI * r}`}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dasharray 1.2s ease" }}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        fontSize: besar ? 46 : 32,
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1,
                    }}
                >
                    {skor}
                </span>
                <span
                    style={{
                        fontSize: besar ? 13 : 10,
                        color: "#64748b",
                        marginTop: 2,
                    }}
                >
                    Skor Sinergi
                </span>
            </div>
        </div>
    );
}

function KartuWrap({
    tone,
    icon,
    label,
    value,
    unit,
    sub,
    onClick,
    ringan,
}: {
    tone: { from: string; to: string; text: string };
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    sub: string;
    onClick?: () => void;
    ringan: boolean;
}) {
    return (
        <div
            onClick={onClick}
            className="kora-wrap-card"
            style={{
                background: `linear-gradient(150deg, ${tone.from} 0%, ${tone.to} 100%)`,
                color: tone.text,
                borderRadius: 16,
                padding: ringan ? 22 : 18,
                minWidth: ringan ? 240 : 200,
                maxWidth: ringan ? 240 : 200,
                flexShrink: 0,
                scrollSnapAlign: "start",
                cursor: onClick ? "pointer" : "default",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "inline-flex",
                    padding: 8,
                    borderRadius: 10,
                    background: "rgba(255,255,255,.18)",
                    marginBottom: 14,
                }}
            >
                {icon}
            </div>
            <p
                style={{
                    margin: "0 0 4px",
                    fontSize: ringan ? 13 : 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".4px",
                    opacity: 0.85,
                }}
            >
                {label}
            </p>
            <p
                style={{
                    margin: "0 0 6px",
                    fontSize: ringan ? 38 : 30,
                    fontWeight: 800,
                    lineHeight: 1,
                }}
            >
                {value}
                {unit && (
                    <span
                        style={{
                            fontSize: ringan ? 15 : 12,
                            fontWeight: 600,
                            opacity: 0.8,
                        }}
                    >
                        {" "}
                        {unit}
                    </span>
                )}
            </p>
            <p
                style={{
                    margin: 0,
                    fontSize: ringan ? 13.5 : 11.5,
                    lineHeight: 1.4,
                    opacity: 0.9,
                }}
            >
                {sub}
            </p>
        </div>
    );
}

export default function TabNilaiTambah({
    data,
    analisisUsaha,
    petaPotensi,
    buyerHistory,
    onOpenModal,
    koperasiNama = "koperasimu",
}: {
    data: DashboardProps["nilaiTambah"];
    analisisUsaha?: DashboardProps["analisisUsaha"];
    petaPotensi?: DashboardProps["petaPotensi"];
    buyerHistory?: DashboardProps["buyerHistory"];
    onOpenModal: Function;
    koperasiNama?: string;
}) {
    const [tingkat, setTingkat] = useState<Tingkat>("advance");
    const [showFormula, setShowFormula] = useState(false);
    const ringan = tingkat === "ringan";
    const scrollRef = useRef<HTMLDivElement>(null);
    const rekomendasiRef = useRef<HTMLDivElement>(null);

    const geser = (arah: number) =>
        scrollRef.current?.scrollBy({ left: arah * 260, behavior: "smooth" });

    const scrollKeRekomendasi = () =>
        rekomendasiRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

    // ================= SINTESIS 3 TAB SEBELUMNYA =================
    const sintesis = useMemo(() => {
        const skorKesehatan = analisisUsaha?.skorTotal ?? 0;

        const desaList = petaPotensi?.desaList ?? [];
        const skorPotensiRataRata = desaList.length
            ? Math.round(
                  desaList.reduce((s, d) => s + d.skorPotensi, 0) /
                      desaList.length,
              )
            : 0;
        const desaTerbaik = desaList.length
            ? desaList.reduce((a, b) => (b.skorPotensi > a.skorPotensi ? b : a))
            : null;

        const totalBuyer = buyerHistory?.stats?.totalBuyer ?? 0;
        const totalTransaksi = buyerHistory?.stats?.transaksiTercatat ?? 0;
        const totalRekBuyer = buyerHistory?.stats?.rekomendasiDihasilkan ?? 0;

        // Heuristik -- BUKAN skor resmi dari backend. Ini estimasi kasar biar
        // "jaringan buyer" bisa ikut disintesis, sambil nunggu ada rumus baku.
        const skorBuyerMentah =
            totalBuyer * 12 + totalTransaksi * 2 + totalRekBuyer * 5;
        const skorBuyer = Math.max(
            0,
            Math.min(100, Math.round(skorBuyerMentah)),
        );

        const bobot = { kesehatan: 0.4, potensi: 0.3, buyer: 0.3 };
        const kontribusiKesehatan = skorKesehatan * bobot.kesehatan;
        const kontribusiPotensi = skorPotensiRataRata * bobot.potensi;
        const kontribusiBuyer = skorBuyer * bobot.buyer;
        const skorSinergi = Math.round(
            kontribusiKesehatan + kontribusiPotensi + kontribusiBuyer,
        );

        return {
            skorKesehatan,
            skorPotensiRataRata,
            desaTerbaik,
            totalDesa: desaList.length,
            totalBuyer,
            totalTransaksi,
            skorBuyer,
            bobot,
            kontribusiKesehatan,
            kontribusiPotensi,
            kontribusiBuyer,
            skorSinergi,
        };
    }, [analisisUsaha, petaPotensi, buyerHistory]);

    const kelas = kelasSinergi(sintesis.skorSinergi);

    // Rekomendasi #1 dipisah jadi "Keputusan Utama" -- ini highlight
    // paling berguna buat pengurus, bukan cuma angka skor.
    const rekomendasiUtama = data.rekomendasi?.[0];
    const rekomendasiLainnya = data.rekomendasi?.slice(1) ?? [];

    return (
        <div style={{ width: "100%" }}>
            <style>{`
                .kora-seg { display:flex; gap:4px; background:#f1f5f9; padding:4px; border-radius:10px; flex-wrap:wrap; }
                .kora-seg button { border:none; background:transparent; cursor:pointer; padding:7px 12px; border-radius:7px; font-size:13px; font-weight:600; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }
                .kora-seg button.aktif { background:#fff; color:#0f172a; box-shadow:0 1px 2px rgba(0,0,0,.06); }

                .kora-wrap-scroll { display:flex; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:6px; scrollbar-width:none; }
                .kora-wrap-scroll::-webkit-scrollbar { display:none; }
                .kora-wrap-card { transition: transform .18s ease; }
                .kora-wrap-card:hover { transform: translateY(-3px); }

                /* Logo dibikin PUTIH (bukan warna asli) supaya kontras di atas
                   gradient teal -- brightness(0) invert(1) mengubah logo
                   apa pun jadi silhouette putih bersih, tanpa perlu asset baru.
                   Statis, gak ada animasi -- lebih pas buat logo/brand mark. */
                .kora-logo { filter: brightness(0) invert(1) drop-shadow(0 6px 10px rgba(0,0,0,.25)); opacity: .95; }

                .kora-rek-card { transition: transform .18s ease, box-shadow .18s ease; }
                .kora-rek-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15,23,42,.08); }

                .kora-utama-card { position: relative; transition: box-shadow .18s ease; }
                .kora-utama-card:hover { box-shadow: 0 8px 24px rgba(194,121,15,.18); }
                .kora-ribbon { position: absolute; top: 0; right: 24px; background: linear-gradient(135deg, #f5b931, #c2790f); color: #fff; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 0 0 8px 8px; letter-spacing: .3px; }

                .kora-wa-btn { display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; border:none; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; text-decoration:none; }
                .kora-wa-btn:hover { background:#1ea952; }
            `}</style>

            {/* ---------------- HEADER + TOGGLE ---------------- */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: ringan ? 24 : 18,
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        Nilai Tambah & Keputusan
                    </h2>
                    <p
                        style={{
                            margin: "2px 0 0",
                            fontSize: ringan ? 15 : 13,
                            color: "#64748b",
                        }}
                    >
                        {ringan
                            ? "Rangkuman gampang dibaca, tanpa detail teknis."
                            : "Sintesis lengkap dari Kesehatan Usaha, Potensi Desa, dan Data Buyer."}
                    </p>
                </div>
                <div className="kora-seg" role="tablist">
                    <button
                        className={ringan ? "aktif" : ""}
                        onClick={() => setTingkat("ringan")}
                    >
                        <Feather size={15} /> Ringan
                    </button>
                    <button
                        className={!ringan ? "aktif" : ""}
                        onClick={() => setTingkat("advance")}
                    >
                        <Gauge size={15} /> Advance
                    </button>
                </div>
            </div>

            {/* ---------------- HERO "WRAPPED" ---------------- */}
            <div
                style={{
                    position: "relative",
                    borderRadius: 20,
                    overflow: "hidden",
                    background:
                        "linear-gradient(135deg, #1e5b65 0%, #2b7a86 55%, #164a52 100%)",
                    padding: ringan ? "32px 28px" : "26px 24px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    flexWrap: "wrap",
                }}
            >
                <img
                    src="/images/simkopdes.png"
                    alt="Logo Simkopdes"
                    className="kora-logo"
                    style={{
                        width: ringan ? 96 : 76,
                        height: ringan ? 96 : 76,
                        objectFit: "contain",
                        flexShrink: 0,
                    }}
                />
                <div style={{ flex: 1, minWidth: 220 }}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 12px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,.15)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".5px",
                            marginBottom: 10,
                        }}
                    >
                        <Sparkles size={12} /> Kora Wrap
                        {analisisUsaha?.terakhirDihitung
                            ? ` • ${analisisUsaha.terakhirDihitung}`
                            : ""}
                    </span>
                    <h3
                        style={{
                            margin: "0 0 6px",
                            fontSize: ringan ? 26 : 21,
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.25,
                        }}
                    >
                        Ini rekap performa {koperasiNama}
                    </h3>
                    <p
                        style={{
                            margin: 0,
                            fontSize: ringan ? 15.5 : 13,
                            color: "rgba(255,255,255,.85)",
                            lineHeight: 1.55,
                            maxWidth: 520,
                        }}
                    >
                        Kora Think gabungin data Kesehatan Usaha, Potensi Desa,
                        dan Data Buyer jadi satu rapor:{" "}
                        <b>Skor Sinergi {sintesis.skorSinergi}</b>.
                    </p>
                </div>

                <div
                    style={{
                        background: "rgba(255,255,255,.1)",
                        borderRadius: 16,
                        padding: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        flexShrink: 0,
                        maxWidth: ringan ? 360 : 320,
                    }}
                >
                    <RingSkor
                        skor={sintesis.skorSinergi}
                        warna="#f5b931"
                        besar={ringan}
                    />
                    <div>
                        <span
                            style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: kelas.bg,
                                color: kelas.hex,
                                fontSize: ringan ? 13 : 11,
                                fontWeight: 700,
                                marginBottom: 8,
                            }}
                        >
                            {kelas.label}
                        </span>

                        {/* Motivasi + arahan langsung ke keputusan, bukan cuma
                            skor mentah -- ini yang bikin skor terasa "titik
                            berangkat", bukan vonis. */}
                        {rekomendasiUtama ? (
                            <p
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: ringan ? 13.5 : 12,
                                    color: "rgba(255,255,255,.9)",
                                    lineHeight: 1.5,
                                }}
                            >
                                <Target
                                    size={13}
                                    style={{
                                        display: "inline",
                                        marginRight: 4,
                                        marginBottom: -2,
                                    }}
                                />
                                Fokus ke{" "}
                                <b style={{ color: "#fff" }}>
                                    {rekomendasiUtama.produk}
                                </b>{" "}
                                dulu — itu peluang dengan dampak paling besar
                                sekarang.
                            </p>
                        ) : (
                            <p
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: 12,
                                    color: "rgba(255,255,255,.85)",
                                    lineHeight: 1.5,
                                }}
                            >
                                Belum ada rekomendasi yang bisa dieksekusi saat
                                ini.
                            </p>
                        )}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            {rekomendasiUtama && (
                                <button
                                    type="button"
                                    onClick={scrollKeRekomendasi}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        background: "#f5b931",
                                        border: "none",
                                        color: "#1e293b",
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        padding: "6px 12px",
                                        borderRadius: 999,
                                    }}
                                >
                                    <Flame size={13} /> Lihat keputusan
                                </button>
                            )}
                            {!ringan && (
                                <button
                                    type="button"
                                    onClick={() => setShowFormula((v) => !v)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        background: "none",
                                        border: "none",
                                        color: "rgba(255,255,255,.75)",
                                        fontSize: 11,
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                >
                                    <Info size={12} />
                                    {showFormula
                                        ? "Sembunyikan rumus"
                                        : "Lihat rumus"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------- PANEL FORMULA (Advance only) ---------------- */}
            {!ringan && showFormula && (
                <div
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        background: "#fff",
                        padding: "12px 16px",
                        marginBottom: 20,
                        fontSize: 12.5,
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 10px",
                            color: "#475569",
                            lineHeight: 1.6,
                        }}
                    >
                        <b>Skor Sinergi</b> = jumlah kontribusi 3 sumber,
                        masing-masing dikali bobotnya:
                        <br />
                        <code
                            style={{
                                background: "#f1f5f9",
                                padding: "2px 6px",
                                borderRadius: 4,
                                display: "inline-block",
                                marginTop: 4,
                            }}
                        >
                            (Kesehatan × 40%) + (Potensi Desa × 30%) + (Buyer ×
                            30%)
                        </code>
                    </p>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 12,
                        }}
                    >
                        <thead>
                            <tr style={{ color: "#94a3b8" }}>
                                <th
                                    style={{
                                        textAlign: "left",
                                        padding: "4px 8px",
                                    }}
                                >
                                    Sumber
                                </th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        padding: "4px 8px",
                                    }}
                                >
                                    Skor
                                </th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        padding: "4px 8px",
                                    }}
                                >
                                    Bobot
                                </th>
                                <th
                                    style={{
                                        textAlign: "right",
                                        padding: "4px 8px",
                                    }}
                                >
                                    Kontribusi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "4px 8px" }}>
                                    Kesehatan Usaha
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                    }}
                                >
                                    {sintesis.skorKesehatan}
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                    }}
                                >
                                    40%
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                    }}
                                >
                                    {sintesis.kontribusiKesehatan.toFixed(1)}
                                </td>
                            </tr>
                            <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "4px 8px" }}>
                                    Potensi Desa (rata-rata)
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                    }}
                                >
                                    {sintesis.skorPotensiRataRata}
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                    }}
                                >
                                    30%
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                    }}
                                >
                                    {sintesis.kontribusiPotensi.toFixed(1)}
                                </td>
                            </tr>
                            <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "4px 8px" }}>
                                    Jaringan Buyer{" "}
                                    <i style={{ color: "#94a3b8" }}>
                                        (estimasi)
                                    </i>
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                    }}
                                >
                                    {sintesis.skorBuyer}
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                    }}
                                >
                                    30%
                                </td>
                                <td
                                    style={{
                                        padding: "4px 8px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                    }}
                                >
                                    {sintesis.kontribusiBuyer.toFixed(1)}
                                </td>
                            </tr>
                            <tr style={{ borderTop: "2px solid #e2e8f0" }}>
                                <td
                                    colSpan={3}
                                    style={{
                                        padding: "6px 8px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                    }}
                                >
                                    Total
                                </td>
                                <td
                                    style={{
                                        padding: "6px 8px",
                                        textAlign: "right",
                                        fontWeight: 800,
                                        color: "#0369a1",
                                    }}
                                >
                                    {(
                                        sintesis.kontribusiKesehatan +
                                        sintesis.kontribusiPotensi +
                                        sintesis.kontribusiBuyer
                                    ).toFixed(1)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p
                        style={{
                            margin: "10px 0 0",
                            color: "#94a3b8",
                            fontSize: 11,
                            lineHeight: 1.6,
                        }}
                    >
                        <b>Skor Kesehatan</b> dan <b>Potensi Desa</b> diambil
                        langsung dari perhitungan resmi di tab masing-masing.{" "}
                        <b>Skor Buyer masih heuristik sisi frontend</b> —
                        dihitung kasar dari jumlah buyer, transaksi, dan
                        rekomendasi yang dihasilkan (
                        <code>
                            {sintesis.totalBuyer}×12 + {sintesis.totalTransaksi}
                            ×2 + rekomendasi×5
                        </code>
                        , dibatasi 0–100). Belum ada rumus baku dari backend
                        untuk metrik ini, jadi sebaiknya jangan dijadikan
                        satu-satunya dasar keputusan besar dulu.
                    </p>
                </div>
            )}

            {/* ---------------- STORY CARDS ala Wrapped ---------------- */}
            <div style={{ position: "relative", marginBottom: 22 }}>
                <div ref={scrollRef} className="kora-wrap-scroll">
                    <KartuWrap
                        ringan={ringan}
                        tone={{ from: "#2b7a86", to: "#1e5b65", text: "#fff" }}
                        icon={<ShieldCheck size={20} />}
                        label="Kesehatan Usaha"
                        value={sintesis.skorKesehatan}
                        unit="/ 100"
                        sub={
                            analisisUsaha?.statusUmum
                                ? `Status umum: ${
                                      analisisUsaha.statusUmum === "sehat"
                                          ? "Sehat"
                                          : analisisUsaha.statusUmum === "cukup"
                                            ? "Cukup"
                                            : "Perlu perhatian"
                                  }`
                                : "Data belum tersedia."
                        }
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Kesehatan Usaha",
                                value: `${sintesis.skorKesehatan} / 100`,
                                desc: "Skor ini sama persis dengan Skor Kesehatan Koperasi di tab Analisis Usaha -- rata-rata tertimbang 7 aspek (anggota, simpanan, RAT, gerai, aset, dokumen, transaksi).",
                            })
                        }
                    />
                    <KartuWrap
                        ringan={ringan}
                        tone={{ from: "#9bba4b", to: "#5f8a2e", text: "#fff" }}
                        icon={<MapPin size={20} />}
                        label="Potensi Desa"
                        value={sintesis.skorPotensiRataRata}
                        unit="/ 100"
                        sub={
                            sintesis.desaTerbaik
                                ? `Terbaik: ${sintesis.desaTerbaik.nama} dari ${sintesis.totalDesa} desa terpetakan.`
                                : "Belum ada desa terpetakan."
                        }
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Rata-rata Skor Potensi Desa",
                                value: sintesis.skorPotensiRataRata,
                                desc: `Rata-rata skorPotensi dari ${sintesis.totalDesa} desa yang tampil di tab Peta Potensi. Desa dengan skor tertinggi: ${sintesis.desaTerbaik?.nama ?? "-"}.`,
                            })
                        }
                    />
                    <KartuWrap
                        ringan={ringan}
                        tone={{ from: "#0ea5e9", to: "#0369a1", text: "#fff" }}
                        icon={<Users size={20} />}
                        label="Jaringan Buyer"
                        value={sintesis.totalBuyer}
                        unit="buyer"
                        sub={`${sintesis.totalTransaksi} transaksi tercatat.`}
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Jaringan Buyer",
                                value: sintesis.totalBuyer,
                                desc: `Diambil dari tab Data Buyer: ${sintesis.totalBuyer} buyer unik dengan total ${sintesis.totalTransaksi} transaksi tercatat.`,
                            })
                        }
                    />
                    <KartuWrap
                        ringan={ringan}
                        tone={{ from: "#f5b931", to: "#c2790f", text: "#fff" }}
                        icon={<Sparkles size={20} />}
                        label="Skor Sinergi"
                        value={sintesis.skorSinergi}
                        unit="/ 100"
                        sub={kelas.label}
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Skor Sinergi Kora Think",
                                value: `${sintesis.skorSinergi} / 100`,
                                desc: "Gabungan Kesehatan Usaha (40%), rata-rata Potensi Desa (30%), dan estimasi Jaringan Buyer (30%). Buka panel 'Lihat rumus' di mode Advance untuk rincian angkanya.",
                            })
                        }
                    />
                </div>
                {!ringan && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 6,
                            marginTop: 8,
                        }}
                    >
                        <button
                            onClick={() => geser(-1)}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                            }}
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <button
                            onClick={() => geser(1)}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                            }}
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>

            {/* ---------------- STAT GRID ASLI (dipertahankan) ---------------- */}
            <div className="stat-grid">
                <StatWidget
                    tone="panen"
                    badge="Terindeks"
                    badgeIcon={<Boxes size={12} />}
                    label="Katalog Analisis"
                    value={data.stats.produkDianalisis}
                    unit="komoditas"
                    icon={<PackagePlus size={82} strokeWidth={1} />}
                    description="Produk mentah dievaluasi."
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Katalog Analisis",
                            value: data.stats.produkDianalisis,
                            desc: "Jumlah komoditas yang sudah dievaluasi Kora Think untuk mencari peluang nilai tambah.",
                        })
                    }
                />
                <StatWidget
                    tone="awas"
                    badge="Tren naik"
                    badgeIcon={<TrendingUp size={12} />}
                    label="Potensi Kenaikan"
                    value={data.stats.potensiPeningkatan}
                    icon={<TrendingUp size={82} strokeWidth={1} />}
                    description="Estimasi lonjakan margin."
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Potensi Kenaikan",
                            value: data.stats.potensiPeningkatan,
                            desc: "Estimasi potensi kenaikan margin/omset kalau rekomendasi di bawah dieksekusi.",
                        })
                    }
                />
                <StatWidget
                    tone="kora"
                    badge="Siap eksekusi"
                    badgeIcon={<Rocket size={12} />}
                    label="Aksi Tereksekusi"
                    value={data.stats.rekomendasiSiapEksekusi}
                    unit="rekomendasi"
                    icon={<Rocket size={82} strokeWidth={1} />}
                    description="Layak diimplementasi hari ini."
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Aksi Tereksekusi",
                            value: data.stats.rekomendasiSiapEksekusi,
                            desc: "Jumlah rekomendasi taktis yang sudah cukup matang buat langsung dijalankan tanpa kajian tambahan.",
                        })
                    }
                />
            </div>

            {/* ---------------- KEPUTUSAN UTAMA (Rekomendasi #1, ditonjolkan) ---------------- */}
            <div ref={rekomendasiRef} style={{ scrollMarginTop: 20 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: "24px 0 12px",
                    }}
                >
                    <span
                        style={{
                            fontSize: ringan ? 16 : 14,
                            fontWeight: 700,
                            color: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Award size={ringan ? 18 : 16} color="#1e5b65" />{" "}
                        Rekomendasi Skalabilitas
                    </span>
                    <AiTag />
                </div>
                <p
                    style={{
                        margin: "-6px 0 16px",
                        fontSize: ringan ? 13.5 : 12,
                        color: "#64748b",
                        lineHeight: 1.5,
                        maxWidth: 620,
                    }}
                >
                    Ini keputusan yang paling berguna dari seluruh analisis di
                    atas — bukan sekadar angka, tapi langkah konkret yang bisa
                    langsung dieksekusi pengurus.
                </p>

                {rekomendasiUtama && (
                    <div
                        className="kora-utama-card"
                        onClick={() =>
                            onOpenModal("nilai_tambah", rekomendasiUtama)
                        }
                        style={{
                            border: "2px solid #f5b931",
                            borderRadius: 16,
                            background:
                                "linear-gradient(180deg, #fffbeb 0%, #ffffff 60%)",
                            padding: ringan ? 24 : 20,
                            cursor: "pointer",
                            marginBottom: rekomendasiLainnya.length ? 16 : 0,
                            boxShadow: "0 4px 16px rgba(194,121,15,.1)",
                        }}
                    >
                        <div className="kora-ribbon">KEPUTUSAN UTAMA</div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 14,
                                marginBottom: 14,
                                marginTop: 6,
                            }}
                        >
                            <div
                                style={{
                                    padding: ringan ? 14 : 12,
                                    background:
                                        "linear-gradient(135deg, #f5b931, #c2790f)",
                                    borderRadius: 12,
                                    color: "#fff",
                                    flexShrink: 0,
                                }}
                            >
                                <Rocket size={ringan ? 26 : 22} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#c2790f",
                                        textTransform: "uppercase",
                                        letterSpacing: ".4px",
                                    }}
                                >
                                    Prioritas #1 — dampak terbesar
                                </span>
                                <h3
                                    style={{
                                        margin: "3px 0 0",
                                        fontSize: ringan ? 20 : 17,
                                        fontWeight: 800,
                                        color: "#0f172a",
                                    }}
                                >
                                    {rekomendasiUtama.produk}
                                </h3>
                            </div>
                        </div>

                        <p
                            style={{
                                fontSize: ringan ? 14 : 13,
                                color: "#475569",
                                margin: "0 0 14px",
                                lineHeight: 1.6,
                            }}
                        >
                            {rekomendasiUtama.insightGabungan}
                        </p>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: ringan ? "1fr" : "1fr 1fr",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #fde68a",
                                    borderRadius: 10,
                                    padding: 14,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        color: "#c2790f",
                                        textTransform: "uppercase",
                                        letterSpacing: ".3px",
                                    }}
                                >
                                    Action Item
                                </span>
                                <p
                                    style={{
                                        fontSize: ringan ? 15 : 13,
                                        color: "#0f172a",
                                        fontWeight: 600,
                                        margin: "4px 0 0",
                                        display: "flex",
                                        gap: 6,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    <ArrowUpRight
                                        size={15}
                                        color="#c2790f"
                                        style={{
                                            flexShrink: 0,
                                            marginTop: 3,
                                        }}
                                    />
                                    {rekomendasiUtama.aksi}
                                </p>
                            </div>
                            <div
                                style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 10,
                                    padding: 14,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        color: "#15803d",
                                        textTransform: "uppercase",
                                        letterSpacing: ".3px",
                                    }}
                                >
                                    Estimasi Dampak
                                </span>
                                <p
                                    style={{
                                        fontSize: ringan ? 16 : 14,
                                        color: "#15803d",
                                        fontWeight: 800,
                                        margin: "4px 0 0",
                                    }}
                                >
                                    {rekomendasiUtama.dampakEstimasi}
                                </p>
                            </div>
                        </div>

                        {(rekomendasiUtama as any).wa && (
                            <a
                                href={(rekomendasiUtama as any).wa}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="kora-wa-btn"
                                onClick={(e) => e.stopPropagation()}
                                style={{ marginTop: 14 }}
                            >
                                <ArrowUpRight size={14} /> Kirim Penawaran via
                                WhatsApp
                            </a>
                        )}
                    </div>
                )}

                {/* ---------------- REKOMENDASI LAINNYA ---------------- */}
                {rekomendasiLainnya.length > 0 && (
                    <>
                        <p
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#94a3b8",
                                textTransform: "uppercase",
                                letterSpacing: ".4px",
                                margin: "4px 0 10px",
                            }}
                        >
                            Rekomendasi Lainnya
                        </p>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: ringan
                                    ? "1fr"
                                    : "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: ringan ? 14 : 12,
                            }}
                        >
                            {rekomendasiLainnya.map((r, i) => (
                                <div
                                    key={i}
                                    className="kora-rek-card"
                                    onClick={() =>
                                        onOpenModal("nilai_tambah", r)
                                    }
                                    style={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 12,
                                        background: "#fff",
                                        padding: ringan ? 20 : 16,
                                        cursor: "pointer",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 12,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: ringan ? 12 : 10,
                                                background: "#e0f2fe",
                                                borderRadius: 10,
                                                color: "#0ea5e9",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Lightbulb
                                                size={ringan ? 22 : 18}
                                            />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: "#94a3b8",
                                                    textTransform: "uppercase",
                                                    letterSpacing: ".4px",
                                                }}
                                            >
                                                Prioritas #{i + 2}
                                            </span>
                                            <h3
                                                style={{
                                                    margin: "2px 0 0",
                                                    fontSize: ringan ? 17 : 14,
                                                    fontWeight: 700,
                                                    color: "#0f172a",
                                                }}
                                            >
                                                {r.produk}
                                            </h3>
                                        </div>
                                    </div>

                                    {!ringan && (
                                        <p
                                            style={{
                                                fontSize: 12.5,
                                                color: "#475569",
                                                margin: "0 0 10px",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {r.insightGabungan}
                                        </p>
                                    )}

                                    <div
                                        style={{
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 8,
                                            padding: ringan ? 12 : 10,
                                            marginBottom: !ringan ? 8 : 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                color: "#64748b",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Action Item
                                        </span>
                                        <p
                                            style={{
                                                fontSize: ringan ? 14.5 : 12,
                                                color: "#0f172a",
                                                fontWeight: 500,
                                                margin: "2px 0 0",
                                                display: "flex",
                                                gap: 6,
                                            }}
                                        >
                                            <ArrowUpRight
                                                size={14}
                                                color="#0ea5e9"
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: 2,
                                                }}
                                            />
                                            {r.aksi}
                                        </p>
                                    </div>

                                    {!ringan && (
                                        <p
                                            style={{
                                                margin: "0 0 8px",
                                                fontSize: 11.5,
                                                color: "#10b981",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {r.dampakEstimasi}
                                        </p>
                                    )}

                                    {(r as any).wa && (
                                        <a
                                            href={(r as any).wa}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="kora-wa-btn"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: 11.5,
                                            }}
                                        >
                                            <ArrowUpRight size={12} /> Kirim via
                                            WhatsApp
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
