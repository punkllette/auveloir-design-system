// Progressive enhancement: the native select remains the source of truth for forms.
const enhanced = new WeakSet();
let activeMenu = null;

function accessibleLabel(select) {
  const explicit = select.getAttribute("aria-label");
  if (explicit) return explicit;
  const linked = select.id && document.querySelector('label[for="' + CSS.escape(select.id) + '"]');
  if (linked) return linked.textContent.trim();
  const wrapper = select.closest("label");
  const spanText = wrapper?.querySelector(":scope > span:first-child")?.textContent.trim();
  const directText = Array.from(wrapper?.childNodes || []).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())?.textContent.trim();
  return spanText || directText || "Selecionar opção";
}

function enhance(select) {
  if (enhanced.has(select)) return;
  enhanced.add(select);
  const label = accessibleLabel(select);
  const root = document.createElement("div");
  root.className = "nexo-select";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "nexo-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const menu = document.createElement("div");
  menu.className = "nexo-menu";
  menu.id = select.id + "-menu";
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-label", label);
  menu.hidden = true;
  trigger.setAttribute("aria-controls", menu.id);
  const value = document.createElement("span");
  value.className = "nexo-value";
  const chevron = document.createElement("span");
  chevron.className = "nexo-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  trigger.append(value, chevron);
  root.append(trigger, menu);
  select.after(root);
  select.classList.add("nexo-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  select.hidden = true;

  let hovered = false;
  let closeTimer;
  const options = () => Array.from(select.options).filter((option) => !option.disabled && !option.hidden);

  function sync() {
    const selected = select.selectedOptions[0];
    value.textContent = selected?.textContent || "Selecione";
    trigger.setAttribute("aria-label", label + ": " + value.textContent);
    trigger.disabled = select.disabled;
    if (!menu.hidden) renderOptions();
  }

  function renderOptions() {
    menu.replaceChildren();
    options().forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "nexo-option";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.value === select.value));
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
        close();
        trigger.focus();
      });
      menu.append(item);
    });
  }

  function open(focusOption = false) {
    if (trigger.disabled) return;
    if (activeMenu && activeMenu !== root) activeMenu.dispatchEvent(new Event("nexo-close"));
    clearTimeout(closeTimer);
    renderOptions();
    menu.hidden = false;
    root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    root.classList.toggle("opens-up", window.innerHeight - root.getBoundingClientRect().bottom < Math.min(menu.scrollHeight + 12, 240) && root.getBoundingClientRect().top > 250);
    activeMenu = root;
    if (focusOption) (menu.querySelector('[aria-selected="true"]') || menu.firstElementChild)?.focus();
  }

  function close() {
    clearTimeout(closeTimer);
    menu.hidden = true;
    root.classList.remove("is-open", "opens-up");
    trigger.setAttribute("aria-expanded", "false");
    if (activeMenu === root) activeMenu = null;
  }

  root.addEventListener("nexo-close", close);
  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse" || !matchMedia("(hover: hover)").matches) return;
    hovered = true;
    open();
  });
  root.addEventListener("pointerleave", () => {
    hovered = false;
    closeTimer = setTimeout(close, 300);
  });
  trigger.addEventListener("click", () => {
    if (menu.hidden) open();
    else if (!hovered) close();
  });
  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      open(true);
      if (event.key === "Home") menu.firstElementChild?.focus();
      if (event.key === "End") menu.lastElementChild?.focus();
    } else if (event.key === "Escape") close();
  });
  menu.addEventListener("keydown", (event) => {
    const items = Array.from(menu.querySelectorAll(".nexo-option"));
    const index = items.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
      trigger.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  });
  select.addEventListener("change", sync);
  select.form?.addEventListener("reset", () => setTimeout(sync, 0));
  new MutationObserver(sync).observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["disabled", "hidden"] });
  sync();
}

function init() {
  document.querySelectorAll("select").forEach(enhance);
  new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (node.matches?.("select")) enhance(node);
      node.querySelectorAll?.("select").forEach(enhance);
    }));
  }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("pointerdown", (event) => {
    if (activeMenu && !activeMenu.contains(event.target)) activeMenu.dispatchEvent(new Event("nexo-close"));
  });
  document.addEventListener("focusin", (event) => {
    if (activeMenu && !activeMenu.contains(event.target)) activeMenu.dispatchEvent(new Event("nexo-close"));
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
