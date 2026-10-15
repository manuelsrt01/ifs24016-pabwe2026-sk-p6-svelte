<script>
  import Modal from "../components/Modal.svelte";
  import { changeCover, isChangingCover } from "../states/linkTreesStore.js";
  import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { inputClass, labelClass, primaryButton, secondaryButton } from "../../../helpers/styles.js";

  let { open = false, linkTreeId, onClose } = $props();

  let file = $state(null);
  let errorText = $state("");

  function close() {
    file = null;
    errorText = "";
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      errorText = "Pilih gambar cover terlebih dahulu.";
      return;
    }
    if (!file.type.startsWith("image/")) {
      errorText = "Berkas harus berupa gambar.";
      return;
    }
    errorText = "";

    const result = await changeCover(linkTreeId, file);
    if (result.ok) {
      await showSuccessDialog(result.message);
      close();
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<Modal {open} title="Ubah Cover" onClose={close}>
  <form class="space-y-4" onsubmit={handleSubmit} novalidate>
    <div>
      <label class={labelClass} for="cover-file">Gambar cover</label>
      <input
        id="cover-file"
        type="file"
        accept="image/*"
        class={inputClass}
        onchange={(event) => (file = event.currentTarget.files[0])} />
      {#if file}
        <p class="mt-1 text-xs text-slate-500">{`Dipilih: ${file.name}`}</p>
      {/if}
    </div>

    {#if errorText}
      <p class="text-sm text-rose-600" role="alert">{errorText}</p>
    {/if}

    <div class="flex justify-end gap-2">
      <button type="button" class={secondaryButton} onclick={close}>Batal</button>
      <button type="submit" class={primaryButton} disabled={$isChangingCover}>
        {$isChangingCover ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  </form>
</Modal>