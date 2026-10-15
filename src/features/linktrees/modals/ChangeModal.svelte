<script>
  import Modal from "../components/Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { changeLinkTree, isChanging } from "../states/linkTreesStore.js";
  import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { inputClass, labelClass, primaryButton, secondaryButton } from "../../../helpers/styles.js";

  let { open = false, linkTree, onClose } = $props();

  const { value: title } = useInput("");
  const { value: type } = useInput("public");
  const { value: description } = useInput("");
  let errorText = $state("");

  $effect(() => {
    if (open) {
      title.set(linkTree.title);
      type.set(linkTree.type);
      description.set(linkTree.description);
      errorText = "";
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!$title.trim() || !$description.trim()) {
      errorText = "Judul dan deskripsi wajib diisi.";
      return;
    }
    errorText = "";

    const result = await changeLinkTree(linkTree.id, {
      title: $title.trim(),
      type: $type,
      description: $description.trim(),
    });

    if (result.ok) {
      await showSuccessDialog(result.message);
      onClose();
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<Modal {open} title="Ubah Link Tree" {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <div>
      <label class={labelClass} for="change-title">Judul</label>
      <input id="change-title" type="text" class={inputClass} bind:value={$title} />
    </div>
    <div>
      <label class={labelClass} for="change-type">Jenis</label>
      <select id="change-type" class={inputClass} bind:value={$type}>
        <option value="public">Publik</option>
        <option value="unlisted">Tidak Terdaftar</option>
        <option value="private">Privat</option>
      </select>
    </div>
    <div>
      <label class={labelClass} for="change-description">Deskripsi</label>
      <textarea id="change-description" rows="3" class={inputClass} bind:value={$description}></textarea>
    </div>

    {#if errorText}
      <p class="text-sm text-rose-600" role="alert">{errorText}</p>
    {/if}

    <div class="flex justify-end gap-2">
      <button type="button" class={secondaryButton} onclick={onClose}>Batal</button>
      <button type="submit" class={primaryButton} disabled={$isChanging}>
        {$isChanging ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </div>
  </form>
</Modal>