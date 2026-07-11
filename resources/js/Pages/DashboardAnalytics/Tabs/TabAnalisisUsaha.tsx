import { useState } from "react";
import {
    Boxes,
    Package2,
    Users,
    PiggyBank,
    CalendarCheck,
    Store,
    FileText,
    TrendingUp,
    AlertTriangle,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    Feather,
    Gauge,
    Info,
} from "lucide-react";
import { StatWidget } from "../Components/StatWidget";
import { DashboardProps, KesehatanKategori } from "../type";

const KATEGORI_ICON: Record<KesehatanKategori["key"], any> = {
    anggota: Users,
    simpanan: PiggyBank,
    rat: CalendarCheck,
    gerai: Store,
    aset: Boxes,
    dokumen: FileText,
    produk_transaksi: Package2,
};

const STATUS_STYLE: Record<
    string,
    { bg: string; color: string; label: string }
> = {
    sehat: { bg: "#dcfce7", color: "#10b981", label: "Sehat" },
    cukup: { bg: "#fef3c7", color: "#f59e0b", label: "Cukup" },
    kurang: { bg: "#fee2e2", color: "#ef4444", label: "Perlu Perhatian" },
};

type Tingkat = "ringan" | "advance";

export default function TabAnalisisUsaha({
    data,
    onOpenModal,
}: {
    data: DashboardProps["analisisUsaha"];
    onOpenModal: Function;
}) {
    const [tingkat, setTingkat] = useState<Tingkat>("advance");
    const [showFormula, setShowFormula] = useState(false);
    const ringan = tingkat === "ringan";

    const kategoriSehat = data.kategori.filter(
        (k) => k.status === "sehat",
    ).length;
    const kategoriPerhatian = data.kategori.filter(
        (k) => k.status !== "sehat",
    ).length;
    const statusTotal = STATUS_STYLE[data.statusUmum] ?? STATUS_STYLE.cukup;

    // Total bobot dipakai sebagai pembagi rata-rata tertimbang. Idealnya
    // selalu 100, tapi dihitung dinamis biar tetap benar walau ada
    // penyesuaian bobot di data (mis. saat kategori "Beta" belum ikut dibobotkan).
    const totalBobot = data.kategori.reduce((s, k) => s + k.bobot, 0) || 1;

    // Kontribusi tiap kategori ke skor total: skor kategori * bobotnya / total bobot.
    // Jumlah semua kontribusi ini = skorTotal (dibulatkan). Ini yang bikin
    // skorTotal bisa dicek manual, bukan angka yang muncul begitu saja.
    const kontribusiList = data.kategori.map((k) => ({
        ...k,
        kontribusi: (k.skor * k.bobot) / totalBobot,
    }));
    const totalKontribusiTerhitung = kontribusiList.reduce(
        (s, k) => s + k.kontribusi,
        0,
    );

    return (
        <div style={{ width: "100%" }}>
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
                        Analisis Kesehatan Usaha
                    </h2>
                    <p
                        style={{
                            margin: "2px 0 0",
                            fontSize: ringan ? 15 : 13,
                            color: "#64748b",
                        }}
                    >
                        {ringan
                            ? "Ringkasan sederhana untuk kemudahan presentasi."
                            : "Rincian lengkap beserta cara perhitungan tiap angka."}
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

            <div className="stat-grid">
                <StatWidget
                    tone="panen"
                    badge="Skor Kesehatan"
                    badgeIcon={<ShieldCheck size={12} />}
                    label="Kesehatan Koperasi"
                    value={data.skorTotal}
                    unit="/ 100"
                    progress={data.skorTotal}
                    icon={<ShieldCheck size={82} strokeWidth={1} />}
                    description={`Status umum: ${statusTotal.label}. Dihitung dari 7 aspek koperasi.`}
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Skor Kesehatan Koperasi",
                            value: `${data.skorTotal} / 100`,
                            desc: `Status umum koperasi saat ini: ${statusTotal.label}. Skor ini adalah rata-rata tertimbang dari Anggota, Simpanan, RAT, Gerai, Aset, Dokumen, serta Produk & Transaksi.`,
                        })
                    }
                />
                <StatWidget
                    tone="tumbuh"
                    badge="Tren naik"
                    badgeIcon={<TrendingUp size={12} />}
                    label="Aspek Sehat"
                    value={kategoriSehat}
                    unit={`dari ${data.kategori.length} aspek`}
                    progress={Math.round(
                        (kategoriSehat / data.kategori.length) * 100,
                    )}
                    icon={<CheckCircle2 size={82} strokeWidth={1} />}
                    description="Aspek koperasi dengan kondisi sudah baik."
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Aspek Sehat",
                            value: kategoriSehat,
                            desc: "Aspek koperasi (dari 7 yang dinilai) yang sudah berada di skor sehat.",
                        })
                    }
                />
                <StatWidget
                    tone="awas"
                    badge="Perlu aksi"
                    badgeIcon={<AlertTriangle size={12} />}
                    label="Perlu Perhatian"
                    value={kategoriPerhatian}
                    unit="aspek"
                    icon={<AlertTriangle size={82} strokeWidth={1} />}
                    description="Aspek yang butuh tindak lanjut pengurus koperasi."
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Aspek Perlu Perhatian",
                            value: kategoriPerhatian,
                            desc: "Aspek berstatus cukup atau kurang. Prioritaskan aspek dengan bobot terbesar dulu.",
                        })
                    }
                />
                <StatWidget
                    tone="kora"
                    badge="Kora Think"
                    badgeIcon={<Sparkles size={12} />}
                    label="Rekomendasi Aktif"
                    value={data.rekomendasi.length}
                    unit="saran"
                    icon={<Sparkles size={82} strokeWidth={1} />}
                    description="Langkah konkret dari AI untuk naikkan skor."
                    onClick={() =>
                        onOpenModal("stat", {
                            title: "Rekomendasi Aktif",
                            value: data.rekomendasi.length,
                            desc: "Jumlah rekomendasi aksi yang disiapkan Kora Think untuk koperasi ini.",
                        })
                    }
                />
            </div>

            {/* Panel formula: cuma muncul di mode Advance. Ini yang jadi
                "pertanggungjawaban" tiap angka -- user bisa lihat persis
                gimana skorTotal, rasio sehat, dan kontribusi tiap aspek dihitung. */}
            {!ringan && (
                <div
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                        overflow: "hidden",
                        marginBottom: "16px",
                    }}
                >
                    <button
                        onClick={() => setShowFormula((v) => !v)}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "10px 16px",
                            background: showFormula ? "#f0f9ff" : "#f8fafc",
                            border: "none",
                            borderBottom: showFormula
                                ? "1px solid #bae6fd"
                                : "none",
                            cursor: "pointer",
                        }}
                    >
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#0369a1",
                                textTransform: "uppercase",
                                letterSpacing: ".4px",
                            }}
                        >
                            <Info size={13} /> Cara angka ini dihitung
                        </span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                            {showFormula ? "Sembunyikan" : "Lihat detail"}
                        </span>
                    </button>
                    {showFormula && (
                        <div style={{ padding: "12px 16px", fontSize: 12.5 }}>
                            <p
                                style={{
                                    margin: "0 0 10px",
                                    color: "#475569",
                                    lineHeight: 1.6,
                                }}
                            >
                                <b>Skor Kesehatan Koperasi</b> = rata-rata
                                tertimbang skor tiap aspek, dengan bobot sebagai
                                penimbang:
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
                                    Σ (skor aspek × bobot%) ÷ Σ bobot%
                                </code>
                            </p>
                            <div style={{ overflowX: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        fontSize: 12,
                                        minWidth: 480,
                                    }}
                                >
                                    <thead>
                                        <tr style={{ color: "#94a3b8" }}>
                                            <th
                                                style={{
                                                    textAlign: "left",
                                                    padding: "4px 8px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Aspek
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "right",
                                                    padding: "4px 8px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Skor
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "right",
                                                    padding: "4px 8px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Bobot
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "right",
                                                    padding: "4px 8px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Kontribusi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kontribusiList.map((k) => (
                                            <tr
                                                key={k.key}
                                                style={{
                                                    borderTop:
                                                        "1px solid #f1f5f9",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: "4px 8px",
                                                        color: "#0f172a",
                                                    }}
                                                >
                                                    {k.label}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {k.skor}%
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {k.bobot}%
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "4px 8px",
                                                        textAlign: "right",
                                                        fontWeight: 700,
                                                        color: "#0369a1",
                                                    }}
                                                >
                                                    {k.kontribusi.toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr
                                            style={{
                                                borderTop: "2px solid #e2e8f0",
                                            }}
                                        >
                                            <td
                                                colSpan={3}
                                                style={{
                                                    padding: "6px 8px",
                                                    textAlign: "right",
                                                    fontWeight: 700,
                                                    color: "#0f172a",
                                                }}
                                            >
                                                Total (hasil hitung ulang)
                                            </td>
                                            <td
                                                style={{
                                                    padding: "6px 8px",
                                                    textAlign: "right",
                                                    fontWeight: 800,
                                                    color: "#0369a1",
                                                }}
                                            >
                                                {totalKontribusiTerhitung.toFixed(
                                                    1,
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p
                                style={{
                                    margin: "10px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 11,
                                    lineHeight: 1.5,
                                }}
                            >
                                Total hasil hitung ulang di atas seharusnya sama
                                (atau selisih tipis karena pembulatan) dengan
                                Skor Kesehatan Koperasi ({data.skorTotal}
                                ) yang tampil di kartu paling atas. Bila beda
                                jauh, cek ulang bobot atau skor sumber data.
                                <br />
                                <b>Aspek Sehat / Perlu Perhatian</b> dihitung
                                langsung dari status tiap aspek: status{" "}
                                <i>sehat</i> masuk hitungan "Aspek Sehat",
                                selain itu (<i>cukup</i>/<i>kurang</i>) masuk
                                "Perlu Perhatian" — bukan dari skor angka, murni
                                dari label status yang sudah ditentukan.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div
                style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    overflow: "hidden",
                    marginBottom: "16px",
                }}
            >
                <div
                    style={{
                        padding: "12px 16px",
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "6px",
                    }}
                >
                    <span
                        style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#0f172a",
                        }}
                    >
                        Rincian Kesehatan per Aspek
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Update terakhir: {data.terakhirDihitung}
                    </span>
                </div>
                <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ minWidth: ringan ? 480 : 780 }}>
                        {kontribusiList.map((row, i) => {
                            const Icon = KATEGORI_ICON[row.key] ?? Boxes;
                            const style =
                                STATUS_STYLE[row.status] ?? STATUS_STYLE.cukup;
                            return (
                                <div
                                    key={row.key}
                                    className="interactive-row"
                                    onClick={() =>
                                        onOpenModal("kesehatan_kategori", row)
                                    }
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: ringan
                                            ? "1.8fr 0.9fr 1fr"
                                            : "1.6fr 2fr 0.8fr 0.9fr 1fr",
                                        gap: "16px",
                                        padding: ringan ? "18px 16px" : "16px",
                                        borderBottom:
                                            i < kontribusiList.length - 1
                                                ? "1px solid #f1f5f9"
                                                : "none",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: "10px",
                                                background: style.bg,
                                                borderRadius: "8px",
                                                color: style.color,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: ringan
                                                        ? "16px"
                                                        : "14px",
                                                    fontWeight: "600",
                                                    color: "#0f172a",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                {row.label}
                                                {row.isBeta && (
                                                    <span
                                                        style={{
                                                            fontSize: "10px",
                                                            fontWeight: "700",
                                                            color: "#0284c7",
                                                            background:
                                                                "#e0f2fe",
                                                            padding: "2px 6px",
                                                            borderRadius:
                                                                "999px",
                                                        }}
                                                    >
                                                        Beta
                                                    </span>
                                                )}
                                            </div>
                                            {!ringan && (
                                                <span
                                                    style={{
                                                        fontSize: "11px",
                                                        color: "#94a3b8",
                                                    }}
                                                >
                                                    Bobot {row.bobot}% dari skor
                                                    total
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!ringan && (
                                        <div
                                            style={{
                                                fontSize: "13px",
                                                color: "#475569",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {row.catatan}
                                        </div>
                                    )}
                                    <div>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                color: style.color,
                                                background: style.bg,
                                                padding: "4px 10px",
                                                borderRadius: "999px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {style.label}
                                        </span>
                                    </div>
                                    {!ringan && (
                                        <div
                                            style={{
                                                textAlign: "right",
                                                fontSize: "12px",
                                                fontWeight: 700,
                                                color: "#0369a1",
                                            }}
                                            title="skor × bobot ÷ total bobot"
                                        >
                                            +{row.kontribusi.toFixed(1)}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: ringan ? "80px" : "60px",
                                                height: ringan ? "6px" : "4px",
                                                borderRadius: "2px",
                                                background: "#f1f5f9",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${row.skor}%`,
                                                    height: "100%",
                                                    background: style.color,
                                                }}
                                            ></div>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: ringan
                                                    ? "13px"
                                                    : "12px",
                                                color: "#64748b",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {row.skor}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {data.rekomendasi.length > 0 && (
                <div
                    style={{
                        border: "1px solid #bae6fd",
                        borderRadius: "8px",
                        backgroundColor: "#f0f9ff",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #bae6fd",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <Sparkles size={16} color="#0284c7" />
                        <span
                            style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#0369a1",
                            }}
                        >
                            Rekomendasi Kora Think untuk Naikkan Skor
                        </span>
                    </div>
                    <div style={{ padding: "8px 16px 16px" }}>
                        {data.rekomendasi.map((r, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    padding: "10px 0",
                                    borderBottom:
                                        i < data.rekomendasi.length - 1
                                            ? "1px dashed #bae6fd"
                                            : "none",
                                    fontSize: ringan ? "14.5px" : "13px",
                                    color: "#0c4a6e",
                                    lineHeight: "1.5",
                                }}
                            >
                                <CheckCircle2
                                    size={16}
                                    color="#0284c7"
                                    style={{
                                        flexShrink: 0,
                                        marginTop: "2px",
                                    }}
                                />
                                <span>{r}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Style kora-seg dipakai bareng di TabPetaPotensi.tsx. Diulang di
                sini supaya tab ini tetap tampil benar kalau di-render sendirian
                (mis. lazy-loaded per tab tanpa TabPetaPotensi ikut ter-mount). */}
            <style>{`
                .kora-seg { display:flex; gap:4px; background:#f1f5f9; padding:4px; border-radius:10px; flex-wrap:wrap; }
                .kora-seg button { border:none; background:transparent; cursor:pointer; padding:7px 12px; border-radius:7px; font-size:13px; font-weight:600; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }
                .kora-seg button.aktif { background:#fff; color:#0f172a; box-shadow:0 1px 2px rgba(0,0,0,.06); }
            `}</style>
        </div>
    );
}
