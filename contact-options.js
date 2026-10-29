/* BullsEye! contact-link helper. Progressive enhancement for mailto: links.
   No email is transmitted by this script. Visitors choose an email app,
   a webmail compose window, or copy the published contact address. */
(() => {
  "use strict";
  const EMAIL = "jponte@bullseyehc.com";
  let dialog, addressField, copyButton, currentSubject = "";

  function buildDialog() {
    const css = document.createElement("style");
    css.textContent = `
      .bullseye-mail-choice{box-sizing:border-box;width:min(440px,calc(100% - 28px));max-width:440px;
        padding:27px;border:1px solid rgba(255,255,255,.22);border-radius:12px;
        background:#151924;color:#f5f7fb;font:inherit;box-shadow:0 20px 70px rgba(0,0,0,.55)}
      .bullseye-mail-choice::backdrop{background:rgba(0,0,0,.72)}
      .bullseye-mail-choice h2{font-size:23px;line-height:1.25;margin:0 30px 12px 0;color:#fff}
      .bullseye-mail-choice p{margin:0 0 18px;color:#bdc5d1;font-size:14px;line-height:1.5}
      .bullseye-mail-choice .choices{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
      .bullseye-mail-choice button{font:inherit;cursor:pointer;border-radius:7px;padding:12px 10px;
        border:1px solid rgba(255,255,255,.25);color:#fff;background:#262d3e;font-size:14px}
      .bullseye-mail-choice button:hover,.bullseye-mail-choice button:focus-visible{border-color:#f03a49}
      .bullseye-mail-choice .primary{background:#d92735;border-color:#d92735}
      .bullseye-mail-choice .field-label{display:block;font-size:13px;font-weight:700;margin:0 0 7px}
      .bullseye-mail-choice .copy-row{display:flex;gap:8px}
      .bullseye-mail-choice input{min-width:0;flex:1;padding:11px 10px;border-radius:6px;
        background:#0e1119;border:1px solid rgba(255,255,255,.24);color:#fff;font:inherit;font-size:14px}
      .bullseye-mail-choice .copy-row button{white-space:nowrap;padding:9px 12px}
      .bullseye-mail-choice .close{position:absolute;top:12px;right:13px;
        border:0;background:none;padding:7px 10px;font-size:23px;line-height:1}
      @media(max-width:360px){.bullseye-mail-choice .choices{grid-template-columns:1fr}}
    `;
    document.head.appendChild(css);
    dialog = document.createElement("dialog");
    dialog.className = "bullseye-mail-choice";
    dialog.setAttribute("aria-labelledby", "bullseye-mail-heading");
    dialog.innerHTML = `
      <button class="close" type="button" data-action="close" aria-label="Close">×</button>
      <h2 id="bullseye-mail-heading">Email Jack Ponte</h2>
      <p>Choose how to compose your message. You can also copy the email address and use any email service.</p>
      <div class="choices">
        <button class="primary" type="button" data-action="gmail">Open Gmail</button>
        <button type="button" data-action="outlook">Open Outlook</button>
        <button type="button" data-action="app">Use email app</button>
        <button type="button" data-action="copy">Copy email address</button>
      </div>
      <label class="field-label" for="bullseye-contact-address">Email address</label>
      <div class="copy-row">
        <input id="bullseye-contact-address" value="${EMAIL}" readonly spellcheck="false" autocomplete="off">
        <button type="button" data-action="copy">Copy</button>
      </div>`;
    document.body.appendChild(dialog);
    addressField = dialog.querySelector("input");
    copyButton = dialog.querySelector(".copy-row button");

    dialog.addEventListener("click", async (event) => {
      const action = event.target.closest("button[data-action]")?.dataset.action;
      if (!action) return;
      if (action === "close") { dialog.close(); return; }
      if (action === "gmail" || action === "outlook") {
        const parameters = new URLSearchParams();
        parameters.set("to", EMAIL);
        if (currentSubject) parameters.set(action === "gmail" ? "su" : "subject", currentSubject);
        const url = action === "gmail"
          ? "https://mail.google.com/mail/?view=cm&fs=1&" + parameters.toString()
          : "https://outlook.office.com/mail/deeplink/compose?" + parameters.toString();
        window.open(url, "_blank", "noopener,noreferrer");
        dialog.close();
        return;
      }
      if (action === "app") {
        const mailto = "mailto:" + EMAIL + (currentSubject ? "?subject=" + encodeURIComponent(currentSubject) : "");
        dialog.close();
        window.location.href = mailto;
        return;
      }
      if (action === "copy") {
        try {
          if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(EMAIL);
          copyButton.textContent = "Copied!";
        } catch (_) {
          addressField.focus();
          addressField.select();
          try {
            if (document.execCommand("copy")) copyButton.textContent = "Copied!";
            else copyButton.textContent = "Selected";
          } catch (_) { copyButton.textContent = "Selected"; }
        }
      }
    });
    dialog.addEventListener("close", () => { copyButton.textContent = "Copy"; });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="mailto:"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const raw = link.getAttribute("href");
    const email = raw.slice(7).split("?")[0].toLowerCase();
    if (email !== EMAIL) return;
    event.preventDefault();
    const subjectMatch = /[?&]subject=([^&]*)/i.exec(raw);
    try { currentSubject = subjectMatch ? decodeURIComponent(subjectMatch[1].replace(/\+/g, " ")) : ""; }
    catch (_) { currentSubject = ""; }
    if (!dialog) buildDialog();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else {
      // Older browsers can still use the original mailto behavior.
      window.location.href = raw;
    }
  });
})();
