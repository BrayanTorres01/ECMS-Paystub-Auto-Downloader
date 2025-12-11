// ==UserScript==
// @name         ECMS Paystub Auto Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Build queue on paystub table, then auto-open and download each PDF
// @match        http://10.100.82.83:10000/*
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// ==/UserScript==

(function () {
    "use strict";

    const href = window.location.href;

    // --------- Helpers for queue ---------
    function getQueue() {
        let stored = GM_getValue("ecms_paystub_queue", "[]");

        // If some older script stored the queue as an array, just use it directly.
        if (Array.isArray(stored)) {
            return stored;
        }

        // Otherwise, assume it's a JSON string and try to parse it.
        if (typeof stored === "string") {
            try {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.warn("ECMS: could not parse stored queue, resetting.", e);
                return [];
            }
        }

        // Fallback
        return [];
    }

    function setQueue(q) {
        // From now on, store the queue as an ARRAY, not a JSON string.
        GM_setValue("ecms_paystub_queue", Array.isArray(q) ? q : []);
    }

    function getIndex() {
        return Number(GM_getValue("ecms_paystub_index", 0)) || 0;
    }

    function setIndex(i) {
        GM_setValue("ecms_paystub_index", i);
    }

    // --------- PART 1: Paystub table page ---------
    (function handlePaystubTablePage() {
        // Look for the paystub table body
        const tbody =
            document.querySelector("tbody[id$='subfile:tb']") ||
            document.querySelector("tbody.rich-table-tbody");

        if (!tbody) return; // not the table page

        const rows = Array.from(tbody.querySelectorAll("tr.rich-table-row"));
        if (!rows.length) return;

        console.log("ECMS: found", rows.length, "paystub rows.");

        // Add start button
        const btn = document.createElement("button");
        btn.textContent = "AUTO DOWNLOAD ALL PAYSTUBS";
        btn.style.position = "fixed";
        btn.style.top = "80px";
        btn.style.right = "20px";
        btn.style.padding = "10px 16px";
        btn.style.zIndex = "999999";
        btn.style.background = "#2e7d32";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        document.body.appendChild(btn);

        btn.addEventListener("click", () => {
            const queue = [];

            for (const row of rows) {
                const cells = Array.from(row.querySelectorAll("td"));

                // Find cell that looks like MM/DD/YYYY
                let dateText = null;
                for (const td of cells) {
                    const t = td.textContent.trim();
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) {
                        dateText = t;
                        break;
                    }
                }
                if (!dateText) {
                    console.warn("No date found in row:", row);
                    continue;
                }

                const filename = dateText.replace(/\//g, "-") + ".pdf";

                // Find thumbnail with openImaging
                const img =
                    row.querySelector("img[onclick*='openImaging']") ||
                    row.querySelector("img");

                if (!img) {
                    console.warn("No thumbnail/openImaging img for", filename);
                    continue;
                }

                const onclick = img.getAttribute("onclick") || "";
                const m = onclick.match(/openImaging\('([^']+)','([^']+)'/);
                if (!m) {
                    console.warn("Could not parse openImaging for", filename, onclick);
                    continue;
                }

                const ctx = m[1];   // usually "ecms"
                const path = m[2];  // "/imaging/document/associationRedirect.faces?...";
                const assocUrl = `${location.origin}/${ctx}${path}`;

                console.log("Queued:", filename, "->", assocUrl);

                queue.push({ filename, assocUrl });
            }

            if (!queue.length) {
                alert("No paystubs queued – check the table structure.");
                return;
            }

            setQueue(queue);
            setIndex(0);

            console.log("ECMS: queue stored as array. Length =", queue.length);
            alert(`Starting auto-download for ${queue.length} paystubs…`);

            // Go to first associationRedirect URL
            window.location.href = queue[0].assocUrl;
        });
    })();

    // --------- PART 2: Viewer pages (associationRedirect / viewImageContent / viewImage.jsp) ---------
    (function handleViewerPages() {
        // Only care about imaging/document URLs
        if (!href.includes("/ecms/imaging/document/")) return;

        let queue = getQueue();
        let index = getIndex();

        console.log(
            "ECMS viewer: retrieved queue. Is array? ",
            Array.isArray(queue),
            " length = ",
            queue.length
        );

        if (!queue.length || index >= queue.length) {
            console.log("ECMS viewer: no active queue.");
            return;
        }

        const current = queue[index];
        console.log(
            "ECMS viewer: index",
            index,
            "of",
            queue.length,
            "->",
            current
        );

        // 2A) associationRedirect.faces or viewImageContent.faces:
        //     find iframe#imageIframe and link to viewImage.jsp
        if (
            href.includes("associationRedirect.faces") ||
            href.includes("viewImageContent")
        ) {
            console.log(
                "ECMS viewer: on associationRedirect/viewImageContent, waiting for iframe…"
            );

            const maxAttempts = 40;
            let attempts = 0;

            const timer = setInterval(() => {
                attempts++;
                const iframe = document.querySelector("iframe#imageIframe");
                if (iframe && iframe.contentDocument) {
                    try {
                        const idoc =
                            iframe.contentDocument ||
                            iframe.contentWindow.document;
                        const a = idoc.querySelector("a[href*='viewImage.jsp']");
                        if (a) {
                            clearInterval(timer);
                            console.log(
                                "ECMS viewer: found viewImage.jsp link, redirecting:",
                                a.href
                            );
                            window.location.href = a.href;
                            return;
                        }
                    } catch (e) {
                        console.warn("ECMS viewer: error reading iframe:", e);
                    }
                }

                if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    console.warn(
                        "ECMS viewer: could not find viewImage.jsp link on this page."
                    );
                }
            }, 300);

            return;
        }

        // 2B) viewImage.jsp: actual PDF viewer (Chrome's PDF viewer)
        if (href.includes("viewImage.jsp")) {
            if (window.__ecmsDownloading) return;
            window.__ecmsDownloading = true;

            console.log(
                "ECMS viewer: on viewImage.jsp, starting GM_download:",
                current.filename
            );

            GM_download({
                url: href,
                name: current.filename,
                saveAs: false,
                onload: function () {
                    console.log("ECMS viewer: downloaded", current.filename);

                    index++;
                    setIndex(index);

                    if (index < queue.length) {
                        const next = queue[index];
                        console.log("ECMS viewer: moving to next:", next);
                        window.location.href = next.assocUrl;
                    } else {
                        console.log("ECMS viewer: finished all downloads.");
                        setQueue([]);
                        alert("ECMS paystub auto-downloader: all paystubs downloaded.");
                    }
                },
                onerror: function (e) {
                    console.error("ECMS viewer: GM_download error:", e);
                    alert(
                        "ECMS paystub auto-downloader: error downloading " +
                            current.filename
                    );
                },
            });

            return;
        }

        // Other imaging/document pages: do nothing
    })();
})();
