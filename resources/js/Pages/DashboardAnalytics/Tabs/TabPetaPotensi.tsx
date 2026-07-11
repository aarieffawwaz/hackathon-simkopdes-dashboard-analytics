import { useEffect, useMemo, useRef, useState } from "react";
import {
    Layers,
    Building2,
    Wheat,
    TrendingUp,
    TrendingDown,
    MapPin,
    MousePointerClick,
    CheckCircle2,
    Sparkles,
    Target,
    Home,
    Phone,
    Feather,
    Gauge,
    User,
    Tag,
    Info,
} from "lucide-react";
import { StatWidget } from "../Components/StatWidget";
import { DashboardProps, DesaPotensi } from "../type";

export const KELAS = [
    { min: 85, label: "Sangat tinggi", rgb: [30, 91, 101], hex: "#1e5b65" },
    { min: 70, label: "Tinggi", rgb: [43, 122, 134], hex: "#2b7a86" },
    { min: 55, label: "Menengah", rgb: [155, 186, 75], hex: "#9bba4b" },
    { min: 0, label: "Perlu dorongan", rgb: [245, 185, 49], hex: "#f5b931" },
] as const;

export const kelasDari = (skor: number) =>
    KELAS.find((k) => skor >= k.min) ?? KELAS[KELAS.length - 1];

function pusatDari(list: DesaPotensi[]): [number, number] {
    if (!list.length) return [117.0, -2.5];
    const lng = list.reduce((s, d) => s + d.lng, 0) / list.length;
    const lat = list.reduce((s, d) => s + d.lat, 0) / list.length;
    return [lng, lat];
}

/* =========================================================
   DUMMY DATA - Diikat kuat ke daratan desa (desaList)
   ========================================================= */
type JenisProgram = "mbg" | "faskes" | "dinsos";

const PROGRAM_META: Record<
    JenisProgram,
    { label: string; warna: string; warnaSoft: string }
> = {
    mbg: {
        label: "Makan Bergizi Gratis",
        warna: "#2563eb",
        warnaSoft: "#dbeafe",
    },
    faskes: {
        label: "Fasilitas Kesehatan",
        warna: "#16a34a",
        warnaSoft: "#dcfce7",
    },
    dinsos: { label: "Bantuan Sosial", warna: "#dc2626", warnaSoft: "#fee2e2" },
};

interface MarkerProgram {
    id: string;
    jenis: JenisProgram;
    nama: string;
    lat: number;
    lng: number;
    telp: string;
    kebutuhan: string;
    jarak: string;
}

function buatProgramDummy(desaList: DesaPotensi[]): MarkerProgram[] {
    if (!desaList.length) return [];
    const d1 = desaList[0];
    const d2 = desaList[Math.floor(desaList.length / 2)] || d1;
    const d3 = desaList[desaList.length - 1] || d1;

    return [
        {
            id: "mbg-1",
            jenis: "mbg",
            nama: "Dapur Umum MBG SDN 01",
            lng: d1.lng + 0.002,
            lat: d1.lat + 0.001,
            telp: "0821-2326-5167",
            kebutuhan: "Suplai harian 50 kg Bayam Organik & 30 kg Telur.",
            jarak: "1.2 km",
        },
        {
            id: "faskes-1",
            jenis: "faskes",
            nama: "Puskesmas Kecamatan",
            lng: d2.lng - 0.001,
            lat: d2.lat + 0.002,
            telp: "0856-9288-9159",
            kebutuhan: "Pengadaan 100 Box Jamu Herbal per bulan.",
            jarak: "2.5 km",
        },
        {
            id: "dinsos-1",
            jenis: "dinsos",
            nama: "Agen Bansos Desa Prioritas",
            lng: d3.lng + 0.001,
            lat: d3.lat - 0.001,
            telp: "0811-3334-5555",
            kebutuhan: "Bantuan Beras Premium 5 Ton.",
            jarak: "5.8 km",
        },
    ];
}

const KOMODITAS_KELAS = [
    {
        key: "sayuran",
        label: "Sayuran",
        hex: "#16a34a",
        kata: [
            "bayam",
            "kangkung",
            "sawi",
            "wortel",
            "kubis",
            "sayur",
            "cabai",
            "tomat",
        ],
    },
    {
        key: "padi",
        label: "Padi / Beras",
        hex: "#eab308",
        kata: ["padi", "beras", "gabah"],
    },
    {
        key: "buah",
        label: "Buah-buahan",
        hex: "#f97316",
        kata: [
            "mangga",
            "pisang",
            "jeruk",
            "salak",
            "durian",
            "buah",
            "melon",
            "semangka",
        ],
    },
    {
        key: "herbal",
        label: "Herbal / Jamu",
        hex: "#9333ea",
        kata: ["jahe", "kunyit", "temulawak", "herbal", "jamu", "empon"],
    },
    {
        key: "madu",
        label: "Madu / Ternak",
        hex: "#d97706",
        kata: ["madu", "lebah", "telur", "ayam", "ternak", "sapi", "kambing"],
    },
    { key: "lainnya", label: "Lainnya", hex: "#64748b", kata: [] },
] as const;

function kelasKomoditas(komoditas: string) {
    const s = (komoditas ?? "").toLowerCase();
    for (const k of KOMODITAS_KELAS) {
        if (k.kata.some((w) => s.includes(w))) return k;
    }
    return KOMODITAS_KELAS[KOMODITAS_KELAS.length - 1];
}

interface MarkerPetani {
    id: string;
    namaPetani: string;
    produk: string;
    harga: string;
    telp: string;
    lat: number;
    lng: number;
    warna: string;
    warnaSoft: string;
}

