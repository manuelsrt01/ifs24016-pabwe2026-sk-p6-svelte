<script>
  import Modal from "../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { addLinkTree, isAdding } from "../states/linkTreesStore.js";
  import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { inputClass, labelClass, primaryButton, secondaryButton } from "../../../helpers/styles.js";

  let { open = false, onClose } = $props();

  const { value: title, reset: resetTitle } = useInput("");
  const { value: type, reset: resetType } = useInput("public");
  const { value: description, reset: resetDescription } = useInput("");
  let errorText = $state("");

  function close() {
    resetTitle();
    resetType();
    resetDescription();
    errorText = "";
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!$title.trim() || !$description.trim()) {
      errorText = "Judul dan deskripsi wajib diisi.";
      return;
    }
    errorText = "";

    const result = await addLinkTree({
      title: $title.trim(),
      type: $type,
      description: $description.trim(),
    });

    if (result.ok) {
      await showSuccessDialog(result.message);
      close();
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<Modal {open} title="Tambah Link Tree" onClose={close}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <div>
      <label class={labelClass} for="add-title">Judul</label>
      <input id="add-title" type="text" class={inputClass} bind:value={$title} />
    </div>
    <div>
      <label class={labelClass} for="add-type">Jenis</label>
      <select id="add-type" class={inputClass} bind:value={$type}>
        <option value="public">Publik</option>
        <option value="unlisted">Tidak Terdaftar</option>
        <option value="private">Privat</option>
      </select>
    </div>
    <div>
      <label class={labelClass} for="add-description">Deskripsi</label>
      <textarea id="add-description" rows="3" class={inputClass} bind:value={$description}></textarea>
    </div>

    {#if errorText}
      <p class="text-sm text-rose-600" role="alert">{errorText}</p>
    {/if}

    <div class="flex justify-end gap-2">
      <button type="button" class={secondaryButton} onclick={close}>Batal</button>
      <button type="submit" class={primaryButton} disabled={$isAdding}>
        {$isAdding ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>