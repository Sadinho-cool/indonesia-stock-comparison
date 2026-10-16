/* =========================================================
   INDONESIA STOCK COMPARISON
   ZAPI + CLOUDFLARE WORKER
========================================================= */


/* =========================
   CONFIG
========================= */

const API_URL =
    "https://indonesia-stock-comparison.sayyid-syafiq136.workers.dev";


const TYPES = [
    "summary",
    "profile",
    "history",
    "fundamentals",
    "dividends",
    "financial"
];



/* =========================
   HELPERS
========================= */

function $(id) {
    return document.getElementById(id);
}


function cleanSymbol(value) {

    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(".JK", "");

}


function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Belum tersedia";
    }

    return new Intl.NumberFormat("id-ID").format(
        Number(value)
    );

}


function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "Belum tersedia";
    }

    return "Rp " + formatNumber(value);

}


function formatDate(value) {

    if (!value) {
        return "Belum tersedia";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


function formatFileSize(bytes) {

    if (
        bytes === null ||
        bytes === undefined ||
        bytes === 0
    ) {
        return "";
    }

    const mb = bytes / 1024 / 1024;

    if (mb >= 1) {
        return `${mb.toFixed(2)} MB`;
    }

    const kb = bytes / 1024;

    return `${Math.round(kb)} KB`;

}


function setText(id, value) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "Belum tersedia"
            : value;

}


function safeArray(value) {

    return Array.isArray(value)
        ? value
        : [];

}



/* =========================
   API
========================= */

async function fetchType(symbol, type) {

    const url =
        `${API_URL}/?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}`;


    const response = await fetch(url, { cache: "no-store" });
    const cacheStatus = response.headers.get("x-isc-api-cache") || "UNKNOWN";

    if (!response.ok) {
        throw new Error(
            `${type}: HTTP ${response.status} (cache ${cacheStatus})`
        );
    }

    const json = await response.json();

    // The Worker exposes whether this response came from its permanent KV cache.
    // This marker is UI metadata only; it does not alter the provider's data fields.
    if (json && typeof json === "object" && !Array.isArray(json)) {
        json.__iscCacheStatus = cacheStatus;
    }


    if (
        json &&
        json.error
    ) {

        throw new Error(
            `${type}: ${json.error}`
        );

    }


    return json;

}


async function loadStock(symbol) {

    const results = {};

    const requests =
        TYPES.map(async (type) => {

            try {

                results[type] =
                    await fetchType(symbol, type);

            }
            catch (error) {

                console.warn(
                    `${symbol} ${type} gagal:`,
                    error
                );

                results[type] = {
                    __error: true,
                    message: error.message
                };

            }

        });


    await Promise.all(requests);


    return results;

}



/* =========================
   SUMMARY
========================= */

function renderSummary(
    summary,
    index,
    symbol
) {

    const suffix =
        index + 1;


    const data =
        summary &&
        !summary.__error
            ? summary
            : {};


    setText(
        `name${suffix}`,
        data.name || symbol
    );


    setText(
        `ticker${suffix}`,
        data.symbol || symbol
    );


    setText(
        `price${suffix}`,
        formatPrice(data.price)
    );


    /*
        Zapi summary belum memberikan
        Dividend Yield / PER / PBV.
        Jadi jangan mengarang angka.
    */

    setText(
        `dividend${suffix}`,
        "Belum tersedia"
    );


    setText(
        `per${suffix}`,
        "Belum tersedia"
    );


    setText(
        `pbv${suffix}`,
        "Belum tersedia"
    );


    setText(
        `tableTicker${suffix}`,
        data.symbol || symbol
    );


    setText(
        `tablePrice${suffix}`,
        formatPrice(data.price)
    );


    setText(
        `tableDividend${suffix}`,
        "Belum tersedia"
    );


    setText(
        `tablePer${suffix}`,
        "Belum tersedia"
    );


    setText(
        `tablePbv${suffix}`,
        "Belum tersedia"
    );


    setText(
        `marketTitle${suffix}`,
        data.symbol || symbol
    );


    setText(
        `open${suffix}`,
        formatPrice(data.open)
    );


    setText(
        `high${suffix}`,
        formatPrice(data.high)
    );


    setText(
        `low${suffix}`,
        formatPrice(data.low)
    );


    setText(
        `volume${suffix}`,
        formatNumber(data.volume)
    );


    setText(
        `value${suffix}`,
        formatPrice(data.value)
    );


    setText(
        `frequency${suffix}`,
        formatNumber(data.frequency)
    );


    setText(
        `bid${suffix}`,
        formatPrice(data.bid)
    );


    setText(
        `offer${suffix}`,
        formatPrice(data.offer)
    );


    setText(
        `foreignBuy${suffix}`,
        formatNumber(data.foreignBuy)
    );


    setText(
        `foreignSell${suffix}`,
        formatNumber(data.foreignSell)
    );


    setText(
        `tableVolume${suffix}`,
        formatNumber(data.volume)
    );


    setText(
        `tableForeignBuy${suffix}`,
        formatNumber(data.foreignBuy)
    );


    setText(
        `tableForeignSell${suffix}`,
        formatNumber(data.foreignSell)
    );

}



/* =========================
   PROFILE
========================= */

function renderProfile(
    response,
    index,
    symbol
) {

    const suffix =
        index + 1;


    const profile =
        response &&
        !response.__error &&
        response.data
            ? response.data
            : null;


    if (!profile) {

        setText(
            `profileName${suffix}`,
            symbol
        );

        setText(
            `profileTicker${suffix}`,
            symbol
        );

        return;

    }


    setText(
        `profileName${suffix}`,
        profile.name || symbol
    );


    setText(
        `profileTicker${suffix}`,
        profile.code || symbol
    );


    setText(
        `sector${suffix}`,
        profile.sector
    );


    setText(
        `industry${suffix}`,
        profile.industry
    );


    /*
        Zapi profile yang kita cek
        tidak memiliki field employees.
    */

    setText(
        `employees${suffix}`,
        "Belum tersedia"
    );


    setText(
        `listingDate${suffix}`,
        formatDate(profile.listingDate)
    );


    setText(
        `listingBoard${suffix}`,
        profile.listingBoard
    );


    setText(
        `description${suffix}`,
        profile.mainBusiness
    );


    renderWebsite(
        `website${suffix}`,
        profile.website
    );


    renderLogo(
        `profileLogo${suffix}`,
        profile.logo,
        symbol
    );


    renderLogo(
        `logo${suffix}`,
        profile.logo,
        symbol
    );

}



/* =========================
   WEBSITE
========================= */

function renderWebsite(id, website) {

    const element = $(id);

    if (!element) {
        return;
    }


    element.replaceChildren();


    if (!website) {

        element.textContent =
            "Belum tersedia";

        return;

    }


    let href =
        String(website).trim();


    if (
        !href.startsWith("http://") &&
        !href.startsWith("https://")
    ) {

        href =
            "https://" + href;

    }


    const link =
        document.createElement("a");


    link.href = href;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.textContent =
        website;


    link.className =
        "document-link";


    element.appendChild(link);

}



/* =========================
   LOGO
========================= */

function renderLogo(id, logoUrl, symbol) {

    const container = $(id);

    if (!container) {
        return;
    }

    container.replaceChildren();

    if (!logoUrl) {
        container.textContent =
            String(symbol || "?").substring(0, 1).toUpperCase();

        return;
    }

    const image = document.createElement("img");

    image.src = logoUrl;

    image.alt = `${symbol} company logo`;

    image.loading = "eager";

    image.onerror = () => {

        image.remove();

        container.textContent =
            String(symbol || "?").substring(0, 1).toUpperCase();

    };

    container.appendChild(image);
}



/* =========================
   DIVIDENDS
========================= */

function renderDividends(
    dividendResponse,
    profileResponse,
    index,
    symbol
) {

    const suffix = index + 1;

    const title =
        $(`dividendTitle${suffix}`);

    if (title) {
        title.textContent = symbol;
    }


    /*
        Profile dividends digunakan sebagai
        sumber utama karena lebih lengkap.
    */

    let dividends = [];


    if (
        profileResponse &&
        !profileResponse.__error &&
        profileResponse.data
    ) {

        dividends =
            safeArray(
                profileResponse.data.dividends
            );

    }


    if (
        dividends.length === 0 &&
        dividendResponse &&
        !dividendResponse.__error &&
        dividendResponse.data
    ) {

        dividends =
            safeArray(
                dividendResponse.data.items
            );

    }


    const list =
        $(`dividendList${suffix}`);


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (dividends.length === 0) {

        list.appendChild(
            createEmptyState(
                "Belum ada data dividen pada response yang tersedia."
            )
        );

        return;

    }


    dividends
        .slice(0, 10)
        .forEach((dividend) => {

            const item =
                document.createElement("div");

            item.className =
                "document-item";


            const info =
                document.createElement("div");

            info.className =
                "document-info";


            const name =
                document.createElement("span");

            name.className =
                "document-name";


            name.textContent =
                `Tahun buku ${dividend.bookYear || "-"}`;


            const meta =
                document.createElement("span");

            meta.className =
                "document-meta";


            meta.textContent =
                `Cash per Share: ${
                    dividend.cashPerShare ?? "Belum tersedia"
                } • Cum: ${
                    formatDate(dividend.cumDate)
                } • Ex: ${
                    formatDate(dividend.exDate)
                }`;


            info.appendChild(name);
            info.appendChild(meta);


            item.appendChild(info);


            /*
                Beberapa response mungkin memiliki
                URL dokumen. Kita hanya membuat tombol
                jika URL benar-benar diberikan API.
            */

            const url =
    dividend.url ||
    dividend.URL ||
    dividend.fileUrl ||
    dividend.fileURL ||
    dividend.documentUrl ||
    dividend.documentURL ||
    (
        profileResponse &&
        profileResponse.data &&
        profileResponse.data._dividendSourceUrl
    );


            if (url) {

                const link =
                    document.createElement("a");

                link.className =
                    "document-link";

                link.href = url;

                link.target = "_blank";

                link.rel =
                    "noopener noreferrer";

                link.textContent =
                    "Buka Dokumen ↗";


                item.appendChild(link);

            }


            list.appendChild(item);

        });

}



/* =========================
   FINANCIAL
========================= */

function renderFinancial(
    response,
    index,
    symbol
) {

    const suffix =
        index + 1;


    setText(
        `reportTitle${suffix}`,
        `${symbol} — Financial Report`
    );


    const list =
        $(`financialList${suffix}`);


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (
        !response ||
        response.__error ||
        !response.data ||
        !Array.isArray(response.data.data)
    ) {

        list.appendChild(
            createEmptyState(
                "Dokumen laporan keuangan tidak tersedia."
            )
        );

        return;

    }


    const reports =
        response.data.data;


    const documents = [];


    reports.forEach((report) => {

        safeArray(
            report.Attachments
        ).forEach((attachment) => {

            documents.push({
                report,
                attachment
            });

        });

    });


    if (documents.length === 0) {

        list.appendChild(
            createEmptyState(
                "Belum ada attachment laporan keuangan."
            )
        );

        return;

    }


    documents
        .slice(0, 10)
        .forEach(({ report, attachment }) => {

            const item =
                document.createElement("div");

            item.className =
                "document-item";


            const info =
                document.createElement("div");

            info.className =
                "document-info";


            const name =
                document.createElement("span");

            name.className =
                "document-name";


            const fileName =
                attachment.File_Name ||
                attachment.fileName ||
                attachment.FileName ||
                "Financial document";


            name.textContent =
                fileName;


            const meta =
                document.createElement("span");

            meta.className =
                "document-meta";


            const year =
                report.Year ||
                report.year ||
                2024;


            const period =
                report.Period ||
                report.period ||
                "audit";


            const size =
                formatFileSize(
                    attachment.File_Size ??
                    attachment.fileSize ??
                    0
                );


            meta.textContent =
                `${year} • ${period}${
                    size
                        ? " • " + size
                        : ""
                }`;


            info.appendChild(name);
            info.appendChild(meta);


            item.appendChild(info);


            /*
                Cari URL yang benar-benar diberikan
                oleh API.

                Kita TIDAK menebak URL IDX.
            */

            const url =
                attachment.url ||
                attachment.URL ||
                attachment.File_URL ||
                attachment.File_Url ||
                attachment.fileUrl ||
                attachment.fileURL ||
                attachment.Download_URL ||
                attachment.Download_Url ||
                attachment.downloadUrl ||
                attachment.DownloadURL;


            if (url) {

                const link =
                    document.createElement("a");

                link.className =
                    "document-link";

                link.href =
                    url;

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

                link.textContent =
                    "Buka File ↗";


                item.appendChild(link);

            }


            list.appendChild(item);

        });

}


/* =========================
   OWNERSHIP
========================= */

function renderOwnership(
    response,
    index,
    symbol
) {

    const suffix =
        index + 1;


    setText(
        `ownershipTitle${suffix}`,
        symbol
    );


    const list =
        $(`ownershipList${suffix}`);


    if (!list) {
        return;
    }


    list.replaceChildren();


    if (
        !response ||
        response.__error ||
        !response.data ||
        !Array.isArray(response.data.data)
    ) {

        list.appendChild(
            createEmptyState(
                "Dokumen ownership tidak tersedia."
            )
        );

        return;

    }


    const files =
        response.data.data;


    if (files.length === 0) {

        list.appendChild(
            createEmptyState(
                "Belum ada dokumen ownership."
            )
        );

        return;

    }


    files
        .slice(0, 10)
        .forEach((file) => {

            const item =
                document.createElement("div");

            item.className =
                "document-item";


            const info =
                document.createElement("div");

            info.className =
                "document-info";


            const name =
                document.createElement("span");

            name.className =
                "document-name";


            name.textContent =
                file.fileName ||
                "Ownership file";


            const meta =
                document.createElement("span");

            meta.className =
                "document-meta";


            meta.textContent =
                `${
                    file.categoryLabel ||
                    file.category ||
                    "Ownership"
                } • ${
                    formatDate(file.publishedAt)
                }`;


            info.appendChild(name);

            info.appendChild(meta);


            item.appendChild(info);


            if (file.url) {

                const link =
                    document.createElement("a");


                link.href =
                    file.url;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.className =
                    "document-link";


                link.textContent =
                    "Buka";


                item.appendChild(link);

            }


            list.appendChild(item);

        });

}



/* =========================
   EMPTY STATE
========================= */

function createEmptyState(message) {

    const element =
        document.createElement("div");


    element.className =
        "empty-state";


    element.textContent =
        message;


    return element;

}



/* =========================
   HISTORY / CHART
========================= */

function extractHistory(response) {

    if (
        !response ||
        response.__error ||
        !response.data
    ) {

        return [];

    }


    return safeArray(
        response.data.items
    );

}


function drawPriceChart(
    history1,
    history2,
    symbol1,
    symbol2
) {

    const canvas =
        $("priceChart");


    if (!canvas) {
        return;
    }


    const container =
        canvas.parentElement;


    const rect =
        container.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    const width =
        Math.max(rect.width, 300);


    const height =
        Math.max(rect.height, 240);


    canvas.width =
        width * dpr;


    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    /*
        Sort oldest -> newest
    */

    const first =
        [...history1]
            .filter(
                item =>
                    item &&
                    item.date &&
                    Number.isFinite(
                        Number(item.close)
                    )
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );


    const second =
        [...history2]
            .filter(
                item =>
                    item &&
                    item.date &&
                    Number.isFinite(
                        Number(item.close)
                    )
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );


    const all =
        [...first, ...second];


    if (all.length === 0) {

        drawChartMessage(
            ctx,
            width,
            height,
            "Data harga belum tersedia."
        );

        return;

    }


    const values =
        all.map(
            item =>
                Number(item.close)
        );


    let min =
        Math.min(...values);


    let max =
        Math.max(...values);


    if (min === max) {

        min -= 1;

        max += 1;

    }


    const padding = {
        top: 30,
        right: 25,
        bottom: 45,
        left: 60
    };


    const chartWidth =
        width -
        padding.left -
        padding.right;


    const chartHeight =
        height -
        padding.top -
        padding.bottom;


    const styles =
        getComputedStyle(document.body);


    const primary =
        styles
            .getPropertyValue("--primary")
            .trim() ||
        "#2563eb";


    const accent =
        styles
            .getPropertyValue("--accent")
            .trim() ||
        "#7c3aed";


    const border =
        styles
            .getPropertyValue("--border")
            .trim() ||
        "#e2e8f0";


    const muted =
        styles
            .getPropertyValue("--text-muted")
            .trim() ||
        "#94a3b8";


    const text =
        styles
            .getPropertyValue("--text-secondary")
            .trim() ||
        "#475569";


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
        Grid
    */

    ctx.lineWidth = 1;

    ctx.strokeStyle =
        border;


    const gridLines = 5;


    for (
        let i = 0;
        i <= gridLines;
        i++
    ) {

        const y =
            padding.top +
            (
                chartHeight /
                gridLines
            ) * i;


        ctx.beginPath();

        ctx.moveTo(
            padding.left,
            y
        );

        ctx.lineTo(
            width - padding.right,
            y
        );

        ctx.stroke();


        const value =
            max -
            (
                (max - min) /
                gridLines
            ) * i;


        ctx.fillStyle =
            muted;


        ctx.font =
            "10px system-ui";


        ctx.textAlign =
            "right";


        ctx.fillText(
            formatNumber(
                Math.round(value)
            ),
            padding.left - 8,
            y + 4
        );

    }


    /*
        Combine dates.
    */

    const dates =
        [
            ...new Set(
                [
                    ...first,
                    ...second
                ].map(
                    item =>
                        item.date
                )
            )
        ].sort(
            (a, b) =>
                new Date(a) -
                new Date(b)
        );


    function xForDate(date) {

        if (dates.length <= 1) {

            return padding.left +
                chartWidth / 2;

        }


        const index =
            dates.indexOf(date);


        return padding.left +
            (
                index /
                (dates.length - 1)
            ) *
            chartWidth;

    }


    function yForValue(value) {

        return padding.top +
            (
                (max - value) /
                (max - min)
            ) *
            chartHeight;

    }


    function drawLine(
        items,
        color
    ) {

        if (items.length === 0) {
            return;
        }


        ctx.beginPath();


        items.forEach(
            (item, index) => {

                const x =
                    xForDate(
                        item.date
                    );


                const y =
                    yForValue(
                        Number(
                            item.close
                        )
                    );


                if (index === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                }
                else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );


        ctx.strokeStyle =
            color;


        ctx.lineWidth = 2.5;

        ctx.lineJoin =
            "round";

        ctx.lineCap =
            "round";


        ctx.stroke();


        /*
            Last point
        */

        const last =
            items[
                items.length - 1
            ];


        const lx =
            xForDate(
                last.date
            );


        const ly =
            yForValue(
                Number(last.close)
            );


        ctx.beginPath();

        ctx.arc(
            lx,
            ly,
            4,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            color;


        ctx.fill();

    }


    drawLine(
        first,
        primary
    );


    drawLine(
        second,
        accent
    );


    /*
        Date labels
    */

    ctx.fillStyle =
        text;


    ctx.font =
        "10px system-ui";


    ctx.textAlign =
        "center";


    const labelIndexes =
        dates.length <= 4
            ? dates.map(
                (_, i) => i
            )
            : [
                0,
                Math.floor(
                    dates.length / 2
                ),
                dates.length - 1
            ];


    labelIndexes.forEach(
        index => {

            const date =
                dates[index];


            const x =
                xForDate(date);


            ctx.fillText(
                formatShortDate(date),
                x,
                height - 15
            );

        }
    );

}


function formatShortDate(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short"
        }
    ).format(date);

}


function drawChartMessage(
    ctx,
    width,
    height,
    message
) {

    const styles =
        getComputedStyle(document.body);


    const muted =
        styles
            .getPropertyValue("--text-muted")
            .trim() ||
        "#94a3b8";


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        muted;


    ctx.font =
        "13px system-ui";


    ctx.textAlign =
        "center";


    ctx.fillText(
        message,
        width / 2,
        height / 2
    );

}



/* =========================
   SHOW SECTIONS
========================= */

function showResults() {

    $("result")
        ?.classList
        .remove("hidden");


    $("comparison")
        ?.classList
        .remove("hidden");


    $("marketSection")
        ?.classList
        .remove("hidden");


    $("chartSection")
        ?.classList
        .remove("hidden");


    $("dividendSection")
        ?.classList
        .remove("hidden");


    $("profileSection")
        ?.classList
        .remove("hidden");


    $("financialSection")
        ?.classList
        .remove("hidden");


    $("ownershipSection")
        ?.classList
        .remove("hidden");

}



/* =========================
   MAIN COMPARE
========================= */

async function compareStocks() {

    const stock1 =
        cleanSymbol(
            $("stock1")?.value
        );


    const stock2 =
        cleanSymbol(
            $("stock2")?.value
        );


    const status =
        $("status");


    const button =
        $("compareButton");


    const buttonText =
        $("buttonText");


    /*
        Validation
    */

    if (!stock1 || !stock2) {

        if (status) {

            status.className =
                "status error";

            status.textContent =
                "Masukkan dua kode saham terlebih dahulu.";

        }

        return;

    }


    if (stock1 === stock2) {

        if (status) {

            status.className =
                "status error";

            status.textContent =
                "Pilih dua saham yang berbeda.";

        }

        return;

    }


    /*
        Loading
    */

    if (button) {
        button.disabled = true;
    }


    if (buttonText) {

        buttonText.textContent =
            "Memuat data...";

    }


    if (status) {

        status.className =
            "status loading";

        status.textContent =
            "Mengambil data dari IDX...";

    }


    try {

        /*
            Load dua saham bersamaan.
        */

        const [
            stockData1,
            stockData2
        ] = await Promise.all([
            loadStock(stock1),
            loadStock(stock2)
        ]);


        /*
            Render
        */

        renderSummary(
            stockData1.summary,
            0,
            stock1
        );


        renderSummary(
            stockData2.summary,
            1,
            stock2
        );


        renderProfile(
            stockData1.profile,
            0,
            stock1
        );


        renderProfile(
            stockData2.profile,
            1,
            stock2
        );


        renderDividends(
            stockData1.dividends,
            stockData1.profile,
            0,
            stock1
        );


        renderDividends(
            stockData2.dividends,
            stockData2.profile,
            1,
            stock2
        );


        renderFinancial(
            stockData1.financial,
            0,
            stock1
        );


        renderFinancial(
            stockData2.financial,
            1,
            stock2
        );


        renderOwnership(
            stockData1.ownership,
            0,
            stock1
        );


        renderOwnership(
            stockData2.ownership,
            1,
            stock2
        );


        /*
            History
        */

        const history1 =
            extractHistory(
                stockData1.history
            );


        const history2 =
            extractHistory(
                stockData2.history
            );


        setText(
            "chartLegend1",
            stock1
        );


        setText(
            "chartLegend2",
            stock2
        );


        setText(
            "chartSubtitle",
            `Riwayat harga ${
                stock1
            } dan ${
                stock2
            } dari data yang tersedia.`
        );


        drawPriceChart(
            history1,
            history2,
            stock1,
            stock2
        );


        /*
            Show everything
        */

        showResults();


        /*
            Success
        */

        if (status) {

            status.className =
                "status success";

            status.textContent =
                "Data berhasil diperbarui.";

        }


        /*
            Scroll smoothly to result
        */

        setTimeout(() => {

            $("result")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);


    }
    catch (error) {

        console.error(error);


        if (status) {

            status.className =
                "status error";

            status.textContent =
                "Terjadi kesalahan saat mengambil data.";

        }

    }
    finally {

        if (button) {
            button.disabled = false;
        }


        if (buttonText) {

            buttonText.textContent =
                "Bandingkan Saham";

        }

    }

}



/* =========================
   DARK MODE
========================= */

function setupTheme() {

    const toggle =
        $("themeToggle");


    if (!toggle) {
        return;
    }


    const savedTheme =
        localStorage.getItem(
            "isc-theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        toggle.textContent =
            "☀️";

    }
    else {

        toggle.textContent =
            "🌙";

    }


    toggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const isDark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "isc-theme",
                isDark
                    ? "dark"
                    : "light"
            );


            toggle.textContent =
                isDark
                    ? "☀️"
                    : "🌙";


            /*
                Redraw chart karena
                warna CSS berubah.
            */

            const canvas =
                $("priceChart");

            document.querySelectorAll(".dividend-chart, #dividendComparisonChart").forEach(chart => {
                if (typeof chart.__redraw === "function") chart.__redraw();
            });


            if (
                canvas &&
                !$("chartSection")
                    ?.classList
                    .contains("hidden")
            ) {

                /*
                    Ambil data yang tersimpan.
                    draw terakhir ditangani oleh
                    compareStocks.
                */

                redrawCurrentChart();

            }

        }
    );

}