function buatPetaniDummy(desaList: DesaPotensi[]): MarkerPetani[] {
    const NAMA_DEPAN = [
        "Bapak Budi",
        "Ibu Sari",
        "Bapak Yanto",
        "Ibu Ratna",
        "Poktan Harapan",
        "Bapak Slamet",
    ];
    return desaList.map((d, i) => {
        const k = kelasKomoditas(d.komoditas);
        const hargaRandom = ((i % 5) + 2) * 4500;
        return {
            id: `petani-${i}`,
            namaPetani:
                NAMA_DEPAN[i % NAMA_DEPAN.length] +
                ` - Desa ${d.nama.split(" ")[0]}`,
            produk: `Panen ${d.komoditas}`,
            harga: `Rp ${hargaRandom.toLocaleString("id-ID")} / kg`,
            telp: `0812-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            lat: d.lat + (Math.random() * 0.001 - 0.0005),
            lng: d.lng + (Math.random() * 0.001 - 0.0005),
            warna: k.hex,
            warnaSoft: k.hex + "22",
        };
    });
}

export const AiTag = () => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #bbf7d0",
            color: "#16a34a",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            flexShrink: 0,
            textTransform: "uppercase",
        }}
    >
        <Sparkles size={12} color="#16a34a" /> Kora Think
    </span>
);

const TagWilayah = () => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            borderRadius: 999,
            background: "#ccfbf1",
            color: "#0d9488",
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
        }}
    >
        <Home size={10} /> Wilayah koperasi
    </span>
);

function SkorGauge({ skor, besar = false }: { skor: number; besar?: boolean }) {
    const kelas = kelasDari(skor);
    const size = besar ? 168 : 132;
    const r = besar ? 66 : 52;
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
                    strokeWidth={besar ? 14 : 11}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={kelas.hex}
                    strokeWidth={besar ? 14 : 11}
                    strokeLinecap="round"
                    strokeDasharray={`${terisi} ${2 * Math.PI * r}`}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dasharray 1s ease" }}
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
                        fontSize: besar ? 44 : 30,
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1,
                    }}
                >
                    {skor}
                </span>
                <span
                    style={{
                        fontSize: besar ? 14 : 11,
                        color: "#64748b",
                        marginTop: 2,
                    }}
                >
                    dari 100
                </span>
            </div>
        </div>
    );
}

function BarisIndikator({
    label,
    nilai,
    maks,
    warna,
    satuan,
    besar = false,
}: {
    label: string;
    nilai: number;
    maks: number;
    warna: string;
    satuan?: string;
    besar?: boolean;
}) {
    const persen = maks ? Math.min((nilai / maks) * 100, 100) : 0;
    return (
        <div style={{ marginBottom: besar ? 18 : 12 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                }}
            >
                <span style={{ fontSize: besar ? 15 : 12, color: "#64748b" }}>
                    {label}
                </span>
                <span
                    style={{
                        fontSize: besar ? 15 : 12,
                        fontWeight: 700,
                        color: warna,
                    }}
                >
                    {nilai.toLocaleString("id-ID")}
                    {satuan && (
                        <span
                            style={{
                                fontWeight: 500,
                                color: "#94a3b8",
                                marginLeft: 3,
                            }}
                        >
                            {satuan}
                        </span>
                    )}
                </span>
            </div>
            <div
                style={{
                    height: besar ? 10 : 6,
                    borderRadius: 5,
                    background: "#f1f5f9",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${persen}%`,
                        height: "100%",
                        background: warna,
                        borderRadius: 5,
                        transition: "width 0.8s ease",
                    }}
                />
            </div>
            {besar && (
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {Math.round(persen)}% dari total skala maksimal
                </span>
            )}
        </div>
    );
}

type ModePeta = "potensi" | "program" | "komoditas";
type Tingkat = "ringan" | "advance";

