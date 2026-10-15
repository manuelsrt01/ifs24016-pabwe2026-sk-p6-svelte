<script>
  import Modal from "../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { addItem, changeItem, isMutatingItem } from "../states/linkTreesStore.js";
  import { showSuccessDialog, showErrorDialog, isValidHttpUrl } from "../../../helpers/toolsHelper.js";
  import { inputClass, labelClass, primaryButton, secondaryButton } from "../../../helpers/styles.js";

  let { open = false, linkTreeId, item = null, onClose } = $props();

  const { value: title } = useInput("");
  const { value: url } = useInput("");
  let errorText = $state("");

  const isEdit = $derived(item !== null);

  $effect(() => {
    if (open) {
      title.set(item ? item.title : "");
      url.set(item ? item.url : "");
      errorText = "";
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!$title.trim() || !$url.trim()) {
      errorText = "Judul dan URL wajib diisi.";
      return;
    }
    if (!isValidHttpUrl($url.trim())) {
      errorText = "URL harus diawali http:// atau https://.";
      return;
    }
    errorText = "";

    const payload = { title: $title.trim(), url: $url.trim() };
    const result = isEdit
      ? await changeItem(linkTreeId, item.id, payload)
      : await addItem(linkTreeId, payload);

    if (result.ok) {
      await showSuccessDialog(result.message);
      onClose();
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<Modal {open} title={isEdit ? "Ubah Tautan" : "Tambah Tautan"} {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <div>
      <label class={labelClass} for="item-title">Judul tautan</label>
      <input id="item-title" type="text" class={inputClass} bind:value={$title} />
    </div>
    <div>
      <label class={labelClass} for="item-url">URL</label>
      <input id="item-url" type="url" placeholder="https://" class={inputClass} bind:value={$url} />
    </div>

    {#if errorText}
      <p class="text-sm text-rose-600" role="alert">{errorText}</p>
    {/if}

    <div class="flex justify-end gap-2">
      <button type="button" class={secondaryButton} onclick={onClose}>Batal</button>
      <button type="submit" class={primaryButton} disabled={$isMutatingItem}>
        {$isMutatingItem ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>