/* =========================
   CHART CACHE
========================= */

let currentChartData = null;


function redrawCurrentChart() {

    if (!currentChartData) {
        return;
    }


    drawPriceChart(
        currentChartData.history1,
        currentChartData.history2,
        currentChartData.symbol1,
        currentChartData.symbol2
    );

}



/*
    Simpan history untuk dark-mode redraw.
    Kita bungkus drawPriceChart asli.
*/

const originalDrawPriceChart =
    drawPriceChart;


drawPriceChart =
    function (
        history1,
        history2,
        symbol1,
        symbol2
    ) {

        currentChartData = {
            history1,
            history2,
            symbol1,
            symbol2
        };


        originalDrawPriceChart(
            history1,
            history2,
            symbol1,
            symbol2
        );

    };



/* =========================
   ENTER KEY
========================= */

function setupInputs() {

    const stock1 = $("stock1");
    const stock2 = $("stock2");

    if (stock1) {

        stock1.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    if (stock1.value.trim()) {

                        stock2?.focus();

                    }

                }

            }
        );

    }

    if (stock2) {

        stock2.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    compareStocks();

                }

            }
        );

    }

}



/* =========================
   INITIALIZE
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupTheme();

        setupInputs();

       setupInfoToggle();

    }
);



/* =========================
   INFO TOGGLE
========================= */