export default function TabPetaPotensi({
    data,
    onOpenModal,
    wilayah = "Koperasi Desa Merah Putih",
}: {
    data: DashboardProps["petaPotensi"];
    onOpenModal: (type: string, data: any) => void;
    wilayah?: string;
}) {
    const desaList = data.desaList;
    const [lngPusat, latPusat] =
        data.pusat?.lng != null && data.pusat?.lat != null
            ? [data.pusat.lng, data.pusat.lat]
            : pusatDari(desaList);

    // Zoom diperdekat agar bar kecil terlihat
    const ZOOM_DEKAT = 12.8;

    const wadahRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const overlayRef = useRef<any>(null);
    const markerRef = useRef<any[]>([]);
    const siapRef = useRef(false);

    const [mode, setMode] = useState<ModePeta>("potensi");
    const [tingkat, setTingkat] = useState<Tingkat>("advance");
    const [terpilih, setTerpilih] = useState<DesaPotensi | null>(null);
    const [petaSiap, setPetaSiap] = useState(false);
    const [showInfoAlgoritma, setShowInfoAlgoritma] = useState(false);
    // Khusus mode "potensi": true selama fase reveal globe (sebelum kamera
    // mendarat). Selama ini titik native MapLibre yang tampil (aman di globe).
    // Begitu kamera landing, dimatikan -> baru batang 3D deck.gl dirender,
    // karena batang 3D cuma akurat posisinya di proyeksi mercator.
    const [globePotensi, setGlobePotensi] = useState(true);

    const [programAktif, setProgramAktif] = useState<MarkerProgram | null>(
        null,
    );
    const [petaniAktif, setPetaniAktif] = useState<MarkerPetani | null>(null);
    const [pesanGagal, setPesanGagal] = useState<string | null>(null);

    const ringan = tingkat === "ringan";

    const programList = useMemo(() => buatProgramDummy(desaList), [desaList]);
    const petaniList = useMemo(() => buatPetaniDummy(desaList), [desaList]);

    const geojson = useMemo(
        () => ({
            type: "FeatureCollection",
            features: desaList.map((d) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [d.lng, d.lat] },
                properties: {
                    nama: d.nama,
                    skor: d.skorPotensi,
                    warnaKomoditas: kelasKomoditas(d.komoditas).hex,
                },
            })),
        }),
        [desaList],
    );

    const ringkasan = useMemo(() => {
        if (!desaList.length)
            return {
                skorRata: 0,
                totalSkorDesa: 0,
                tertinggi: null as DesaPotensi | null,
                komoditasDominan: "—",
                totalProduksi: 0,
                totalKebutuhan: 0,
                jumlahTinggi: 0,
            };
        const totalSkorDesa = desaList.reduce((s, d) => s + d.skorPotensi, 0);
        const skorRata = Math.round(totalSkorDesa / desaList.length);
        const tertinggi = desaList.reduce((a, b) =>
            b.skorPotensi > a.skorPotensi ? b : a,
        );
        const hitung = new Map<string, number>();
        desaList.forEach((d) =>
            d.komoditas.split(",").forEach((k) => {
                const tr = k.trim();
                if (tr) hitung.set(tr, (hitung.get(tr) ?? 0) + 1);
            }),
        );
        const komoditasDominan =
            [...hitung.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

        return {
            skorRata,
            totalSkorDesa,
            tertinggi,
            komoditasDominan,
            totalProduksi: desaList.reduce(
                (s, d) => s + (d.produksiTon ?? 0),
                0,
            ),
            totalKebutuhan: desaList.reduce(
                (s, d) => s + (d.kebutuhanPasar ?? 0),
                0,
            ),
            jumlahTinggi: desaList.filter((d) => d.skorPotensi >= 70).length,
        };
    }, [desaList]);

    const selisih = ringkasan.totalProduksi - ringkasan.totalKebutuhan;
    const punyaDataProduksi =
        ringkasan.totalProduksi > 0 || ringkasan.totalKebutuhan > 0;
    const rasioProduksi = ringkasan.totalKebutuhan
        ? Math.round((ringkasan.totalProduksi / ringkasan.totalKebutuhan) * 100)
        : 0;
    const persenTinggi = desaList.length
        ? Math.round((ringkasan.jumlahTinggi / desaList.length) * 100)
        : 0;
    const rasioKecocokan = data.stats.desaTerpetakan
        ? Math.round(
              (data.stats.kecocokanTinggi / data.stats.desaTerpetakan) * 100,
          )
        : 0;

    const sebaranKomoditas = useMemo(() => {
        const peta = new Map<string, number>();
        desaList.forEach((d) => {
            const k = kelasKomoditas(d.komoditas);
            peta.set(k.key, (peta.get(k.key) ?? 0) + 1);
        });
        return KOMODITAS_KELAS.map((k) => ({
            ...k,
            jumlah: peta.get(k.key) ?? 0,
        })).filter((k) => k.jumlah > 0);
    }, [desaList]);

    const narasi = (() => {
        if (!desaList.length)
            return `Belum ada desa dengan koordinat tercatat di wilayah ${wilayah}.`;
        const bagian = [
            `Dari ${desaList.length} desa terpetakan, ${ringkasan.jumlahTinggi} desa (${persenTinggi}%) memiliki daya dukung suplai sangat mumpuni (skor ≥70).`,
            `Lanskap pertanian didominasi oleh ${ringkasan.komoditasDominan}.`,
        ];
        if (punyaDataProduksi) {
            bagian.push(
                selisih >= 0
                    ? `Secara agregat, produksi lokal surplus ${selisih.toLocaleString("id-ID")} ton, mencakup ${rasioProduksi}% dari permintaan program sekitar, membuka ruang untuk ekspansi ke pasar luar wilayah.`
                    : `Sayangnya, produksi total masih defisit ${Math.abs(selisih).toLocaleString("id-ID")} ton. Petani lokal baru mampu menyokong ${rasioProduksi}% permintaan program buyer yang ada.`,
            );
        }
        if (ringkasan.tertinggi)
            bagian.push(
                `${ringkasan.tertinggi.nama} adalah episentrum utama dengan skor puncak ${ringkasan.tertinggi.skorPotensi}.`,
            );
        return bagian.join(" ");
    })();

    useEffect(() => {
        const ML = (window as any).maplibregl;
        const DECK = (window as any).deck;
        if (!wadahRef.current || !ML || !DECK) return;

        let map: any;
        let resizeObserver: ResizeObserver | null = null;
        const bisaGlobe =
            typeof ML.Map?.prototype?.setProjection === "function";
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        try {
            // Sama seperti kode lama: kalau device minta reduced motion,
            // langsung mendarat di lokasi tanpa animasi terbang.
            map = new ML.Map({
                container: wadahRef.current,
                style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
                center:
                    reduced || !bisaGlobe
                        ? [lngPusat, latPusat]
                        : [117.0, -2.5],
                zoom: reduced || !bisaGlobe ? ZOOM_DEKAT : 2.6,
                pitch: reduced || !bisaGlobe ? 52 : 0,
                bearing: reduced || !bisaGlobe ? -18 : 0,
            });

            map.addControl(
                new ML.NavigationControl({ visualizePitch: true }),
                "top-right",
            );

            const overlay = new DECK.MapboxOverlay({
                interleaved: false,
                layers: [],
                getTooltip: ({ object }: any) =>
                    object && {
                        html: `<div style="font-family:Inter,sans-serif;padding:2px 4px"><strong style="font-size:12px">${object.nama}</strong><br/><span style="font-size:11px">Skor ${object.skorPotensi}/100</span></div>`,
                        style: {
                            background: "#0f172a",
                            color: "#fff",
                            borderRadius: "6px",
                        },
                    },
            });
            map.addControl(overlay);

            // Fix "gap putih" di bawah peta: canvas MapLibre cuma di-size
            // sekali saat inisialisasi. Kalau kontainernya berubah ukuran
            // belakangan (resize window, toggle Ringan/Advance yang
            // menyembunyikan stat-grid, buka sidebar, dsb), canvas TIDAK
            // otomatis ikut menyesuaikan -> makanya muncul area kosong.
            // ResizeObserver di sini memaksa map.resize() tiap kali ukuran
            // kontainer berubah, jadi canvas selalu pas menutupi kontainernya.
            if (typeof ResizeObserver !== "undefined" && wadahRef.current) {
                resizeObserver = new ResizeObserver(() => {
                    requestAnimationFrame(() => map?.resize());
                });
                resizeObserver.observe(wadahRef.current);
            }

            map.on("load", () => {
                siapRef.current = true;

                map.addSource("desa-source", {
                    type: "geojson",
                    data: geojson,
                });

                // Titik native MapLibre khusus fase reveal (globe). Titik ini
                // AMAN dipakai di proyeksi globe karena MapLibre yang render
                // langsung, bukan deck.gl. Warnanya sudah mengikuti skala
                // skor yang sama dengan batang 3D nanti (lihat KELAS).
                map.addLayer({
                    id: "desa-titik",
                    type: "circle",
                    source: "desa-source",
                    layout: { visibility: "none" },
                    paint: {
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            2,
                            3.5,
                            8,
                            7,
                        ],
                        "circle-color": [
                            "step",
                            ["get", "skor"],
                            "#f5b931",
                            55,
                            "#9bba4b",
                            70,
                            "#2b7a86",
                            85,
                            "#1e5b65",
                        ],
                        "circle-stroke-width": 1.5,
                        "circle-stroke-color": "#ffffff",
                    },
                });

                map.addLayer({
                    id: "desa-komoditas-area",
                    type: "circle",
                    source: "desa-source",
                    layout: { visibility: "none" },
                    paint: {
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            8,
                            10,
                            11.5,
                            45,
                            14,
                            120,
                        ],
                        "circle-color": ["get", "warnaKomoditas"],
                        "circle-opacity": 0.4,
                        "circle-blur": 0.4,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": ["get", "warnaKomoditas"],
                    },
                });

                // Paksa satu resize begitu peta selesai load, buat jaga-jaga
                // kalau kontainer sudah punya ukuran final berbeda dari saat
                // konstruktor Map dipanggil pertama kali (mis. transisi tab).
                requestAnimationFrame(() => map.resize());

                if (reduced || !bisaGlobe) {
                    // Tanpa animasi: langsung mercator, langsung siap.
                    setGlobePotensi(false);
                    setPetaSiap(true);
                    return;
                }

                // Fase 1: perlihatkan bumi (globe) dulu supaya titik desa
                // tidak salah tempat, karena batang 3D deck.gl belum boleh
                // dirender selama proyeksi masih globe.
                map.setProjection({ type: "globe" });
                setPetaSiap(true); // titik native sudah boleh tampil dari sini

                // Fase 2: terbang turun ke wilayah koperasi.
                map.flyTo({
                    center: [lngPusat, latPusat],
                    zoom: ZOOM_DEKAT,
                    pitch: 52,
                    bearing: -18,
                    speed: 0.8,
                    curve: 1.5,
                    duration: 3500,
                    essential: true,
                });

                // Fase 3: begitu kamera mendarat, baru pindah ke mercator dan
                // nyalakan batang 3D deck.gl -- di titik ini posisinya sudah
                // pasti presisi, tidak akan cacat/geser.
                map.once("moveend", () => {
                    map.setProjection({ type: "mercator" });
                    setGlobePotensi(false);
                });
            });

            mapRef.current = map;
            overlayRef.current = overlay;
        } catch (err) {
            setPesanGagal("Peta gagal diinisialisasi.");
        }

        return () => {
            siapRef.current = false;
            setPetaSiap(false);
            setGlobePotensi(true);
            resizeObserver?.disconnect();
            markerRef.current.forEach((m) => m.remove());
            map?.remove();
        };
    }, [desaList, lngPusat, latPusat, geojson]);

    // Layout berubah setiap kali toggle Ringan/Advance (stat-grid ikut
    // muncul/hilang) atau ganti mode peta (legend/pesan berubah tinggi).
    // ResizeObserver di atas menangani perubahan ukuran kontainer secara
    // umum, tapi transisi CSS butuh sedikit jeda sebelum ukuran final
    // stabil -- makanya di-resize sekali lagi setelah transisi selesai
    // supaya tidak ada gap putih tersisa di bawah peta.
    useEffect(() => {
        if (!petaSiap) return;
        const t = setTimeout(() => mapRef.current?.resize(), 260);
        return () => clearTimeout(t);
    }, [ringan, mode, petaSiap]);

    useEffect(() => {
        const map = mapRef.current;
        const overlay = overlayRef.current;
        const DECK = (window as any).deck;
        const ML = (window as any).maplibregl;
        if (!map || !overlay || !DECK || !petaSiap) return;

        markerRef.current.forEach((m) => m.remove());
        markerRef.current = [];
        setProgramAktif(null);
        setPetaniAktif(null);

        // Selama fase reveal globe (potensi, belum landing) kamera sudah
        // dikendalikan oleh flyTo bawaan -- jangan tabrak dengan easeTo lain.
        const sedangReveal = mode === "potensi" && globePotensi;
        if (!sedangReveal) {
            if (mode === "potensi") {
                map.easeTo({ pitch: 52, bearing: -18, duration: 1200 }); // Miring 3D
            } else {
                map.easeTo({ pitch: 0, bearing: 0, duration: 1200 }); // Tegak Lurus / Flat
            }
        }

        if (map.getLayer("desa-komoditas-area")) {
            map.setLayoutProperty(
                "desa-komoditas-area",
                "visibility",
                mode === "komoditas" ? "visible" : "none",
            );
        }

        // Titik native cuma tampil selagi masih fase reveal globe di mode
        // potensi. Begitu landing (globePotensi=false) titik ini disembunyikan
        // dan digantikan batang 3D deck.gl yang sudah presisi.
        if (map.getLayer("desa-titik")) {
            map.setLayoutProperty(
                "desa-titik",
                "visibility",
                sedangReveal ? "visible" : "none",
            );
        }

        overlay.setProps({
            layers:
                mode === "potensi" && !globePotensi
                    ? [
                          new DECK.ColumnLayer({
                              id: "potensi-desa",
                              data: desaList,
                              diskResolution: 6,
                              radius: 350, // Dikecilkan sedikit agar bar lebih tajam saat didekati
                              extruded: true,
                              pickable: true,
                              autoHighlight: true,
                              highlightColor: [245, 185, 49, 230],
                              elevationScale: 90,
                              getPosition: (d: DesaPotensi) => [d.lng, d.lat],
                              getElevation: (d: DesaPotensi) => d.skorPotensi,
                              getFillColor: (d: DesaPotensi) => [
                                  ...kelasDari(d.skorPotensi).rgb,
                                  d.milikKoperasi ? 255 : 190,
                              ],
                              onClick: ({ object }: any) => {
                                  if (object)
                                      setTerpilih(object as DesaPotensi);
                              },
                          }),
                      ]
                    : [],
        });

        if (ML) {
            if (mode === "program") {
                programList.forEach((p) => {
                    const el = document.createElement("div");
                    el.className = "kora-breathe-pin";
                    el.innerHTML = `<span class="kora-breathe-ring" style="background:${PROGRAM_META[p.jenis].warna}"></span><span class="kora-breathe-dot" style="background:${PROGRAM_META[p.jenis].warna}"></span>`;
                    el.style.cursor = "pointer";
                    el.addEventListener("mouseenter", () => setProgramAktif(p));
                    el.addEventListener("click", () => setProgramAktif(p));
                    markerRef.current.push(
                        new ML.Marker({ element: el })
                            .setLngLat([p.lng, p.lat])
                            .addTo(map),
                    );
                });
            } else if (mode === "komoditas") {
                petaniList.forEach((p) => {
                    const el = document.createElement("div");
                    el.className = "kora-farmer-pin";
                    el.innerHTML = `<div style="width: 14px; height: 14px; background: ${p.warna}; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5);"></div>`;
                    el.style.cursor = "pointer";
                    el.addEventListener("mouseenter", () => setPetaniAktif(p));
                    el.addEventListener("click", () => setPetaniAktif(p));
                    markerRef.current.push(
                        new ML.Marker({ element: el })
                            .setLngLat([p.lng, p.lat])
                            .addTo(map),
                    );
                });
            }
        }
    }, [mode, desaList, programList, petaniList, petaSiap, globePotensi]);

    const sorotDesa = (d: DesaPotensi) => {
        setTerpilih(d);
        if (mode !== "potensi") setMode("potensi");
        mapRef.current?.flyTo({
            center: [d.lng, d.lat],
            zoom: 14, // Lebih dalam lagi saat spesifik menyorot satu desa
            pitch: 55,
            bearing: -18,
            curve: 1.5,
            duration: 2000,
            essential: true,
        });
    };

    return (
        <div style={{ width: "100%" }}>
            <style>{`
                .kora-breathe-pin { position: relative; width: 20px; height: 20px; }
                .kora-breathe-dot { position: absolute; inset: 5px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.35); }
                .kora-breathe-ring { position: absolute; inset: 0; border-radius: 50%; opacity: .5; animation: koraBreathe 1.8s ease-out infinite; }
                .kora-farmer-pin { transition: transform 0.2s; }
                .kora-farmer-pin:hover { transform: scale(1.4); z-index: 10; }
                @keyframes koraBreathe { 0% { transform: scale(0.6); opacity: .55; } 70% { transform: scale(2.2); opacity: 0; } 100% { transform: scale(2.2); opacity: 0; } }
                .kora-seg { display:flex; gap:4px; background:#f1f5f9; padding:4px; border-radius:10px; flex-wrap:wrap; }
                .kora-seg button { border:none; background:transparent; cursor:pointer; padding:7px 12px; border-radius:7px; font-size:13px; font-weight:600; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }
                .kora-seg button.aktif { background:#fff; color:#0f172a; box-shadow:0 1px 2px rgba(0,0,0,.06); }
            `}</style>

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
                        Peta Potensi Wilayah
                    </h2>
                    <p
                        style={{
                            margin: "2px 0 0",
                            fontSize: ringan ? 15 : 13,
                            color: "#64748b",
                        }}
                    >
                        {ringan
                            ? "Tampilan sederhana untuk kemudahan presentasi."
                            : "Tampilan data lengkap dengan perhitungan algoritma AI."}
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

            {/* Kartu Statistik Atas (Ditampilkan penuh dengan penjelasan logis di mode Advance) */}
            {!ringan && (
                <div className="stat-grid" key="stats-q2">
                    <StatWidget
                        tone="tumbuh"
                        badge="Terpetakan"
                        badgeIcon={<MapPin size={12} />}
                        label="Titik Terpetakan"
                        value={data.stats.desaTerpetakan}
                        unit="desa"
                        icon={<MapPin size={82} strokeWidth={1} />}
                        description="Data lokasi divalidasi geospasial."
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Titik Terpetakan",
                                value: data.stats.desaTerpetakan,
                                desc: "Sistem telah berhasil melakukan geocoding pada titik desa ini. Desa yang masuk dalam angka ini dipastikan memiliki batas koordinat yang valid dan siap dilakukan analisis topologi lahan.",
                            })
                        }
                    />
                    <StatWidget
                        tone="panen"
                        badge="Komoditas"
                        badgeIcon={<Wheat size={12} />}
                        label="Potensi Terdeteksi"
                        value={data.stats.potensiTeridentifikasi}
                        unit="titik"
                        icon={<Target size={82} strokeWidth={1} />}
                        description="Fokus komoditas unggulan utama."
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Potensi Terdeteksi",
                                value: data.stats.potensiTeridentifikasi,
                                desc: "Titik ini mencerminkan komoditas primer yang paling berharga secara ekonomi di tiap wilayah berdasarkan volume historis dan kecocokan agroklimatologi.",
                            })
                        }
                    />
                    <StatWidget
                        tone="kora"
                        badge="Siap match"
                        badgeIcon={<CheckCircle2 size={12} />}
                        label="Kecocokan Tinggi"
                        value={data.stats.kecocokanTinggi}
                        unit={`dari ${data.stats.desaTerpetakan}`}
                        progress={rasioKecocokan}
                        icon={<CheckCircle2 size={82} strokeWidth={1} />}
                        description={`Rasio integrasi buyer mencapai ${rasioKecocokan}%.`}
                        onClick={() =>
                            onOpenModal("stat", {
                                title: "Kecocokan Tinggi",
                                value: data.stats.kecocokanTinggi,
                                desc: `Terdapat ${data.stats.kecocokanTinggi} dari total ${data.stats.desaTerpetakan} desa yang mendapatkan skor kecocokan lebih dari 70. Ini berarti ${rasioKecocokan}% suplai desa ini sangat siap, konsisten, dan memenuhi standar spesifikasi buyer atau program pemerintah (MBG).`,
                            })
                        }
                    />
                </div>
            )}

            <div className="pd-grid">
                {/* ---------------- PETA ---------------- */}
                <div
                    className="pd-card"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                    }}
                >
                    <div
                        className="pd-head"
                        style={{ flexWrap: "wrap", gap: 10 }}
                    >
                        <span className="pd-title">
                            <Layers size={15} color="#1e5b65" /> Peta Interaktif
                        </span>
                        <div className="kora-seg" role="tablist">
                            <button
                                className={mode === "potensi" ? "aktif" : ""}
                                onClick={() => setMode("potensi")}
                            >
                                <Target size={14} /> Potensi
                            </button>
                            <button
                                className={mode === "program" ? "aktif" : ""}
                                onClick={() => setMode("program")}
                            >
                                <Building2 size={14} /> Program
                            </button>
                            <button
                                className={mode === "komoditas" ? "aktif" : ""}
                                onClick={() => setMode("komoditas")}
                            >
                                <User size={14} /> Petani
                            </button>
                        </div>
                    </div>

                    {/* Tambahan style inline (flex:1 + minHeight:0) supaya
                        kontainer peta selalu mengambil sisa tinggi kartu, apa
                        pun ukuran layar/transisi tab-nya. Ini pasangan dari
                        ResizeObserver di atas: kontainer dijamin punya ukuran
                        yang benar, lalu map.resize() bikin canvas ikut pas
                        -- jadi tidak ada lagi gap putih di bawah peta. */}
                    <div
                        className="pd-map"
                        style={{
                            position: "relative",
                            flex: "1 1 auto",
                            minHeight: 0,
                            overflow: "hidden",
                        }}
                    >
                        {pesanGagal ? (
                            <div className="pd-fallback">{pesanGagal}</div>
                        ) : (
                            <>
                                <div
                                    ref={wadahRef}
                                    style={{ position: "absolute", inset: 0 }}
                                />

                                <div className="pd-legend">
                                    {mode === "potensi" && (
                                        <>
                                            <strong style={legendJudul}>
                                                Skor potensi 3D
                                            </strong>
                                            {KELAS.map((k) => (
                                                <div
                                                    key={k.label}
                                                    className="pd-legend-row"
                                                >
                                                    <span
                                                        className="pd-swatch"
                                                        style={{
                                                            background: k.hex,
                                                        }}
                                                    />
                                                    {k.label} ({k.min}+)
                                                </div>
                                            ))}
                                            <p
                                                style={{
                                                    margin: "8px 0 0",
                                                    fontSize: 10,
                                                    color: "#94a3b8",
                                                    maxWidth: 150,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                Tinggi bar menyesuaikan
                                                peringkat persentil skor desa.
                                            </p>
                                        </>
                                    )}
                                    {mode === "program" && (
                                        <>
                                            <strong style={legendJudul}>
                                                Program pemerintah
                                            </strong>
                                            {(
                                                Object.keys(
                                                    PROGRAM_META,
                                                ) as JenisProgram[]
                                            ).map((j) => (
                                                <div
                                                    key={j}
                                                    className="pd-legend-row"
                                                >
                                                    <span
                                                        className="pd-swatch"
                                                        style={{
                                                            background:
                                                                PROGRAM_META[j]
                                                                    .warna,
                                                        }}
                                                    />
                                                    {PROGRAM_META[j].label}
                                                </div>
                                            ))}
                                            <p
                                                style={{
                                                    margin: "8px 0 0",
                                                    fontSize: 10,
                                                    color: "#94a3b8",
                                                    maxWidth: 150,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                Peta merata (flat). Titik
                                                melambangkan instansi program
                                                MBG/Sosial terdekat.
                                            </p>
                                        </>
                                    )}
                                    {mode === "komoditas" && (
                                        <>
                                            <strong style={legendJudul}>
                                                Data Panen Petani
                                            </strong>
                                            {(sebaranKomoditas.length
                                                ? sebaranKomoditas
                                                : KOMODITAS_KELAS
                                            ).map((k) => (
                                                <div
                                                    key={k.key}
                                                    className="pd-legend-row"
                                                >
                                                    <span
                                                        className="pd-swatch"
                                                        style={{
                                                            background: k.hex,
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                    {k.label}
                                                </div>
                                            ))}
                                            <p
                                                style={{
                                                    margin: "8px 0 0",
                                                    fontSize: 10,
                                                    color: "#94a3b8",
                                                    maxWidth: 150,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                Klik titik data petani untuk
                                                melihat kontak langsung dan
                                                penawaran panen.
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Popup Program */}
                                {mode === "program" && programAktif && (
                                    <PopupCard
                                        iconBg={
                                            PROGRAM_META[programAktif.jenis]
                                                .warnaSoft
                                        }
                                        iconColor={
                                            PROGRAM_META[programAktif.jenis]
                                                .warna
                                        }
                                        title={programAktif.nama}
                                        subtitle={`${PROGRAM_META[programAktif.jenis].label} • ${programAktif.jarak}`}
                                    >
                                        <div
                                            style={{
                                                background: "#fff1f2",
                                                border: "1px solid #fecdd3",
                                                borderLeft: "4px solid #f43f5e",
                                                borderRadius: 8,
                                                padding: "8px 10px",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    color: "#e11d48",
                                                    letterSpacing: ".05em",
                                                }}
                                            >
                                                Kebutuhan Suplai
                                            </span>
                                            <p
                                                style={{
                                                    margin: "2px 0 0",
                                                    fontSize: 12.5,
                                                    fontWeight: 600,
                                                    color: "#9f1239",
                                                }}
                                            >
                                                {programAktif.kebutuhan}
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#334155",
                                            }}
                                        >
                                            <Phone size={14} />
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {programAktif.telp}
                                            </span>
                                        </div>
                                    </PopupCard>
                                )}

                                {/* Popup Petani */}
                                {mode === "komoditas" && petaniAktif && (
                                    <PopupCard
                                        iconBg={petaniAktif.warnaSoft}
                                        iconColor={petaniAktif.warna}
                                        title={petaniAktif.namaPetani}
                                        subtitle={petaniAktif.produk}
                                    >
                                        <div
                                            style={{
                                                background: "#f8fafc",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 8,
                                                padding: "8px 10px",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    color: "#0f172a",
                                                }}
                                            >
                                                <Tag
                                                    size={14}
                                                    color={petaniAktif.warna}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {petaniAktif.harga}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#334155",
                                            }}
                                        >
                                            <Phone size={14} />
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {petaniAktif.telp}
                                            </span>
                                        </div>
                                    </PopupCard>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ---------------- PANEL KANAN ---------------- */}
                <div className="pd-card">
                    <div className="pd-head">
                        <span className="pd-title">{wilayah}</span>
                        <AiTag />
                    </div>
                    <div className="pd-panel">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                flexWrap: ringan ? "wrap" : "nowrap",
                            }}
                        >
                            <SkorGauge
                                skor={ringkasan.skorRata}
                                besar={ringan}
                            />
                            <div style={{ minWidth: 0 }}>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                        fontSize: ringan ? 14 : 11,
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        letterSpacing: ".4px",
                                        fontWeight: 700,
                                        position: "relative",
                                    }}
                                >
                                    Skor Rata-rata Wilayah
                                    {!ringan && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowInfoAlgoritma((v) => !v)
                                            }
                                            title="Cara AI membaca angka ini"
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: 16,
                                                height: 16,
                                                borderRadius: "50%",
                                                border: "none",
                                                background: showInfoAlgoritma
                                                    ? "#1e5b65"
                                                    : "#e2e8f0",
                                                color: showInfoAlgoritma
                                                    ? "#fff"
                                                    : "#64748b",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                                padding: 0,
                                                transition: "all .15s",
                                            }}
                                        >
                                            <Info size={11} />
                                        </button>
                                    )}
                                    {showInfoAlgoritma && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 8px)",
                                                left: 0,
                                                zIndex: 6,
                                                width: 320,
                                                maxWidth: "85vw",
                                                background: "#fff",
                                                border: "1px solid #e2e8f0",
                                                boxShadow:
                                                    "0 8px 30px rgba(15,23,42,.14)",
                                                borderRadius: 10,
                                                padding: 12,
                                                textTransform: "none",
                                                letterSpacing: "normal",
                                                fontWeight: 400,
                                                cursor: "default",
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <strong
                                                style={{
                                                    fontSize: 11,
                                                    color: "#475569",
                                                    textTransform: "uppercase",
                                                    letterSpacing: ".4px",
                                                }}
                                            >
                                                Cara angka ini dihitung
                                            </strong>
                                            <ul
                                                style={{
                                                    margin: "8px 0 0",
                                                    paddingLeft: 16,
                                                    fontSize: 12,
                                                    color: "#64748b",
                                                    lineHeight: 1.7,
                                                }}
                                            >
                                                <li>
                                                    <b>Skor potensi</b> (0–100)
                                                    per desa: indikator
                                                    persentil keekonomisan desa
                                                    terhadap rata-rata nasional.
                                                    Ambang kelasnya di ≥85
                                                    "Sangat tinggi", ≥70
                                                    "Tinggi", ≥55 "Menengah",
                                                    sisanya "Perlu dorongan".
                                                </li>
                                                <li>
                                                    <b>
                                                        Skor Rata-rata Wilayah (
                                                        {ringkasan.skorRata})
                                                    </b>
                                                    : rata-rata sederhana (bukan
                                                    tertimbang) dari semua desa
                                                    terpetakan.
                                                    <br />
                                                    <code
                                                        style={{
                                                            background:
                                                                "#f1f5f9",
                                                            padding: "2px 6px",
                                                            borderRadius: 4,
                                                            display:
                                                                "inline-block",
                                                            marginTop: 3,
                                                        }}
                                                    >
                                                        {
                                                            ringkasan.totalSkorDesa
                                                        }{" "}
                                                        (total skor) ÷{" "}
                                                        {desaList.length} desa ={" "}
                                                        {ringkasan.skorRata}
                                                    </code>
                                                </li>
                                                <li>
                                                    <b>
                                                        Desa skor tinggi (
                                                        {persenTinggi}%)
                                                    </b>
                                                    : jumlah desa dengan skor
                                                    potensi ≥70 dibagi total
                                                    desa terpetakan.
                                                    <br />
                                                    <code
                                                        style={{
                                                            background:
                                                                "#f1f5f9",
                                                            padding: "2px 6px",
                                                            borderRadius: 4,
                                                            display:
                                                                "inline-block",
                                                            marginTop: 3,
                                                        }}
                                                    >
                                                        {ringkasan.jumlahTinggi}{" "}
                                                        ÷ {desaList.length} ×
                                                        100 = {persenTinggi}%
                                                    </code>
                                                </li>
                                                {punyaDataProduksi && (
                                                    <li>
                                                        <b>
                                                            Rasio suplai (
                                                            {rasioProduksi}%)
                                                        </b>
                                                        : Total Produksi ÷ Total
                                                        Kebutuhan Buyer. Di atas
                                                        100% = surplus.
                                                        <br />
                                                        <code
                                                            style={{
                                                                background:
                                                                    "#f1f5f9",
                                                                padding:
                                                                    "2px 6px",
                                                                borderRadius: 4,
                                                                display:
                                                                    "inline-block",
                                                                marginTop: 3,
                                                            }}
                                                        >
                                                            {ringkasan.totalProduksi.toLocaleString(
                                                                "id-ID",
                                                            )}{" "}
                                                            ÷{" "}
                                                            {ringkasan.totalKebutuhan.toLocaleString(
                                                                "id-ID",
                                                            )}{" "}
                                                            × 100 ={" "}
                                                            {rasioProduksi}%
                                                        </code>
                                                    </li>
                                                )}
                                                <li>
                                                    <b>
                                                        Kecocokan Tinggi (
                                                        {rasioKecocokan}%)
                                                    </b>
                                                    : metrik ini{" "}
                                                    <i>dihitung di backend</i>,
                                                    bukan dari desaList yang
                                                    tampil di peta. Rumusnya
                                                    tetap rasio sederhana:
                                                    <br />
                                                    <code
                                                        style={{
                                                            background:
                                                                "#f1f5f9",
                                                            padding: "2px 6px",
                                                            borderRadius: 4,
                                                            display:
                                                                "inline-block",
                                                            marginTop: 3,
                                                        }}
                                                    >
                                                        {
                                                            data.stats
                                                                .kecocokanTinggi
                                                        }{" "}
                                                        ÷{" "}
                                                        {
                                                            data.stats
                                                                .desaTerpetakan
                                                        }{" "}
                                                        × 100 = {rasioKecocokan}
                                                        %
                                                    </code>
                                                    <br />
                                                    <span
                                                        style={{
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        Catatan:{" "}
                                                        {
                                                            data.stats
                                                                .desaTerpetakan
                                                        }{" "}
                                                        (data statistik) bisa
                                                        berbeda dari{" "}
                                                        {desaList.length} (desa
                                                        yang berhasil dirender
                                                        di peta ini) kalau ada
                                                        desa yang koordinatnya
                                                        belum tervalidasi.
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </span>
                                <p
                                    style={{
                                        margin: "4px 0 8px",
                                        fontSize: ringan ? 22 : 15,
                                        fontWeight: 700,
                                        color: kelasDari(ringkasan.skorRata)
                                            .hex,
                                    }}
                                >
                                    {kelasDari(ringkasan.skorRata).label}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: ringan ? 15 : 12,
                                        color: "#64748b",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    Sebanyak {ringkasan.jumlahTinggi} dari total{" "}
                                    {desaList.length} desa berhasil mencetak
                                    metrik performa di atas batas minimum
                                    unggulan (≥70).
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                borderTop: "1px dashed #e2e8f0",
                                paddingTop: 14,
                                marginTop: 14,
                            }}
                        >
                            <BarisIndikator
                                label="Skor desa tertinggi"
                                nilai={ringkasan.tertinggi?.skorPotensi ?? 0}
                                maks={100}
                                warna="#1e5b65"
                                besar={ringan}
                            />

                            {punyaDataProduksi && (
                                <>
                                    <BarisIndikator
                                        label="Total Produksi Wilayah"
                                        nilai={ringkasan.totalProduksi}
                                        maks={Math.max(
                                            ringkasan.totalProduksi,
                                            ringkasan.totalKebutuhan,
                                        )}
                                        warna="#9bba4b"
                                        satuan="ton"
                                        besar={ringan}
                                    />
                                    <BarisIndikator
                                        label="Kebutuhan Buyer Aktif"
                                        nilai={ringkasan.totalKebutuhan}
                                        maks={Math.max(
                                            ringkasan.totalProduksi,
                                            ringkasan.totalKebutuhan,
                                        )}
                                        warna="#f5b931"
                                        satuan="ton"
                                        besar={ringan}
                                    />
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            fontSize: ringan ? 15 : 12,
                                            fontWeight: 600,
                                            color:
                                                selisih >= 0
                                                    ? "#0f766e"
                                                    : "#b45309",
                                        }}
                                    >
                                        {selisih >= 0 ? (
                                            <TrendingUp size={16} />
                                        ) : (
                                            <TrendingDown size={16} />
                                        )}
                                        {selisih >= 0
                                            ? "Surplus Produksi: "
                                            : "Defisit Produksi: "}{" "}
                                        {Math.abs(selisih).toLocaleString(
                                            "id-ID",
                                        )}{" "}
                                        ton
                                        {ringkasan.totalKebutuhan > 0 && (
                                            <span
                                                style={{
                                                    color: "#94a3b8",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                ({rasioProduksi}% coverage)
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Kartu Narasi Analisis Ekstra */}
                        <div
                            style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 8,
                                padding: ringan ? 16 : 12,
                                marginTop: 14,
                            }}
                        >
                            <strong
                                style={{
                                    fontSize: ringan ? 13 : 11,
                                    color: "#1e5b65",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    textTransform: "uppercase",
                                    letterSpacing: ".4px",
                                }}
                            >
                                <Wheat size={ringan ? 15 : 13} /> Bacaan Wilayah
                            </strong>
                            <p
                                style={{
                                    margin: "6px 0 0",
                                    fontSize: ringan ? 15.5 : 12.5,
                                    lineHeight: 1.6,
                                    color: "#475569",
                                }}
                            >
                                {narasi}
                            </p>
                        </div>

                        {/* Card Sorotan per Desa yang diklik di Peta */}
                        {terpilih ? (
                            <div
                                style={{
                                    borderTop: "1px dashed #e2e8f0",
                                    paddingTop: 14,
                                    marginTop: 14,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginBottom: 10,
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: 8,
                                            borderRadius: 8,
                                            background: "#ccfbf1",
                                            color: "#0d9488",
                                            lineHeight: 0,
                                        }}
                                    >
                                        <MapPin size={18} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: "#0f172a",
                                            }}
                                        >
                                            {terpilih.nama}
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: 11,
                                                color: "#64748b",
                                            }}
                                        >
                                            {terpilih.koperasi ??
                                                "Koperasi belum tercatat"}
                                            {terpilih.kecamatan
                                                ? ` • Kec. ${terpilih.kecamatan}`
                                                : ""}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: kelasDari(
                                                terpilih.skorPotensi,
                                            ).hex,
                                        }}
                                    >
                                        {terpilih.skorPotensi}/100
                                    </span>
                                </div>
                                <p
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: "#0f172a",
                                    }}
                                >
                                    {terpilih.komoditas}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12.5,
                                        color: "#475569",
                                        lineHeight: 1.55,
                                    }}
                                >
                                    {terpilih.catatanAI}
                                </p>
                            </div>
                        ) : (
                            <div className="pd-hint" style={{ marginTop: 14 }}>
                                <MousePointerClick
                                    size={15}
                                    color="#94a3b8"
                                    style={{ flexShrink: 0 }}
                                />
                                {mode === "potensi"
                                    ? "Pilih batang 3D pada peta untuk meninjau status infrastruktur desanya."
                                    : mode === "program"
                                      ? "Pilih titik indikator instansi pada peta untuk membuka kebutuhan spesifikasi suplai."
                                      : "Pilih titik panen pada peta untuk melihat penawaran langsung dari petani lokal."}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DAFTAR DESA (Disingkat untuk fokus ke Peta) */}
            <div className="pd-card" style={{ marginTop: 16 }}>
                <div className="pd-head">
                    <span className="pd-title">
                        Katalog Komoditas Terdaftar
                    </span>
                    <AiTag />
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {desaList.map((d, i) => {
                        const aktif = terpilih?.nama === d.nama;
                        const kk = kelasKomoditas(d.komoditas);
                        return (
                            <div
                                key={d.nama}
                                className="pd-row"
                                onClick={() => sorotDesa(d)}
                                style={{
                                    background: aktif ? "#f0fdfa" : "#fff",
                                    borderLeft: `3px solid ${aktif ? kelasDari(d.skorPotensi).hex : "transparent"}`,
                                    borderBottom:
                                        i < desaList.length - 1
                                            ? "1px solid #f1f5f9"
                                            : "none",
                                }}
                            >
                                <div
                                    style={{
                                        padding: 10,
                                        background: kk.hex + "22",
                                        borderRadius: 8,
                                        color: kk.hex,
                                        flexShrink: 0,
                                        lineHeight: 0,
                                    }}
                                >
                                    <MapPin size={ringan ? 24 : 20} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 4,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: ringan ? 16 : 14,
                                                fontWeight: 600,
                                                color: "#0f172a",
                                            }}
                                        >
                                            {d.nama}{" "}
                                            {d.milikKoperasi && <TagWilayah />}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                background: "#f1f5f9",
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                                color: kelasDari(d.skorPotensi)
                                                    .hex,
                                            }}
                                        >
                                            Skor {d.skorPotensi}
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: ringan ? 15 : 13,
                                            fontWeight: 500,
                                            color: "#0f172a",
                                            margin: "0 0 4px",
                                        }}
                                    >
                                        {d.komoditas}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: ringan ? 14.5 : 13,
                                            color: "#475569",
                                            margin: 0,
                                        }}
                                    >
                                        {d.catatanAI}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const legendJudul: React.CSSProperties = {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: ".5px",
};

function PopupCard({
    iconBg,
    iconColor,
    title,
    subtitle,
    children,
}: {
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                position: "absolute",
                left: 16,
                bottom: 16,
                width: 300,
                maxWidth: "calc(100% - 32px)",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 30px rgba(15,23,42,.14)",
                padding: 14,
                zIndex: 5,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                }}
            >
                <span
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: iconBg,
                        color: iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <User size={16} />
                </span>
                <div style={{ minWidth: 0 }}>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0f172a",
                        }}
                    >
                        {title}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                        {subtitle}
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}
