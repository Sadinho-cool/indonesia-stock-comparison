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
    "logo",
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


    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            `${type}: HTTP ${response.status}`
        );

    }


    const json = await response.json();


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
    return value === null || value === undefined || value === ""
        ? "Belum tersedia"
        : value;
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
        ["ROE", "tableRoe1", "tableRoe2"],
        ["ROA", "tableRoa1", "tableRoa2"],
        ["DER", "tableDer1", "tableDer2"],
        ["Revenue", "tableRevenue1", "tableRevenue2"],
        ["Net Profit", "tableNetProfit1", "tableNetProfit2"]
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

    setText("dividend" + suffix, v2Value(data.dividendYield));
    setText("per" + suffix, v2Value(data.per));
    setText("pbv" + suffix, v2Value(data.pbv));

    setText("tableDividend" + suffix, v2Value(data.dividendYield));
    setText("tablePer" + suffix, v2Value(data.per));
    setText("tablePbv" + suffix, v2Value(data.pbv));
    setText("tableRoe" + suffix, v2Value(data.roe));
    setText("tableRoa" + suffix, v2Value(data.roa));
    setText("tableDer" + suffix, v2Value(data.der));
    setText("tableRevenue" + suffix, v2Value(data.revenue));
    setText("tableNetProfit" + suffix, v2Value(data.netProfit));
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
        dividends = safeArray(profile?.dividends).map(item => ({
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
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
        const match = String(value).match(/(\d{1,2})\s+([A-Za-z]{3})\s+'?(\d{2,4})?/);
        if (!match) return 0;
        const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
        const year = match[3] ? Number(match[3].length === 2 ? "20" + match[3] : match[3]) : new Date().getFullYear();
        return new Date(year, months[match[2]] ?? 0, Number(match[1])).getTime();
    };
    dividends.sort((a, b) => toTimestamp(parseDate(b)) - toTimestamp(parseDate(a)));

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
    meta.textContent = dates.join(" • ") || latest.title || "Tanggal belum tersedia";
    info.append(name, meta);
    latestItem.appendChild(info);
    list.appendChild(latestItem);

    const canvas = document.createElement("canvas");
    canvas.className = "dividend-chart";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Grafik nilai dividen per saham " + symbol);
    list.appendChild(canvas);

    const values = dividends.slice(0, 10).map(item => {
        const raw = String(item.value || "").replace(/[^0-9,.-]/g, "").replace(",", ".");
        return Number(raw);
    }).reverse();
    const labels = dividends.slice(0, 10).reverse().map(item => {
        const d = parseDate(item);
        return d || item.bookYear || "";
    });
    const drawDividendChart = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(280, Math.floor(rect.width || 320));
        const height = 190;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.height = height + "px";
        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const root = getComputedStyle(document.documentElement);
        const css = name => root.getPropertyValue(name).trim();
        const textColor = css("--text") || getComputedStyle(document.body).color || "#172033";
        const muted = css("--text-secondary") || textColor;
        const border = css("--border") || "#d1d5db";
        const color = css("--primary") || "#2563eb";
        const valid = values.filter(v => Number.isFinite(v));

        if (!valid.length || valid.every(v => v === 0)) {
            ctx.fillStyle = textColor;
            ctx.font = "12px system-ui, sans-serif";
            ctx.fillText("Data dividen tidak tersedia untuk grafik.", 10, 24);
            return;
        }

        const maxValue = Math.max(...valid, 1);
        const unit = maxValue <= 10 ? 1 : maxValue <= 100 ? 10 : 100;
        const max = Math.ceil(maxValue / unit) * unit;
        const pad = {top: 20, right: 10, bottom: 38, left: 48};
        const chartW = width - pad.left - pad.right;
        const chartH = height - pad.top - pad.bottom;

        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.fillStyle = muted;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        for (let tick = 0; tick <= 4; tick++) {
            const value = max * tick / 4;
            const y = pad.top + chartH - chartH * tick / 4;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(width - pad.right, y);
            ctx.stroke();
            ctx.fillText(new Intl.NumberFormat("id-ID", {maximumFractionDigits: 2}).format(value), pad.left - 7, y + 3);
        }

        const gap = values.length > 6 ? 5 : 9;
        const barW = Math.max(8, (chartW - gap * Math.max(0, values.length - 1)) / values.length);
        values.forEach((value, i) => {
            if (!Number.isFinite(value)) return;
            const x = pad.left + i * (barW + gap);
            const barH = Math.max(2, value / max * chartH);
            ctx.fillStyle = color;
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") ctx.roundRect(x, pad.top + chartH - barH, barW, barH, 4);
            else ctx.rect(x, pad.top + chartH - barH, barW, barH);
            ctx.fill();

            if (values.length <= 6 && barW >= 25) {
                ctx.fillStyle = textColor;
                ctx.font = "10px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(new Intl.NumberFormat("id-ID", {maximumFractionDigits: 2}).format(value), x + barW / 2, Math.max(12, pad.top + chartH - barH - 5));
            }
            if (values.length <= 8 || i === 0 || i === values.length - 1 || i % 2 === 0) {
                ctx.fillStyle = muted;
                ctx.font = "9px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(String(labels[i]).slice(0, 8), x + barW / 2, height - 13);
            }
        });
    };
    requestAnimationFrame(drawDividendChart);
    if (!window.__dividendResizeBound) {
        window.addEventListener("resize", () => {
            document.querySelectorAll(".dividend-comparison-chart").forEach(c => { if (typeof c.__redraw === "function") c.__redraw(); });
            document.querySelectorAll(".dividend-chart").forEach(c => {
                if (typeof c.__redraw === "function") c.__redraw();
            });
        });
        window.__dividendResizeBound = true;
    }
    canvas.__redraw = drawDividendChart;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "dividend-history-toggle";
    toggle.textContent = "Lihat riwayat dividen (" + dividends.length + ")";
    toggle.setAttribute("aria-expanded", "false");
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
    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        history.classList.toggle("hidden", expanded);
        toggle.textContent = (expanded ? "Lihat" : "Sembunyikan") + " riwayat dividen" + (expanded ? " (" + dividends.length + ")" : "");
    });
    list.append(toggle, history);
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
            items = safeArray(profile.data?.dividends).map(item => ({
                type: "DIVIDEND",
                value: item.cashPerShare != null ? "Rp" + item.cashPerShare : null,
                fields: { "Pay Date": item.paymentDate, "Ex Date": item.exDate },
                bookYear: item.bookYear
            }));
        }
        const dateOf = item => {
            const fields = item.fields || {};
            return fields["Pay Date"] || fields["Ex Date"] || fields["Cum Date"] || item.bookYear || "";
        };
        const timestamp = value => {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
            const match = String(value).match(/(\d{1,2})\s+([A-Za-z]{3})\s+'?(\d{2,4})?/);
            if (!match) return 0;
            const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
            const year = match[3] ? Number(match[3].length === 2 ? "20" + match[3] : match[3]) : new Date().getFullYear();
            return new Date(year, months[match[2]] ?? 0, Number(match[1])).getTime();
        };
        return items.map(item => {
            const raw = String(item.value || "").replace(/[^0-9,.-]/g, "").replace(",", ".");
            return { date: dateOf(item), time: timestamp(dateOf(item)), value: Number(raw) };
        }).filter(item => Number.isFinite(item.value)).sort((a,b) => a.time - b.time).slice(-8);
    };

    const first = getDividends(response1, profile1);
    const second = getDividends(response2, profile2);
    const count = Math.max(first.length, second.length);
    const labels = Array.from({length: count}, (_, i) => "Ke-" + (i + 1));
    const values1 = Array.from({length: count}, (_, i) => first[i]?.value ?? null);
    const values2 = Array.from({length: count}, (_, i) => second[i]?.value ?? null);

    if (legend) {
        legend.replaceChildren();
        [[symbol1, "series-one"], [symbol2, "series-two"]].forEach(([labelText, cls]) => {
            const item = document.createElement("span");
            item.className = "dividend-legend-item";
            const swatch = document.createElement("i");
            swatch.className = "dividend-legend-swatch " + cls;
            const label = document.createElement("span");
            label.textContent = labelText;
            item.append(swatch, label);
            legend.appendChild(item);
        });
    }

    const draw = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(300, Math.floor(rect.width || 600));
        const height = 270;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.height = height + "px";
        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const root = getComputedStyle(document.documentElement);
        const css = name => root.getPropertyValue(name).trim();
        const textColor = css("--text") || getComputedStyle(document.body).color || "#172033";
        const muted = css("--text-secondary") || textColor;
        const border = css("--border") || "#d1d5db";
        const colors = [css("--primary") || "#2563eb", css("--accent") || "#7c3aed"];
        const series = [values1, values2];
        const valid = series.flat().filter(v => v != null && Number.isFinite(v));

        if (!valid.length) {
            ctx.fillStyle = textColor;
            ctx.font = "13px sans-serif";
            ctx.fillText("Data dividen belum tersedia untuk dibandingkan.", 12, 24);
            return;
        }

        const maxValue = Math.max(...valid, 1);
        const max = Math.ceil(maxValue / (maxValue <= 10 ? 1 : maxValue <= 100 ? 10 : 100)) *
            (maxValue <= 10 ? 1 : maxValue <= 100 ? 10 : 100);
        const pad = {left: 52, right: 18, top: 18, bottom: 38};
        const chartW = width - pad.left - pad.right;
        const chartH = height - pad.top - pad.bottom;

        ctx.font = "11px system-ui, sans-serif";
        ctx.lineWidth = 1;
        ctx.strokeStyle = border;
        ctx.fillStyle = muted;
        ctx.textAlign = "right";
        for (let tick = 0; tick <= 4; tick++) {
            const value = max * tick / 4;
            const y = pad.top + chartH - chartH * tick / 4;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(width - pad.right, y);
            ctx.stroke();
            ctx.fillText("Rp" + new Intl.NumberFormat("id-ID", {maximumFractionDigits: 2}).format(value), pad.left - 8, y + 4);
        }

        const xAt = i => count <= 1 ? pad.left + chartW / 2 : pad.left + chartW * i / (count - 1);
        const yAt = value => pad.top + chartH - value / max * chartH;
        series.forEach((values, si) => {
            ctx.strokeStyle = colors[si];
            ctx.fillStyle = colors[si];
            ctx.lineWidth = 2.5;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.beginPath();
            let started = false;
            values.forEach((value, i) => {
                if (value == null || !Number.isFinite(value)) { started = false; return; }
                const x = xAt(i), y = yAt(value);
                if (!started) { ctx.moveTo(x, y); started = true; }
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            values.forEach((value, i) => {
                if (value == null || !Number.isFinite(value)) return;
                const x = xAt(i), y = yAt(value);
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = textColor;
                ctx.font = "10px system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(new Intl.NumberFormat("id-ID", {maximumFractionDigits: 2}).format(value), x, Math.max(12, y - 9));
                ctx.fillStyle = colors[si];
            });
        });

        ctx.fillStyle = muted;
        ctx.font = "11px system-ui, sans-serif";
        ctx.textAlign = "center";
        labels.forEach((label, i) => {
            if (count <= 8 || i === 0 || i === count - 1 || i % 2 === 0) {
                ctx.fillText(label, xAt(i), height - 14);
            }
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
    if (!data || (!data.quarterly && !data.annually)) {
        list.appendChild(createEmptyState("Data laporan keuangan belum tersedia dari API."));
        return;
    }

    const periodTabs = document.createElement("div");
    periodTabs.className = "financial-tabs";
    const content = document.createElement("div");
    content.className = "financial-report-content";
    list.append(periodTabs, content);

    const renderPeriod = periodName => {
        content.replaceChildren();
        const periodData = data[periodName];
        if (!periodData) {
            content.appendChild(createEmptyState("Periode ini tidak tersedia."));
            return;
        }
        const statements = [
            ["incomeStatement", "Laba Rugi"],
            ["balanceSheet", "Neraca"],
            ["cashFlow", "Arus Kas"]
        ];
        statements.forEach(([key, label]) => {
            const statement = periodData[key];
            if (!statement) return;
            const section = document.createElement("section");
            section.className = "financial-statement";
            const heading = document.createElement("h4");
            heading.textContent = statement.title || label;
            section.appendChild(heading);

            const tableData = statement.table;
            let rows = [];
            if (Array.isArray(tableData)) rows = tableData;
            else if (tableData && Array.isArray(tableData.rows)) rows = tableData.rows;
            else if (tableData && Array.isArray(tableData.data)) rows = tableData.data;
            else if (tableData && typeof tableData === "object") {
                const keys = Object.keys(tableData);
                const arrays = keys.map(k => tableData[k]).filter(Array.isArray);
                if (arrays.length) {
                    const first = arrays[0];
                    rows = first.map((_, i) => {
                        const row = {};
                        keys.forEach(k => { if (Array.isArray(tableData[k])) row[k] = tableData[k][i]; });
                        return row;
                    });
                }
            }

            if (!rows.length) {
                const chart = statement.chart || {};
                const periods = Array.isArray(chart.timeframe) ? chart.timeframe : [];
                const metrics = Object.entries(chart).filter(([k,v]) => k !== "timeframe" && Array.isArray(v));
                if (periods.length && metrics.length) {
                    const table = document.createElement("div");
                    table.className = "financial-table-wrap";
                    const tbl = document.createElement("table");
                    tbl.className = "financial-table";
                    const thead = document.createElement("thead");
                    const trh = document.createElement("tr");
                    ["Pos", ...periods].forEach(text => {
                        const th = document.createElement("th"); th.textContent = text; trh.appendChild(th);
                    });
                    thead.appendChild(trh); tbl.appendChild(thead);
                    const tbody = document.createElement("tbody");
                    metrics.forEach(([metric, values]) => {
                        const tr = document.createElement("tr");
                        const th = document.createElement("th"); th.textContent = metric; tr.appendChild(th);
                        values.forEach(v => { const td = document.createElement("td"); td.textContent = v == null ? "—" : formatNumber(v); tr.appendChild(td); });
                        tbody.appendChild(tr);
                    });
                    tbl.appendChild(tbody); table.appendChild(tbl); section.appendChild(table);
                } else {
                    section.appendChild(createEmptyState("Rincian " + label.toLowerCase() + " belum tersedia."));
                }
                content.appendChild(section);
                return;
            }

            const table = document.createElement("div");
            table.className = "financial-table-wrap";
            const tbl = document.createElement("table");
            tbl.className = "financial-table";
            const displayCell = value => {
                if (value == null || value === "") return "—";
                if (typeof value !== "object") return String(value);
                if (Array.isArray(value)) return value.map(displayCell).join(" · ");
                for (const key of ["formattedValue", "formatted", "displayValue", "display", "value", "amount", "label", "name", "title", "text"]) {
                    if (value[key] != null && typeof value[key] !== "object") return String(value[key]);
                }
                const entries = Object.entries(value).filter(([key]) => !["id", "key"].includes(key));
                return entries.map(([key, item]) => {
                    if (item == null || typeof item !== "object") return String(item ?? "—");
                    return displayCell(item);
                }).filter(Boolean).join(" · ") || "—";
            };
            const rowLabelKeys = ["label", "name", "title", "item", "metric", "account", "description", "particulars", "key"];
            const normalized = rows.map(row => {
                if (Array.isArray(row)) return row.map(displayCell);
                if (row && typeof row === "object") {
                    const labelKey = rowLabelKeys.find(key => row[key] != null && typeof row[key] !== "object");
                    const label = labelKey ? displayCell(row[labelKey]) : null;
                    const valueKey = ["values", "periods", "data", "amounts"].find(key => row[key] != null);
                    let values = valueKey ? row[valueKey] : null;
                    if (values && typeof values === "object" && !Array.isArray(values)) {
                        values = Object.values(values);
                    }
                    if (Array.isArray(values)) return [ ...(label ? [label] : []), ...values.map(displayCell) ];
                    const rest = Object.entries(row)
                        .filter(([key]) => key !== labelKey && !["id", "key"].includes(key))
                        .map(([, value]) => displayCell(value));
                    return [ ...(label ? [label] : []), ...rest ];
                }
                return [displayCell(row)];
            });
            const headers = Array.isArray(tableData?.headers) ? tableData.headers :
                (Array.isArray(tableData?.columns) ? tableData.columns : []);
            const thead = document.createElement("thead");
            const trh = document.createElement("tr");
            (headers.length ? headers : normalized[0].map((_, i) => i === 0 ? "Pos Laporan" : "Nilai " + i))
                .forEach(value => { const th = document.createElement("th"); th.textContent = String(value); trh.appendChild(th); });
            thead.appendChild(trh); tbl.appendChild(thead);
            const tbody = document.createElement("tbody");
            normalized.forEach(row => {
                const tr = document.createElement("tr");
                row.forEach((value, i) => {
                    const cell = document.createElement(i === 0 ? "th" : "td");
                    cell.textContent = value;
                    tr.appendChild(cell);
                });
                tbody.appendChild(tr);
            });
            tbl.appendChild(tbody); table.appendChild(tbl); section.appendChild(table);
            content.appendChild(section);
        });
    };

    [["quarterly","Kuartalan"],["annually","Tahunan"]].forEach(([key,label], i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "financial-tab" + (i === 0 ? " active" : "");
        button.textContent = label;
        button.addEventListener("click", () => {
            periodTabs.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === button));
            renderPeriod(key);
        });
        periodTabs.appendChild(button);
    });
    renderPeriod(data.quarterly ? "quarterly" : "annually");
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

    // Cache hanya dipakai saat pemulihan otomatis setelah halaman dibuka ulang.
    // Klik tombol Bandingkan secara sengaja tetap mengambil data terbaru dari API.
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
            status.className = "status success";
            status.textContent = cachedComparison
                ? "Perbandingan dipulihkan dari penyimpanan lokal; tidak ada request API baru."
                : "Data berhasil diperbarui dan disimpan di browser.";
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