function setupInfoToggle() {

    const button = $("infoToggle");
    const details = $("infoDetails");

    if (!button || !details) return;

    button.addEventListener("click", () => {

        const isOpen =
            button.getAttribute("aria-expanded") === "true";

        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        button.classList.toggle(
            "active",
            !isOpen
        );

        details.hidden = isOpen;

    });

}

/* =========================================================
   V2 FRONTEND UPGRADE
   - Fundamental data
   - Correct IDX/Pluang response parsing
   - Quick section navigation
   - Shareholder overview
   - Financial snapshot
========================================================= */

function v2Value(value) {
    if (value === null || value === undefined || typeof value === "boolean") {
        return "Belum tersedia";
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : "Belum tersedia";
    }

    if (typeof value !== "string") {
        return "Belum tersedia";
    }

    const text = value.trim();

    if (
        !text ||
        /^(false|true|null|undefined|nan|infinity|-infinity)$/i.test(text) ||
        /^[-–—]$/.test(text)
    ) {
        return "Belum tersedia";
    }

    return text;
}

function v2MetricValue(value, unit) {
    const safeValue = v2Value(value);
    if (safeValue === "Belum tersedia") return safeValue;

    // Zapi's Pluang fundamentals endpoint documents these metrics as
    // pre-formatted strings with explicit units. Do not guess units for
    // an unexpected raw number or an unfamiliar format.
    if (typeof value !== "string") return "Format API belum terverifikasi";

    const text = value.trim();
    const patterns = {
        percent: /^[-+]?\s*\d[\d.,]*\s*%$/,
        multiple: /^[-+]?\s*\d[\d.,]*\s*x$/i,
        currency: /^[-+]?\s*Rp\s*[-+]?\s*\d[\d.,]*(?:\s*[KMBT])?$/i
    };

    return patterns[unit]?.test(text)
        ? text
        : "Format API belum terverifikasi";
}

function formatApiTimestampV2(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta"
    }).format(date) + " WIB";
}

function parseSummaryV2(response) {
    const row =
        response && !response.__error && response.data &&
        Array.isArray(response.data.data)
            ? response.data.data[0]
            : null;

    if (!row) return {};

    return {
        symbol: row.StockCode,
        name: row.StockName,
        price: row.Close,
        previous: row.Previous,
        open: row.OpenPrice,
        high: row.High,
        low: row.Low,
        change: row.Change,
        volume: row.Volume,
        value: row.Value,
        frequency: row.Frequency,
        bid: row.Bid,
        bidVolume: row.BidVolume,
        offer: row.Offer,
        offerVolume: row.OfferVolume,
        foreignBuy: row.ForeignBuy,
        foreignSell: row.ForeignSell
    };
}

function parseFundamentalsV2(response) {
    const data =
        response && !response.__error ? response.data : null;

    if (!data) return {};

    return {
        revenue: data.overview?.revenue,
        netProfit: data.overview?.net_income,
        eps: data.overview?.eps,
        bvps: data.overview?.bvps,
        per: data.ratios?.valuation?.pe,
        pbv: data.ratios?.valuation?.pb,
        roe: data.ratios?.profitability?.roe,
        roa: data.ratios?.profitability?.roa,
        npm: data.ratios?.profitability?.npm,
        der: data.ratios?.solvency?.de,
        currentRatio: data.ratios?.solvency?.cr,
        dividendYield: data.ratios?.dividend?.ttm,
        payoutRatio: data.ratios?.dividend?.payoutRatio,
        dividendPerShare: data.ratios?.dividend?.dividendPerShare
    };
}

function ensureFundamentalRows() {
    const comparison = $("comparison");
    if (!comparison) return;

    const tbody = comparison.querySelector("tbody");
    if (!tbody || tbody.dataset.v2Fundamentals === "true") return;

    const rows = [
        ["ROE (%)", "tableRoe1", "tableRoe2"],
        ["ROA (%)", "tableRoa1", "tableRoa2"],
        ["DER (%)", "tableDer1", "tableDer2"],
        ["Revenue (format sumber)", "tableRevenue1", "tableRevenue2"],
        ["Net Profit (format sumber)", "tableNetProfit1", "tableNetProfit2"]
    ];

    const volumeRow = $("tableVolume1")?.closest("tr");

    rows.forEach(([label, id1, id2]) => {
        const row = document.createElement("tr");

        const labelCell = document.createElement("td");
        labelCell.textContent = label;

        const cell1 = document.createElement("td");
        cell1.id = id1;
        cell1.textContent = "-";

        const cell2 = document.createElement("td");
        cell2.id = id2;
        cell2.textContent = "-";

        row.appendChild(labelCell);
        row.appendChild(cell1);
        row.appendChild(cell2);

        if (volumeRow) tbody.insertBefore(row, volumeRow);
        else tbody.appendChild(row);
    });

    tbody.dataset.v2Fundamentals = "true";

    // Add a persistent transparency note below the comparison table.
    if (!$("v2DataIntegrityNote")) {
        const note = document.createElement("div");
        note.id = "v2DataIntegrityNote";
        note.className = "v2-data-integrity-note";
        note.setAttribute("role", "note");
        note.setAttribute("aria-live", "polite");

        const tableWrapper = comparison.querySelector(".table-wrapper");
        if (tableWrapper) tableWrapper.insertAdjacentElement("afterend", note);
        else comparison.appendChild(note);
    }
}

function renderSummaryV2(response, index, symbol) {
    const suffix = index + 1;
    const data = parseSummaryV2(response);
    const displaySymbol = data.symbol || symbol;

    setText("name" + suffix, data.name || symbol);
    setText("ticker" + suffix, displaySymbol);
    setText("price" + suffix, formatPrice(data.price));

    setText("marketTitle" + suffix, displaySymbol);
    setText("open" + suffix, formatPrice(data.open));
    setText("high" + suffix, formatPrice(data.high));
    setText("low" + suffix, formatPrice(data.low));
    setText("volume" + suffix, formatNumber(data.volume));
    setText("value" + suffix, formatPrice(data.value));
    setText("frequency" + suffix, formatNumber(data.frequency));
    setText("bid" + suffix, formatPrice(data.bid));
    setText("offer" + suffix, formatPrice(data.offer));
    setText("foreignBuy" + suffix, formatNumber(data.foreignBuy));
    setText("foreignSell" + suffix, formatNumber(data.foreignSell));

    setText("tableTicker" + suffix, displaySymbol);
    setText("tablePrice" + suffix, formatPrice(data.price));
    setText("tableVolume" + suffix, formatNumber(data.volume));
    setText("tableForeignBuy" + suffix, formatNumber(data.foreignBuy));
    setText("tableForeignSell" + suffix, formatNumber(data.foreignSell));
}

function renderFundamentalsV2(response, index, symbol) {
    const suffix = index + 1;
    const data = parseFundamentalsV2(response);

    ensureFundamentalRows();

    setText("dividend" + suffix, v2MetricValue(data.dividendYield, "percent"));
    setText("per" + suffix, v2MetricValue(data.per, "multiple"));
    setText("pbv" + suffix, v2MetricValue(data.pbv, "multiple"));

    setText("tableDividend" + suffix, v2MetricValue(data.dividendYield, "percent"));
    setText("tablePer" + suffix, v2MetricValue(data.per, "multiple"));
    setText("tablePbv" + suffix, v2MetricValue(data.pbv, "multiple"));
    setText("tableRoe" + suffix, v2MetricValue(data.roe, "percent"));
    setText("tableRoa" + suffix, v2MetricValue(data.roa, "percent"));
    setText("tableDer" + suffix, v2MetricValue(data.der, "percent"));
    setText("tableRevenue" + suffix, v2MetricValue(data.revenue, "currency"));
    setText("tableNetProfit" + suffix, v2MetricValue(data.netProfit, "currency"));
}

function renderFundamentalIntegrityNote(response1, symbol1, response2, symbol2) {
    const note = $("v2DataIntegrityNote");
    if (!note) return;

    note.replaceChildren();

    const heading = document.createElement("strong");
    heading.textContent = "Transparansi dan kualitas data";
    note.appendChild(heading);

    const describeSource = (response, symbol) => {
        if (!response || response.__error) {
            const reason = response?.message || "sumber fundamental tidak tersedia";
            return `${symbol}: data fundamental gagal dimuat (${reason}). Angka terkait tidak ditampilkan.`;
        }

        const data = response.data && typeof response.data === "object"
            ? response.data
            : {};
        const source = data.source || "Pluang melalui Zapi";
        const parsed = parseFundamentalsV2(response);
        const metricChecks = [
            ["dividendYield", "percent"],
            ["per", "multiple"],
            ["pbv", "multiple"],
            ["roe", "percent"],
            ["roa", "percent"],
            ["der", "percent"],
            ["revenue", "currency"],
            ["netProfit", "currency"]
        ];
        const hasVerifiableMetric = metricChecks.some(([key, unit]) => {
            const value = v2MetricValue(parsed[key], unit);
            return value !== "Belum tersedia" && value !== "Format API belum terverifikasi";
        });

        if (!hasVerifiableMetric) {
            return `${symbol}: respons diterima, tetapi belum ada metrik fundamental yang dapat diverifikasi dari format datanya.`;
        }

        const details = [`${symbol}: sumber ${source}`];
        if (data.lastUpdated) details.push(`pembaruan penyedia: ${data.lastUpdated}`);
        if (response.timestamp) details.push(`timestamp respons: ${formatApiTimestampV2(response.timestamp)}`);
        if (response.__iscCacheStatus) details.push(`cache Worker: ${response.__iscCacheStatus}`);
        return details.join(" • ") + ".";
    };

    [describeSource(response1, symbol1), describeSource(response2, symbol2)].forEach(line => {
        const paragraph = document.createElement("p");
        paragraph.textContent = line;
        note.appendChild(paragraph);
    });

    const disclaimer = document.createElement("p");
    disclaimer.className = "v2-data-integrity-disclaimer";
    disclaimer.textContent =
        "Metrik dipertahankan dalam format dan satuan yang diberikan penyedia (mis. %, x, atau Rp). " +
        "Jika format satuan tidak sesuai skema yang dikenal, nilainya ditandai dan tidak ditebak. " +
        "Periode ringkasan fundamental dapat berbeda antar-metrik; gunakan laporan keuangan resmi untuk memeriksa periode dan konteksnya. " +
        "Cache Worker proyek ini disimpan tanpa kedaluwarsa otomatis selama pengembangan. Status HIT berarti respons diambil dari cache, bukan permintaan baru ke penyedia, sehingga datanya bisa usang.";
    note.appendChild(disclaimer);
}

function renderProfileV2(response, index, symbol) {
    const suffix = index + 1;
    renderProfile(response, index, symbol);

    const profile =
        response && !response.__error ? response.data : null;

    if (!profile) return;

    const card = $("profileLogo" + suffix)?.closest(".profile-card");
    if (!card || card.querySelector(".v2-shareholders")) return;

    const shareholders = safeArray(profile.shareholders);
    const wrapper = document.createElement("div");
    wrapper.className = "business-description v2-shareholders";

    const heading = document.createElement("span");
    heading.textContent = "Pemegang saham utama";
    wrapper.appendChild(heading);

    if (shareholders.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Belum tersedia";
        wrapper.appendChild(empty);
    } else {
        const list = document.createElement("div");
        list.className = "document-list";

        shareholders.slice(0, 8).forEach((holder) => {
            const item = document.createElement("div");
            item.className = "document-item";

            const info = document.createElement("div");
            info.className = "document-info";

            const name = document.createElement("span");
            name.className = "document-name";
            name.textContent =
                holder.name ||
                holder.shareholderName ||
                holder.investorName ||
                "Pemegang saham";

            const meta = document.createElement("span");
            meta.className = "document-meta";

            const percentage =
                holder.percentage ??
                holder.percent ??
                holder.sharePercentage ??
                holder.ownershipPercentage;

            meta.textContent =
                percentage === undefined
                    ? "Persentase belum tersedia"
                    : String(percentage) + "%";

            info.appendChild(name);
            info.appendChild(meta);
            item.appendChild(info);
            list.appendChild(item);
        });

        wrapper.appendChild(list);
    }

    card.appendChild(wrapper);
}


function parseDividendAmount(value) {
    let raw = String(value == null ? "" : value)
        .replace(/rp/gi, "")
        .replace(/\s/g, "")
        .replace(/[^\d,.-]/g, "");

    if (!raw) return NaN;

    const comma = raw.lastIndexOf(",");
    const dot = raw.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
        if (comma > dot) raw = raw.replace(/\./g, "").replace(",", ".");
        else raw = raw.replace(/,/g, "");
    } else if (comma >= 0) {
        raw = raw.replace(",", ".");
    }

    return Number(raw);
}

function calculateSharedDividendAxis(values) {
    const valid = values.filter(value => Number.isFinite(value) && value >= 0);
    const highest = valid.length ? Math.max(...valid) : 0;

    // Semua grafik dividen memakai interval tetap Rp10 dan batas sumbu yang sama.
    const step = 10;
    const max = Math.max(step, Math.ceil(highest / step) * step);

    return { max, step };
}

let sharedDividendAxis = { max: 10, step: 10 };

function renderDividendsV2(response, profileResponse, index, symbol) {
    const suffix = index + 1;
    setText("dividendTitle" + suffix, symbol);

    let dividends = [];
    if (response && !response.__error && response.data) {
        dividends = safeArray(response.data.past)
            .filter(item => item && item.type === "DIVIDEND");
    }

    const profile = profileResponse && !profileResponse.__error
        ? profileResponse.data
        : null;

    if (!dividends.length) {
        dividends = safeArray(profile && profile.dividends).map(item => ({
            type: "DIVIDEND",
            value: item.cashPerShare != null ? "Rp" + item.cashPerShare : null,
            title: "Dividend",
            fields: {
                "Cum Date": item.cumDate,
                "Ex Date": item.exDate,
                "Pay Date": item.paymentDate
            },
            bookYear: item.bookYear
        }));
    }

    const list = $("dividendList" + suffix);
    if (!list) return;
    list.replaceChildren();

    const parseDate = item => {
        const fields = item.fields || {};
        return fields["Pay Date"] || fields["Ex Date"] || fields["Cum Date"] || "";
    };

    const toTimestamp = value => {
        if (!value) return 0;
        const text = String(value).trim();
        if (/^\d{4}$/.test(text)) return new Date(Number(text), 0, 1).getTime();
        const parsed = new Date(text);
        if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
        const match = text.match(/(\d{1,2})\s+([A-Za-z]{3})\s+'?(\d{2,4})?/);
        if (!match) return 0;
        const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
        const year = match[3]
            ? Number(match[3].length === 2 ? "20" + match[3] : match[3])
            : new Date().getFullYear();
        return new Date(year, months[match[2]] || 0, Number(match[1])).getTime();
    };

    dividends.sort((a, b) => toTimestamp(parseDate(b) || b.bookYear) - toTimestamp(parseDate(a) || a.bookYear));

    if (!dividends.length) {
        list.appendChild(createEmptyState("Belum ada data dividen yang tersedia."));
        return;
    }

    const latest = dividends[0];
    const latestItem = document.createElement("div");
    latestItem.className = "document-item dividend-latest";
    const info = document.createElement("div");
    info.className = "document-info";
    const name = document.createElement("span");
    name.className = "document-name";
    name.textContent = (latest.value || "Dividen terbaru") + " / saham";
    const meta = document.createElement("span");
    meta.className = "document-meta";
    const fields = latest.fields || {};
    const dates = [
        fields["Cum Date"] ? "Cum: " + fields["Cum Date"] : null,
        fields["Ex Date"] ? "Ex: " + fields["Ex Date"] : null,
        fields["Pay Date"] ? "Bayar: " + fields["Pay Date"] : null
    ].filter(Boolean);
    meta.textContent = dates.join(" • ") || latest.title || latest.bookYear || "Tanggal belum tersedia";
    info.append(name, meta);
    latestItem.appendChild(info);
    list.appendChild(latestItem);

    const chartItems = dividends.slice(0, 8).map((item, itemIndex) => {
        const date = parseDate(item) || item.bookYear || "";
        return {
            value: parseDividendAmount(item.value),
            label: date || ("Pembayaran " + (itemIndex + 1)),
            time: toTimestamp(date) || (Date.UTC(2000, 0, 1) + itemIndex * 86400000)
        };
    }).filter(item => Number.isFinite(item.value))
      .sort((a, b) => a.time - b.time);

    const graphButton = document.createElement("button");
    graphButton.type = "button";
    graphButton.className = "dividend-history-toggle dividend-graph-toggle";
    graphButton.textContent = "Tampilkan Grafik";
    graphButton.setAttribute("aria-expanded", "false");

    const canvas = document.createElement("canvas");
    canvas.className = "dividend-chart hidden";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Grafik dividen per saham " + symbol);

    const drawDividendChart = () => {
        if (canvas.classList.contains("hidden") || canvas.closest(".hidden")) return;

        const rect = canvas.getBoundingClientRect();
        const width = Math.max(300, Math.floor(rect.width || 600));
        const height = Math.max(280, Math.floor(rect.height || 460));
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const styles = getComputedStyle(document.body);
        const css = name => styles.getPropertyValue(name).trim();
        const text = css("--text-secondary") || "#475569";
        const muted = css("--text-muted") || "#94a3b8";
        const border = css("--border") || "#e2e8f0";
        const color = css("--primary") || "#2563eb";

        if (!chartItems.length) {
            ctx.fillStyle = text;
            ctx.font = "13px system-ui, sans-serif";
            ctx.fillText("Data dividen belum tersedia untuk grafik.", 16, 28);
            return;
        }

        const axis = sharedDividendAxis;
        const padding = { top: 30, right: 25, bottom: 45, left: 65 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const xAt = i => chartItems.length <= 1
            ? padding.left + chartWidth / 2
            : padding.left + chartWidth * i / (chartItems.length - 1);
        const yAt = value => padding.top + (axis.max - value) / axis.max * chartHeight;

        ctx.lineWidth = 1;
        ctx.strokeStyle = border;
        ctx.fillStyle = muted;
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "right";

        for (let value = 0; value <= axis.max + axis.step * 0.001; value += axis.step) {
            const y = yAt(value);
            // Tampilkan angka setiap Rp10, tetapi gambar garis bantu hanya tiap Rp20.
            if (Math.round(value / 20) * 20 === Math.round(value)) {
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }
            ctx.fillText("Rp" + new Intl.NumberFormat("id-ID", {maximumFractionDigits: 2}).format(value), padding.left - 8, y + 4);
        }

        ctx.beginPath();
        chartItems.forEach((point, i) => {
            const x = xAt(i);
            const y = yAt(point.value);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        const last = chartItems[chartItems.length - 1];
        ctx.beginPath();
        ctx.arc(xAt(chartItems.length - 1), yAt(last.value), 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.fillStyle = text;
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "center";
        const labelIndexes = chartItems.length <= 4
            ? chartItems.map((_, i) => i)
            : [0, Math.floor(chartItems.length / 2), chartItems.length - 1];

        labelIndexes.forEach(i => {
            const point = chartItems[i];
            const date = new Date(point.time);
            let label = point.label;
            if (!Number.isNaN(date.getTime()) && !/^Pembayaran/.test(label)) {
                label = formatShortDate(date.toISOString());
            }
            ctx.fillText(String(label).slice(0, 14), xAt(i), height - 15);
        });
    };

    canvas.__redraw = drawDividendChart;
    graphButton.addEventListener("click", () => {
        const willShow = canvas.classList.contains("hidden");
        canvas.classList.toggle("hidden", !willShow);
        graphButton.setAttribute("aria-expanded", String(willShow));
        graphButton.textContent = willShow ? "Sembunyikan Grafik" : "Tampilkan Grafik";
        if (willShow) requestAnimationFrame(() => canvas.__redraw && canvas.__redraw());
    });

    list.append(graphButton, canvas);

    const historyToggle = document.createElement("button");
    historyToggle.type = "button";
    historyToggle.className = "dividend-history-toggle";
    historyToggle.textContent = "Lihat riwayat dividen (" + dividends.length + ")";
    historyToggle.setAttribute("aria-expanded", "false");

    const history = document.createElement("div");
    history.className = "dividend-history hidden";
    dividends.forEach(item => {
        const row = document.createElement("div");
        row.className = "document-item";
        const rowInfo = document.createElement("div");
        rowInfo.className = "document-info";
        const rowName = document.createElement("span");
        rowName.className = "document-name";
        rowName.textContent = (item.value || "Dividen") + " / saham";
        const rowMeta = document.createElement("span");
        rowMeta.className = "document-meta";
        const f = item.fields || {};
        rowMeta.textContent = [
            f["Cum Date"] ? "Cum: " + f["Cum Date"] : null,
            f["Ex Date"] ? "Ex: " + f["Ex Date"] : null,
            f["Pay Date"] ? "Bayar: " + f["Pay Date"] : null
        ].filter(Boolean).join(" • ") || item.bookYear || "Tanggal belum tersedia";
        rowInfo.append(rowName, rowMeta);
        row.appendChild(rowInfo);
        history.appendChild(row);
    });

    historyToggle.addEventListener("click", () => {
        const expanded = historyToggle.getAttribute("aria-expanded") === "true";
        historyToggle.setAttribute("aria-expanded", String(!expanded));
        history.classList.toggle("hidden", expanded);
        historyToggle.textContent = (expanded ? "Lihat" : "Sembunyikan") + " riwayat dividen" +
            (expanded ? " (" + dividends.length + ")" : "");
    });

    list.append(historyToggle, history);

    if (!window.__dividendResizeBound) {
        window.addEventListener("resize", () => {
            document.querySelectorAll(".dividend-comparison-chart, .dividend-chart").forEach(chart => {
                if (
                    typeof chart.__redraw === "function" &&
                    !chart.classList.contains("hidden") &&
                    !chart.closest(".hidden")
                ) {
                    chart.__redraw();
                }
            });
        });
        window.__dividendResizeBound = true;
    }
}

function renderDividendComparisonV2(response1, profile1, symbol1, response2, profile2, symbol2) {
    const canvas = $("dividendComparisonChart");
    const legend = $("dividendComparisonLegend");
    if (!canvas) return;

    const getDividends = (response, profile) => {
        let items = response && !response.__error && response.data
            ? safeArray(response.data.past).filter(item => item && item.type === "DIVIDEND")
            : [];

        if (!items.length && profile && !profile.__error) {
            items = safeArray(profile.data && profile.data.dividends).map(item => ({
                type: "DIVIDEND",
                value: item.cashPerShare != null ? "Rp" + item.cashPerShare : null,
                fields: {
                    "Pay Date": item.paymentDate,
                    "Ex Date": item.exDate,
                    "Cum Date": item.cumDate
                },
                bookYear: item.bookYear
            }));
        }

        const dateOf = item => {
            const fields = item.fields || {};
            return fields["Pay Date"] || fields["Ex Date"] || fields["Cum Date"] || "";
        };
        const timestamp = value => {
            if (!value) return 0;
            const text = String(value).trim();
            if (/^\d{4}$/.test(text)) return new Date(Number(text), 0, 1).getTime();
            const parsed = new Date(text);
            if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
            const match = text.match(/(\d{1,2})\s+([A-Za-z]{3})\s+'?(\d{2,4})?/);
            if (!match) return 0;
            const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
            const year = match[3]
                ? Number(match[3].length === 2 ? "20" + match[3] : match[3])
                : new Date().getFullYear();
            return new Date(year, months[match[2]] || 0, Number(match[1])).getTime();
        };

        return items.map((item, index) => {
            const date = dateOf(item) || item.bookYear || "";
            return {
                date,
                time: timestamp(date) || (Date.UTC(2000, 0, 1) + index * 86400000),
                value: parseDividendAmount(item.value)
            };
        }).filter(item => Number.isFinite(item.value))
          .sort((a, b) => a.time - b.time)
          .slice(-8);
    };

    const first = getDividends(response1, profile1);
    const second = getDividends(response2, profile2);
    sharedDividendAxis = calculateSharedDividendAxis(
        first.concat(second).map(item => item.value)
    );

    if (legend) {
        legend.replaceChildren();
        [[symbol1, "legend-dot-one", "series-one"], [symbol2, "legend-dot-two", "series-two"]].forEach(([symbol, dotClass, seriesClass]) => {
            const item = document.createElement("div");
            const dot = document.createElement("span");
            dot.className = "legend-dot " + dotClass;
            dot.style.background = seriesClass === "series-one"
                ? (getComputedStyle(document.body).getPropertyValue("--primary").trim() || "#2563eb")
                : (getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#7c3aed");
            const label = document.createElement("strong");
            label.textContent = symbol;
            item.append(dot, label);
            legend.appendChild(item);
        });
    }

    const draw = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(300, Math.floor(rect.width || 600));
        const height = Math.max(280, Math.floor(rect.height || 460));
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const styles = getComputedStyle(document.body);
        const css = name => styles.getPropertyValue(name).trim();
        const border = css("--border") || "#e2e8f0";
        const muted = css("--text-muted") || "#94a3b8";
        const text = css("--text-secondary") || "#475569";
        const colors = [
            css("--primary") || "#2563eb",
            css("--accent") || "#7c3aed"
        ];
        const allPoints = first.concat(second);

        if (!allPoints.length) {
            ctx.fillStyle = text;
            ctx.font = "13px system-ui, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("Data dividen belum tersedia untuk dibandingkan.", 16, 28);
            return;
        }

        const dates = Array.from(new Set(allPoints.map(item => item.time))).sort((a, b) => a - b);
        const values = allPoints.map(item => item.value).filter(Number.isFinite);
        let min = Math.min(...values);
        let max = Math.max(...values);
        if (min === max) {
            min -= 1;
            max += 1;
        }

        // Samakan skala dan pola sumbu dengan grafik price history.
        const padding = { top: 30, right: 25, bottom: 45, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const xAt = time => dates.length <= 1
            ? padding.left + chartWidth / 2
            : padding.left + dates.indexOf(time) / (dates.length - 1) * chartWidth;
        const yAt = value => padding.top + ((max - value) / (max - min)) * chartHeight;

        const gridLines = 5;
        ctx.lineWidth = 1;
        ctx.strokeStyle = border;
        ctx.fillStyle = muted;
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "right";
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            const value = max - ((max - min) / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText("Rp" + new Intl.NumberFormat("id-ID", {maximumFractionDigits: 0}).format(Math.round(value)), padding.left - 8, y + 4);
        }

        const drawLine = (items, color) => {
            if (!items.length) return;
            ctx.beginPath();
            items.forEach((point, index) => {
                const x = xAt(point.time);
                const y = yAt(point.value);
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.stroke();

            const last = items[items.length - 1];
            ctx.beginPath();
            ctx.arc(xAt(last.time), yAt(last.value), 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        };

        drawLine(first, colors[0]);
        drawLine(second, colors[1]);

        ctx.fillStyle = text;
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "center";
        const labelIndexes = dates.length <= 4
            ? dates.map((_, i) => i)
            : [0, Math.floor(dates.length / 2), dates.length - 1];
        labelIndexes.forEach(index => {
            const raw = allPoints.find(item => item.time === dates[index])?.date || "";
            const parsed = new Date(dates[index]);
            const label = raw && !/^Pembayaran/.test(raw)
                ? (Number.isNaN(parsed.getTime()) ? raw : formatShortDate(parsed.toISOString()))
                : raw;
            ctx.fillText(String(label).slice(0, 14), xAt(dates[index]), height - 15);
        });
    };

    canvas.__redraw = draw;
    requestAnimationFrame(draw);
}

function renderFinancialV2(response, index, symbol) {
    const suffix = index + 1;
    setText("reportTitle" + suffix, symbol + " — Laporan Keuangan");

    const list = $("financialList" + suffix);
    if (!list) return;
    list.replaceChildren();

    const data = response && !response.__error ? response.data : null;
    const periodKeys = ["quarterly", "annually"].filter(key => data && data[key]);

    if (!data || !periodKeys.length) {
        list.appendChild(createEmptyState("Data laporan keuangan belum tersedia dari API."));
        return;
    }

    const statementLabels = {
        incomeStatement: "Income Statement",
        balanceSheet: "Balance Sheet",
        cashFlow: "Cash Flow",
        cashflow: "Cash Flow",
        cash_flow: "Cash Flow"
    };

    const periodSelect = document.createElement("select");
    periodSelect.className = "financial-select";
    periodSelect.setAttribute("aria-label", "Pilih kuartal atau tahun");

    const typeSelect = document.createElement("select");
    typeSelect.className = "financial-select";
    typeSelect.setAttribute("aria-label", "Pilih jenis laporan");

    const statementTabs = document.createElement("div");
    statementTabs.className = "financial-tabs";
    statementTabs.setAttribute("role", "group");
    statementTabs.setAttribute("aria-label", "Jenis laporan keuangan");

    const controls = document.createElement("div");
    controls.className = "financial-controls";

    const selectors = document.createElement("div");
    selectors.className = "financial-period-controls";

    const typeLabel = document.createElement("label");
    typeLabel.className = "financial-control-label";
    typeLabel.textContent = "Frekuensi";
    typeLabel.appendChild(typeSelect);

    const periodLabel = document.createElement("label");
    periodLabel.className = "financial-control-label";
    periodLabel.textContent = "Periode";
    periodLabel.appendChild(periodSelect);

    selectors.append(typeLabel, periodLabel);
    controls.append(statementTabs, selectors);

    const content = document.createElement("div");
    content.className = "financial-report-content";
    content.appendChild(createEmptyState("Pilih jenis laporan dan periode. Tabel akan diperbarui otomatis."));

    list.append(controls, content);

    const invalidFinancialLiteral = value =>
        typeof value === "boolean" ||
        /^(false|true|null|undefined|nan)$/i.test(String(value == null ? "" : value).trim());

    const cleanFinancialText = value => {
        if (invalidFinancialLiteral(value)) return "—";
        return String(value).replace(/\b(false|true|null|undefined|nan)\b/gi, "—").trim() || "—";
    };

    const displayCell = value => {
        if (value === null || value === undefined || value === "") return "—";
        if (typeof value === "boolean") return "—";

        if (typeof value !== "object") {
            if (typeof value === "number") return formatNumber(value);
            const text = String(value).trim();
            if (/^(false|true|null|undefined|nan)$/i.test(text)) return "—";

            if (/^-?\d[\d,.]*$/.test(text)) {
                const number = Number(text.replace(/,/g, ""));
                if (Number.isFinite(number)) return formatNumber(number);
            }
            return cleanFinancialText(text);
        }

        if (Array.isArray(value)) {
            return value.map(displayCell).filter(text => text !== "—").join(" · ") || "—";
        }

        for (const key of ["formattedValue", "formatted", "displayValue", "display", "value", "amount", "label", "name", "title", "text"]) {
            if (value[key] !== null && value[key] !== undefined && typeof value[key] !== "object") {
                const cleaned = displayCell(value[key]);
                if (cleaned !== "—") return cleaned;
            }
        }

        // Abaikan flag dan properti metadata Boolean yang dikirim API.
        const entries = Object.entries(value).filter(([key, item]) =>
            !["id", "key"].includes(key) &&
            typeof item !== "boolean" &&
            !invalidFinancialLiteral(item)
        );

        return entries.map(([, item]) => displayCell(item))
            .filter(text => text && text !== "—")
            .join(" · ") || "—";
    };

    const prettyMetric = value => {
        const raw = String(value || "").trim();
        if (invalidFinancialLiteral(raw)) return "—";
        return cleanFinancialText(raw)
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b[a-z]/g, char => char.toUpperCase());
    };

    const getStatements = periodName => {
        const periodData = data[periodName];
        if (!periodData || typeof periodData !== "object") return [];
        return Object.entries(periodData).filter(([key, value]) => {
            if (!value || typeof value !== "object") return false;
            return Boolean(
                value.chart ||
                value.table ||
                Array.isArray(value.rows) ||
                statementLabels[key] ||
                /statement|balance|cash.?flow|income|profit|loss|earning|financial/i.test(key)
            );
        }).map(([key, value]) => ({
            key,
            value,
            label: statementLabels[key] || prettyMetric(key)
        }));
    };

    const getTableParts = statement => {
        const tableData = statement && statement.table;
        let rows = [];
        let headers = [];

        if (Array.isArray(tableData)) {
            rows = tableData;
            if (Array.isArray(tableData.headers)) headers = tableData.headers;
        } else if (tableData && typeof tableData === "object") {
            headers = Array.isArray(tableData.headers)
                ? tableData.headers
                : (Array.isArray(tableData.columns) ? tableData.columns : []);

            if (Array.isArray(tableData.rows)) rows = tableData.rows;
            else if (Array.isArray(tableData.data)) rows = tableData.data;
            else {
                const arrays = Object.entries(tableData).filter(([, value]) => Array.isArray(value));
                if (arrays.length) {
                    const count = Math.max(...arrays.map(([, value]) => value.length));
                    rows = Array.from({length: count}, (_, rowIndex) => {
                        const row = {};
                        arrays.forEach(([key, value]) => { row[key] = value[rowIndex]; });
                        return row;
                    });
                }
            }
        }

        return {rows, headers};
    };

    const normalizePeriod = value =>
        cleanFinancialText(value).replace(/\s+/g, " ").trim().toLowerCase();

    const getPeriods = statement => {
        // Zapi/Pluang mengirim table sebagai array objek per periode:
        // { title: "Q2 '25", items: [...], isSelected: false }.
        const periodTables = Array.isArray(statement && statement.table)
            ? statement.table.filter(item => item && Array.isArray(item.items) && item.title)
            : [];
        if (periodTables.length) {
            return periodTables.map(item => cleanFinancialText(item.title));
        }

        // Chart data juga dapat berupa array objek dengan timeframe per baris.
        const chart = statement && statement.chart;
        if (Array.isArray(chart)) {
            const labels = chart
                .map(point => point && point.timeframe)
                .filter(value => value !== null && value !== undefined && !invalidFinancialLiteral(value))
                .map(cleanFinancialText);
            if (labels.length) return labels;
        }

        const timeframe = chart && chart.timeframe;
        if (Array.isArray(timeframe) && timeframe.length) {
            const labels = timeframe
                .filter(value => !invalidFinancialLiteral(value))
                .map(cleanFinancialText);
            if (labels.length) return labels;
        }

        const parts = getTableParts(statement);
        if (parts.headers.length > 1) {
            const labels = parts.headers.slice(1)
                .filter(value => !invalidFinancialLiteral(value))
                .map(cleanFinancialText);
            if (labels.length) return labels;
        }

        return ["Terbaru"];
    };

    const getRowsForSelectedPeriod = (statement, selectedIndex, selectedLabel) => {
        const tableData = statement && statement.table;

        // Format tabel asli Pluang: setiap periode menyimpan "title" dan "items".
        // Setiap item berisi kolom seperti column1, column2, column3, serta metadata.
        if (Array.isArray(tableData)) {
            const periodTables = tableData.filter(item => item && Array.isArray(item.items));
            if (periodTables.length) {
                const target = normalizePeriod(selectedLabel);
                const selectedTable = periodTables.find(item =>
                    item.title && normalizePeriod(item.title) === target
                ) || periodTables[selectedIndex] || periodTables[0];

                const columnKeys = item => Object.keys(item || {})
                    .filter(key => /^column\d+$/i.test(key))
                    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

                let rows = selectedTable.items.map(item => {
                    const keys = columnKeys(item);
                    if (keys.length) return keys.map(key => displayCell(item[key]));
                    if (Array.isArray(item)) return item.map(displayCell);
                    if (item && typeof item === "object") {
                        const labelKey = ["label", "name", "title", "item", "metric", "account", "description", "particulars"].find(key =>
                            item[key] !== null && item[key] !== undefined && typeof item[key] !== "object"
                        );
                        const label = labelKey ? displayCell(item[labelKey]) : "";
                        const rest = Object.entries(item)
                            .filter(([key, value]) =>
                                key !== labelKey &&
                                !["id", "key", "viewType", "isSelected"].includes(key) &&
                                typeof value !== "boolean" &&
                                !invalidFinancialLiteral(value)
                            )
                            .map(([, value]) => displayCell(value));
                        return [label, ...rest].filter((value, index) => index === 0 || value !== "");
                    }
                    return [displayCell(item)];
                }).filter(row => row.some(value => value && value !== "—"));

                let headers = [];
                if (rows.length && /^(item|pos(isi)?|metric|particulars|akun)$/i.test(String(rows[0][0] || "").trim())) {
                    headers = rows.shift();
                }

                const columnCount = Math.max(2, ...rows.map(row => row.length), headers.length);
                if (!headers.length) {
                    headers = Array.from({length: columnCount}, (_, index) =>
                        index === 0 ? "Pos Laporan" : index === 1 ? selectedLabel : index === 2 ? "Perubahan" : "Nilai " + index
                    );
                } else {
                    headers = headers.map((header, index) =>
                        header && header !== "—" ? header : (index === 0 ? "Pos Laporan" : "Nilai " + index)
                    );
                }

                if (rows.length) return { headers, rows };
            }
        }

        // Fallback: chart bisa berupa array berisi satu objek per kuartal/tahun.
        const chart = statement && statement.chart;
        if (Array.isArray(chart) && chart.length) {
            const points = chart.filter(point => point && typeof point === "object");
            const selectedPoint = points.find(point =>
                point.timeframe && normalizePeriod(point.timeframe) === normalizePeriod(selectedLabel)
            ) || points[selectedIndex] || points[0];

            if (selectedPoint) {
                const rows = Object.entries(selectedPoint)
                    .filter(([key, value]) =>
                        key !== "timeframe" &&
                        !["id", "key", "isSelected", "viewType"].includes(key) &&
                        typeof value !== "boolean" &&
                        !invalidFinancialLiteral(key) &&
                        value !== null &&
                        value !== undefined &&
                        typeof value !== "object"
                    )
                    .map(([key, value]) => [prettyMetric(key), displayCell(value)]);

                if (rows.length) return { headers: ["Pos Laporan", selectedLabel], rows };
            }
        }

        // Fallback untuk format API lain yang sudah berbentuk object berisi array nilai.
        const chartObject = chart && !Array.isArray(chart) ? chart : {};
        const timeframes = Array.isArray(chartObject.timeframe) ? chartObject.timeframe : [];
        const metricArrays = Object.entries(chartObject).filter(([key, value]) =>
            key !== "timeframe" &&
            Array.isArray(value) &&
            !invalidFinancialLiteral(key)
        );

        if (timeframes.length && metricArrays.length) {
            const rows = metricArrays.map(([metric, values]) => [
                prettyMetric(metric),
                displayCell(values[selectedIndex])
            ]);
            return { headers: ["Pos Laporan", selectedLabel], rows };
        }

        // Fallback untuk tabel datar dari sumber data lain.
        const parts = getTableParts(statement);
        const sourceRows = parts.rows;
        if (!sourceRows.length) return { headers: [], rows: [] };

        const headerIndex = parts.headers.findIndex(header =>
            normalizePeriod(header) === normalizePeriod(selectedLabel)
        );
        const chosenColumn = headerIndex > 0 ? headerIndex : selectedIndex + 1;
        const labelKeys = ["label", "name", "title", "item", "metric", "account", "description", "particulars", "key"];
        const valueKeys = ["values", "periods", "data", "amounts"];

        const rows = sourceRows.map(row => {
            if (Array.isArray(row)) {
                if (row.length > 1) {
                    const columnIndex = parts.headers.length > 1
                        ? chosenColumn
                        : (row.length > selectedIndex + 1 ? selectedIndex + 1 : 1);
                    return [displayCell(row[0]), displayCell(row[columnIndex])];
                }
                return [displayCell(row[0]), "—"];
            }

            if (row && typeof row === "object") {
                const labelKey = labelKeys.find(key =>
                    row[key] !== null && row[key] !== undefined && typeof row[key] !== "object"
                );
                const label = labelKey ? displayCell(row[labelKey]) : "Pos Laporan";
                const exactKey = Object.keys(row).find(key =>
                    normalizePeriod(key) === normalizePeriod(selectedLabel)
                );
                if (exactKey) return [label, displayCell(row[exactKey])];

                const valueKey = valueKeys.find(key => row[key] !== null && row[key] !== undefined);
                if (valueKey) {
                    let values = row[valueKey];
                    if (values && typeof values === "object" && !Array.isArray(values)) {
                        const exactPeriodKey = Object.keys(values).find(key =>
                            normalizePeriod(key) === normalizePeriod(selectedLabel)
                        );
                        if (exactPeriodKey) return [label, displayCell(values[exactPeriodKey])];
                        values = Object.values(values);
                    }
                    if (Array.isArray(values)) return [label, displayCell(values[selectedIndex])];
                }

                const rest = Object.entries(row)
                    .filter(([key, value]) =>
                        key !== labelKey &&
                        !["id", "key", "viewType", "isSelected"].includes(key) &&
                        typeof value !== "boolean" &&
                        !invalidFinancialLiteral(value)
                    )
                    .map(([, value]) => displayCell(value))
                    .filter(value => value !== "—");

                return [label, rest[selectedIndex] || rest[0] || "—"];
            }

            return [displayCell(row), "—"];
        }).filter(row => row[0] && row[0] !== "—");

        return {
            headers: parts.headers.length ? parts.headers : ["Pos Laporan", selectedLabel],
            rows
        };
    };

    let selectedType = data.quarterly ? "quarterly" : "annually";
    let selectedStatementKey = "";

    const rebuildStatementTabs = () => {
        const statements = getStatements(selectedType);
        statementTabs.replaceChildren();

        if (!statements.length) {
            selectedStatementKey = "";
            statementTabs.appendChild(createEmptyState("Jenis laporan tidak tersedia untuk frekuensi ini."));
            updatePeriodOptions();
            return;
        }

        if (!statements.some(item => item.key === selectedStatementKey)) {
            selectedStatementKey = statements[0].key;
        }

        statements.forEach(item => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "financial-tab" + (item.key === selectedStatementKey ? " active" : "");
            button.textContent = item.label;
            button.setAttribute("aria-pressed", String(item.key === selectedStatementKey));
            button.addEventListener("click", () => {
                selectedStatementKey = item.key;
                rebuildStatementTabs();
                updatePeriodOptions();
                showSelectionHint();
            });
            statementTabs.appendChild(button);
        });

        updatePeriodOptions();
    };

    const updatePeriodOptions = () => {
        const statements = getStatements(selectedType);
        const selected = statements.find(item => item.key === selectedStatementKey) || statements[0];
        periodSelect.replaceChildren();

        if (!selected) {
            const option = document.createElement("option");
            option.value = "0";
            option.textContent = "Tidak tersedia";
            periodSelect.appendChild(option);
            return;
        }

        getPeriods(selected.value).forEach((label, periodIndex) => {
            const option = document.createElement("option");
            option.value = String(periodIndex);
            option.textContent = label;
            periodSelect.appendChild(option);
        });
    };

    const showSelectionHint = () => renderSelectedReport();

    periodKeys.forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key === "quarterly" ? "Kuartalan" : "Tahunan";
        typeSelect.appendChild(option);
    });
    typeSelect.value = selectedType;

    typeSelect.addEventListener("change", () => {
        selectedType = typeSelect.value;
        rebuildStatementTabs();
        showSelectionHint();
    });

    periodSelect.addEventListener("change", showSelectionHint);

    const renderSelectedReport = () => {
        content.replaceChildren();
        const statements = getStatements(selectedType);
        const selected = statements.find(item => item.key === selectedStatementKey);
        if (!selected) {
            content.appendChild(createEmptyState("Laporan yang dipilih tidak tersedia."));
            return;
        }

        const periods = getPeriods(selected.value);
        const selectedIndex = Math.max(0, Number(periodSelect.value) || 0);
        const selectedPeriod = periods[selectedIndex] || periods[0] || "Terbaru";
        const section = document.createElement("section");
        section.className = "financial-statement";

        const heading = document.createElement("h4");
        heading.textContent = selected.label + " · " + selectedPeriod;
        section.appendChild(heading);

        const reportTable = getRowsForSelectedPeriod(selected.value, selectedIndex, selectedPeriod);
        const rows = reportTable.rows || [];
        if (!rows.length) {
            section.appendChild(createEmptyState("Rincian untuk laporan dan periode ini belum tersedia dalam format tabel."));
            content.appendChild(section);
            return;
        }

        const tableWrap = document.createElement("div");
        tableWrap.className = "financial-table-wrap";
        const table = document.createElement("table");
        table.className = "financial-table";

        const columnCount = Math.max(
            (reportTable.headers || []).length,
            ...rows.map(row => row.length),
            2
        );
        const headers = Array.from({length: columnCount}, (_, index) =>
            (reportTable.headers || [])[index] ||
            (index === 0 ? "Pos Laporan" : index === 1 ? selectedPeriod : "Kolom " + (index + 1))
        );

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        headers.forEach(label => {
            const th = document.createElement("th");
            th.textContent = cleanFinancialText(label);
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        rows.forEach(row => {
            const tr = document.createElement("tr");
            Array.from({length: columnCount}, (_, index) => row[index] ?? "—").forEach((value, index) => {
                const cell = document.createElement(index === 0 ? "th" : "td");
                cell.textContent = cleanFinancialText(value);
                tr.appendChild(cell);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        section.appendChild(tableWrap);
        content.appendChild(section);
    };

    // Tunggu pilihan parameter pertama. Perubahan parameter setelah itu
    // langsung merender ulang laporan tanpa tombol konfirmasi.
    rebuildStatementTabs();
}

function createV2Navigation() {
    if ($("v2SectionNav")) return;

    const result = $("result");
    if (!result || !result.parentNode) return;

    const nav = document.createElement("nav");
    nav.id = "v2SectionNav";
    nav.className = "section-nav";
    nav.setAttribute("aria-label", "Navigasi hasil analisis");

    const items = [
        ["Overview", "result"],
        ["Fundamentals", "comparison"],
        ["Market", "marketSection"],
        ["Chart", "chartSection"],
        ["Dividend", "dividendSection"],
        ["Financials", "financialSection"],
        ["Profile", "profileSection"]
    ];

    items.forEach(([label, targetId]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "section-nav-item";
        button.dataset.target = targetId;
        button.textContent = label;

        button.addEventListener("click", () => {
            const target = $(targetId);
            if (!target) return;

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        nav.appendChild(button);
    });

    result.parentNode.insertBefore(nav, result);
    setupV2SectionObserver();
}

let v2SectionObserver = null;

function setupV2SectionObserver() {
    if (v2SectionObserver) v2SectionObserver.disconnect();

    const nav = $("v2SectionNav");
    if (!nav) return;

    const targets = [
        "result",
        "comparison",
        "marketSection",
        "chartSection",
        "dividendSection",
        "financialSection",
        "profileSection"
    ].map(id => $(id)).filter(Boolean);

    const buttons = [...nav.querySelectorAll(".section-nav-item")];

    v2SectionObserver = new IntersectionObserver(
        entries => {
            const visible =
                entries
                    .filter(entry => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio - a.intersectionRatio
                    )[0];

            if (!visible) return;

            buttons.forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.target === visible.target.id
                );
            });
        },
        {
            rootMargin: "-18% 0px -65% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        }
    );

    targets.forEach(target => v2SectionObserver.observe(target));
}

const legacyShowResultsV2 = showResults;

function showResultsV2() {
    legacyShowResultsV2();
    ensureFundamentalRows();

    const comparison = $("comparison");
    const result = $("result");

    if (
        result &&
        comparison &&
        result.nextElementSibling !== comparison
    ) {
        result.parentNode.insertBefore(
            comparison,
            result.nextElementSibling
        );
    }

    createV2Navigation();
    setupV2SectionObserver();
}

const COMPARISON_CACHE_KEY = "isc-comparison-cache-v1";

function readComparisonCache(symbol1, symbol2) {
    try {
        const raw = localStorage.getItem(COMPARISON_CACHE_KEY);
        if (!raw) return null;
        const cache = JSON.parse(raw);
        if (
            cache.symbol1 !== symbol1 ||
            cache.symbol2 !== symbol2 ||
            !cache.data1 ||
            !cache.data2
        ) return null;
        return cache;
    } catch (error) {
        console.warn("Cache perbandingan tidak dapat dibaca:", error);
        return null;
    }
}

function saveComparisonCache(symbol1, symbol2, data1, data2) {
    try {
        localStorage.setItem(COMPARISON_CACHE_KEY, JSON.stringify({
            symbol1,
            symbol2,
            savedAt: new Date().toISOString(),
            data1,
            data2
        }));
        return true;
    } catch (error) {
        console.warn("Cache perbandingan tidak dapat disimpan (mungkin kapasitas penyimpanan browser penuh):", error);
        return false;
    }
}

function restoreLastComparison() {
    try {
        const raw = localStorage.getItem(COMPARISON_CACHE_KEY);
        if (!raw) return;
        const cache = JSON.parse(raw);
        if (!cache.symbol1 || !cache.symbol2 || !cache.data1 || !cache.data2) return;
        const input1 = $("stock1");
        const input2 = $("stock2");
        if (!input1 || !input2) return;
        input1.value = cache.symbol1;
        input2.value = cache.symbol2;
        compareStocksV2(true);
    } catch (error) {
        console.warn("Perbandingan sebelumnya tidak dapat dipulihkan:", error);
    }
}

function getEndpointFailureSummary(stockData, symbol) {
    const labels = {
        summary: "ringkasan pasar",
        profile: "profil perusahaan",
        history: "riwayat harga",
        fundamentals: "fundamental",
        dividends: "dividen",
        financial: "laporan keuangan"
    };

    return TYPES
        .filter(type => stockData && stockData[type] && stockData[type].__error)
        .map(type => `${symbol}: ${labels[type]} (${stockData[type].message || "gagal"})`);
}

async function compareStocksV2(restoreOnly = false) {
    const stock1 = cleanSymbol($("stock1")?.value);
    const stock2 = cleanSymbol($("stock2")?.value);

    const status = $("status");
    const button = $("compareButton");
    const buttonText = $("buttonText");

    if (!stock1 || !stock2) {
        if (status) {
            status.className = "status error";
            status.textContent =
                "Masukkan dua kode saham terlebih dahulu.";
        }
        return;
    }

    if (stock1 === stock2) {
        if (status) {
            status.className = "status error";
            status.textContent =
                "Pilih dua saham yang berbeda.";
        }
        return;
    }

    if (button) button.disabled = true;
    if (buttonText) buttonText.textContent = "Memuat data...";

    // Saat halaman dibuka ulang, tampilkan snapshot lokal terlebih dahulu.
    // Setelah UI pulih, jalankan perbandingan normal agar data diperbarui sesuai TTL cache HTTP/Worker.
    const cachedComparison = restoreOnly ? readComparisonCache(stock1, stock2) : null;

    if (restoreOnly && !cachedComparison) return;

    if (status) {
        status.className = "status loading";
        status.textContent = cachedComparison
            ? "Memulihkan perbandingan tersimpan tanpa meminta data API..."
            : "Mengambil data dari IDX & Pluang...";
    }

    try {
        let stockData1;
        let stockData2;

        if (cachedComparison) {
            stockData1 = cachedComparison.data1;
            stockData2 = cachedComparison.data2;
        } else {
            [stockData1, stockData2] = await Promise.all([
                loadStock(stock1),
                loadStock(stock2)
            ]);
            saveComparisonCache(stock1, stock2, stockData1, stockData2);
        }

        renderSummaryV2(stockData1.summary, 0, stock1);
        renderSummaryV2(stockData2.summary, 1, stock2);

        renderFundamentalsV2(stockData1.fundamentals, 0, stock1);
        renderFundamentalsV2(stockData2.fundamentals, 1, stock2);
        renderFundamentalIntegrityNote(
            stockData1.fundamentals, stock1,
            stockData2.fundamentals, stock2
        );

        renderProfileV2(stockData1.profile, 0, stock1);
        renderProfileV2(stockData2.profile, 1, stock2);

        renderDividendsV2(
            stockData1.dividends,
            stockData1.profile,
            0,
            stock1
        );

        renderDividendsV2(
            stockData2.dividends,
            stockData2.profile,
            1,
            stock2
        );

        renderDividendComparisonV2(
            stockData1.dividends, stockData1.profile, stock1,
            stockData2.dividends, stockData2.profile, stock2
        );

        renderFinancialV2(stockData1.financial, 0, stock1);
        renderFinancialV2(stockData2.financial, 1, stock2);


        const history1 = extractHistory(stockData1.history);
        const history2 = extractHistory(stockData2.history);

        setText("chartLegend1", stock1);
        setText("chartLegend2", stock2);

        setText(
            "chartSubtitle",
            "Riwayat harga " +
            stock1 +
            " dan " +
            stock2 +
            " dari data yang tersedia."
        );

        drawPriceChart(
            history1,
            history2,
            stock1,
            stock2
        );

        showResultsV2();

        if (status) {
            const endpointFailures = [
                ...getEndpointFailureSummary(stockData1, stock1),
                ...getEndpointFailureSummary(stockData2, stock2)
            ];

            const cacheHits = [
                ...TYPES.filter(type => stockData1?.[type]?.__iscCacheStatus === "HIT").map(type => `${stock1} ${type}`),
                ...TYPES.filter(type => stockData2?.[type]?.__iscCacheStatus === "HIT").map(type => `${stock2} ${type}`)
            ];

            if (endpointFailures.length) {
                status.className = "status warning";
                status.textContent =
                    "Perbandingan tampil, tetapi data belum lengkap. Gagal mengambil " +
                    endpointFailures.join("; ") +
                    ". Nilai yang tidak tersedia tidak dianggap nol.";
            } else if (cacheHits.length) {
                status.className = "status warning";
                status.textContent =
                    "Perbandingan tampil, tetapi sebagian respons berasal dari cache Worker permanen (" +
                    cacheHits.join(", ") +
                    "). Data bisa usang; cek timestamp dan sumber sebelum menganggapnya terbaru.";
            } else {
                status.className = "status success";
                status.textContent = cachedComparison
                    ? "Data tersimpan ditampilkan; pemeriksaan pembaruan akan berjalan otomatis."
                    : "Semua endpoint berhasil merespons. Periksa catatan sumber dan waktu data di bawah tabel.";
            }
        }

        if (restoreOnly && cachedComparison) {
            // Re-fetch through the normal flow after the cached UI is visible.
            // Browser/Worker cache policies decide whether the upstream API is needed.
            setTimeout(() => {
                const sameComparison =
                    cleanSymbol($("stock1")?.value) === stock1 &&
                    cleanSymbol($("stock2")?.value) === stock2;

                if (sameComparison) {
                    compareStocksV2(false);
                }
            }, 0);
        }

        if (!restoreOnly) {
            setTimeout(() => {
                $("result")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 150);
        }

    } catch (error) {
        console.error(error);

        if (status) {
            status.className = "status error";
            status.textContent =
                "Terjadi kesalahan saat mengambil data.";
        }
    } finally {
        if (button) button.disabled = false;
        if (buttonText) buttonText.textContent = "Bandingkan Saham";
    }
}

compareStocks = compareStocksV2;

document.addEventListener("DOMContentLoaded", () => {
    restoreLastComparison();
});
